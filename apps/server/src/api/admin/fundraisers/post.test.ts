// This test is probably a bit over the top, but it also acts as a test for post
// endpoints generally: that the wrapper, logic and database all glue together

import { ulid } from 'ulid';
import { fixedGroups } from '@raise/shared';
import { get, scan } from '../../../helpers/db';
import { fundraiserTable } from '../../../helpers/tables';
import { call, makeFundraiser } from '../../../../local/testHelpers';
import { main } from './post';

test.each([
  ['specifying properties', makeFundraiser({ id: undefined })],
  ['using defaults', {}],
])('national team member can create a fundraiser %s', async (description, fundraiser) => {
  // when we call the endpoint
  const response = await call(main, { auth: { groups: [fixedGroups.National] } })(fundraiser);

  // then we get back our new fundraiser's id
  // spell-checker: disable-next-line
  expect(response).toMatch(/^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/);
  expect(await get(fundraiserTable, { id: response })).toMatchObject({ ...fundraiser, id: response });
});

test('non-national team member cannot create a fundraiser', async () => {
  // when we call the endpoint
  const response = await call(main, { auth: { groups: ['Test'] }, rawResponse: true })({});

  // then an error response is returned
  expect(response.statusCode).toBe(403);
  expect(response.body).toContain('groups');
});

test.each([
  ['missing', null],
  ['wrong type', 'this is a string'],
  ['property with wrong type', { paused: 'Yes' /* should be boolean */ }],
  ['property violating constraint', { totalRaised: -1 /* should be non-negative */ }],
  ['additional property', { prop: 'value' }],
  ['specifying id property', { id: ulid() }],
])('rejects invalid fundraiser: %s', async (description, fundraiser) => {
  // when we call the endpoint
  const response = await call(main, { rawResponse: true })(fundraiser);

  // then an error response is returned
  expect(response.statusCode).toBe(400);
  expect(response.body).toContain('Event object failed validation');

  // and we have not created a new fundraiser
  expect(await scan(fundraiserTable)).toHaveLength(0);
});
