import createHttpError from "http-errors"
import { call } from "../../../../../local/testHelpers"
import env from "../../../../env/env"
import { main } from "./post"
import { main as getFundraisers } from "../../fundraisers/get"
import * as db from "../../../../helpers/db"

const googleTokenPayload = {
  iss: "accounts.google.com", // verified by the real library
  email_verified: true,
  sub: "12345",
  email: "test@joinraise.org",
  aud: env.GOOGLE_LOGIN_CLIENT_ID, // verified by the real library
  iat: 1609459200,
  exp: 2524608000, // verified by the real library
}

const getPayload = jest.fn()
const verifyIdToken = jest.fn().mockResolvedValue({ getPayload })

jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken,
  })),
}))

jest.mock("../../../../helpers/groups", () => ({
  getGroups: jest.fn().mockImplementation((email) => {
    if (email === "test@joinraise.org") return []
    throw new createHttpError.Forbidden(`Your account, ${email}, is not allowlisted to use the platform`)
  }),
}))

test("get working access token for valid Google token", async () => {
  jest.spyOn(db, "insertAudit")

  getPayload.mockReturnValue(googleTokenPayload)

  const response = await call(main, { auth: false })({
    idToken: "idTokenValue",
    accessToken: "accessTokenValue",
  })

  expect(verifyIdToken).toHaveBeenCalledTimes(1)
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: "idTokenValue",
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  })
  expect(response.expiresAt).toBeGreaterThan(new Date().getTime() / 1000)
  expect((await call(getFundraisers, { auth: response.accessToken, rawResponse: true })(null)).statusCode).toBe(200)
  expect(db.insertAudit).toHaveBeenCalledWith({
    object: "test@joinraise.org",
    action: "login",
  })
})

test.each([
  ["missing payload", undefined, "idToken: missing payload", 401],
  ["missing email", { ...googleTokenPayload, email: undefined }, "idToken: missing email", 401],
  ["with unverified email", { ...googleTokenPayload, email_verified: false }, "idToken: email not verified", 401],
  ["with non-allowlisted email", { ...googleTokenPayload, email: "bad@joinraise.org" }, "not allowlisted", 403],
])("rejects Google token %s", async (description, token, errMessage, status) => {
  getPayload.mockReturnValue(token)

  const response = await call(main, { rawResponse: true, auth: false })({
    idToken: "idTokenValue",
    accessToken: "accessTokenValue",
  })

  expect(verifyIdToken).toHaveBeenCalledTimes(1)
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: "idTokenValue",
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  })

  expect(response.statusCode).toBe(status)
  expect(response.body).toContain(errMessage)
})

test("rejects invalid Google token", async () => {
  verifyIdToken.mockRejectedValueOnce("Invalid token for some reason!")

  const response = await call(main, { rawResponse: true, auth: false })({
    idToken: "idTokenValue",
    accessToken: "accessTokenValue",
  })

  expect(verifyIdToken).toHaveBeenCalledTimes(1)
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: "idTokenValue",
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  })

  expect(response.statusCode).toBe(401)
  expect(response.body).toContain("idToken: not valid")
  expect(response.body).not.toContain("Invalid token for some reason!")
})

test("rejects when Google login disabled", async () => {
  const envBefore = { ...env }
  env.GOOGLE_LOGIN_ENABLED = false

  const response = await call(main, { rawResponse: true, auth: false })({
    idToken: "idTokenValue",
    accessToken: "accessTokenValue",
  })

  expect(verifyIdToken).not.toHaveBeenCalled()
  expect(response.statusCode).toBe(401)
  expect(response.body).toContain("not enabled")

  env.GOOGLE_LOGIN_ENABLED = envBefore.GOOGLE_LOGIN_ENABLED
})
