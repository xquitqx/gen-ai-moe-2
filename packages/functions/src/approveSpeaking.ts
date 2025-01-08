//const userID = event.requestContext.authorizer!.jwt.claims.sub;
import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
import { v4 as uuidv4 } from 'uuid';
import { Table } from 'sst/node/table';
import * as AWS from 'aws-sdk';
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";

const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("events:" , event.body);
  try {
    let questionID = "";
    let questionID2 = "";
    const dynamodb = new AWS.DynamoDB();
          const tableName = Table.Records.tableName;
          if (!event.body) {
              return { statusCode: 400, body: JSON.stringify({ message: "No body provided in the event" }) };
          }
          console.log("events:" , event.body);
          const parsedBody = JSON.parse(JSON.parse(event.body))
          console.log("DOUBLE PARSE:", parsedBody)
    
          const transactItems: any[] = [];
        
    // const transactParams = { TransactItems: transactItems };
    // const command = new TransactWriteItemsCommand(transactParams);
    // const response = await dynamodb.transactWriteItems(transactParams).promise();
    // const userID = event.requestContext.authorizer!.jwt.claims.sub; // Target user ID
    // const bucketName = "mohdj-codecatalyst-sst-ap-extractedtxtbucket87b8ca-ijzohbu9cf75"; // Name of the S3 bucket
    // const pdfBucket = Bucket.BucketTextract.bucketName;

    // // List all objects in the S3 bucket
    // const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    // const objectsPDF = await s3.listObjectsV2({ Bucket: pdfBucket }).promise();


    // let targetObjectKey: string | null = null;
    // let targetObjectKeyPDF: string | null = null;


    // // Find the object whose name contains the userID
    // for (const obj of objects.Contents || []) {
    //   if (obj.Key && obj.Key.includes(userID) && obj.Key.includes("Speaking")) {
    //     targetObjectKey = obj.Key;
    //     break;
    //   }
    // }
    // for (const obj of objectsPDF.Contents || []) {
    //     if (obj.Key && obj.Key.includes(userID) /*&&  obj.Key.includes("Listening")*/) {
    //       targetObjectKeyPDF = obj.Key;
    //       break;
    //     }
    //   }

    // if (!targetObjectKey || !targetObjectKeyPDF) {
    //   return {
    //     statusCode: 404,
    //     body: JSON.stringify({ message: `No object found for userID: ${userID}` }),
    //   };
    // }

    // // Retrieve the content of the target object
    // const targetObject = await s3
    //   .deleteObject({ Bucket: bucketName, Key: targetObjectKey })
    //   .promise();
    // const targetObjectpdf = await s3
    //   .deleteObject({ Bucket: pdfBucket, Key: targetObjectKeyPDF })
    //   .promise();

    
    

    return {
        statusCode: 200,
        body: JSON.stringify({
          
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
