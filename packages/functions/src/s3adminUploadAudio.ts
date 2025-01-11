import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Bucket } from 'sst/node/bucket';
import { use } from 'sst/constructs';
import { DBStack } from '../../../stacks/DBStack';

const s3 = new S3Client({});

export const handler: APIGatewayProxyHandler = async event => {
  //const bucketName = Bucket.Polly.bucketName;
  // const {
  //   speakingPollyBucket
  // } = use(DBStack);
  
  const bucketName = 'speaking-questions-polly'

  if (!event.body || !event.headers['content-type']) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'File data or Content-Type is missing.' }),
    };
  }

  const contentType = event.headers['content-type'];
  const boundaryMatch = contentType.match(/boundary=(.+)/);
  const boundary = boundaryMatch ? boundaryMatch[1] : null;

  if (!boundary) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid Content-Type: boundary not found.' }),
    };
  }

  // Decode the body
  const bodyBuffer = Buffer.from(event.body, 'base64'); // AWS Lambda encodes body in base64
  const bodyText = bodyBuffer.toString('binary'); // Convert to binary string
  const parts = bodyText.split(`--${boundary}`).filter(part => part.trim() !== '' && part.trim() !== '--');

  const uploadedFiles: string[] = [];
  let fileCounter = 1;

  for (const part of parts) {
    const [headers, rawBody] = part.split('\r\n\r\n');
    if (!headers || !rawBody) continue;

    // Extract Content-Type and check for file part
    const contentTypeMatch = headers.match(/Content-Type: (.+)/);
    const contentTypeHeader = contentTypeMatch ? contentTypeMatch[1] : null;

    if (!contentTypeHeader) {
      console.log('Skipped non-file part.');
      continue; // Skip if no Content-Type header (not a file part)
    }

    // Extract the file data
    const fileData = Buffer.from(rawBody.trim(), 'binary');

    try {
      const userID = event.requestContext.authorizer!.jwt.claims.sub;
      const currentSection = event.queryStringParameters?.section || 'default';
      const fileName = `unApproved/${currentSection}/${userID}-FILENUM-${fileCounter}.${contentTypeHeader.split('/')[1] || 'bin'}`;
      fileCounter++; // Increment for the next file

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileData,
        ContentType: contentTypeHeader,
      });

      await s3.send(command);
      uploadedFiles.push(fileName);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to upload one or more files.' }),
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Files uploaded successfully!',
      files: uploadedFiles,
    }),
  };
};
