import AWS from 'aws-sdk';
import { S3Event, Context } from 'aws-lambda';

export const handler = async (event: S3Event, context: Context): Promise<void> => {
    console.log("Lambda is Triggered NOW in the safe mode :)");
    try {
        console.log(`Received event: ${JSON.stringify(event)}`);

        const fileObj = event.Records[0];
        const bucketName = fileObj.s3.bucket.name;
        const fileName = fileObj.s3.object.key;
        console.log(`Bucket: ${bucketName}, File: ${fileName}`);

        // Check if the uploaded file is a PDF
        if (fileName.toLowerCase().endsWith('.pdf')) {
            const textractClient = new AWS.Textract();
            const response = await textractClient.startDocumentAnalysis({
                DocumentLocation: { S3Object: { Bucket: bucketName, Name: fileName } },
                FeatureTypes: ['FORMS']
            }).promise();

            const jobId = response.JobId;
            console.log(`Started document analysis with JobId: ${jobId}`);

            // Poll for job completion
            while (true) {
                const jobResponse = await textractClient.getDocumentAnalysis({ JobId: jobId! }).promise();
                const jobStatus = jobResponse.JobStatus;

                if (jobStatus === 'SUCCEEDED' || jobStatus === 'FAILED') {
                    break;
                }

                console.log(`Job Status: ${jobStatus}. Waiting for completion...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            const finalResponse = await textractClient.getDocumentAnalysis({ JobId: jobId! }).promise();

            // Check if the job succeeded and print the result
            if (finalResponse.JobStatus === 'SUCCEEDED') {
                console.log("Document analysis succeeded!");
                console.log(finalResponse);

                const tempFilePath = '/tmp/extracted.txt';
                const fs = require('fs');
                const writeStream = fs.createWriteStream(tempFilePath);

                for (const block of finalResponse.Blocks || []) {
                    if (block.BlockType === 'LINE') {
                        console.log("Writing text:", block.Text); // Debugging log
                        writeStream.write(block.Text + '\n');
                    }
                }
                writeStream.end();

                writeStream.on('finish', async () => {
                    console.log("Finished writing to file. Preparing to upload...");

                    const stats = fs.statSync(tempFilePath);
                    console.log(`File size after writing: ${stats.size} bytes`);

                    const user = "Mohamed";
                    const outputFileName = `${fileName.split('.').slice(0, -1).join('.')}_${user}_Reading_extracted_text.txt`;

                    const s3Client = new AWS.S3();
                    await s3Client.upload({
                        Bucket: "mohdj-codecatalyst-sst-ap-extractedtxtbucket87b8ca-ijzohbu9cf75",
                        Key: outputFileName,
                        Body: fs.createReadStream(tempFilePath)
                    }).promise();

                    console.log(`Uploaded extracted text to ${outputFileName} in bucket ${bucketName}`);
                });
            } else {
                console.log("Document analysis failed!");
            }
        } else {
            console.log("Please upload a PDF file");
        }
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
    }
};
