import { StackContext, Bucket, BucketProps } from "sst/constructs";
import { aws_s3 as s3, aws_iam as iam, RemovalPolicy, Duration } from "aws-cdk-lib";

export function SSTBootstrap({ stack }: StackContext) {
  // 1) Override the default stack name in CloudFormation.
  //    This ensures the deployed stack will be called "SSTBootstrap".
  stack.setStackName("SSTBootstrap");

  // 2) Create the S3 bucket, minus PublicAccessBlockConfiguration.
  const bucket = new Bucket(stack, "SSTBootstrap", {
    autoDeleteObjects: true, // creates a custom resource for auto-delete
    cdk: {
      bucket: {
        encryption: s3.BucketEncryption.S3_MANAGED,
        lifecycleRules: [
          {
            abortIncompleteMultipartUploadAfter: Duration.days(3),
            enabled: true,
            id: "Remove partial uploads after 3 days",
          },
        ],
        removalPolicy: RemovalPolicy.DESTROY,
      },
    },
  } as BucketProps);

  // 3) Deny non-HTTPS access (equivalent to the Condition in your CloudFormation)
  bucket.cdk.bucket?.addToResourcePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ["s3:*"],
      principals: [new iam.AnyPrincipal()],
      resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
      conditions: {
        Bool: { "aws:SecureTransport": "false" },
      },
    })
  );

  return {
    // Make the bucket name available as an SST output (optional)
    BucketName: bucket.bucketName,
  };
}

