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
        params: [
          // https://www.gatsbyjs.com/docs/caching/
          { "**/*.html": { CacheControl: "public, max-age=0, must-revalidate" } },
          { "**/page-data.json": { CacheControl: "public, max-age=0, must-revalidate" } },
          { "page-data/app-data.json": { CacheControl: "public, max-age=0, must-revalidate" } },
          { "chunk-map.json": { CacheControl: "public, max-age=0, must-revalidate" } },
          { "webpack.stats.json": { CacheControl: "public, max-age=0, must-revalidate" } },
          { "static/**": { CacheControl: "public, max-age=31536000, immutable" } },
          { "**/*.js": { CacheControl: "public, max-age=31536000, immutable" } },
          { "**/*.css": { CacheControl: "public, max-age=31536000, immutable" } },
        ],
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
              Compress: true,
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
            // Admin pages are not server-side rendered, so we should redirect to an app page (but not return a 404)
            // Hopefully for genuine 404s, search engnines should be smart enough to figure out it's not a real page
            CustomErrorResponses: [{
              ErrorCode: 404,
              ResponseCode: 200,
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
