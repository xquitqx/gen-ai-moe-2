import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Table } from 'sst/node/table';

const dynamoDb = new DynamoDBClient({});

export const handler = async () => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // Scan for users whose TestTakenTime is more than 24 hours ago
    const scanCommand = new ScanCommand({
      TableName: Table.Records.tableName,
      FilterExpression: 'attribute_exists(TestTakenTime) AND TestTakenTime < :twentyFourHoursAgo',
      ExpressionAttributeValues: {
        ':twentyFourHoursAgo': twentyFourHoursAgo,
      },
    });

    const result = await dynamoDb.send(scanCommand);

    if (result.Items) {
      for (const item of result.Items) {
        const updateCommand = new UpdateCommand({
          TableName: Table.Records.tableName,
          Key: {
            PK: item.PK,
            SK: 'USER#INFO',
          },
          UpdateExpression: 'SET StreakCounter = :zero',
          ExpressionAttributeValues: {
            ':zero': 0,
          },
        });

        await dynamoDb.send(updateCommand);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Streaks reset successfully' }),
    };
  } catch (error) {
    console.error('Error resetting streaks:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to reset streaks' }),
    };
  }
};