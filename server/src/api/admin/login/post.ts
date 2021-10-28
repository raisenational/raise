import "source-map-support/register"
import { OAuth2Client } from "google-auth-library"
import createHttpError from "http-errors"
import jwt from "jsonwebtoken"
import { middyfy } from "../../../helpers/wrapper"
import { accessTokenSchema, idAndAccessTokenSchema } from "../../../helpers/schemas"
import { insertAudit } from "../../../helpers/db"
import { AuthTokenPayload } from "../../../helpers/types"

// Exchanges a Google id and access token for a Raise access token
export const main = middyfy(idAndAccessTokenSchema, accessTokenSchema, false, async (event) => {
  const client = new OAuth2Client()
  const tokenPayload = (await client.verifyIdToken({
    idToken: event.body.idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  }).catch(() => { throw new createHttpError.Unauthorized("idToken: not valid") })).getPayload()

  if (!tokenPayload) throw new createHttpError.Unauthorized("idToken: missing payload")
  if (!tokenPayload.email) throw new createHttpError.Unauthorized("idToken: missing email")
  if (!tokenPayload.email_verified) throw new createHttpError.Unauthorized("idToken: email not verified")

  // TODO: allowlist of users / restrict to G Suite domain with hd
  await insertAudit({
    object: tokenPayload.email,
    action: "login",
  })
  const now = Math.floor(new Date().getTime() / 1000)

  const authTokenPayload: AuthTokenPayload = {
    subject: tokenPayload.email,
    groups: ["National"],
    iat: now,
    exp: now + 28800, // 8 hours
  }

  return {
    accessToken: jwt.sign(
      authTokenPayload,
      process.env.JWT_PRIVATE_KEY!,
      { algorithm: "ES256" },
    ),
    expiresAt: now + 28800,
  }
})
