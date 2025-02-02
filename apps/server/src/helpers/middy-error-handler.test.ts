
import type middy from '@middy/core';
import createHttpError from 'http-errors';
import middyErrorHandler from './middy-error-handler';
import {insertAudit} from './db';

jest.mock('./db');

const makeRequestFromError = (error: unknown) => ({error} as unknown as middy.Request);

test('handles 400 error with a message', async () => {
	// Given... a 400 error with a message
	const request = makeRequestFromError(new createHttpError[400]('client messed up, we can tell them this'));

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status is set, and message made public
	expect(request.response.statusCode).toBe(400);
	expect(request.response.body).toContain('client messed up, we can tell them this');
});

test('handles 400 error without a message', async () => {
	// Given... a 400 error without a message
	const request = makeRequestFromError(new createHttpError[400]());

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status and body are set
	expect(request.response.statusCode).toBe(400);
	expect(request.response.body).toBeDefined();
});

test.each([401, 403] as const)('handles %s security error', async (status) => {
	// Given... a security error
	const err = new createHttpError[status]('public message');
	const request = makeRequestFromError(err);

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status and body are set, we log it, and store and audit log
	expect(request.response.statusCode).toBe(status);
	expect(request.response.body).toContain('public message');
	expect(console.warn).toHaveBeenCalledWith('Security error processing request:');
	expect(console.warn).toHaveBeenCalledWith(err);
	expect(insertAudit).toHaveBeenCalledWith({
		action: 'security',
		metadata: {
			message: 'public message',
			statusCode: status,
		},
	});
});

test('handles error with details', async () => {
	// Given... a 400 error with details
	const err = new createHttpError[400]('public message');
	const details = {apiVersion: 'v123', docs: 'https://example.com'};
	err.details = {...details};
	const request = makeRequestFromError(err);

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status and body are set
	expect(request.response.statusCode).toBe(400);
	expect(request.response.body).toContain('public message');
	expect(JSON.parse(request.response.body as string).details).toEqual(details);
});

test('handles error with unstringifyable details', async () => {
	// Given... a 400 error with details
	const err = new createHttpError[400]('public message');
	const details = {apiVersion: 'v123', num: 2n};
	err.details = {...details};
	const request = makeRequestFromError(err);

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status and body are set, and we log an error about the invalid details
	expect(request.response.statusCode).toBe(400);
	expect(request.response.body).toContain('public message');
	expect(console.error).toHaveBeenCalledWith('Failed to stringify details for following error:');
	expect(console.error).toHaveBeenCalledWith(err);
});

test.each([
	500, 501, 502, 503, 504,
] as const)('handles %s error with a message', async (status) => {
	// Given... a 5xx error with a message
	const err = new createHttpError[status]('message that should not be public');
	const request = makeRequestFromError(err);

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status is set, and message is not made public but logged
	expect(request.response.statusCode).toBe(status);
	expect(request.response.body).toBeDefined();
	expect(request.response.body).not.toContain('message that should not be public');
	expect(console.error).toHaveBeenCalledWith(err);
});

test.each([
	500, 501, 502, 503, 504,
] as const)('handles %s error without a message', async (status) => {
	// Given... a 5xx error with a message
	const request = makeRequestFromError(new createHttpError[status]());

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status and body are set
	expect(request.response.statusCode).toBe(status);
	expect(request.response.body).toBeDefined();
});

test('handles a non-http error', async () => {
	// Given... a non-http error with a message
	const err = new Error('message that should not be public');
	const request = makeRequestFromError(err);

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status is set, and message is not made public but logged
	expect(request.response.statusCode).toBe(500);
	expect(request.response.body).toBeDefined();
	expect(request.response.body).not.toContain('message that should not be public');
	expect(console.error).toHaveBeenCalledWith(err);
});

test('handles a string error', async () => {
	// Given... a string error
	const request = makeRequestFromError('private message');

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status is set, and message made public
	expect(request.response.statusCode).toBe(500);
	expect(request.response.body).not.toContain('private message');
});

test('handles a number error', async () => {
	// Given... a number error
	const request = makeRequestFromError(1234);

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status is set, and message made public
	expect(request.response.statusCode).toBe(500);
	expect(request.response.body).not.toContain('1234');
});

test('handles a empty error', async () => {
	// Given... a empty error
	const request = makeRequestFromError({});

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status is set, and message made public
	expect(request.response.statusCode).toBe(500);
	expect(request.response.body).not.toContain('{}');
});

test('handles a undefined error', async () => {
	// Given... a undefined error
	const request = makeRequestFromError(undefined);

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status is set, and message made public
	expect(request.response.statusCode).toBe(500);
	expect(request.response.body).not.toContain('undefined');
});

test('handles a null error', async () => {
	// Given... a null error
	const request = makeRequestFromError(null);

	// When... we pass it through the error handler
	await middyErrorHandler(request);

	// Then... the response status is set, and message made public
	expect(request.response.statusCode).toBe(500);
	expect(request.response.body).not.toContain('null');
});
