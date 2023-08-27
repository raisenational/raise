import type { ScheduledHandler } from 'aws-lambda';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import env from '../../env/env';
import type { AccessTokenPayload } from '../../helpers/types';
import 'source-map-support/register';

export const main: ScheduledHandler<unknown> = async () => {
  const now = Math.floor(new Date().getTime() / 1000);
  const authTokenPayload: AccessTokenPayload = {
    subject: 'scheduler',
    groups: [],
    iat: now,
    exp: now + 60, // 1 minute
  };

  const token = jwt.sign(
    authTokenPayload,
    env.JWT_PRIVATE_KEY,
    { algorithm: 'ES256' },
  );

  await axios('/scheduler/collect-payments', {
    baseURL: env.API_BASE_URL,
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 300_000, // 5 minutes
  });
};
