import { call } from '../../../../local/testHelpers';
import { main } from './get';

test('returns info in the auth token', async () => {
  const response = await call(main, {
    auth: { groups: ['Test'], iat: 1609459200, exp: 2524608000 },
  })(null);

  expect(response).toEqual({
    email: 'tests',
    expiresAt: 2524608000,
    groups: ['Test'],
    issuedAt: 1609459200,
    sourceIp: '123.123.123.123',
  });
});
