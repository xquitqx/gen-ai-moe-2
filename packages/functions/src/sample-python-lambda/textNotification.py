import boto3
import time
import random
def main(event, context):
    print("Lambda is Triggered NOW in the safe mode :) ")
    try:
        print(f"Received event: {event}")
        fileObj = event["Records"][0]
        bucketName = fileObj["s3"]["bucket"]["name"]
        fileName = fileObj["s3"]["object"]["key"]
        print(f"Bucket: {bucketName}, File: {fileName}")

        # Check if the uploaded file is a PDF
        if fileName.lower().endswith('.pdf'):
            textractClient = boto3.client('textract')
            response = textractClient.start_document_analysis(
                DocumentLocation={'S3Object': {'Bucket': bucketName, 'Name': fileName}},
                FeatureTypes=['FORMS']
            )
            jobId = response['JobId']
            print(f"Started document analysis with JobId: {jobId}")

            # Poll for job completion
            while True:
                jobResponse = textractClient.get_document_analysis(JobId=jobId)
                jobStatus = jobResponse['JobStatus']
                if jobStatus in ['SUCCEEDED', 'FAILED']:
                    break
                print(f"Job Status: {jobStatus}. Waiting for completion...")
                time.sleep(5)  
                
            # Check if the job succeeded and print the result
            if jobStatus == 'SUCCEEDED':
                print("Document analysis succeeded!")
                print(jobResponse)
                print("Extracted Text Lines:")
                temp_file_path = '/tmp/extracted.txt'
                with open(temp_file_path, 'w') as f:
                    for block in jobResponse['Blocks']:
                        if block['BlockType'] == 'LINE':  
                            f.write(block['Text'] + '\n')  
                
                #random_number = random.randint(1, 1000)
                # const user = event.requestContext.authorizer!.jwt.claims.sub;
                user = "Mohamed"
                output_file_name = f"{fileName.rsplit('.', 1)[0]}_{user}_extracted_text.txt"
                s3Client = boto3.client('s3')
                # Upload the file to S3
                s3Client.upload_file(temp_file_path, "mohdj-codecatalyst-sst-ap-extractedtxtbucket87b8ca-ijzohbu9cf75", output_file_name)
                print(f"Uploaded extracted text to {output_file_name} in bucket {bucketName}")
            else:
                print("Document analysis failed!")
        else:
            print("Please upload a PDF file")
    except Exception as e:
        print(f"Error: {str(e)}")
    
