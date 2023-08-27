import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { call } from '../../../../../local/testHelpers';
import { main } from './post';
import { login } from '../../../../helpers/login';
import { LoginResponse } from '../../../../schemas';
import env from '../../../../env/env';

jest.mock('../../../../helpers/login', () => ({
  login: jest.fn(),
}));

beforeEach(() => {
  (login as unknown as jest.Mock).mockImplementation((email) => {
    if (email === 'test@joinraise.org') {
      const result: LoginResponse = {
        accessToken: { value: 'mockA', expiresAt: 0 },
        refreshToken: { value: 'mockR', expiresAt: 1 },
        groups: [],
      };
      return result;
    }

    throw new createHttpError.Forbidden(`Your account, ${email}, is not allowlisted to use the platform`);
  });
});

test('get working tokens for allowlisted email and valid token', async () => {
  const now = Math.floor(Date.now() / 1000);
  const refreshToken = jwt.sign(
    { subject: 'test@joinraise.org', iat: now, exp: now + 3600 * 24 },
    env.JWT_PRIVATE_KEY,
    { algorithm: 'ES256' }
  );

  const response = await call(main, { auth: false })({ refreshToken });

  expect(response.accessToken.value).toEqual('mockA');
  expect(response.refreshToken.value).toEqual(refreshToken);
});

test('rejects token for non allowlisted user', async () => {
  const now = Math.floor(Date.now() / 1000);
  const refreshToken = jwt.sign(
    { subject: 'rando@gmail.com', iat: now, exp: now + 3600 * 24 },
    env.JWT_PRIVATE_KEY,

    { algorithm: 'ES256' }
  );

  const response = await call(main, { rawResponse: true, auth: false })({ refreshToken });

  expect(response.statusCode).toBe(403);
  expect(response.body).toContain('allowlisted');
});

test('rejects expired token', async () => {
  const now = Math.floor(Date.now() / 1000);
  const refreshToken = jwt.sign(
    { subject: 'test@joinraise.org', iat: now - 100, exp: now - 10 },
    env.JWT_PRIVATE_KEY,

    { algorithm: 'ES256' }
  );

  const response = await call(main, { rawResponse: true, auth: false })({ refreshToken });

  expect(response.statusCode).toBe(403);
  expect(response.body).toContain('expired');
});

test('rejects token with bad signature', async () => {
  const now = Math.floor(Date.now() / 1000);
  const refreshToken = jwt.sign(
    { subject: 'test@joinraise.org', iat: now - 100, exp: now - 10 },
    '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKxho5EgKIJI8ShaqMqrzZBBeUZheOGEVALl1QNFbzpCoAoGCCqGSM49\nAwEHoUQDQgAEytwpbd5LVbsdaiJ8Gq9U395QtYmqcMFmAEx0rJ/n4QdaScVrBj9q\nuDP7n68ZQhU1KD4xIuv9Rk35kB8xW02wEQ==\n-----END EC PRIVATE KEY-----',
    { algorithm: 'ES256' }
  );

  const response = await call(main, { rawResponse: true, auth: false })({ refreshToken });

  expect(response.statusCode).toBe(403);
  expect(response.body).toContain('Bad signature');
});
