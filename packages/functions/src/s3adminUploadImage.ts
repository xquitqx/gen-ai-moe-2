import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
// import { v4 as uuidv4 } from 'uuid'; // To generate a unique file name

const s3 = new S3Client({});

export const handler: APIGatewayProxyHandler = async event => {
  //const bucketName = 'hsn-codecatalyst-sst-app--buckettextractbucket4e81-9qp7bptepiwk';
  const bucketName = Bucket.BucketTextract.bucketName;
  console.log(bucketName);

  // Check if the body of the request exists
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'File data is required' }),
    };
  }

  // Check if the Content-Type header is present
  const contentType: string | undefined = event.headers['content-type'];
  console.log(event.headers);

  // Ensure contentType is not undefined and is one of the allowed types
  if (!contentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Content-Type header is missing' }),
    };
  }

  // Generate a unique file name using UUID
  const userID = event.requestContext.authorizer!.jwt.claims.sub;
  const fileName = `${userID}.${
    contentType === 'image/jpeg'
      ? 'jpeg'
      : contentType === 'image/png'
      ? 'png'
      : 'unknown'
  }`;

  if (fileName.endsWith('unknown')) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid Content-Type. Only JPEG and PNG are supported.',
      }),
    };
  }

  try {
    const fileData = Buffer.from(event.body, 'base64'); // Decode base64 image data
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileData,
      ContentType: contentType, // Dynamic based on input header
    });

    await s3.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Uploaded Successfully!`,
      }),
    };
  } catch (error) {
    console.error('Failed to upload file: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to upload file' }),
    };
  }
};
