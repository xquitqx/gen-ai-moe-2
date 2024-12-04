import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Bucket, Table, StackContext, Function, RDS } from 'sst/constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';
import { Fn, RemovalPolicy, listMapper } from 'aws-cdk-lib';
import AWS from 'aws-sdk';

export function DBStack(this: any, { stack }: StackContext) {
  // Create the original DynamoDB table 'Records'

  const graphlambdafunction = new Function(stack, 'GraphLambdaFunction', {
    handler: 'packages/functions/src/sample-python-lambda/graphdatalambda.main',
    runtime: 'python3.11',
    permissions: ['dynamodb'], // Dynamodb access
  });

  const table = new Table(stack, 'Records', {
    fields: {
      PK: 'string',
      SK: 'string',
    },
    primaryIndex: { partitionKey: 'PK', sortKey: 'SK' },
    stream: true,
  });

  table.addConsumers(stack, {
    consumer1: graphlambdafunction,
  });

  // Create the new DynamoDB table 'userdata' with PK as 'username' and SK as 'schoolname'
  const userdataTable = new Table(stack, 'UserData', {
    fields: {
      PK: 'string', // 'username' will be the partition key
      SK: 'string', // 'schoolname' will be the sort key
    },
    primaryIndex: { partitionKey: 'PK', sortKey: 'SK' },
  });

  const uploads_bucket = new Bucket(stack, 'Uploads');
  const Polly_bucket = new Bucket(stack, 'Polly');
  const audiobucket = new Bucket(stack, 'listeningAudios');
  const speakingPollyBucket = s3.Bucket.fromBucketAttributes(
    this,
    'speakingPolly',
    {
      bucketArn: 'arn:aws:s3:::speaking-questions-polly',
    },
  );

  const feedback_table = new Table(stack, 'ResponseFeedback', {
    fields: {
      feedbackId: 'string',
    },
    primaryIndex: { partitionKey: 'feedbackId' },
  });

  // Output the new 'userdata' table name
  stack.addOutputs({
    UserDataTableName: userdataTable.tableName,
  });

  // Return relevant resources
  return {
    table,
    userdataTable, // Return the new 'userdata' table as well
    uploads_bucket,
    feedback_table,
    Polly_bucket,
    speakingPollyBucket,
    audiobucket,
    graphlambdafunction,
  };
}
