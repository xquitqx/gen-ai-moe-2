// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { APIGatewayProxyHandler } from 'aws-lambda';
// import { Bucket } from 'sst/node/bucket';
// // import { v4 as uuidv4 } from 'uuid'; // To generate a unique file name

// const s3 = new S3Client({});

// export const handler: APIGatewayProxyHandler = async event => {
//   const currentSection = event.queryStringParameters?.section || 'default';
//   const bucketName = Bucket.Uploads.bucketName;
//   console.log(bucketName);

//   // Check if the body of the request exists
//   if (!event.body) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ message: 'File data is required' }),
//     };
//   }

//   // Check if the Content-Type header is present
//   const contentType: string | undefined = event.headers['content-type'];
//   console.log(event.headers);

//   // Ensure contentType is not undefined and is one of the allowed types
//   if (!contentType) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ message: 'Content-Type header is missing' }),
//     };
//   }

//   // Generate a unique file name using UUID
//   const userID = event.requestContext.authorizer!.jwt.claims.sub;
//   const fileName = `${currentSection}/${userID}.${
//     contentType === 'audio/mpeg' ? 'mp3' : 'unknown'
//   }`;

//   const fileData = Buffer.from(event.body, 'base64');
//   console.log(fileName);

//   try {
//     const command = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: fileName,
//       Body: fileData,
//       ContentType: 'audio/mpeg', // MP3 MIME type
//     });

//     await s3.send(command);
//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: `Uploaded Successfully!`,
//       }),
//     };
//   } catch (error) {
//     console.error('Failed to upload file: ', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: 'Failed to upload file' }),
//     };
//   }
// };
import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Bucket } from 'sst/node/bucket';

const s3 = new S3Client({});

export const handler: APIGatewayProxyHandler = async (event) => {
  const bucketName = Bucket.Uploads.bucketName;

  if (!event.body || !event.headers['content-type']) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'File data or Content-Type is missing.' }),
    };
  }
  console.log(event.body)

  const contentType = event.headers['content-type'];
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/); // Improved boundary matching
  if (!boundaryMatch) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid Content-Type: boundary not found.' }),
    };
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const bodyBuffer = Buffer.from(event.body, 'base64');
  const bodyText = bodyBuffer.toString('binary');

  // Correct splitting: include the closing boundary and handle potential extra whitespace
  const parts = bodyText.split(`--${boundary}`).filter(part => part.trim() !== '' && part.trim() !== '--' && !part.startsWith('--'));

  const uploadedFiles: string[] = [];
  let fileCounter = 1;

  for (const part of parts) {
    const headersEndIndex = part.indexOf('\r\n\r\n');
    if (headersEndIndex === -1) continue;

    const headers = part.slice(0, headersEndIndex);
    const rawBody = part.slice(headersEndIndex + 4); // No trim here, important for binary data

    const dispositionMatch = headers.match(/Content-Disposition:.*filename="(.+?)"/);
    if (!dispositionMatch) {
      console.log('Skipped part without filename.');
      continue;
    }

    const filename = dispositionMatch[1];

    const contentTypeMatch = headers.match(/Content-Type: (.+)/);
    const contentTypeHeader = contentTypeMatch ? contentTypeMatch[1] : null;

    if (!contentTypeHeader) {
      console.log('Skipped part without Content-Type.');
      continue;
    }

    const fileData = Buffer.from(rawBody, 'binary');

    try {
      const userID = event.requestContext.authorizer?.jwt.claims.sub || 'anonymous';
      const currentSection = event.queryStringParameters?.section || 'default';
      const fileName = `${currentSection}/${userID}-FILENUM-${fileCounter}-${filename}`;
      fileCounter++;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileData,
        ContentType: contentTypeHeader,
        Metadata: { // Example of adding metadata
            originalFilename: filename,
        }
      });

      await s3.send(command);
      uploadedFiles.push(fileName);
    } catch (error) {
      console.error(`Error uploading file ${filename}:`, error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: uploadedFiles.length > 0 ? 'Files uploaded successfully!' : 'No valid files were uploaded.',
      files: uploadedFiles,
    }),
  };
};
