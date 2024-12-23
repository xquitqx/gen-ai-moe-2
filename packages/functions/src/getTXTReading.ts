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
      if (obj.Key && obj.Key.includes(userID) && obj.Key.includes("Reading")) {
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
    let  questions = "Add the word \"BREAK\" before each question number.  Do not answer the questions.";
    let getPassage1 = "Include only the first passage of the following text without the questions. ";
    let getPassage2 = "Include only the second passage of the following text without the questions. ";
    let getPassage3 = "Include only the third passage of the following text without the questions. ";

    questions += objectContent
    getPassage1 += objectContent
    getPassage2 += objectContent
    getPassage3 += objectContent

    const feedbackResults = await runModel(questions);
    const passage1 = await runModel(getPassage1);
    const passage2 = await runModel(getPassage2);
    const passage3 = await runModel(getPassage3);

    console.log("listening prompt: ",feedbackResults)
    console.log('Object Content:', objectContent);
    console.log("First passage:" , passage1)
    console.log("second passage:" , passage2)
    console.log("third passage:" , passage3)



    return {
        statusCode: 200,
        body: JSON.stringify({
          feedbackResults,
          passage1,
          passage2,
          passage3,
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
