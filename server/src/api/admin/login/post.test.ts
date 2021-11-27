import { call } from "../../../../local/testHelpers"
import env from "../../../env/env"
import { main } from "./post"
import { main as getFundraisers } from "../fundraisers/get"
import * as db from "../../../helpers/db"

const googleTokenPayload = {
  iss: "accounts.google.com", // verified by the real library
  email_verified: true,
  sub: "12345",
  email: "test@joinraise.org",
  aud: env.GOOGLE_CLIENT_ID, // verified by the real library
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

test("get working access token for valid Google token", async () => {
  jest.spyOn(db, "insertAudit")

  getPayload.mockReturnValue(googleTokenPayload)

  const response = await call(main)({
    idToken: "idTokenValue",
    accessToken: "accessTokenValue",
  })

  expect(verifyIdToken).toHaveBeenCalledTimes(1)
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: "idTokenValue",
    audience: env.GOOGLE_CLIENT_ID,
  })
  expect(response.expiresAt).toBeGreaterThan(new Date().getTime() / 1000)
  expect((await call(getFundraisers, { auth: response.accessToken, rawResponse: true })(null)).statusCode).toBe(200)
  expect(db.insertAudit).toHaveBeenCalledWith({
    object: "test@joinraise.org",
    action: "login",
  })
})

test.each([
  ["missing payload", undefined, "idToken: missing payload"],
  ["missing email", { ...googleTokenPayload, email: undefined }, "idToken: missing email"],
  ["with unverified email", { ...googleTokenPayload, email_verified: false }, "idToken: email not verified"],
])("rejects Google token %s", async (description, token, errMessage) => {
  getPayload.mockReturnValue(token)

  const response = await call(main, { rawResponse: true })({
    idToken: "idTokenValue",
    accessToken: "accessTokenValue",
  })

  expect(verifyIdToken).toHaveBeenCalledTimes(1)
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: "idTokenValue",
    audience: env.GOOGLE_CLIENT_ID,
  })

  expect(response.statusCode).toBe(401)
  expect(response.body).toContain(errMessage)
})

test("rejects invalid Google token", async () => {
  verifyIdToken.mockRejectedValueOnce("Invalid token for some reason!")

  const response = await call(main, { rawResponse: true })({
    idToken: "idTokenValue",
    accessToken: "accessTokenValue",
  })

  expect(verifyIdToken).toHaveBeenCalledTimes(1)
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: "idTokenValue",
    audience: env.GOOGLE_CLIENT_ID,
  })

  expect(response.statusCode).toBe(401)
  expect(response.body).toContain("idToken: not valid")
  expect(response.body).not.toContain("Invalid token for some reason!")
})
