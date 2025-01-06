import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { APIGatewayProxyHandler } from "aws-lambda";

// S3 Client Configuration
const s3 = new S3Client();

const BUCKET_NAME = "speaking-questions-polly";
const REGION = "us-east-1"; // The region of your bucket
const BUCKET_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Fetch all objects from the S3 bucket
    const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const response = await s3.send(command);

    // Filter objects to include only files ending with `.mp3`
    const mp3Files = response.Contents?.filter((object) =>
      object.Key?.endsWith(".mp3")
    ).map((object) => `${BUCKET_URL}${object.Key}`);

    console.log(mp3Files);
    return {
      statusCode: 200,
      body: JSON.stringify({ mp3Files }),
    };
  } catch (error) {
    console.error("Error fetching objects from S3:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching objects from S3" }),
    };
  }
};
