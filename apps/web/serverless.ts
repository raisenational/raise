import type {AWS} from '@serverless/typescript';
import env from './src/env/env';

const RAISE_SERVICE_NAME = 'raise-website';
const MWA_SERVICE_NAME = 'mwa-website';
const RAISE_S3_BUCKET_NAME = `${RAISE_SERVICE_NAME}-${env.STAGE}-405129592067`;
const MWA_S3_BUCKET_NAME = `${MWA_SERVICE_NAME}-${env.STAGE}-405129592067`;

const serverlessConfiguration: AWS = {
	service: RAISE_SERVICE_NAME,
	frameworkVersion: '3',
	custom: {
		s3Sync: [
			{
				bucketName: RAISE_S3_BUCKET_NAME,
				localDir: './dist/raise',
				params: [
					{'**/*.html': {CacheControl: 'public, max-age=0, must-revalidate'}},
					{'shared/**': {CacheControl: 'public, max-age=86400'}},
					{'_next/**': {CacheControl: 'public, max-age=31536000, immutable'}},
				],
			},
			{
				bucketName: MWA_S3_BUCKET_NAME,
				localDir: './dist/mwa',
				params: [
					{'**/*.html': {CacheControl: 'public, max-age=0, must-revalidate'}},
					{'shared/**': {CacheControl: 'public, max-age=86400'}},
					{'_next/**': {CacheControl: 'public, max-age=31536000, immutable'}},
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
		profile: 'raise-405129592067',
	},
	resources: {
		Resources: {
			RaiseWebsiteBucket: {
				Type: 'AWS::S3::Bucket',
				Properties: {
					BucketName: RAISE_S3_BUCKET_NAME,
					PublicAccessBlockConfiguration: {
						BlockPublicAcls: false,
						BlockPublicPolicy: false,
						IgnorePublicAcls: false,
						RestrictPublicBuckets: false,
					},
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
								Resource: {'Fn::Join': ['', [{'Fn::GetAtt': ['RaiseWebsiteBucket', 'Arn']}, '/*']]},
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
							TargetOriginId: {'Fn::Sub': 'S3-origin-${RaiseWebsiteBucket}'},
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
							Id: {'Fn::Sub': 'S3-origin-${RaiseWebsiteBucket}'},
							CustomOriginConfig: {
								HTTPPort: 80,
								HTTPSPort: 443,
								OriginProtocolPolicy: 'http-only',
							},
						}],
						CustomErrorResponses: [{
							ErrorCode: 404,
							ResponseCode: 404,
							ResponsePagePath: '/404.html',
						}],
						PriceClass: 'PriceClass_100',
						ViewerCertificate: {
							AcmCertificateArn: 'arn:aws:acm:us-east-1:405129592067:certificate/b028f0fd-4988-4232-866e-c2f4760a2570',
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
					PublicAccessBlockConfiguration: {
						BlockPublicAcls: false,
						BlockPublicPolicy: false,
						IgnorePublicAcls: false,
						RestrictPublicBuckets: false,
					},
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
								Resource: {'Fn::Join': ['', [{'Fn::GetAtt': ['MWAWebsiteBucket', 'Arn']}, '/*']]},
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
							TargetOriginId: {'Fn::Sub': 'S3-origin-${MWAWebsiteBucket}'},
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
							Id: {'Fn::Sub': 'S3-origin-${MWAWebsiteBucket}'},
							CustomOriginConfig: {
								HTTPPort: 80,
								HTTPSPort: 443,
								OriginProtocolPolicy: 'http-only',
							},
						}],
						CustomErrorResponses: [{
							ErrorCode: 404,
							ResponseCode: 404,
							ResponsePagePath: '/404.html',
						}],
						PriceClass: 'PriceClass_100',
						ViewerCertificate: {
							AcmCertificateArn: 'arn:aws:acm:us-east-1:405129592067:certificate/b8349f4c-a17d-4776-acf1-6bcd6a799e46',
							MinimumProtocolVersion: 'TLSv1.2_2021',
							SslSupportMethod: 'sni-only',
						},
					},
				},
			},
		},
		Outputs: {
			WebsiteURL: {
				Value: {'Fn::Join': ['', ['https://', {'Fn::GetAtt': ['RaiseCDN', 'DomainName']}]]},
				Description: 'CloudFront URL for Raise website',
			},
			MWAWebsiteURL: {
				Value: {'Fn::Join': ['', ['https://', {'Fn::GetAtt': ['MWACDN', 'DomainName']}]]},
				Description: 'CloudFront URL for MWA website',
			},
		},
	},
};

module.exports = serverlessConfiguration;
