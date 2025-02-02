import createHttpError from 'http-errors';
import {ulid} from 'ulid';
import {call, testGroupId} from '../../../../../local/testHelpers';
import {main} from './post';
import tasks from '../../../../tasks';
import {type TaskDefinition} from '../../../../helpers/types';

jest.mock('../../../../tasks', () => [
	{
		id: '01FQWY151AJ6TJJBT44MM2HNZ8',
		name: 'A task',
		run: () => undefined,
		groups: [testGroupId],
	},
	{
		id: '01FQWYD5FGVS4F9Q9JZ5Y3D0PD',
		name: 'With return value',
		run: () => 1,
		groups: [testGroupId],
	},
	{
		id: '01FQWY1BPYFF3KS7BY8B4NJJSC',
		name: 'That errors with non-HTTP error',
		run() {
			throw new Error('kaboom');
		},
		groups: [testGroupId],
	},
	{
		id: '01FQWYPF19KMGXZHAWHWQ8FV3N',
		name: 'That errors with a HTTP error',
		run() {
			throw new createHttpError.Conflict('Something was wrong');
		},
		groups: [testGroupId],
	},
	{
		id: '01FQWYBWR1TH7RN4XW66XKC80X',
		name: 'Happy async task',
		async run() {/* noop */},
		groups: [testGroupId],
	},
	{
		id: '01FQWYC0C57HMA4XZNG094J664',
		name: 'Sad async task',
		async run() {
			throw new Error('kaboom');
		},
		groups: [testGroupId],
	},
	{
		id: '01H9YE5G03M1NYNKST1MFRSA0Z',
		name: 'Task with different group',
		run: () => undefined,
		groups: [ulid()],
	},
] satisfies TaskDefinition[]);

beforeEach(() => {
	tasks.forEach((t) => jest.spyOn(t, 'run'));
});

test('can run a task', async () => {
	// When we call the endpoint
	// the HTTP call succeeds (implied)
	await call(main, {pathParameters: {taskId: tasks[0].id}})(null);

	// And the run function has been called exactly once
	expect(tasks[0].run).toHaveBeenCalledTimes(1);
});

test('can run a task with a return value', async () => {
	// When we call the endpoint
	// the HTTP call succeeds (implied) - the endpoint should not send back the return value
	await call(main, {pathParameters: {taskId: tasks[1].id}})(null);

	// And the run function has been called exactly once
	expect(tasks[1].run).toHaveBeenCalledTimes(1);
});

test('can run a task that errors with a non-HTTP error', async () => {
	// When we call the endpoint
	const response = await call(main, {rawResponse: true, pathParameters: {taskId: tasks[2].id}})(null);

	// The HTTP call fails
	expect(response.statusCode).toBe(500);
	// And the run function has been called exactly once
	expect(tasks[2].run).toHaveBeenCalledTimes(1);
});

test('can run a task that errors with a HTTP error', async () => {
	// When we call the endpoint
	const response = await call(main, {rawResponse: true, pathParameters: {taskId: tasks[3].id}})(null);

	// The HTTP call fails
	expect(response.statusCode).toBe(409);
	// And the run function has been called exactly once
	expect(tasks[3].run).toHaveBeenCalledTimes(1);
});

test('can run an async task', async () => {
	// When we call the endpoint
	// the HTTP call succeeds (implied) - the endpoint should not send back the return value
	await call(main, {pathParameters: {taskId: tasks[4].id}})(null);

	// And the run function has been called exactly once
	expect(tasks[4].run).toHaveBeenCalledTimes(1);
});

test('can run an async task that errors', async () => {
	// When we call the endpoint
	const response = await call(main, {rawResponse: true, pathParameters: {taskId: tasks[5].id}})(null);

	// The HTTP call fails
	expect(response.statusCode).toBe(500);
	// And the run function has been called exactly once
	expect(tasks[5].run).toHaveBeenCalledTimes(1);
});

test('can\'t run task with non-overlapping groups', async () => {
	// When we call the endpoint
	const response = await call(main, {rawResponse: true, pathParameters: {taskId: tasks[6].id}})(null);

	// The HTTP call fails
	expect(response.statusCode).toBe(403);
	// And the run function has not been called
	expect(tasks[6].run).toHaveBeenCalledTimes(0);
});
