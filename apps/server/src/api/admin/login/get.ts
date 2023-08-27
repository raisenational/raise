import jwt from 'jsonwebtoken';
import { middyfy } from '../../../helpers/wrapper';
import { AccessTokenPayload } from '../../../helpers/types';
import { $Profile } from '../../../schemas';

export const main = middyfy(null, $Profile, true, async (event) => {
  const payload = jwt.decode(event.auth.token, { json: true }) as AccessTokenPayload;

  return {
    email: payload.subject,
    groups: payload.groups,
    issuedAt: payload.iat,
    expiresAt: payload.exp,
    sourceIp: event.requestContext.http.sourceIp,
  };
});
