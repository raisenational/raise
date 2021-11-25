import type {
  APIGatewayProxyEventV2, APIGatewayProxyResult, Handler, Context, APIGatewayProxyEventHeaders,
} from "aws-lambda"
import jwt from "jsonwebtoken"
import { ulid } from "ulid"
import { AuthTokenPayload } from "./types"
import env from "../env/env"
import { Fundraiser } from "./schemaTypes"

test.skip("testHelpers", () => { /* noop */ })

interface CallOptions {
  path?: string,
  pathParameters?: Record<string, string>,
  rawResponse?: boolean,
}

export const callWithAuth = (handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResult>, options: CallOptions = {}) => async (body: any): Promise<any> => {
  const now = Math.floor(new Date().getTime() / 1000)
  const authTokenPayload: AuthTokenPayload = {
    subject: "tests",
    groups: [],
    iat: now,
    exp: now + 60, // 1 minute
  }

  const token = jwt.sign(
    authTokenPayload,
    env.JWT_PRIVATE_KEY,
    { algorithm: "ES256" },
  )

  const response = await handler(
    {
      routeKey: `UNKNOWN ${options.path ?? "/unknown"}`,
      rawPath: options.path ?? "/unknown",
      rawQueryString: "",
      headers: {
        authorization: `Bearer ${token}`,
      } as APIGatewayProxyEventHeaders,
      requestContext: {
        accountId: "12345678",
        http: {
          method: "UNKNOWN",
          path: options.path ?? "/unknown",
          protocol: "HTTP/1.1",
          sourceIp: "123.123.123.123",
          userAgent: "some browser",
        },
      },
      body: body ? JSON.stringify(body) : null,
      pathParameters: options.pathParameters ?? {},
    } as APIGatewayProxyEventV2,
    {
      awsRequestId: "request-123456789",
    } as Context,
    () => { throw new Error("expected to return promise, not invoke callback") },
  )

  return options.rawResponse ? response : JSON.parse(response!.body)
}

export const makeFundraiser = (): Fundraiser => ({
  id: ulid(),
  fundraiserName: "Test Fundraiser",
  activeFrom: Math.floor(new Date().getTime() / 1000),
  activeTo: Math.floor(new Date().getTime() / 1000) + 10000,
  recurringDonationsTo: Math.floor(new Date().getTime() / 1000) + 20000,
  paused: false,
  goal: Math.ceil(Math.random() * 4) * 500_00,
  totalRaised: 0,
  donationsCount: 0,
  matchFundingRate: 0,
  matchFundingPerDonationLimit: null,
  matchFundingRemaining: null,
  minimumDonationAmount: null,
  groupsWithAccess: ["Test"],
  suggestedDonationAmountOneOff: Math.ceil(Math.random() * 4) * 50_00,
  suggestedDonationAmountWeekly: Math.ceil(Math.random() * 4) * 5_00,
  suggestedContributionAmount: 10_00,
})
