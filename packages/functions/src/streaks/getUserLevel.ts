import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
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

  const getCommand = new GetCommand({
    TableName: Table.Records.tableName,
    Key: {
      PK: userId,
      SK: 'USER#INFO',
    },
  });

  try {
    const result = await dynamoDb.send(getCommand);
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User level not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    console.error('Error getting user level:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to get user level' }),
    };
  }
};