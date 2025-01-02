//const userID = event.requestContext.authorizer!.jwt.claims.sub;
import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
import { runModel } from './utilities';
const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userID = "Mohamed"; // Target user ID
    const bucketName = Bucket.ExtractedTXT.bucketName; // Name of the Extracted txt S3 bucket

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
    // let question1 = `For every question in the provided text, append the word 'BREAK'  before each question number and keep all other text.  append \"CHOICE\"
    //  before each  choice letter and keep all other text. Ensure this is done for all sections in the text without
    //   altering the rest of the content.`
    let getPassage1 = "Include only the first passage of the following text without the questions. Append the word \"PASSAGE\" before the passage. append the word \"PASSTITLE\" before the passage title.";
    let getPassage2 = "Include only the second passage of the following text without the questions. Append the word \"PASSAGE\" before the passage. append the word \"PASSTITLE\" before the passage title. ";
    let getPassage3 = "Include only the third passage of the following text without the questions. Append the word \"PASSAGE\" before the passage. append the word \"PASSTITLE\" before the passage title. ";
    let passage1Questions = "Include only the first passage of the follwoing text. For every question in the passage, append the word \"BREAK\"  before each question number and keep all other text.  append \"CHOICE\" before each choice letter and keep all other text. Ensure this is done for the first passage in the text without altering the rest of the content."
    let passage2Questions = "Include only the second passage of the follwoing text. For every question in the passage, append the word \"BREAK\"  before each question number and keep all other text.  append \"CHOICE\" before each choice letter and keep all other text. Ensure this is done for the second passage in the text without altering the rest of the content."
    let passage3Questions = "Include only the third passage of the follwoing text. For every question in the passage, append the word \"BREAK\"  before each question number and keep all other text.  append \"CHOICE\" before each choice letter and keep all other text. Ensure this is done for the third passage in the text without altering the rest of the content."

    passage1Questions += objectContent
    passage2Questions += objectContent
    passage3Questions += objectContent
    getPassage1 += objectContent
    getPassage2 += objectContent
    getPassage3 += objectContent
    
    
    const passage1 = await runModel(getPassage1);
    const passage2 = await runModel(getPassage2);
    const passage3 = await runModel(getPassage3);
    const firstQuestions = await runModel(passage1Questions)
    const secondQuestions = await runModel(passage2Questions)
    const thirdQuestions = await runModel(passage3Questions)

    console.log('Object Content:', objectContent);
    console.log("First passage:" , passage1)
    console.log("second passage:" , passage2)
    console.log("third passage:" , passage3)
    console.log("first set of questions: " ,firstQuestions)
    console.log("second set of questions: " ,secondQuestions)
    console.log("third set of questions: " ,thirdQuestions)




    return {
        statusCode: 200,
        body: JSON.stringify({
          passage1,
          passage2,
          passage3,
          firstQuestions,
          secondQuestions,
          thirdQuestions
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
