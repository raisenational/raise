import createHttpError from "http-errors"
import { middyfy } from "../../../../helpers/wrapper"
import { accessTokenSchema, impersonationLoginRequestSchema } from "../../../../helpers/schemas"
import env from "../../../../env/env"
import { login } from "../../../../helpers/login"

// Given an email, creates a Raise access token
// Only for testing purposes, never to be used in prod
export const main = middyfy(impersonationLoginRequestSchema, accessTokenSchema, false, async (event) => {
  if (!env.IMPERSONATION_LOGIN_ENABLED) throw new createHttpError.Forbidden("Impersonation login is not enabled")

  // prod should have IMPERSONATION_LOGIN_ENABLED disabled, but just as an extra check
  if (env.STAGE === "prod") throw new createHttpError.Forbidden("Impersonation login should not be enabled in prod")

  return login(event.body.email)
})
