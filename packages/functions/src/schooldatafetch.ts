import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB();
const tableName = process.env.tableName || 'unknown_table';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    // Extract the 'school' query parameter from the event object
    const schoolName = event.queryStringParameters?.school;

    if (!schoolName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'School name is required in query parameter',
        }),
      };
    }

    // Query DynamoDB using the school name from the query parameter
    const response = await dynamodb
      .query({
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk and SK = :sk',
        ExpressionAttributeValues: {
          ':pk': { S: 'AGGREGATES' },
          ':sk': { S: schoolName }, // Use dynamic school name here
        },
      })
      .promise();

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0]; // Since there's only one aggregate entry

      // Extract values from the item and convert them to numbers, with fallback to 0 if undefined
      const studentCount = item.student_count?.N ? +item.student_count.N : 0;
      const avgOverallAvg = item.Avg_overall_avg?.N
        ? +item.Avg_overall_avg.N
        : 0;
      const avgReadingScore = item.avg_reading_score?.N
        ? +item.avg_reading_score.N
        : 0;
      const avgListeningScore = item.avg_listening_score?.N
        ? +item.avg_listening_score.N
        : 0;
      const avgSpeakingScore = item.avg_speaking_score?.N
        ? +item.avg_speaking_score.N
        : 0;
      const avgWritingScore = item.avg_writing_score?.N
        ? +item.avg_writing_score.N
        : 0;

      return {
        statusCode: 200,
        body: JSON.stringify({
          student_count: studentCount,
          avg_overall_avg: avgOverallAvg,
          avg_reading_score: avgReadingScore,
          avg_listening_score: avgListeningScore,
          avg_speaking_score: avgSpeakingScore,
          avg_writing_score: avgWritingScore,
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Aggregates not found for the specified school',
        }),
      };
    }
  } catch (error) {
    console.error('Error fetching aggregates:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch aggregates' }),
    };
  }
};
