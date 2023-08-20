import { fixedGroups } from '@raise/shared';
import { call } from '../../../../local/testHelpers';
import { main } from './get';
import tasks from '../../../tasks';

jest.mock('../../../tasks', () => [
  {
    id: '01FQWY151AJ6TJJBT44MM2HNZ8',
    name: 'A task',
    groups: [fixedGroups.National],
    run: jest.fn(),
  },
  {
    id: '01FQWY1BPYFF3KS7BY8B4NJJSC',
    name: 'Some other task',
    groups: [fixedGroups.National],
    run: jest.fn().mockImplementation(() => { throw new Error('kaboom'); }),
  },
]);

test('lists tasks', async () => {
  // when we call the endpoint
  const response = await call(main)(null);

  // we get back the tasks
  expect(response).toEqual([
    { id: '01FQWY151AJ6TJJBT44MM2HNZ8', name: 'A task', groups: [fixedGroups.National] },
    { id: '01FQWY1BPYFF3KS7BY8B4NJJSC', name: 'Some other task', groups: [fixedGroups.National] },
  ]);
  // nothing should have been run
  tasks.forEach((t) => expect(t.run).not.toHaveBeenCalled());
});
