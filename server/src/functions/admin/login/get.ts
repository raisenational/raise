import "source-map-support/register"
import jwt from "jsonwebtoken"
import { middyfy } from "../../../helpers/wrapper"
import { profileSchema } from "../../../helpers/schemas"

export const main = middyfy(null, profileSchema, true, async (event) => {
  const payload = jwt.decode(event.auth.token, { json: true })!

  return {
    email: payload.email,
    groups: payload.groups,
    issuedAt: payload.iat!,
    expiresAt: payload.exp!,
  }
})
