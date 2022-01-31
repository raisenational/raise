import type { APIGatewayProxyEventV2, Context } from "aws-lambda"
import type { Group, JSONSchema } from "@raise/shared"

export interface AuthTokenPayload {
  subject: string,
  groups: Group[],
  iat: number,
  exp: number,
}

export interface TaskDefinition {
  id: string,
  name: string,
  run: () => unknown | Promise<unknown>,
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

export interface Env {
  STAGE: "local" | "dev" | "prod",

  API_BASE_URL: string,

  JWT_PUBLIC_KEY: string,
  JWT_PRIVATE_KEY: string,

  GOOGLE_CLIENT_ID: string,

  STRIPE_PUBLISHABLE_KEY: string,
  STRIPE_SECRET_KEY: string,
  STRIPE_WEBHOOK_SECRET: string,

  SLACK_BOT_TOKEN: string,
  SLACK_CHANNEL_ID: string,

  JWT_REQUIRE_ISSUED_AT_AFTER: number | undefined,

  GOOGLE_LOGIN_ENABLED: boolean,
  IMPERSONATION_LOGIN_ENABLED: boolean,
}
