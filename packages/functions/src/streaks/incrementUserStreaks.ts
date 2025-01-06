import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Table } from 'sst/node/table';

const dynamoDb = new DynamoDBClient({});
const sesClient = new SESClient({});

const MILESTONES = [3, 7, 14, 30];

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer!.jwt.claims.sub;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid user ID' }),
    };
  }

  const now = new Date();
  const fifteenHoursAgo = new Date(now.getTime() - 15 * 60 * 60 * 1000).toISOString();

  const updateCommand = new UpdateCommand({
    TableName: Table.Records.tableName,
    Key: {
      PK: userId,
      SK: 'USER#INFO',
    },
    UpdateExpression: 'SET StreakCounter = if_not_exists(StreakCounter, :start) + :inc, TestTakenTime = :testTakenTime',
    ConditionExpression: 'attribute_not_exists(TestTakenTime) OR TestTakenTime < :fifteenHoursAgo',
    ExpressionAttributeValues: {
      ':start': 0,
      ':inc': 1,
      ':testTakenTime': now.toISOString(),
      ':fifteenHoursAgo': fifteenHoursAgo,
    },
    ReturnValues: 'ALL_NEW',
  });

  try {
    const result = await dynamoDb.send(updateCommand);
    const streakCounter = result.Attributes?.StreakCounter;

    if (MILESTONES.includes(streakCounter)) {
      const email = event.requestContext.authorizer!.jwt.claims.email;
      await sendMilestoneEmail(email, streakCounter);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User streak incremented successfully', Attributes: result.Attributes }),
    };
  } catch (error: any) {
    console.error('Error incrementing user streak:', error);
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Streaks have already been incremented in the last 15 hours' }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to increment user streak' }),
    };
  }
};

const sendMilestoneEmail = async (email: string, streakCounter: number) => {
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: {
          Data: `Congratulations! You have reached a streak of ${streakCounter} days! Keep up the great work!`,
        },
      },
      Subject: {
        Data: `Milestone Reached: ${streakCounter} Days Streak!`,
      },
    },
    Source: 'cicagent233@gmail.com',
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log(`Milestone email sent to ${email}`);
  } catch (error) {
    console.error('Error sending milestone email:', error);
  }
};