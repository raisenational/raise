import dynamodbLocal from 'aws-dynamodb-local';
import path from 'path';
import {execSync} from 'child_process';
import type {AWS} from '@serverless/typescript';

export const setup = async () => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const service = JSON.parse(execSync('npx serverless print --format json', {encoding: 'utf-8'}));

	// Start DynamoDB local
	await dynamodbLocal.start({
		port: 8005,
		installPath: path.join(__dirname, '..', '.dynamodb'),
		sharedDb: false, // So each test gets its own database
	});

	// Store the table CloudFormation resources in the __DYNAMODB_TABLES environment variable
	process.env.__DYNAMODB_TABLES = JSON.stringify(Object.values(service.resources.Resources as NonNullable<NonNullable<AWS['resources']>['Resources']>[string][])
		.filter((resource) => resource.Type === 'AWS::DynamoDB::Table')
		.map((resource) => resource.Properties));
};

export const teardown = async () => {
	await dynamodbLocal.stop(8005);
};
