import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Table } from 'sst/node/table';

const dynamoDb = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer!.jwt.claims.sub;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid user ID' }),
    };
  }

  // Get user info to retrieve their CEFR level
  const getUserCommand = new QueryCommand({
    TableName: Table.Records.tableName,
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': userId,
      ':sk': 'USER#INFO',
    },
  });

  try {
    const userResult = await dynamoDb.send(getUserCommand);
    if (!userResult.Items || userResult.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User info not found' }),
      };
    }

    const userInfo = userResult.Items[0];
    const userLevel = userInfo.CEFRLevel;

    const cefrQuestionsTableName = process.env.cefrQuestionsTableName;

    // Query questions based on user level
    const getQuestionsCommand = new QueryCommand({
      TableName: cefrQuestionsTableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `CEFR#${userLevel}`,
      },
    });

    const questionsResult = await dynamoDb.send(getQuestionsCommand);
    console.log("🚀 ~ consthandler:APIGatewayProxyHandler= ~ questionsResult:", questionsResult)
    if (!questionsResult.Items || questionsResult.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No questions found for user level' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(questionsResult.Items),
    };
  } catch (error) {
    console.error('Error getting questions by level:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to get questions by level' }),
    };
  }
};