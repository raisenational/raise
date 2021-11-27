/* eslint-disable no-console */
import middy from "@middy/core"
import middyValidator from "@middy/validator"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import createHttpError from "http-errors"
import { EncryptionAlgorithms, JWTAuthMiddleware } from "middy-middleware-jwt-auth"
import type { APIGatewayProxyEventV2, APIGatewayProxyResult, Handler as AWSHandler } from "aws-lambda"
import type { Handler, AuthTokenPayload, APIGatewayEvent } from "./types"
import { middyAuditContextManagerAfter, middyAuditContextManagerBefore } from "./auditContext"
import middyErrorHandler from "./middy-error-handler"
import env from "../env/env"

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

export function middyfy<RequestSchema, ResponseSchema, RequiresAuth extends boolean>(requestSchema: RequestSchema, responseSchema: ResponseSchema, requiresAuth: RequiresAuth, handler: Handler<RequestSchema, ResponseSchema, RequiresAuth>): AWSHandler<APIGatewayProxyEventV2, APIGatewayProxyResult> {
  try {
    return middy(handler)
      .before(middyAuditContextManagerBefore)
      .after(middyAuditContextManagerAfter)
      .use(new JWTAuthMiddleware({
        algorithm: EncryptionAlgorithms.ES256,
        credentialsRequired: requiresAuth,
        isPayload: (token: AuthTokenPayload): token is AuthTokenPayload => {
          const isTokenType = (typeof token === "object" && token !== null && typeof token.subject === "string" && Array.isArray(token.groups) && token.groups.every((g: string) => typeof g === "string") && typeof token.iat === "number" && typeof token.exp === "number")
          if (!isTokenType) return false
          if (env.JWT_REQUIRE_ISSUED_AT_AFTER !== undefined && token.iat < env.JWT_REQUIRE_ISSUED_AT_AFTER) throw new createHttpError.Forbidden("Your token is too old. Try logging out and in again.")
          return true
        },
        secretOrPublicKey: env.JWT_PUBLIC_KEY,
      }))
      .before(({ event }: { event: APIGatewayEvent }) => {
        if (requestSchema !== null && event.headers["content-type"] !== "application/json") {
          throw new createHttpError.UnsupportedMediaType()
        }
      })
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
      .before(middyAuditContextManagerBefore)
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
