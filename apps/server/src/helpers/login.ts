import { fixedGroups } from '@raise/shared';
import { createHash } from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import env from '../env/env';
import { LoginResponse, Ulid, User } from '../schemas';
import { insertAudit, scan } from './db';
import { userTable } from './tables';
import { AccessTokenPayload, RefreshTokenPayload } from './types';

export const login = async (email: string): Promise<LoginResponse> => {
  const now = Math.floor(new Date().getTime() / 1000);
  const groups = await getGroups(email);

  await insertAudit({
    object: email,
    action: 'login',
  });

  const authTokenPayload: AccessTokenPayload = {
    subject: email,
    groups,
    iat: now,
    exp: now + 3600, // 1 hour
  };

  const refreshTokenPayload: RefreshTokenPayload = {
    subject: email,
    iat: now,
    exp: now + 3600 * 24, // 1 day
  };

  return {
    accessToken: {
      value: jwt.sign(
        authTokenPayload,
        env.JWT_PRIVATE_KEY,
        { algorithm: 'ES256' },
      ),
      expiresAt: authTokenPayload.exp,
    },
    refreshToken: {
      value: jwt.sign(
        refreshTokenPayload,
        env.JWT_PRIVATE_KEY,
        { algorithm: 'ES256' },
      ),
      expiresAt: refreshTokenPayload.exp,
    },
    groups,
  };
};

const SECURITY_TRAINING_VALIDITY_IN_SECONDS = 31556952; // 1 year

// Map from SHA1_hex(lowercase Google account email) to use definition
// We use hashes to avoid checking-in people's personal emails to the repo
const HARD_CODED_USER_MAP: Record<string, Omit<User, 'id' | 'email'>> = {
  '715ec86cfb0e42b3f41aec77fa7b4a8441128d5e': {
    name: 'Adam Jones',
    groups: [fixedGroups.National, fixedGroups.NationalTech],
    securityTrainingCompletedAt: new Date('2023-01-02T18:47:46Z').getTime() / 1000,
  },
  '7b023b5154a262453b5c3f1157a866a8f3be6f63': {
    name: 'Malena Schmidt',
    groups: [fixedGroups.National, fixedGroups.NationalTech],
    securityTrainingCompletedAt: new Date('2023-01-16T21:58:46Z').getTime() / 1000,
  },
};

/**
 * This should only be used for login. In other places, we should be getting groups from the decoded JWT
 * @returns array of group ids for a given email
 * */
const getGroups = async (email: string): Promise<Ulid[]> => {
  // TODO: add secondary index to query by
  const usersFromDb = await scan(userTable);
  const user = usersFromDb.find((u) => u.email === email) ?? HARD_CODED_USER_MAP[createHash('sha1').update(email.toLowerCase()).digest('hex')];

  if (user === undefined) {
    throw new createHttpError.Forbidden(`Your account, ${email}, is not allowlisted to use the platform`);
  }

  if (user.securityTrainingCompletedAt + SECURITY_TRAINING_VALIDITY_IN_SECONDS < new Date().getTime() / 1000) {
    throw new createHttpError.Forbidden(`Security training for ${email} out of date, last marked completed on ${new Date(user.securityTrainingCompletedAt * 1000)}`);
  }

  return user.groups;
};
