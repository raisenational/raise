import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { middyfy } from '../../../../helpers/wrapper';
import env from '../../../../env/env';
import { login } from '../../../../helpers/login';
import { $RefreshLoginRequest, $LoginResponse } from '../../../../schemas';
import { RefreshTokenPayload } from '../../../../helpers/types';

// Given a Raise refresh token, generate a new Raise access token
export const main = middyfy($RefreshLoginRequest, $LoginResponse, false, async (event) => {
  const oldToken = verifyRefreshToken(event.body.refreshToken);

  const newTokens = await login(oldToken.subject);
  return {
    accessToken: newTokens.accessToken,
    groups: newTokens.groups,

    // Avoid extending the refresh token forever.
    // We could consider changing this behavior: it might be reasonable to continue extending.
    refreshToken: {
      value: event.body.refreshToken,
      expiresAt: oldToken.exp,
    },
  };
});

const verifyRefreshToken = (refreshToken: string): RefreshTokenPayload => {
  let token: RefreshTokenPayload;
  try {
    const verifiedPayload = jwt.verify(refreshToken, env.JWT_PUBLIC_KEY, { algorithms: ['ES256'], ignoreExpiration: true });
    token = typeof verifiedPayload === 'string' ? JSON.parse(verifiedPayload) : verifiedPayload;
  } catch (error) {
    throw new createHttpError.Forbidden('Bad signature on refresh token');
  }

  const isTokenType = (typeof token === 'object' && token !== null && typeof token.subject === 'string' && typeof token.iat === 'number' && typeof token.exp === 'number');
  if (!isTokenType) {
    throw new createHttpError.BadRequest('Invalid refresh token payload shape');
  }

  if (Date.now() / 1000 > token.exp) {
    throw new createHttpError.Forbidden('Refresh token has expired. Try refreshing the page, and logging in again.');
  }

  if (env.JWT_REQUIRE_ISSUED_AT_AFTER !== undefined && token.iat < env.JWT_REQUIRE_ISSUED_AT_AFTER) {
    throw new createHttpError.Forbidden('Your token is too old. Try logging out and in again.');
  }

  return token;
};
