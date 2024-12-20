//const userID = event.requestContext.authorizer!.jwt.claims.sub;
import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { wsError, runModel } from './utilities';
const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userID = "Mohamed"; // Target user ID
    const bucketName = "mohdj-codecatalyst-sst-ap-extractedtxtbucket87b8ca-ijzohbu9cf75"; // Name of the S3 bucket

    // List all objects in the S3 bucket
    const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();

    let targetObjectKey: string | null = null;

    // Find the object whose name contains the userID
    for (const obj of objects.Contents || []) {
      if (obj.Key && obj.Key.includes(userID)) {
        targetObjectKey = obj.Key;
        break;
      }
    }

    if (!targetObjectKey) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No object found for userID: ${userID}` }),
      };
    }

    // Retrieve the content of the target object
    const targetObject = await s3
      .getObject({ Bucket: bucketName, Key: targetObjectKey })
      .promise();

    const objectContent = targetObject.Body?.toString('utf-8') || '';
    let  questions = "For every question in the provided text, append the word 'BREAK'  before each question number and keep all other text.  append \"CHOICE\" before each  choice letter and keep all other text. Ensure this is done for all sections in the text without altering the rest of the content.";
    questions += objectContent
    const feedbackResults = await runModel(questions);
    
    console.log("listening prompt: ",feedbackResults)
    console.log('Object Content:', objectContent);

    return {
      statusCode: 200,
      body:JSON.stringify({
         feedbackResults
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error'}),
    };
  }
};
