import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

// Initialize DynamoDB client
const dynamodb = new AWS.DynamoDB();

// Fetch the table name from environment variables
const tableName = process.env.tableName || 'unknown_table';

export const handler: APIGatewayProxyHandler = async event => {
  try {
    // Extract the 'school' query parameter from the event object
    const schoolName = event.queryStringParameters?.school;
    let lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey;

    if (!schoolName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'School name is required in query parameter',
        }),
      };
    }

    // Perform a scan operation with a filter expression to get all matching items based on SK
    let records: any[] = [];
    let userDetails: any[] = []; // Initialize user details array
    let response;

    do {
      response = await dynamodb
        .scan({
          TableName: tableName,
          FilterExpression: 'contains(SK, :sk)', // Check if SK contains the school name
          ExpressionAttributeValues: {
            ':sk': { S: schoolName }, // Pass the school name as the value for SK
          },
          ExclusiveStartKey: lastEvaluatedKey
            ? { SK: { S: lastEvaluatedKey } }
            : undefined, // Use pagination if provided
        })
        .promise();

      // Map all matching items to readable JSON objects
      const newRecords = response.Items?.map(item => {
        return {
          username: item.username?.S || 'N/A',
          listeningBandScore: item.Listeningbandscore?.N
            ? +item.Listeningbandscore.N
            : 0,
          numberOfExamsSolved: item.numberOfExamsSolved?.N
            ? +item.numberOfExamsSolved.N
            : 0,
          overallAvg: item.overallavg?.N ? +item.overallavg.N : 0,
          readingBandScore: item.readingbandscore?.N
            ? +item.readingbandscore.N
            : 0,
          speakingBandScore: item.speakingbandscore?.N
            ? +item.speakingbandscore.N
            : 0,
          writingBandScore: item.writingbandscore?.N
            ? +item.writingbandscore.N
            : 0,
        };
      });

      // Add new records to the list
      records = [...records, ...(newRecords || [])];

      // Extract the username and numberOfExamsSolved for the users
      const newUserDetails = response.Items?.map(item => ({
        username: item.username?.S || 'N/A',
        numberOfExamsSolved: item.numberOfExamsSolved?.N
          ? +item.numberOfExamsSolved.N
          : 0,
      }));

      // Add the user details to the users list
      userDetails = [...userDetails, ...(newUserDetails || [])];

      // Set the LastEvaluatedKey for the next scan, if available
      lastEvaluatedKey = response.LastEvaluatedKey
        ? response.LastEvaluatedKey.SK.S
        : undefined;
    } while (response.LastEvaluatedKey); // Continue scanning if there is a LastEvaluatedKey

    if (records.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          records, // Return all matching records as an array
          users: userDetails, // Include user details (username and numberOfExamsSolved)
          lastEvaluatedKey: lastEvaluatedKey, // Include the lastEvaluatedKey for pagination
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'No records found for the specified school',
        }),
      };
    }
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch records' }),
    };
  }
};
