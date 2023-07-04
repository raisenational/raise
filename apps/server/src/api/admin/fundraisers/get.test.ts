// This test is probably a bit over the top, but it also acts as a test for get
// endpoints generally: that the wrapper, logic and database all glue together

import { ulid } from 'ulid';
import { insert } from '../../../helpers/db';
import { fundraiserTable } from '../../../helpers/tables';
import { call, makeFundraiser } from '../../../../local/testHelpers';
import { main } from './get';

test('retrieves no fundraisers', async () => {
  // given no fundraisers in the db

  // when we call the endpoint
  const response = await call(main)(null);

  // we get back an empty array
  expect(response).toEqual([]);
});

test('retrieves one fundraiser', async () => {
  // given a fundraiser in the db
  const fundraiser = makeFundraiser();
  await insert(fundraiserTable, fundraiser);

  // when we call the endpoint
  const response = await call(main)(null);

  // we get back the fundraiser
  expect(response).toEqual([fundraiser]);
});

test('retrieves multiple fundraisers', async () => {
  // given multiple fundraisers in the db
  const fundraisers = [makeFundraiser(), makeFundraiser()];
  await Promise.all(fundraisers.map((f) => insert(fundraiserTable, f)));

  // when we call the endpoint
  const response = await call(main)(null);

  // we get back the fundraisers
  expect(response).toHaveLength(2);
  expect(response).toContainEqual(fundraisers[0]);
  expect(response).toContainEqual(fundraisers[1]);
});

test('validates schema before return', async () => {
  // given an invalid fundraiser in the db (missing properties)
  await insert({ ...fundraiserTable, schema: { type: 'object', properties: { id: { type: 'string' } } } }, { id: ulid() });

  // when we call the endpoint
  const response = await call(main, { rawResponse: true })(null);

  // we get back an error
  expect(response.statusCode).toEqual(500);
});

test('cannot retrieve fundraisers without auth', async () => {
  const response = await call(main, { auth: false, rawResponse: true })(null);

  expect(response.statusCode).toEqual(401);
});

test('cannot retrieve fundraisers with invalid auth', async () => {
  const response = await call(main, { auth: 'abcd', rawResponse: true })(null);

  expect(response.statusCode).toEqual(401);
});

test('cannot retrieve fundraisers with wrongly signed auth', async () => {
  // spell-checker: disable-next-line
  const response = await call(main, { authKey: '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKxho5EgKIJI8ShaqMqrzZBBeUZheOGEVALl1QNFbzpCoAoGCCqGSM49\nAwEHoUQDQgAEytwpbd5LVbsdaiJ8Gq9U395QtYmqcMFmAEx0rJ/n4QdaScVrBj9q\nuDP7n68ZQhU1KD4xIuv9Rk35kB8xW02wEQ==\n-----END EC PRIVATE KEY-----', rawResponse: true })(null);

  expect(response.statusCode).toEqual(401);
});
