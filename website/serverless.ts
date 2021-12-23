import type { AWS } from "@serverless/typescript"
import env from "./src/env/env"

const SERVICE_NAME = "raise-website"
const S3_BUCKET_NAME = `${SERVICE_NAME}-${env.STAGE}`

const serverlessConfiguration: AWS = {
  service: SERVICE_NAME,
  frameworkVersion: "2",
  custom: {
    s3Sync: [
      {
        bucketName: S3_BUCKET_NAME,
        localDir: "./public",
        params: [{
          "*": {
            CacheControl: "no-cache",
          },
        }],
      },
    ],
  },
  plugins: [
    "serverless-s3-sync",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    stage: env.STAGE,
  },
  resources: {
    Resources: {
      WebsiteBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: S3_BUCKET_NAME,
          AccessControl: "PublicRead",
          WebsiteConfiguration: {
            IndexDocument: "index.html",
            ErrorDocument: "404.html",
          },
        },
      },
      WebsiteBucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: {
            Ref: "WebsiteBucket",
          },
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  "s3:GetObject",
                ],
                Effect: "Allow",
                Principal: "*",
                Resource: { "Fn::Join": ["", [{ "Fn::GetAtt": ["WebsiteBucket", "Arn"] }, "/*"]] },
              },
            ],
            Version: "2012-10-17",
          },
        },
      },
      CDN: {
        Type: "AWS::CloudFront::Distribution",
        Properties: {
          DistributionConfig: {
            Comment: S3_BUCKET_NAME,
            DefaultCacheBehavior: {
              AllowedMethods: ["GET", "HEAD"],
              CachedMethods: ["GET", "HEAD"],
              CachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6", // Managed-CachingOptimized
              // eslint-disable-next-line no-template-curly-in-string
              TargetOriginId: { "Fn::Sub": "S3-origin-${WebsiteBucket}" },
              ViewerProtocolPolicy: "redirect-to-https",
            },
            DefaultRootObject: "index.html",
            Enabled: true,
            HttpVersion: "http2",
            IPV6Enabled: true,
            Origins: [{
              DomainName: {
                "Fn::Select": [
                  1,
                  {
                    "Fn::Split": [
                      "//",
                      {
                        "Fn::GetAtt": ["WebsiteBucket", "WebsiteURL"],
                      },
                    ],
                  },
                ],
              },
              // eslint-disable-next-line no-template-curly-in-string
              Id: { "Fn::Sub": "S3-origin-${WebsiteBucket}" },
              CustomOriginConfig: {
                HTTPPort: 80,
                HTTPSPort: 443,
                OriginProtocolPolicy: "http-only",
              },
            }],
            CustomErrorResponses: [{
              ErrorCode: 404,
              ResponseCode: 404,
              ResponsePagePath: "/404.html",
            }],
            PriceClass: "PriceClass_100",
            ViewerCertificate: {
              CloudFrontDefaultCertificate: true,
            },
          },
        },
      },
    },
    Outputs: {
      WebsiteURL: {
        Value: { "Fn::Join": ["", ["https://", { "Fn::GetAtt": ["CDN", "DomainName"] }]] },
        Description: "URL for website",
      },
    },
  },
}

module.exports = serverlessConfiguration
