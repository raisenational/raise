import type { AWS } from '@serverless/typescript';
import env from './src/env/env';

const RAISE_SERVICE_NAME = 'raise-website';
const MWA_SERVICE_NAME = 'mwa-website';
const RAISE_S3_BUCKET_NAME = `${RAISE_SERVICE_NAME}-${env.STAGE}`;
const MWA_S3_BUCKET_NAME = `${MWA_SERVICE_NAME}-${env.STAGE}`;

const serverlessConfiguration: AWS = {
  service: RAISE_SERVICE_NAME,
  frameworkVersion: '3',
  custom: {
    s3Sync: [
      {
        bucketName: RAISE_S3_BUCKET_NAME,
        localDir: './dist/raise',
        params: [
          // https://www.gatsbyjs.com/docs/caching/
          { '**/*.html': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { '**/page-data.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'page-data/app-data.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'chunk-map.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'webpack.stats.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'static/**': { CacheControl: 'public, max-age=31536000, immutable' } },
          { '**/*.js': { CacheControl: 'public, max-age=31536000, immutable' } },
          { '**/*.css': { CacheControl: 'public, max-age=31536000, immutable' } },
        ],
      },
      {
        bucketName: MWA_S3_BUCKET_NAME,
        localDir: './dist/mwa',
        params: [
          // https://www.gatsbyjs.com/docs/caching/
          { '**/*.html': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { '**/page-data.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'page-data/app-data.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'chunk-map.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'webpack.stats.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'static/**': { CacheControl: 'public, max-age=31536000, immutable' } },
          { '**/*.js': { CacheControl: 'public, max-age=31536000, immutable' } },
          { '**/*.css': { CacheControl: 'public, max-age=31536000, immutable' } },
        ],
      },
    ],
  },
  plugins: [
    'serverless-s3-sync',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: 'eu-west-1',
    stage: env.STAGE,
  },
  resources: {
    Resources: {
      RaiseWebsiteBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: RAISE_S3_BUCKET_NAME,
          AccessControl: 'PublicRead',
          WebsiteConfiguration: {
            IndexDocument: 'index.html',
            ErrorDocument: '404.html',
          },
        },
      },
      RaiseWebsiteBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          Bucket: {
            Ref: 'RaiseWebsiteBucket',
          },
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  's3:GetObject',
                ],
                Effect: 'Allow',
                Principal: '*',
                Resource: { 'Fn::Join': ['', [{ 'Fn::GetAtt': ['RaiseWebsiteBucket', 'Arn'] }, '/*']] },
              },
            ],
            Version: '2012-10-17',
          },
        },
      },
      RaiseCDN: {
        Type: 'AWS::CloudFront::Distribution',
        Properties: {
          DistributionConfig: {
            Aliases: [env.CUSTOM_RAISE_DOMAIN],
            Comment: `${RAISE_SERVICE_NAME}-${env.STAGE}`,
            DefaultCacheBehavior: {
              AllowedMethods: ['GET', 'HEAD'],
              CachedMethods: ['GET', 'HEAD'],
              CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
              Compress: true,
              // eslint-disable-next-line no-template-curly-in-string
              TargetOriginId: { 'Fn::Sub': 'S3-origin-${RaiseWebsiteBucket}' },
              ViewerProtocolPolicy: 'redirect-to-https',
            },
            DefaultRootObject: 'index.html',
            Enabled: true,
            HttpVersion: 'http2',
            IPV6Enabled: true,
            Origins: [{
              DomainName: {
                'Fn::Select': [
                  1,
                  {
                    'Fn::Split': [
                      '//',
                      {
                        'Fn::GetAtt': ['RaiseWebsiteBucket', 'WebsiteURL'],
                      },
                    ],
                  },
                ],
              },
              // eslint-disable-next-line no-template-curly-in-string
              Id: { 'Fn::Sub': 'S3-origin-${RaiseWebsiteBucket}' },
              CustomOriginConfig: {
                HTTPPort: 80,
                HTTPSPort: 443,
                OriginProtocolPolicy: 'http-only',
              },
            }],
            CustomErrorResponses: [{
              ErrorCode: 404,
              // This prevents the SEO hit from serving a 404 page to Search Engines with a 200 response code
              // Admin pages (except the main admin index) are not server-side rendered, so we will get the occasional 404
              // Most browsers seem okay with this, and Gatsby routing magic means the correct page will be displayed
              ResponseCode: 404,
              ResponsePagePath: '/404.html',
            }],
            PriceClass: 'PriceClass_100',
            ViewerCertificate: {
              AcmCertificateArn: 'arn:aws:acm:us-east-1:338337944728:certificate/1da4e440-ec4c-4d8f-8ec6-b1b85969d360',
              MinimumProtocolVersion: 'TLSv1.2_2021',
              SslSupportMethod: 'sni-only',
            },
          },
        },
      },

      MWAWebsiteBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: MWA_S3_BUCKET_NAME,
          AccessControl: 'PublicRead',
          WebsiteConfiguration: {
            IndexDocument: 'index.html',
            ErrorDocument: '404.html',
          },
        },
      },
      MWAWebsiteBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          Bucket: {
            Ref: 'MWAWebsiteBucket',
          },
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  's3:GetObject',
                ],
                Effect: 'Allow',
                Principal: '*',
                Resource: { 'Fn::Join': ['', [{ 'Fn::GetAtt': ['MWAWebsiteBucket', 'Arn'] }, '/*']] },
              },
            ],
            Version: '2012-10-17',
          },
        },
      },
      MWACDN: {
        Type: 'AWS::CloudFront::Distribution',
        Properties: {
          DistributionConfig: {
            Aliases: [env.CUSTOM_MWA_DOMAIN],
            Comment: `${MWA_SERVICE_NAME}-${env.STAGE}`,
            DefaultCacheBehavior: {
              AllowedMethods: ['GET', 'HEAD'],
              CachedMethods: ['GET', 'HEAD'],
              CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
              Compress: true,
              // eslint-disable-next-line no-template-curly-in-string
              TargetOriginId: { 'Fn::Sub': 'S3-origin-${MWAWebsiteBucket}' },
              ViewerProtocolPolicy: 'redirect-to-https',
            },
            DefaultRootObject: 'index.html',
            Enabled: true,
            HttpVersion: 'http2',
            IPV6Enabled: true,
            Origins: [{
              DomainName: {
                'Fn::Select': [
                  1,
                  {
                    'Fn::Split': [
                      '//',
                      {
                        'Fn::GetAtt': ['MWAWebsiteBucket', 'WebsiteURL'],
                      },
                    ],
                  },
                ],
              },
              // eslint-disable-next-line no-template-curly-in-string
              Id: { 'Fn::Sub': 'S3-origin-${MWAWebsiteBucket}' },
              CustomOriginConfig: {
                HTTPPort: 80,
                HTTPSPort: 443,
                OriginProtocolPolicy: 'http-only',
              },
            }],
            CustomErrorResponses: [{
              ErrorCode: 404,
              // This prevents the SEO hit from serving a 404 page to Search Engines with a 200 response code
              // Admin pages (except the main admin index) are not server-side rendered, so we will get the occasional 404
              // Most browsers seem okay with this, and Gatsby routing magic means the correct page will be displayed
              ResponseCode: 404,
              ResponsePagePath: '/404.html',
            }],
            PriceClass: 'PriceClass_100',
            ViewerCertificate: {
              AcmCertificateArn: 'arn:aws:acm:us-east-1:338337944728:certificate/e6de0c70-749e-45f1-8258-4f13c4f40654',
              MinimumProtocolVersion: 'TLSv1.2_2021',
              SslSupportMethod: 'sni-only',
            },
          },
        },
      },
    },
    Outputs: {
      WebsiteURL: {
        Value: { 'Fn::Join': ['', ['https://', { 'Fn::GetAtt': ['RaiseCDN', 'DomainName'] }]] },
        Description: 'CloudFront URL for Raise website',
      },
      MWAWebsiteURL: {
        Value: { 'Fn::Join': ['', ['https://', { 'Fn::GetAtt': ['MWACDN', 'DomainName'] }]] },
        Description: 'CloudFront URL for MWA website',
      },
    },
  },
};

module.exports = serverlessConfiguration;
