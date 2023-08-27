import type {
  APIGatewayProxyEventV2, APIGatewayProxyResult, Handler, Context, APIGatewayProxyEventHeaders,
} from "aws-lambda"
import jwt from "jsonwebtoken"
import { ulid } from "ulid"
import { fixedGroups } from "@raise/shared"
import { AccessTokenPayload } from "../src/helpers/types"
import env from "../src/env/env"
import MockDate from 'mockdate';
import * as db from "../src/helpers/db"
import { AuditLog, Donation, Fundraiser, Payment } from "../src/schemas"

interface CallOptions {
  path?: string,
  routeKey?: string,
  pathParameters?: Record<string, string | undefined>,
  headers?: Record<string, string | undefined>,
  rawResponse?: boolean,
  auth?: Partial<AccessTokenPayload> | false | string,
  authKey?: string
  rawBody?: boolean,
}

export const testGroupId = "01GPYGNDBDHY9685YHRKWT6VE7";

export const call = (handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResult>, options: CallOptions = {}) => async (body: any): Promise<any> => {
  const now = Math.floor(new Date().getTime() / 1000)
  const token = typeof options.auth === "string" ? options.auth : jwt.sign(
    {
      subject: "tests",
      groups: [fixedGroups.National, testGroupId],
      iat: now,
      exp: now + 60, // 1 minute
      ...options.auth
    },
    options.authKey ?? env.JWT_PRIVATE_KEY,
    { algorithm: "ES256" },
  )

  process.env.AWS_REGION = 'eu-test-1';
  const response = await handler(
    {
      routeKey: options.routeKey ?? `UNKNOWN ${options.path ?? "/unknown"}`,
      rawPath: options.path ?? "/unknown",
      rawQueryString: "",
      headers: {
        authorization: options.auth === false ? undefined : `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
        ...options.headers,
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
      body: body ? (options.rawBody ? body : JSON.stringify(body)) : null,
      pathParameters: options.pathParameters ?? {},
    } as APIGatewayProxyEventV2,
    {
      awsRequestId: "request-123456789",
      logGroupName: "aws/lambda/raise-server-stage-myFunc",
      logStreamName: "2022/01/01/[$LATEST]123456789",
    } as Context,
    () => { throw new Error("expected to return promise, not invoke callback") },
  )
  process.env.AWS_REGION = undefined;
  if (!response) throw new Error("No response returned")

  if (options.rawResponse) return response
  if (response.statusCode > 300) throw new Error(`Unexpected status: ${response.statusCode}, body is ${response.body}`)
  if (response.body === undefined) return undefined
  return JSON.parse(response.body)
}

export const makeFundraiser = <Override extends Partial<Fundraiser>>(override?: Override): Fundraiser & Override => ({
  id: ulid(),
  internalName: "Raise Test 2022",
  publicName: "Raise Test",
  activeFrom: Math.floor(new Date().getTime() / 1000),
  activeTo: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
  recurringDonationsTo: Math.floor(new Date().getTime() / 1000) + 2419200, // 4 weeks
  paused: false,
  currency: Math.random() < 0.5 ? "gbp" : "usd",
  goal: Math.ceil(Math.random() * 4) * 500_00,
  totalRaised: 0,
  donationsCount: 0,
  matchFundingRate: Math.floor(Math.random() * 6) * 50,
  matchFundingPerDonationLimit: null,
  matchFundingRemaining: null,
  minimumDonationAmount: null,
  groupsWithAccess: [testGroupId],
  suggestedDonationAmountOneOff: Math.ceil(Math.random() * 4) * 50_00,
  suggestedDonationAmountWeekly: Math.ceil(Math.random() * 4) * 5_00,
  suggestedContributionAmount: 10_00,
  eventLink: null,
  moreInvolvedLink: null,
  archived: false,
  ...override,
} as Fundraiser & Override)

export const makeDonation = <Override extends Partial<Donation>>(override?: Override): Donation & Override => ({
  id: ulid(),
  fundraiserId: ulid(),
  donorName: "Person McPersonface",
  donorEmail: "person@example.com",
  emailConsentInformational: false,
  emailConsentMarketing: false,
  createdAt: Math.floor(new Date().getTime() / 1000),
  addressLine1: null,
  addressLine2: null,
  addressLine3: null,
  addressPostcode: null,
  addressCountry: null,
  giftAid: false,
  comment: "Keeping up the energy!",
  donationAmount: 0,
  matchFundingAmount: 0,
  contributionAmount: 0,
  recurringAmount: null,
  recurrenceFrequency: null,
  stripeCustomerId: null,
  stripePaymentMethodId: null,
  charity: "AMF",
  overallPublic: false,
  namePublic: false,
  donationAmountPublic: false,
  donationCounted: false,
  ...override,
} as Donation & Override)

export const makePayment = <Override extends Partial<Payment>>(override?: Override): Payment & Override => ({
  id: ulid(),
  donationId: ulid(),
  fundraiserId: ulid(),
  at: Math.floor(new Date().getTime() / 1000),
  donationAmount: Math.ceil(Math.random() * 9) * 10_00,
  contributionAmount: Math.floor(Math.random() * 2) * 10_00,
  matchFundingAmount: Math.ceil(Math.random() * 9) * 10_00,
  method: "cash",
  reference: "Paid to treasurer at SP",
  status: "paid",
  ...override,
} as Payment & Override)

export const makeAuditLog = <Override extends Partial<AuditLog>>(override?: Override): AuditLog & Override => ({
  id: ulid(),
  object: ulid(),
  subject: "raisenational@gmail.com",
  action: "edit",
  at: Math.floor(new Date().getTime() / 1000),
  sourceIp: "1.1.1.1",
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/1.2 Chrome/1.2.3.4 Safari/1.2",
  routeRaw: "GET /admin/somewhere",
  metadata: {
    extraDetailsLocation: "here",
  },
  ttl: null,
  ...override,
} as AuditLog & Override)

export const enableConsole = (): void => {
  (console.error as jest.MockedFunction<typeof console.error>).mockRestore();
  (console.warn as jest.MockedFunction<typeof console.warn>).mockRestore();
  (console.info as jest.MockedFunction<typeof console.info>).mockRestore();
  (console.log as jest.MockedFunction<typeof console.log>).mockRestore()
}

export const setMockDate = (value: Date | number) => {
  MockDate.set(typeof value === "number" ? value * 1000 : value)
}

const withDelay = <Y extends any[], T>(fn: (...args: Y) => Promise<T>) => async (...args: Y): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 20))
  const result = await fn(...args)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 20))
  return result
}

export const delayDb = () => {
  const { scan, get, query, insert, update, inTransaction, } = db
  jest.spyOn(db, "scan").mockImplementation(withDelay(scan))
  jest.spyOn(db, "get").mockImplementation(withDelay(get))
  jest.spyOn(db, "query").mockImplementation(withDelay(query))
  jest.spyOn(db, "insert").mockImplementation(withDelay(insert))
  jest.spyOn(db, "update").mockImplementation(withDelay(update))
  jest.spyOn(db, "inTransaction").mockImplementation(withDelay(inTransaction))
}
