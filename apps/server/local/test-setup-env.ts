/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-restricted-imports */
import {beforeEach, Mock, vi} from 'vitest';
import {DynamoDBClient, CreateTableCommand} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, TransactWriteCommand} from '@aws-sdk/lib-dynamodb';
import {auditContext} from '../src/helpers/auditContext';
import {dbClient} from '../src/helpers/db';

// Retrieve the table CloudFormation resources from the __DYNAMODB_TABLES environment variable
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const DYNAMODB_TABLES: unknown[] = JSON.parse(process.env.__DYNAMODB_TABLES!);

// Mock out email and Slack by default so our tests don't send out messages
vi.mock('../src/helpers/slack', () => ({
	sendMessage: vi.fn().mockResolvedValue(undefined),
	sendMessageWithLogsLink: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../src/helpers/email', () => ({
	sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// Shared DynamoDB clients for all tests
// Connects to a DynamoDB local instance set up by serverless-dynamodb
const dynamoDBClient = new DynamoDBClient({
	region: 'test',
	endpoint: 'http://0.0.0.0:8005',
	credentials: {
		accessKeyId: 'MockAccessKeyId',
		secretAccessKey: 'MockSecretAccessKey',
	},
});
const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient, {
	marshallOptions: {
		convertEmptyValues: false,
		removeUndefinedValues: false,
	},
	unmarshallOptions: {
		wrapNumbers: false,
	},
});

beforeEach(async () => {
	// Mock audit context (you can override this by setting auditContext.value)
	auditContext.value = {
		subject: 'test',
		sourceIp: '127.0.0.1',
		userAgent: 'test',
		route: 'unknown',
		routeRaw: 'unknown',
		logGroupName: 'aws/lambda/raise-server-stage-myFunc',
		logStreamName: '2022/01/01/[$LATEST]123456789',
		awsRegion: 'eu-test-1',
	};

	// Disable logging (you can override this with enableConsole from test helpers)
	vi.spyOn(console, 'error').mockImplementation(() => {/* noop */});
	vi.spyOn(console, 'warn').mockImplementation(() => {/* noop */});
	vi.spyOn(console, 'info').mockImplementation(() => {/* noop */});
	vi.spyOn(console, 'log').mockImplementation(() => {/* noop */});

	// Set up database
	// We create a prefix to prepend to all tables in this test environment for isolation
	// We create the tables lazily, so only on the first database interaction are they initialized
	const envPrefix = `test-env-${Math.random()}`;
	let ready = false;

	dbClient.send = vi.fn()
		.mockImplementationOnce(async (command) => {
			// The first time, we lazy initiate the tables
			await Promise.all(DYNAMODB_TABLES.map(async (table: any) => {
				return dynamoDBClient.send(new CreateTableCommand({
					...table,
					TableName: `${envPrefix}-${table.TableName}`,
				}));
			}));
			ready = true;

			// Call ourself to use the mockImplementation below
			// to execute the command originally requested
			return dbClient.send(command);
		})
		.mockImplementation(async (command) => {
			// If we have two calls to the database in quick succession, we might start
			// running this code without having initialized the tables above. Here we busy-wait
			// until our database tables are all set up before continuing.
			if (!ready) {
				await new Promise<void>((resolve) => {
					const timeout = setInterval(() => {
						if (ready) {
							clearInterval(timeout);
							resolve();
						}
					}, 50);
				});
			}

			// Proxy commands to use the tables for this test environment
			if (command instanceof TransactWriteCommand) {
				command.input.TransactItems?.forEach((i) => {
					Object.values(i).forEach((v) => {
						v.TableName = `${envPrefix}-${v.TableName}`;
					});
				});
			} else {
				command.input.TableName = `${envPrefix}-${command.input.TableName}`;
			}

			// Actually execute the command
			return dynamoDBDocumentClient.send(command);
		});
});
