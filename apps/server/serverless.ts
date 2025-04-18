/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type {AWS} from '@serverless/typescript';
import {execSync} from 'child_process';
import env from './src/env/env';
import {type Table, tables} from './src/helpers/tables';
import {getFunctionEvent, getFunctionPaths, pascalCase} from './local/helpers';

const SERVICE_NAME = 'raise-server';

const createResources = (definitions: Record<string, Table<any, any, any>>): NonNullable<NonNullable<AWS['resources']>['Resources']> =>
	Object.values(definitions).reduce<NonNullable<NonNullable<AWS['resources']>['Resources']>>((acc, table) => {
		const resourceKey = `${pascalCase(table.entityName)}Table`;
		if (acc[resourceKey] !== undefined) {
			throw new Error(`Duplicate table resource key ${resourceKey}`);
		}

		acc[resourceKey] = {
			Type: 'AWS::DynamoDB::Table',
			DeletionPolicy: env.STAGE === 'prod' ? 'Retain' : 'Delete',
			Properties: {
				AttributeDefinitions: [{
					AttributeName: table.partitionKey,
					AttributeType: 'S', // String
				}, ...(table.primaryKey === table.partitionKey
					? []
					: [{
						AttributeName: table.primaryKey,
						AttributeType: 'S', // String
					}])],
				KeySchema: [{
					AttributeName: table.partitionKey,
					KeyType: 'HASH',
				}, ...(table.primaryKey === table.partitionKey
					? []
					: [{
						AttributeName: table.primaryKey,
						KeyType: 'RANGE',
					}]
				)],
				BillingMode: 'PAY_PER_REQUEST',
				PointInTimeRecoverySpecification: {
					PointInTimeRecoveryEnabled: env.STAGE === 'prod',
				},
				TableName: table.name,
				...((table.schema as {properties?: {ttl?: unknown}}).properties?.ttl
					? {
						TimeToLiveSpecification: {
							AttributeName: 'ttl',
							Enabled: true,
						},
					}
					: {}),
			},
		};

		return acc;
	}, {});

const tableResources = createResources(tables);

const getVersion = (): string => {
	const hash = execSync('git rev-parse --short HEAD', {encoding: 'utf-8'});
	return `${(new Date()).toISOString().replace(/-/g, '').replace(/\..*/, '')
		.replace(/:/g, '')
		.replace('T', '.')}.${hash.trim()}`;
};

const serverlessConfiguration: AWS = {
	service: SERVICE_NAME,
	frameworkVersion: '3',
	custom: {
		webpack: {
			webpackConfig: './webpack.config.js',
			includeModules: {
				forceExclude: [
					// We do not exclude the aws-sdk v3, even though it is included in the Lambda environment,
					// because then we know exactly what version we're running and have no random surprises
					'@aws-sdk/types',
					'mockdate',
				],
			},
			// Exclude envs for security reasons, ensures we never deploy prod config to dev environment etc.
			excludeFiles: [
				'src/env/local.ts',
				'src/env/dev.ts',
				'src/env/prod.ts',
				'src/**/*.test.ts',
			],
			packagerOptions: {
				scripts: [
					// Remove unused code that the bundler misses
					'find node_modules/ -name "*.d.ts" -type f -delete',
					'find node_modules/ -name "*.md" ! -name "LICENSE.md" -type f -delete',
				],
			},
		},
		'serverless-offline': {
			httpPort: 8001,
			websocketPort: 8002,
			lambdaPort: 8003,
			reloadHandler: true,
		},
		'serverless-dynamodb': {
			start: {
				port: 8004,
				migrate: true,
				seed: true,
			},
			seed: {
				sample: {
					sources: [{
						table: tables.fundraiser.name,
						sources: ['./local/table_fundraiser.json'],
					}, {
						table: tables.donation.name,
						sources: ['./local/table_donation.json'],
					}, {
						table: tables.payment.name,
						sources: ['./local/table_payment.json'],
					}, {
						table: tables.auditLog.name,
						sources: ['./local/table_auditLog.json'],
					}, {
						table: tables.group.name,
						sources: ['./local/table_group.json'],
					}, {
						table: tables.user.name,
						sources: ['./local/table_user.json'],
					}],
				},
			},
		},
		'serverless-offline-ses-v2': {
			port: 8006,
		},
		'serverless-offline-watcher': [{
			path: 'src/schemas/jsonSchema.ts',
			command: 'npm run generate:schemas',
		}],
	},
	plugins: [
		'serverless-webpack',
		'serverless-dynamodb',
		'serverless-offline',
		'serverless-offline-ses-v2',
		'serverless-offline-watcher',
	],
	provider: {
		name: 'aws',
		runtime: 'nodejs18.x',
		region: 'eu-west-1',
		profile: 'raise-405129592067',
		stage: env.STAGE,
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		httpApi: {
			payload: '2.0',
			cors: {
				// 2023-11-19: not sure why this has become necessary, but as of Chrome v119
				// just setting this to 'true' no longer works.
				allowedHeaders: ['*'],
				allowedOrigins: ['*'],
				allowedMethods: ['*'],
			},
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			STAGE: env.STAGE,
			VERSION: getVersion(),
		},
		memorySize: 256,
		timeout: 30,
		iam: {
			role: {
				statements: [
					...Object.keys(tableResources).map((cloudformationName) => ({
						Effect: 'Allow',
						Action: 'dynamodb:*',
						Resource: {
							'Fn::GetAtt': [cloudformationName, 'Arn'],
						},
					})),
					{
						Effect: 'Allow',
						Action: [
							'ses:SendEmail',
						],
						Resource: '*',
					},
				],
			},
		},
	},
	functions: {
		apiRouter: {
			handler: 'src/api/_router.main',
			events: getFunctionPaths().map(getFunctionEvent),
		},
		schedulerCollectPaymentsRun: {
			handler: 'src/scheduler/collect-payments/run.main',
			events: [
				{
					schedule: env.STAGE === 'local'
						? 'rate(1 minute)' // Every minute
						: 'cron(0 8 * * ? *)', // Every day at 8am UTC
				},
			],
		},
	},
	resources: {
		Resources: {
			// Using multiple DynamoDB tables as a conscious choice for maintainability.
			// The docs promote a single-table design - for max perf/min costs this may
			// be the case, however for us database access time and DynamoDB costs are
			// not limiting factors. Instead, simplicity and maintainability are so a
			// multiple table design makes sense. As we're using on-demand mode billing
			// (as opposed to provisioned capacity) the costs aren't much higher.
			...tableResources,
		},
	},
};

module.exports = serverlessConfiguration;
