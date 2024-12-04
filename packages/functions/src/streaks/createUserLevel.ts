import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Table } from 'sst/node/table';

const dynamoDb = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
    const userId = event.requestContext.authorizer!.jwt.claims.sub;
    const { cefrLevel, streakCounter, testTaken } = JSON.parse(event.body || '{}');

    if (!userId || !cefrLevel || streakCounter === undefined || !testTaken) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid input' }),
        };
    }

    const putCommand = new PutCommand({
        TableName: Table.Records.tableName,
        Item: {
            PK: userId,
            SK: 'USER#INFO',
            CEFRLevel: cefrLevel,
            StreakCounter: streakCounter,
            TestTakenTime: testTaken,
        },
    });

    try {
        await dynamoDb.send(putCommand);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User streak record created successfully' }),
        };
    } catch (error) {
        console.error('Error creating user record:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create user record' }),
        };
    }
};