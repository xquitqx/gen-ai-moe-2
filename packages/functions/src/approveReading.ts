//const userID = event.requestContext.authorizer!.jwt.claims.sub;
import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
import { v4 as uuidv4 } from 'uuid';
import { Table } from 'sst/node/table';
import * as AWS from 'aws-sdk';
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { json } from 'stream/consumers';

const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {

  const requestBody = event.body ? JSON.parse(event.body) : null;
  console.log("Parsed event body:", requestBody);
  try {
      const dynamodb = new AWS.DynamoDB();
      const tableName = Table.Records.tableName;
      if (!event.body) {
          return { statusCode: 400, body: JSON.stringify({ message: "No body provided in the event" }) };
      }
      
      const parsedBody = JSON.parse(JSON.parse(event.body))
      let p1 = parsedBody[0]
      let p2 = parsedBody[1]
      let p3 = parsedBody[2]
      

      console.log(p1)
      console.log(p2)
      console.log("the first passage title ", p1[0])
      console.log("The  number of questions", p1[2].length)
      console.log("The first question: " , p1[2][0].question)
      
          
    
      const transactItems: any[] = [];
      let id = uuidv4();
      let checker = true;
      while(checker) {
        const check = await dynamodb
        .query({
          TableName: tableName,
          KeyConditionExpression: 'PK = :pk AND SK = :sk',
          ExpressionAttributeValues: {
            ':pk': { S: 'reading' },  // String value for PK
            ':sk': { S: id },   // String value for SK
            },
            ProjectionExpression: 'PK, SK',
        })
        .promise(); 
        const checkQuestion = check.Items?.[0];
        if (checkQuestion) {
          // const sortKey = checkQuestion.SK?.S
          id = uuidv4();
        }
        else {
          checker = false;
        }
       }
       const subQuestionsListP1 = []; // Initialize empty list for subquestions
       const subQuestionsListP2 = []; // Initialize empty list for subquestions
       const subQuestionsListP3 = []; // Initialize empty list for subquestions
       
       // Loop through each subquestion in p1[2]
       for (let i = 0; i < p1[2].length; i++) {
         const subQuestionData = p1[2][i];
         const { question, choices, selectedAnswer } = subQuestionData;
       
         // Construct a subquestion mapping
         subQuestionsListP1.push({
          M: {
            CorrectAnswer: { S: selectedAnswer  },  
            QuestionText: { S: `${question}-answer-` },
            Choices: {
              L: choices.map((choice: any) => ({ S: choice })) // Map each choice as { S: value }
            }
          }
         });
       }

      // For P2 --------------------------------------------------------------------------------------------------
       for (let i = 0; i < p2[2].length; i++) {
        const subQuestionData = p2[2][i];
        const { question, choices, selectedAnswer } = subQuestionData;
      
        // Construct a subquestion mapping
        subQuestionsListP2.push({
         M: {
           CorrectAnswer: { S: selectedAnswer  },  
           QuestionText: { S: `${question}-answer-` },
           Choices: {
             L: choices.map((choice: any) => ({ S: choice })) // Map each choice as { S: value }
           }
         }
        });
      }
      // For P3 --------------------------------------------------------------------------------------------------
      for (let i = 0; i < p3[2].length; i++) {
        const subQuestionData = p3[2][i];
        const { question, choices, selectedAnswer } = subQuestionData;
      
        // Construct a subquestion mapping
        subQuestionsListP3.push({
         M: {
           CorrectAnswer: { S: selectedAnswer  },  
           QuestionText: { S: `${question}-answer-` },
           Choices: {
             L: choices.map((choice: any) => ({ S: choice })) // Map each choice as { S: value }
           }
         }
        });
      }
       
       // Push the constructed subquestions to DynamoDB
       transactItems.push({
         Put: {
           TableName: tableName,
           Item: {
             PK: { S: "reading" },
             SK: { S: id },
             P1: {
               M: {
                 NumOfQuestions: { N: "1" },
                 Passage: { S: p1[1] },
                 PassageTitle: { S: p1[0] },
                 Questions: {
                   L: [
                     {
                       M: {
                         NumOfSubQuestions: { N: `${p1[2].length}` },
                         Question: { S: "Read the following passage and answer the questions." },
                         QuestionType: { S: "Matching Paragraph Information" },
                         SubQuestions: {
                           L: subQuestionsListP1 // Dynamically generated subquestions
                         }
                       }
                     }
                   ]
                 }
               }
             },
            P2: {
              M: {
                  NumOfQuestions: { N: "1" },
                  Passage: { S:  p2[1] },
                  PassageTitle: { S: p2[0] },
                  Questions: {
                      L: [
                          { 
                            M: {
                              NumOfSubQuestions: { N: `${p1[2].length}` },
                              Question: { S: "Read the following passage and answer the questions." },
                              QuestionType: { S: "List Selection" },
                              SubQuestions: {
                                L: subQuestionsListP2 // Dynamically generated subquestions
                              }
                            }
                          },
                      ]
                  }
              }
            },
            P3: {
              M: {
                NumOfQuestions: { N: "1" },
                Passage: { S: p3[1] },
                PassageTitle: { S: p3[0] },
                Questions: {
                  L: [
                    {
                      M: {
                        NumOfSubQuestions: { N: `${p3[2].length}` },
                        Question: { S: "Read the following passage and answer the questions." },
                        QuestionType: { S: "Matching Headings" },
                        SubQuestions: {
                          L: subQuestionsListP3 // Dynamically generated subquestions
                        }
                      }
                    }
                  ]
                }
              }
        }

           }
         }
       });
       
       // Update existing DynamoDB item to add subquestions
      //  transactItems.push({
      //    Update: {
      //      TableName: tableName,
      //      Key: {
      //        PK: { S: "reading" },
      //        SK: { S: id }
      //      },
      //      UpdateExpression: "SET #questions[0].SubQuestion = :subQuestions",
      //      ExpressionAttributeNames: {
      //        "#questions": "P1.Questions"
      //      },
      //      ExpressionAttributeValues: {
      //        ":subQuestions": {
      //          L: subQuestionsList
      //        }
      //      }
      //    }
      //  });
       
       console.log("Transaction items:", JSON.stringify(transactItems, null, 2));
       

      transactItems.push({
        Update: {
            TableName: tableName,
            Key: { // Key is required for Update
                PK: { S: "reading" },
                SK: { S: "index" },
            },
            UpdateExpression: "SET #index = list_append(if_not_exists(#index, :empty_list), :new_element)",
            ExpressionAttributeNames: {
                "#index": "index"
            },
            ExpressionAttributeValues: {
                ":new_element": { L: [{ S: id }] },
                ":empty_list": { L: [] } // Important for creating the list if it doesn't exist
            },
        },
    });
    

  
    const transactParams = { TransactItems: transactItems };
    const command = new TransactWriteItemsCommand(transactParams);
    const response = await dynamodb.transactWriteItems(transactParams).promise();
    const userID = event.requestContext.authorizer!.jwt.claims.sub; // Target user ID
    const bucketName = Bucket.ExtractedTXT.bucketName; // Name of the Extracted txt S3 bucket
    const pdfBucket = Bucket.BucketTextract.bucketName;

    // List all objects in the S3 bucket
    const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    const objectsPDF = await s3.listObjectsV2({ Bucket: pdfBucket }).promise();


    let targetObjectKey: string | null = null;
    let targetObjectKeyPDF: string | null = null;


    // Find the object whose name contains the userID
    for (const obj of objects.Contents || []) {
      if (obj.Key && obj.Key.includes(userID) && obj.Key.includes("Reading")) {
        console.log("I enter to delete the txt file with ID:" , userID)
        targetObjectKey = obj.Key;
        break;
      }
    }
    for (const obj of objectsPDF.Contents || []) {
        if (obj.Key && obj.Key.includes(userID) /*&&  obj.Key.includes("Listening")*/) {
          console.log("I enter to delete the txt file with ID:" , userID)
          targetObjectKeyPDF = obj.Key;
          break;
        }
      }

    if (!targetObjectKey || !targetObjectKeyPDF) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No object found for userID: ${userID}` }),
      };
    }

    // Retrieve the content of the target object
    const targetObject = await s3
      .deleteObject({ Bucket: bucketName, Key: targetObjectKey })
      .promise();
    const targetObjectpdf = await s3
      .deleteObject({ Bucket: pdfBucket, Key: targetObjectKeyPDF })
      .promise();

    
    

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
