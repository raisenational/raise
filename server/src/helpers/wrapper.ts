/* eslint-disable no-console */
import middy from "@middy/core"
import middyValidator from "@middy/validator"
import createHttpError from "http-errors"
import { EncryptionAlgorithms, JWTAuthMiddleware } from "middy-middleware-jwt-auth"
import type { APIGatewayProxyEventV2, APIGatewayProxyResult, Handler as AWSHandler } from "aws-lambda"
import type { Handler, AuthTokenPayload } from "./types"
import { middyAuditContextManager } from "./auditContext"
import middyJsonBodyParser from "./http-json-body-parser"
import middyErrorHandler from "./middy-error-handler"

const middyJsonBodySerializer: middy.MiddlewareFn<unknown, unknown> = async (request) => {
  request.response = {
    statusCode: request.response === undefined ? 204 : 200,
    body: request.response === undefined ? undefined : JSON.stringify(request.response),
    headers: {
      "Content-Type": "application/json",
    },
  }
}

const middyPathParamsValidatorAndNormalizer: middy.MiddlewareFn<APIGatewayProxyEventV2, unknown> = async (request) => {
  request.event.pathParameters = request.event.pathParameters ?? {}
  request.event.routeKey.match(/\{[a-zA-Z0-9]*\}/g)?.map((k) => k.slice(1, -1)).forEach((k) => {
    if (request.event.pathParameters![k] === undefined) {
      throw new createHttpError.BadRequest(`Missing path parameter ${k}`)
    }
  })
}

// TODO: add tests to check this works, particularly checking async error handling works (I don't think it does)
export function middyfy<RequestSchema, ResponseSchema, RequiresAuth extends boolean>(requestSchema: RequestSchema, responseSchema: ResponseSchema, requiresAuth: RequiresAuth, handler: Handler<RequestSchema, ResponseSchema, RequiresAuth>): AWSHandler<APIGatewayProxyEventV2, APIGatewayProxyResult> {
  try {
    return middy(handler)
      .use(new JWTAuthMiddleware({
        algorithm: EncryptionAlgorithms.ES256,
        credentialsRequired: requiresAuth,
        isPayload: (token: AuthTokenPayload): token is AuthTokenPayload => typeof token === "object" && token !== null && typeof token.subject === "string" && Array.isArray(token.groups) && token.groups.every((g: string) => typeof g === "string") && typeof token.iat === "number" && typeof token.exp === "number",
        secretOrPublicKey: process.env.JWT_PUBLIC_KEY!,
      }))
      .use(middyJsonBodyParser())
      .after(middyJsonBodySerializer)
      .use(middyValidator({
        inputSchema: requestSchema === null ? { type: "object", properties: { body: { type: "null" } } } : { type: "object", properties: { body: requestSchema } },
        outputSchema: responseSchema === null ? undefined /* enforced by types as cannot validate the response is undefined */ : responseSchema,
        ajvOptions: {
          strict: true,
          allErrors: true,
          useDefaults: false,
          coerceTypes: false,
        },
      }))
      .before(middyPathParamsValidatorAndNormalizer)
      .use(middyAuditContextManager)
      .onError(middyErrorHandler) as unknown as AWSHandler<APIGatewayProxyEventV2, APIGatewayProxyResult>
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
