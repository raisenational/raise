import middy from "@middy/core"
import { insertAudit } from "./db"

const middyErrorHandler: middy.MiddlewareFn<unknown, unknown> = async (request) => {
  const err = (request.error instanceof Error ? request.error : {}) as { statusCode?: number, details?: unknown } & Error

  if (err.statusCode === 401 || err.statusCode === 403) {
    // eslint-disable-next-line no-console
    console.warn("Security error processing request:")
    // eslint-disable-next-line no-console
    console.warn(request.error)
    await insertAudit({
      action: "security",
      metadata: { statusCode: err.statusCode, message: err.message },
    })
  }

  // Log and hide details of unexpected errors
  if (typeof err.statusCode !== "number" || typeof err.message !== "string" || err.statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error("Internal error processing request:")
    // eslint-disable-next-line no-console
    console.error(request.error)
    err.statusCode = typeof err.statusCode === "number" && err.statusCode > 500 ? err.statusCode : 500
    err.message = "An internal error occured"
    err.details = undefined
  }

  // Strip unstringifyable details
  if (err.details !== undefined) {
    try {
      JSON.stringify(err.details)
    } catch {
      // eslint-disable-next-line no-console
      console.error("Failed to stringify details for following error:")
      // eslint-disable-next-line no-console
      console.error(request.error)
      err.details = undefined
    }
  }

  request.response = {
    statusCode: err.statusCode,
    body: JSON.stringify({ message: err.message, details: err.details }),
    headers: {
      "Content-Type": "application/json",
    },
  }
}

export default middyErrorHandler
