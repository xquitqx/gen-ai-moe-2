// stacks/SSTBootstrapStack.ts
import { StackContext, Bucket, BucketProps } from "sst/constructs";
import { aws_s3 as s3, aws_iam as iam, RemovalPolicy, Duration } from "aws-cdk-lib";

export function SSTBootstrapStack({ stack }: StackContext) {
  // Create the bucket
  const bucket = new Bucket(stack, "SSTBootstrapBucket", {
    // autoDeleteObjects creates a Lambda + custom resource under the hood
    // to delete all objects when the bucket is removed.
    autoDeleteObjects: true,

    cdk: {
      bucket: {
        // Equivalent to "BucketEncryption": {"ServerSideEncryptionConfiguration": [...]}
        encryption: s3.BucketEncryption.S3_MANAGED,

        // Lifecycle rule for aborting incomplete multipart uploads after 3 days
        lifecycleRules: [
          {
            abortIncompleteMultipartUploadAfter: Duration.days(3),
            enabled: true,
            id: "Remove partial uploads after 3 days",
          },
        ],

        // Equivalent to "Delete" DeletionPolicy/UpdateReplacePolicy
        removalPolicy: RemovalPolicy.DESTROY,

        // Optionally apply the same tag from the original template
        // (You can also add it via the SST `tags` prop or `stack.addDefaultFunctionEnv`.)
        bucketName: undefined, // specify a name if needed
      },
    },
  } as BucketProps);

  // Deny insecure (non-HTTPS) transport, replicating the "secure transport" bucket policy
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

  // (Optional) Add other policies or roles if needed to replicate
  // your specific environment’s usage

  // Return outputs, similar to how the template returns BucketName
  return {
    BucketName: bucket.bucketName,
  };
}
