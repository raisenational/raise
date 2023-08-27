import createHttpError from 'http-errors';
import { call } from '../../../../../local/testHelpers';
import { main } from './post';
import env from '../../../../env/env';
import { login } from '../../../../helpers/login';
import { LoginResponse } from '../../../../schemas';

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

test('get working tokens for allowlisted email', async () => {
  const response = await call(main, { auth: false })({
    email: 'test@joinraise.org',
  });

  expect(response.accessToken.value).toEqual('mockA');
  expect(response.refreshToken.value).toEqual('mockR');
});

test.each([
  ['with non-allowlisted email', { email: 'bad@joinraise.org' }, 'not allowlisted', 403],
])('rejects %s', async (description, payload, errMessage, status) => {
  const response = await call(main, { rawResponse: true, auth: false })(payload);

  expect(response.statusCode).toBe(status);
  expect(response.body).toContain(errMessage);
});

test.each([
  ['with non-enabled env', { STAGE: 'dev', IMPERSONATION_LOGIN_ENABLED: false } as const, 'not enabled', 401],
  ['in the prod stage', { STAGE: 'prod', IMPERSONATION_LOGIN_ENABLED: true } as const, 'not be enabled in prod', 401],
])('rejects %s', async (description, envOverrides, errMessage, status) => {
  const envBefore = { ...env };
  env.STAGE = envOverrides.STAGE;
  env.IMPERSONATION_LOGIN_ENABLED = envOverrides.IMPERSONATION_LOGIN_ENABLED;

  const response = await call(main, { rawResponse: true, auth: false })({ email: 'test@joinraise.org' });

  expect(response.statusCode).toBe(status);
  expect(response.body).toContain(errMessage);

  env.STAGE = envBefore.STAGE;
  env.IMPERSONATION_LOGIN_ENABLED = envBefore.IMPERSONATION_LOGIN_ENABLED;
});
