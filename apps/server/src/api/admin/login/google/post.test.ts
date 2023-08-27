import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';
import { call } from '../../../../../local/testHelpers';
import env from '../../../../env/env';
import { login } from '../../../../helpers/login';
import { main } from './post';
import { LoginResponse } from '../../../../schemas';

const googleTokenPayload = {
  iss: 'accounts.google.com', // verified by the real library
  email_verified: true,
  sub: '12345',
  email: 'test@joinraise.org',
  aud: env.GOOGLE_LOGIN_CLIENT_ID, // verified by the real library
  iat: 1609459200,
  exp: 2524608000, // verified by the real library
};

const getPayload = jest.fn();
const verifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(),
}));

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
  (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
    verifyIdToken,
  }));
  verifyIdToken.mockResolvedValue({ getPayload });
});

test('get working access token for valid Google token', async () => {
  getPayload.mockReturnValue(googleTokenPayload);

  const response = await call(main, { auth: false })({
    idToken: 'idTokenValue',
  });

  expect(verifyIdToken).toHaveBeenCalledTimes(1);
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: 'idTokenValue',
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  });

  expect(response.accessToken.value).toEqual('mockA');
  expect(response.refreshToken.value).toEqual('mockR');
});

test.each([
  ['missing payload', undefined, 'idToken: missing payload', 401],
  ['missing email', { ...googleTokenPayload, email: undefined }, 'idToken: missing email', 401],
  ['with unverified email', { ...googleTokenPayload, email_verified: false }, 'idToken: email not verified', 401],
  ['with non-allowlisted email', { ...googleTokenPayload, email: 'bad@joinraise.org' }, 'not allowlisted', 403],
])('rejects Google token %s', async (description, token, errMessage, status) => {
  getPayload.mockReturnValue(token);

  const response = await call(main, { rawResponse: true, auth: false })({
    idToken: 'idTokenValue',
  });

  expect(verifyIdToken).toHaveBeenCalledTimes(1);
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: 'idTokenValue',
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  });

  expect(response.statusCode).toBe(status);
  expect(response.body).toContain(errMessage);
});

test('rejects invalid Google token', async () => {
  verifyIdToken.mockRejectedValueOnce('Invalid token for some reason!');

  const response = await call(main, { rawResponse: true, auth: false })({
    idToken: 'idTokenValue',
  });

  expect(verifyIdToken).toHaveBeenCalledTimes(1);
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: 'idTokenValue',
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  });

  expect(response.statusCode).toBe(401);
  expect(response.body).toContain('idToken: not valid');
  expect(response.body).not.toContain('Invalid token for some reason!');
});

test('rejects when Google login disabled', async () => {
  const envBefore = { ...env };
  env.GOOGLE_LOGIN_ENABLED = false;

  const response = await call(main, { rawResponse: true, auth: false })({
    idToken: 'idTokenValue',
  });

  expect(verifyIdToken).not.toHaveBeenCalled();
  expect(response.statusCode).toBe(401);
  expect(response.body).toContain('not enabled');

  env.GOOGLE_LOGIN_ENABLED = envBefore.GOOGLE_LOGIN_ENABLED;
});
