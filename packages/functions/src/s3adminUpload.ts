import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid'; // To generate a unique file name

const s3 = new S3Client({});

export const handler: APIGatewayProxyHandler = async event => {
  const bucketName = 'hsn-codecatalyst-sst-app--buckettextractbucket4e81-9qp7bptepiwk';

  // Check if the body of the request exists
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'File data is required' }),
    };
  }
  console.log(event.headers)

  // Check if the Content-Type header is present
  const contentType: string | undefined = event.headers['content-type'];
  console.log(event.headers)


  // Ensure contentType is not undefined and is one of the allowed types
  if (!contentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Content-Type header is missing' }),
    };
  }

  const allowedContentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedContentTypes.includes(contentType)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid file type. Only PDF and DOC/DOCX files are allowed.',
      }),
    };
  }

  // Generate a unique file name using UUID
  const fileName = `${uuidv4()}.${
    contentType === 'application/pdf' ? 'pdf' : 'docx'
  }`;

  const fileData = Buffer.from(event.body, 'base64');

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileData,
      ContentType: contentType,
    });

    await s3.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `File "${fileName}" uploaded successfully to bucket "${bucketName}".`,
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
