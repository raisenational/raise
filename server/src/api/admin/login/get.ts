import jwt from "jsonwebtoken"
import { middyfy } from "../../../helpers/wrapper"
import { profileSchema } from "../../../helpers/schemas"
import { AuthTokenPayload } from "../../../helpers/types"

export const main = middyfy(null, profileSchema, true, async (event) => {
  const payload = jwt.decode(event.auth.token, { json: true }) as AuthTokenPayload

  return {
    email: payload.subject,
    groups: payload.groups,
    issuedAt: payload.iat,
    expiresAt: payload.exp,
    sourceIp: event.requestContext.http.sourceIp,
  }
})
