import middy from "@middy/core"

type AuditContext = {
  value: undefined | {
    subject: string,
    sourceIp: string,
    userAgent: string,
    route: string,
    routeRaw: string,
  },
}

// Ugly global variable to use for auditContext
// Will be present provided the middleware has run e.g. in a function wrapped by middify
// May be funky in reused environments e.g. serverless-offline or lambdas not wrapped by middify e.g. scheduler
export const auditContext: AuditContext = { value: undefined }

// TODO: better typings
export const middyAuditContextManager: middy.MiddlewareObj = {
  before: ({ event }) => {
    const subject: string = event.auth?.payload.email ?? (event.requestContext.http.path.startsWith("/stripe/") ? "stripe" : "public")

    auditContext.value = {
      subject,
      sourceIp: event.requestContext.http.sourceIp,
      userAgent: event.requestContext.http.userAgent,
      route: event.requestContext.routeKey,
      routeRaw: `${event.requestContext.http.method} ${event.requestContext.http.path}`,
    }
  },
  after: () => {
    auditContext.value = undefined
  },
}
