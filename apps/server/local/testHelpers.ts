import { vi, MockedFunction } from 'vitest'
import type {
	APIGatewayProxyEventV2, APIGatewayProxyResult, Handler, Context, APIGatewayProxyEventHeaders,
} from 'aws-lambda';
import jwt from 'jsonwebtoken';
import {fixedGroups} from '@raise/shared';
import {type AccessTokenPayload} from '../src/helpers/types';
import env from '../src/env/env';
import MockDate from 'mockdate';
import * as db from '../src/helpers/db';

// Re-export these, because I moved them but I can't be bothered to migrate existing tests
export * from '../src/helpers/makers';

type CallOptions = {
	path?: string;
	routeKey?: string;
	pathParameters?: Record<string, string | undefined>;
	headers?: Record<string, string | undefined>;
	rawResponse?: boolean;
	auth?: Partial<AccessTokenPayload> | false | string;
	authKey?: string;
	rawBody?: boolean;
};

export const testGroupId = '01GPYGNDBDHY9685YHRKWT6VE7';

export const call = (handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResult>, options: CallOptions = {}) => async (body: any): Promise<any> => {
	const now = Math.floor(new Date().getTime() / 1000);
	const token = typeof options.auth === 'string' ? options.auth : jwt.sign(
		{
			subject: 'tests',
			groups: [fixedGroups.National, testGroupId],
			iat: now,
			exp: now + 60, // 1 minute
			...options.auth,
		},
		options.authKey ?? env.JWT_PRIVATE_KEY,
		{algorithm: 'ES256'},
	);

	process.env.AWS_REGION = 'eu-test-1';
	const response = await handler(
		{
			routeKey: options.routeKey ?? `UNKNOWN ${options.path ?? '/unknown'}`,
			rawPath: options.path ?? '/unknown',
			rawQueryString: '',
			headers: {
				authorization: options.auth === false ? undefined : `Bearer ${token}`,
				'content-type': 'application/json; charset=utf-8',
				...options.headers,
			} as APIGatewayProxyEventHeaders,
			requestContext: {
				accountId: '12345678',
				http: {
					method: 'UNKNOWN',
					path: options.path ?? '/unknown',
					protocol: 'HTTP/1.1',
					sourceIp: '123.123.123.123',
					userAgent: 'some browser',
				},
			},
			body: body ? (options.rawBody ? body : JSON.stringify(body)) : null,
			pathParameters: options.pathParameters ?? {},
		} as APIGatewayProxyEventV2,
		{
			awsRequestId: 'request-123456789',
			logGroupName: 'aws/lambda/raise-server-stage-myFunc',
			logStreamName: '2022/01/01/[$LATEST]123456789',
		} as Context,
		() => {
			throw new Error('expected to return promise, not invoke callback');
		},
	);
	process.env.AWS_REGION = undefined;
	if (!response) {
		throw new Error('No response returned');
	}

	if (options.rawResponse) {
		return response;
	}

	if (response.statusCode > 300) {
		throw new Error(`Unexpected status: ${response.statusCode}, body is ${response.body}`);
	}

	if (response.body === undefined) {
		return undefined;
	}

	return JSON.parse(response.body);
};

export const enableConsole = (): void => {
	(console.error as MockedFunction<typeof console.error>).mockRestore();
	(console.warn as MockedFunction<typeof console.warn>).mockRestore();
	(console.info as MockedFunction<typeof console.info>).mockRestore();
	(console.log as MockedFunction<typeof console.log>).mockRestore();
};

export const setMockDate = (value: Date | number) => {
	MockDate.set(typeof value === 'number' ? value * 1000 : value);
};

const withDelay = <Y extends any[], T>(fn: (...args: Y) => Promise<T>) => async (...args: Y): Promise<T> => {
	await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));
	const result = await fn(...args);
	await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));
	return result;
};

export const delayDb = () => {
	const {scan, get, query, insert, update, inTransaction} = db;
	vi.spyOn(db, 'scan').mockImplementation(withDelay(scan));
	vi.spyOn(db, 'get').mockImplementation(withDelay(get));
	vi.spyOn(db, 'query').mockImplementation(withDelay(query));
	vi.spyOn(db, 'insert').mockImplementation(withDelay(insert));
	vi.spyOn(db, 'update').mockImplementation(withDelay(update));
	vi.spyOn(db, 'inTransaction').mockImplementation(withDelay(inTransaction));
};
