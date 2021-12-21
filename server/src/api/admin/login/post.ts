import { OAuth2Client } from "google-auth-library"
import createHttpError from "http-errors"
import jwt from "jsonwebtoken"
import { middyfy } from "../../../helpers/wrapper"
import { accessTokenSchema, idAndAccessTokenSchema } from "../../../helpers/schemas"
import { insertAudit } from "../../../helpers/db"
import { AuthTokenPayload } from "../../../helpers/types"
import env from "../../../env/env"
import { getGroups } from "../../../helpers/groups"

// Exchanges a Google id and access token for a Raise access token
export const main = middyfy(idAndAccessTokenSchema, accessTokenSchema, false, async (event) => {
  const client = new OAuth2Client()
  const tokenPayload = (await client.verifyIdToken({
    idToken: event.body.idToken,
    audience: env.GOOGLE_CLIENT_ID,
  }).catch(() => { throw new createHttpError.Unauthorized("idToken: not valid") })).getPayload()

  if (!tokenPayload) throw new createHttpError.Unauthorized("idToken: missing payload")
  if (!tokenPayload.email) throw new createHttpError.Unauthorized("idToken: missing email")
  if (!tokenPayload.email_verified) throw new createHttpError.Unauthorized("idToken: email not verified")

  await insertAudit({
    object: tokenPayload.email,
    action: "login",
  })
  const now = Math.floor(new Date().getTime() / 1000)
  const expiresAt = now + 3600 // 1 hour

  const groups = getGroups(tokenPayload.email)
  if (groups === undefined) {
    throw new createHttpError.Forbidden(`Your account, ${tokenPayload.email}, is not allowlisted to use the platform`)
  }

  const authTokenPayload: AuthTokenPayload = {
    subject: tokenPayload.email,
    groups,
    iat: now,
    exp: expiresAt,
  }

  return {
    accessToken: jwt.sign(
      authTokenPayload,
      env.JWT_PRIVATE_KEY,
      { algorithm: "ES256" },
    ),
    expiresAt,
  }
})
