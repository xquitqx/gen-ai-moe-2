import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { APIGatewayProxyHandler } from "aws-lambda";
import { Bucket } from 'sst/node/bucket';


export const handler: APIGatewayProxyHandler = async (event) => {
  const userID = event.requestContext.authorizer!.jwt.claims.sub;
  console.log("I am:", userID)

  // S3 Client Configuration
  const s3 = new S3Client();
  const BUCKET_NAME = Bucket.Uploads.bucketName
  const REGION = "us-east-1"; // The region of your bucket
  const BUCKET_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`;

  try {
    const currentSection = event.queryStringParameters?.section;

    

    // Determine folder and file count limit based on the section
    const folderName = currentSection;
    let fileLimit
    if(currentSection === "Listening")
      fileLimit = 4;
    else if(currentSection === "Speaking")
      fileLimit = 7;
    else if(currentSection === "Writing")
      fileLimit = 1

    

    console.log("You are currently in this section:", currentSection);

    // Fetch all objects from the S3 bucket under the specified folder
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${folderName}/`, // Ensure only files in the specific folder are fetched
    });
    const response = await s3.send(command);

    // Filter objects to include only files ending with `.mp3` and containing the userID
    let mp3Files = null;
    let image = null;
    if(folderName != "Writing"){
       mp3Files = response.Contents?.filter(
      (object) => /*object.Key?.endsWith(".mp3") &&*/ object.Key?.includes(userID)
    )
      .map((object) => `${BUCKET_URL}${object.Key}`) // Generate full URLs
      .slice(0, fileLimit); // Limit to the required number of files

    console.log("The audio files are: ", mp3Files);
  }
  else{
    for (const obj of response.Contents|| []) {
      if (obj.Key && obj.Key.includes(userID)) {
        image = `${BUCKET_URL}${obj.Key}`;
        break;
      }
    };
    console.log("The image is ", image)
    return {
      statusCode: 200,
      body: JSON.stringify({ image: image || [] }),
    };
  }
  
    return {
      statusCode: 200,
      body: JSON.stringify({ mp3Files: mp3Files || [] }),
    };
  } catch (error) {
    console.error("Error fetching objects from S3:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching objects from S3" }),
    };
  }
};
