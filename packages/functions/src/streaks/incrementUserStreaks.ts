import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
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

  const updateCommand = new UpdateCommand({
    TableName: Table.Records.tableName,
    Key: {
      PK: userId,
      SK: 'USER#INFO',
    },
    UpdateExpression: 'SET StreakCounter = if_not_exists(StreakCounter, :start) + :inc, TestTaken = :testTaken',
    ExpressionAttributeValues: {
      ':start': 0,
      ':inc': 1,
      ':TestTakenTime': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  });

  try {
    const result = await dynamoDb.send(updateCommand);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User streak incremented successfully', Attributes: result.Attributes }),
    };
  } catch (error) {
    console.error('Error incrementing user streak:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to increment user streak' }),
    };
  }
};