import { OAuth2Client } from "google-auth-library"
import createHttpError from "http-errors"
import { middyfy } from "../../../../helpers/wrapper"
import { googleLoginRequestSchema, loginResponseSchema } from "../../../../helpers/schemas"
import env from "../../../../env/env"
import { login } from "../../../../helpers/login"

// Exchanges a Google id and access token for a Raise access token
export const main = middyfy(googleLoginRequestSchema, loginResponseSchema, false, async (event) => {
  const client = new OAuth2Client()
  const tokenPayload = (await client.verifyIdToken({
    idToken: event.body.idToken,
    audience: env.GOOGLE_CLIENT_ID,
  }).catch(() => { throw new createHttpError.Unauthorized("idToken: not valid") })).getPayload()

  if (!tokenPayload) throw new createHttpError.Unauthorized("idToken: missing payload")
  if (!tokenPayload.email) throw new createHttpError.Unauthorized("idToken: missing email")
  if (!tokenPayload.email_verified) throw new createHttpError.Unauthorized("idToken: email not verified")

  return login(tokenPayload.email)
})
