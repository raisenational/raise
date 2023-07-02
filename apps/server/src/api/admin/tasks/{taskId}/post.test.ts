import createHttpError from 'http-errors';
import { call } from '../../../../../local/testHelpers';
import { main } from './post';
import tasks from '../../../../tasks';

jest.mock('../../../../tasks', () => [
  {
    id: '01FQWY151AJ6TJJBT44MM2HNZ8',
    name: 'A task',
    run: () => undefined,
  },
  {
    id: '01FQWYD5FGVS4F9Q9JZ5Y3D0PD',
    name: 'With return value',
    run: () => 1,
  },
  {
    id: '01FQWY1BPYFF3KS7BY8B4NJJSC',
    name: 'That errors with non-HTTP error',
    run: () => { throw new Error('kaboom'); },
  },
  {
    id: '01FQWYPF19KMGXZHAWHWQ8FV3N',
    name: 'That errors with a HTTP error',
    run: () => { throw new createHttpError.Conflict('Something was wrong'); },
  },
  {
    id: '01FQWYBWR1TH7RN4XW66XKC80X',
    name: 'Happy async task',
    run: async () => { /* noop */ },
  },
  {
    id: '01FQWYC0C57HMA4XZNG094J664',
    name: 'Sad async task',
    run: async () => { throw new Error('kaboom'); },
  },
]);

beforeEach(() => {
  tasks.forEach((t) => jest.spyOn(t, 'run'));
});

test('can run a task', async () => {
  // when we call the endpoint
  // the HTTP call succeeds (implied)
  await call(main, { pathParameters: { taskId: tasks[0].id } })(null);

  // and the run function has been called exactly once
  expect(tasks[0].run).toHaveBeenCalledTimes(1);
});

test('can run a task with a return value', async () => {
  // when we call the endpoint
  // the HTTP call succeeds (implied) - the endpoint should not send back the return value
  await call(main, { pathParameters: { taskId: tasks[1].id } })(null);

  // and the run function has been called exactly once
  expect(tasks[1].run).toHaveBeenCalledTimes(1);
});

test('can run a task that errors with a non-HTTP error', async () => {
  // when we call the endpoint
  const response = await call(main, { rawResponse: true, pathParameters: { taskId: tasks[2].id } })(null);

  // the HTTP call fails
  expect(response.statusCode).toBe(500);
  // and the run function has been called exactly once
  expect(tasks[2].run).toHaveBeenCalledTimes(1);
});

test('can run a task that errors with a HTTP error', async () => {
  // when we call the endpoint
  const response = await call(main, { rawResponse: true, pathParameters: { taskId: tasks[3].id } })(null);

  // the HTTP call fails
  expect(response.statusCode).toBe(409);
  // and the run function has been called exactly once
  expect(tasks[3].run).toHaveBeenCalledTimes(1);
});

test('can run an async task', async () => {
  // when we call the endpoint
  // the HTTP call succeeds (implied) - the endpoint should not send back the return value
  await call(main, { pathParameters: { taskId: tasks[4].id } })(null);

  // and the run function has been called exactly once
  expect(tasks[4].run).toHaveBeenCalledTimes(1);
});

test('can run an async task that errors', async () => {
  // when we call the endpoint
  const response = await call(main, { rawResponse: true, pathParameters: { taskId: tasks[5].id } })(null);

  // the HTTP call fails
  expect(response.statusCode).toBe(500);
  // and the run function has been called exactly once
  expect(tasks[5].run).toHaveBeenCalledTimes(1);
});
