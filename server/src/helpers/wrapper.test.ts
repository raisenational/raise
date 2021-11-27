import { call } from "../../local/testHelpers"
import { middyfy } from "./wrapper"
import type { JSONSchema } from "./schemas"

const greetRequestSchema: JSONSchema<{ greetingWord?: string, greetee: string }> = {
  type: "object",
  properties: {
    greetingWord: { type: "string" },
    greetee: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
  required: ["greetee"],
}

const greetResponseSchema: JSONSchema<{ greeting: string }> = {
  type: "object",
  properties: {
    greeting: { type: "string" },
  },
  additionalProperties: false,
  required: ["greeting"],
}

const publicHandler = middyfy(greetRequestSchema, greetResponseSchema, false, async (event) => ({ greeting: `${event.body.greetingWord ?? event.pathParameters.greetingWord ?? "Hello"} ${event.body.greetee}!` }))
const authReqHandler = middyfy(greetRequestSchema, greetResponseSchema, true, async (event) => ({ greeting: `${event.body.greetingWord ?? event.pathParameters.greetingWord ?? "Hello"} ${event.body.greetee}!` }))

describe("public endpoint", () => {
  test("can be called without an auth token", async () => {
    const response = await call(publicHandler, { auth: false })({ greetee: "world" })

    expect(response).toEqual({ greeting: "Hello world!" })
  })
})

describe("auth required endpoint", () => {
  test("rejects missing auth token", async () => {
    const response = await call(authReqHandler, { auth: false, rawResponse: true })({ greetee: "world" })

    expect(response.statusCode).toBe(401)
    expect(response.body).toContain("No valid bearer token was set in the authorization header")
  })
})

describe.each([
  ["public", publicHandler],
  ["auth required", authReqHandler],
])("%s endpoint", (_description, handler) => {
  test("can be called with a valid auth token", async () => {
    const response = await call(handler)({ greetee: "world" })

    expect(response).toEqual({ greeting: "Hello world!" })
  })

  test("can be called with a valid auth token with no groups", async () => {
    const response = await call(handler, { auth: { groups: [] } })({ greetee: "world" })

    expect(response).toEqual({ greeting: "Hello world!" })
  })

  test("rejects an invalid auth token", async () => {
    const response = await call(handler, { auth: "an-invalid-token", rawResponse: true })({ greetee: "world" })

    expect(response.statusCode).toBe(401)
    expect(response.body).toContain("Invalid token")
  })

  test("rejects an auth token with an invalid payload", async () => {
    const response = await call(handler, { auth: { groups: [1] } as any, rawResponse: true })({ greetee: "world" })

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain("Token payload malformed")
  })

  test("rejects expired token", async () => {
    const response = await call(handler, { auth: { iat: 1637971200, exp: 1637971800 }, rawResponse: true })({ greetee: "world" })

    expect(response.statusCode).toBe(401)
    expect(response.body).toContain("Token expired")
  })

  test("rejects token signed with wrong key", async () => {
    const response = await call(handler, { authKey: "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEINMpp4m2FIteV9mG3mm+JQp+vNTlynGzHmexIGqU/odvoAoGCCqGSM49\nAwEHoUQDQgAEOzo72IF7TKxi10iaUFZZIDxEfNHwU+lQWbOaUiomowCV9sFTOmfV\nqI7WqFvIvW1oGHRI7bsExLNjf/KX2eJOew==\n-----END EC PRIVATE KEY-----", rawResponse: true })({ greetee: "world" })

    expect(response.statusCode).toBe(401)
    expect(response.body).toContain("Invalid token")
  })

  test("rejects missing body", async () => {
    const response = await call(handler, { rawResponse: true })(null)

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain("failed validation")
  })

  test.each([
    ["syntax error 1", "{greetee: world}"],
    ["syntax error 2", "{\"greetee\": world}"],
    ["syntax error 3", "{greetee: \"world\"}"],
    ["syntax error 4", "{"],
    ["syntax error 5", "'"],
    ["syntax error 6", "@"],
    ["plain text", "greetee world"],
    ["XML", "<greetee>world</greetee>"],
  ])("rejects invalid JSON body: %s", async (description, body) => {
    const response = await call(handler, { rawBody: true, rawResponse: true })(body)

    expect(response.statusCode).toBe(422)
    expect(response.body).toContain("invalid JSON")
  })

  describe.each([
    [undefined],
    ["text/plain"],
    ["application/xml"],
    ["text/html"],
    ["application/x-www-form-urlencoded"],
    ["multipart/form-data"],
  ])("rejects %s content-type", (contentType) => {
    test.each([
      ["JSON", "{\"greetee\": \"world\"}"],
      ["invalid JSON-like", "{\"greetee\": world}"],
      ["plain text", "greetee world"],
      ["XML", "<greetee>world</greetee>"],
      ["invalid XML-like", "<greetee>world<greetee/>"],
      ["HTML", "<html><head></head><body><h1>world</h1></body></html>"],
      ["form data", "greetee=world"],
    ])("with %s body", async (description, body) => {
      const response = await call(handler, {
        rawBody: true,
        rawResponse: true,
        headers: {
          "content-type": contentType,
        },
      })(body)

      expect(response.statusCode).toBe(415)
      expect(response.body).toContain("Unsupported Media Type")
    })
  })

  test("rejects wrong body type", async () => {
    const response = await call(handler, { rawResponse: true })(3)

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain("failed validation")
    expect(response.body).toContain("must be object")
  })

  test("rejects body with missing properties", async () => {
    const response = await call(handler, { rawResponse: true })({})

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain("failed validation")
    expect(response.body).toContain("missingProperty")
    expect(response.body).toContain("greetee")
  })

  test("rejects body with additional properties", async () => {
    const response = await call(handler, { rawResponse: true })({ greetee: "world", someProp: "surplus" })

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain("failed validation")
    expect(response.body).toContain("additionalProperties")
    expect(response.body).toContain("someProp")
  })

  test("rejects body with incorrect property type", async () => {
    const response = await call(handler, { rawResponse: true })({ greetee: 3 })

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain("failed validation")
    expect(response.body).toContain("string")
    expect(response.body).toContain("greetee")
  })

  test("rejects body with property violating constraint", async () => {
    const response = await call(handler, { rawResponse: true })({ greetee: "" })

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain("failed validation")
    expect(response.body).toContain("minLength")
    expect(response.body).toContain("greetee")
  })

  test("can provide optional property", async () => {
    const response = await call(handler)({ greetingWord: "Hi", greetee: "world" })

    expect(response).toEqual({ greeting: "Hi world!" })
  })

  test("can provide path parameters", async () => {
    const response = await call(handler, { routeKey: "/{greetingWord}", path: "/Hey", pathParameters: { greetingWord: "Hey" } })({ greetee: "world" })

    expect(response).toEqual({ greeting: "Hey world!" })
  })

  test("rejects missing path parameter", async () => {
    const response = await call(handler, { rawResponse: true, routeKey: "UNKNOWN /{greetingWord}", path: "/" })({ greetee: "world" })

    expect(response.statusCode).toBe(400)
    expect(response.body).toContain("Missing path parameter greetingWord")
  })
})
