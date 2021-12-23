import { call } from "../../../../../local/testHelpers"
import { main } from "./post"
import { main as getFundraisers } from "../../fundraisers/get"
import * as db from "../../../../helpers/db"
import env from "../../../../env/env"

jest.mock("../../../../helpers/groups", () => ({
  getGroups: jest.fn().mockImplementation((email) => (email === "test@joinraise.org" ? [] : undefined)),
}))

test("get working access token for allowlisted email", async () => {
  jest.spyOn(db, "insertAudit")

  const response = await call(main, { auth: false })({
    email: "test@joinraise.org",
  })

  expect(response.expiresAt).toBeGreaterThan(new Date().getTime() / 1000)
  expect((await call(getFundraisers, { auth: response.accessToken, rawResponse: true })(null)).statusCode).toBe(200)
  expect(db.insertAudit).toHaveBeenCalledWith({
    object: "test@joinraise.org",
    action: "login",
  })
})

test.each([
  ["with non-allowlisted email", { email: "bad@joinraise.org" }, "not allowlisted", 403],
])("rejects %s", async (description, payload, errMessage, status) => {
  const response = await call(main, { rawResponse: true, auth: false })(payload)

  expect(response.statusCode).toBe(status)
  expect(response.body).toContain(errMessage)
})

test.each([
  ["with non-enabled env", { STAGE: "dev", IMPERSONATION_LOGIN_ENABLED: false } as const, "not enabled", 403],
  ["in the prod stage", { STAGE: "prod", IMPERSONATION_LOGIN_ENABLED: true } as const, "not be enabled in prod", 403],
])("rejects %s", async (description, envOverrides, errMessage, status) => {
  const envBefore = { ...env }
  env.STAGE = envOverrides.STAGE
  env.IMPERSONATION_LOGIN_ENABLED = envOverrides.IMPERSONATION_LOGIN_ENABLED

  const response = await call(main, { rawResponse: true, auth: false })({ email: "test@joinraise.org" })

  expect(response.statusCode).toBe(status)
  expect(response.body).toContain(errMessage)

  env.STAGE = envBefore.STAGE
  env.IMPERSONATION_LOGIN_ENABLED = envBefore.IMPERSONATION_LOGIN_ENABLED
})
