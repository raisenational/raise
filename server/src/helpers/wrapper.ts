/* eslint-disable no-console */
import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import middyValidator from "@middy/validator"
import type { FromSchema, JSONSchema } from "json-schema-to-ts"
import type {
  APIGatewayProxyEvent, APIGatewayProxyResult, Context, Handler as AWSHandler,
} from "aws-lambda"

const middyJsonBodySerializer: middy.MiddlewareFn<unknown, unknown> = async (request) => {
  request.response = {
    statusCode: request.response === undefined ? 204 : 200,
    body: request.response === undefined ? undefined : JSON.stringify(request.response),
    headers: {
      "Content-Type": "application/json",
    },
  }
}

const middyErrorHandler: middy.MiddlewareFn<unknown, unknown> = async (request) => {
  const err = (request.error instanceof Error ? request.error : {}) as { statusCode?: number, details?: unknown } & Error

  // Log and hide details of unexpected errors
  if (typeof err.statusCode !== "number" || typeof err.message !== "string" || err.statusCode >= 500) {
    console.error("Internal error processing request:")
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
      console.error("Failed to stringify details for following error:")
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

type Handler<RequestSchema, ResponseSchema> = (event: Omit<APIGatewayProxyEvent, "body"> & { body: RequestSchema extends null ? null : FromSchema<RequestSchema> }, context: Context) => Promise<ResponseSchema extends null ? void : FromSchema<ResponseSchema>>

export function middyfy<RequestSchema extends JSONSchema | null, ResponseSchema extends JSONSchema | null>(requestSchema: RequestSchema, responseSchema: ResponseSchema, handler: Handler<RequestSchema, ResponseSchema>): AWSHandler<APIGatewayProxyEvent, APIGatewayProxyResult> {
  try {
    return middy(handler)
      .use(middyJsonBodyParser())
      .after(middyJsonBodySerializer)
      // TODO: validate that the path parameters are present and are strings
      .use(middyValidator({
        inputSchema: requestSchema === null ? { type: "object", properties: { body: { type: "null" } } } : { type: "object", properties: { body: requestSchema } },
        outputSchema: responseSchema === null ? undefined /* enforced by types as cannot validate the response is undefined */ : responseSchema,
      }))
      .onError(middyErrorHandler) as unknown as AWSHandler<APIGatewayProxyEvent, APIGatewayProxyResult>
  } catch (err) {
    console.error("Severe internal error processing request:")
    console.error(err)
    return async () => ({
      statusCode: 500,
      body: JSON.stringify({ message: "An internal error occured" }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
