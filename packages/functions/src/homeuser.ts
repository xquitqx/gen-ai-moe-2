import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB();
const tableName = process.env.tableName || 'unknown_table';
const tableName2 = process.env.tableName2 || 'unknown_table2'; // Table 2

export const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    // Log the event object to inspect headers and other request details
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Retrieve the token from the Authorization header (in this case, userID)
    const userID = event.requestContext.authorizer?.jwt.claims.sub;

    // Log the userID to ensure it's being extracted properly
    console.log('UserID:', userID);

    if (!userID) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token is required' }),
      };
    }

    // Query the first DynamoDB table (tableName) using the token as the PK (Primary Key)
    const response = await dynamodb
      .query({
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': { S: userID }, // Use token as the PK
        },
      })
      .promise();

    // Declare variables to hold data from table 1 (user data)
    let username = 'Unknown User';
    let listeningBandScore = 0;
    let numberOfExamsSolved = 0;
    let overallAvg = 0;
    let readingBandScore = 0;
    let speakingBandScore = 0;
    let writingBandScore = 0;
    let school = 'Unknown School';

    // Check if the query returned any items from tableName
    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0]; // Since the token should be unique, only one item is expected

      // Extract values from the item and convert them to numbers, with fallback to 0 if undefined
      username = item.username?.S || 'Unknown User';
      listeningBandScore = item.Listeningbandscore?.N
        ? +item.Listeningbandscore.N
        : 0;
      numberOfExamsSolved = item.numberOfExamsSolved?.N
        ? +item.numberOfExamsSolved.N
        : 0;
      overallAvg = item.overallavg?.N ? +item.overallavg.N : 0;
      readingBandScore = item.readingbandscore?.N
        ? +item.readingbandscore.N
        : 0;
      speakingBandScore = item.speakingbandscore?.N
        ? +item.speakingbandscore.N
        : 0;
      writingBandScore = item.writingbandscore?.N
        ? +item.writingbandscore.N
        : 0;
      school = item.SK?.S || 'Unknown School';
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User data not found' }),
      };
    }

    // Query the second DynamoDB table (tableName2) using the userID as the PK
    const response2 = await dynamodb
      .query({
        TableName: tableName2,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': { S: userID }, // Use token as the PK
          ':sk': { S: 'USER#INFO' }, // Fixed SK value for user info
        },
      })
      .promise();

    // Declare variables to hold data from table 2
    let CEFRLevel: string =
      'No CEFR level assigned yet, take the placement test first!';
    let StreakCounter: number | string =
      'No streak yet, take the placement test first!';

    // Check if the query returned any items from tableName2
    if (response2.Items && response2.Items.length > 0) {
      const item2 = response2.Items[0]; // Only expecting one item

      // Extract the CEFRLevel and StreakCounter
      CEFRLevel =
        item2.CEFRLevel?.S ||
        'No CEFR level assigned yet, take the placement test first!';
      StreakCounter = item2.StreakCounter?.N
        ? +item2.StreakCounter.N
        : 'No streak yet, take the placement test first!';
    }

    // Return all the data in separate variables
    return {
      statusCode: 200,
      body: JSON.stringify({
        username, // User's username from table 1
        listeningBandScore, // Listening band score from table 1
        numberOfExamsSolved, // Number of exams solved from table 1
        overallAvg, // Overall average from table 1
        readingBandScore, // Reading band score from table 1
        speakingBandScore, // Speaking band score from table 1
        writingBandScore, // Writing band score from table 1
        school, // School from table 1
        CEFRLevel, // CEFR level from table 2
        StreakCounter, // Streak counter from table 2
      }),
    };
  } catch (error) {
    console.error('Error fetching user data:', error);

    // Return an error message if there's an issue
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch user data' }),
    };
  }
};
