import type { APIGatewayProxyEventV2, Context } from "aws-lambda"
import type { JSONSchema } from "./schemas"

export type AuthTokenPayload = {
  email: string,
  groups: string[],
}

// The API event we have to handle after our middlewares have run
export type APIGatewayEvent<Body = unknown, Auth = { payload: AuthTokenPayload, token: string } | undefined> = Omit<APIGatewayProxyEventV2, "body" | "pathParameters"> & {
  body: Body,
  rawBody: Body extends null ? unknown : string,
  pathParameters: Record<string, string>,
  auth: Auth,
}

export type Handler<RequestSchema, ResponseSchema, RequiresAuth> = (
  event: APIGatewayEvent<
    RequestSchema extends JSONSchema<infer T> ? T : null,
    RequiresAuth extends true ? { payload: AuthTokenPayload, token: string } : undefined
  >,
  context: Context) => Promise<ResponseSchema extends JSONSchema<infer T> ? T : void>
