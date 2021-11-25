import {
  auditContext,
  middyAuditContextManagerAfter,
  middyAuditContextManagerBefore,
} from "./auditContext"
import type { APIGatewayEvent } from "./types"

test("before sets up the auditContext with an unauthed-event", () => {
  // Given we're not in an auditContext
  auditContext.value = undefined

  // When we run the before hook
  middyAuditContextManagerBefore({
    event: {
      requestContext: {
        http: {
          sourceIp: "123.123.123.123",
          userAgent: "some browser",
          method: "POST",
          path: "/a/path/with/ABCD123",
          protocol: "https",
        },
        routeKey: "POST /a/path/with/{param}",
      },
    } as APIGatewayEvent,
  })

  // Then the audit context is set up as expected
  expect(auditContext.value).toEqual({
    route: "POST /a/path/with/{param}",
    routeRaw: "POST /a/path/with/ABCD123",
    sourceIp: "123.123.123.123",
    subject: "public",
    userAgent: "some browser",
  })
})

test("before sets up the auditContext with an authed-event", () => {
  // Given we're not in an auditContext
  auditContext.value = undefined

  // When we run the before hook
  middyAuditContextManagerBefore({
    event: {
      requestContext: {
        http: {
          sourceIp: "123.123.123.123",
          userAgent: "some browser",
          method: "POST",
          path: "/a/path/with/ABCD123",
          protocol: "https",
        },
        routeKey: "POST /a/path/with/{param}",
      },
      auth: {
        payload: {
          subject: "ajones@joinraise.org",
          groups: ["National"],
          iat: Math.floor(new Date().getTime() / 1000),
          exp: Math.floor(new Date().getTime() / 1000) + 1000,
        },
        token: "ey1.2.3",
      },
    } as APIGatewayEvent,
  })

  // Then the audit context is set up as expected
  expect(auditContext.value).toEqual({
    route: "POST /a/path/with/{param}",
    routeRaw: "POST /a/path/with/ABCD123",
    sourceIp: "123.123.123.123",
    subject: "ajones@joinraise.org",
    userAgent: "some browser",
  })
})

test("after clears the auditContext", () => {
  // Given we're in an auditContext
  auditContext.value = {
    route: "POST /a/path/with/{param}",
    routeRaw: "POST /a/path/with/ABCD123",
    sourceIp: "123.123.123.123",
    subject: "public",
    userAgent: "some browser",
  }

  // When we run the after hook
  middyAuditContextManagerAfter()

  // Then the auditContext is clearer
  expect(auditContext.value).toBeUndefined()
})
