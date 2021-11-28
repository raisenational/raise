import { ulid } from "ulid"
import {
  call, makeFundraiser, makeDonation, makePayment, delayDb,
} from "../../../../local/testHelpers"
import env from "../../../env/env"
import { get, insert } from "../../../helpers/db"
import { StripeWebhookRequest } from "../../../helpers/schemaTypes"
import { donationTable, fundraiserTable, paymentTable } from "../../../helpers/tables"
import { main } from "./post"

const webhookConstructEvent = jest.fn()
const customersCreate = jest.fn().mockResolvedValue({ id: `cus_${ulid()}` })

jest.mock("stripe", () => jest.fn().mockImplementation(() => ({
  webhooks: {
    get constructEvent() { return webhookConstructEvent },
  },
  customers: {
    get create() { return customersCreate },
  },
})))

describe("signature validation", () => {
  test("rejects request missing stripe signature", async () => {
    const req = makeStripeWebhookRequest()

    const response = await call(main, { rawResponse: true, auth: false })(req)

    expect(response.statusCode).toBe(401)
    expect(response.body).toContain("Missing Stripe-Signature header")
  })

  test("rejects request with invalid stripe signature", async () => {
    const req = makeStripeWebhookRequest()
    webhookConstructEvent.mockImplementationOnce(() => { throw new Error() })

    const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "not-valid" } })(req)

    expect(response.statusCode).toBe(401)
    expect(response.body).toContain("Failed to validate webhook signature")
  })
})

describe("one-off donation", () => {
  test.each([
    ["no match funding limits", null, null, null, 150_00],
    ["fundraiser remaining match funding limit", 100_00, null, 0, 100_00],
    ["per-donation match funding limit", null, 100_00, null, 100_00],
  ])("%s", async (description, matchFundingRemaining, matchFundingPerDonationLimit, matchFundingRemainingAfter, matchFundingAmount) => {
    const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingPerDonationLimit, matchFundingRemaining })
    const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false })
    const payment = makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      method: "card",
      status: "pending",
      reference: `pi_${ulid()}`,
      donationAmount: 150_00,
      contributionAmount: 10_00,
      matchFundingAmount: null,
    })
    const req = makeStripeWebhookRequest(undefined, {
      id: payment.reference!,
      amount: payment.donationAmount + payment.contributionAmount,
      amount_received: payment.donationAmount + payment.contributionAmount,
      metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
    })
    await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)])

    const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

    expect(webhookConstructEvent).toBeCalledTimes(1)
    expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), "valid-signature", env.STRIPE_WEBHOOK_SECRET)
    expect(response.statusCode).toBe(204)

    expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
      donationsCount: 1,
      totalRaised: 150_00 + matchFundingAmount,
      matchFundingRemaining: matchFundingRemainingAfter,
    })
    expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
      donationAmount: 150_00,
      contributionAmount: 10_00,
      matchFundingAmount,
      donationCounted: true,
    })
    expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
      ...payment,
      donationAmount: 150_00,
      contributionAmount: 10_00,
      matchFundingAmount,
      status: "paid",
    })
  })
})

test("can make first recurring donation", async () => {
  const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingPerDonationLimit: 50_00, matchFundingRemaining: 100_00 })
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false })
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  })]
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[0].reference!,
    amount: payments[0].donationAmount + payments[0].contributionAmount,
    amount_received: payments[0].donationAmount + payments[0].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[0].id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))])

  const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(webhookConstructEvent).toBeCalledTimes(1)
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), "valid-signature", env.STRIPE_WEBHOOK_SECRET)
  expect(response.statusCode).toBe(204)

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 60_00,
    matchFundingRemaining: 50_00,
  })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    donationCounted: true,
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    status: "paid",
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
    status: "pending",
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: "pending",
  })
})

test("can make later recurring donation with match funding committed previously", async () => {
  const fundraiser = makeFundraiser({
    matchFundingRate: 100,
    matchFundingPerDonationLimit: 50_00,
    donationsCount: 1,
    totalRaised: 60_00,
    matchFundingRemaining: 50_00,
  })
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    donationCounted: true,
  })
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "paid",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
  })]
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[1].reference!,
    amount: payments[1].donationAmount + payments[1].contributionAmount,
    amount_received: payments[1].donationAmount + payments[1].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[1].id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))])

  const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(webhookConstructEvent).toBeCalledTimes(1)
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), "valid-signature", env.STRIPE_WEBHOOK_SECRET)
  expect(response.statusCode).toBe(204)

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 110_00,
    matchFundingRemaining: 50_00,
  })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 60_00,
    contributionAmount: 10_00,
    matchFundingAmount: 50_00,
    donationCounted: true,
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    status: "paid",
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
    status: "paid",
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: "pending",
  })
})

test("can make later recurring donation without match funding committed previously", async () => {
  const fundraiser = makeFundraiser({
    matchFundingRate: 100,
    matchFundingPerDonationLimit: 50_00,
    donationsCount: 1,
    totalRaised: 60_00,
    matchFundingRemaining: 70_00,
  })
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    donationCounted: true,
  })
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "paid",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  })]
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[1].reference!,
    amount: payments[1].donationAmount + payments[1].contributionAmount,
    amount_received: payments[1].donationAmount + payments[1].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[1].id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))])

  const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(webhookConstructEvent).toBeCalledTimes(1)
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), "valid-signature", env.STRIPE_WEBHOOK_SECRET)
  expect(response.statusCode).toBe(204)

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 110_00,
    matchFundingRemaining: 50_00,
  })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 60_00,
    contributionAmount: 10_00,
    matchFundingAmount: 50_00,
    donationCounted: true,
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    status: "paid",
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
    status: "paid",
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: "pending",
  })
})

test("rejects partially captured payment intent", async () => {
  const fundraiser = makeFundraiser()
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
  })
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference!,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: Math.floor((payment.donationAmount + payment.contributionAmount) / 2),
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)])

  const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(response.statusCode).toBe(400)
  expect(response.body).toContain("amount does not match amount_received")
})

test.each([["cash" as const], ["direct_to_charity" as const]])("rejects %s payment", async (method) => {
  const fundraiser = makeFundraiser()
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method,
    status: "pending",
    reference: `pi_${ulid()}`,
  })
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference!,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)])

  const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(response.statusCode).toBe(400)
  expect(response.body).toContain(`payment method is '${method}', not card`)
})

test("rejects payment for mismatched amount", async () => {
  const fundraiser = makeFundraiser()
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
  })
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference!,
    amount: payment.donationAmount + payment.contributionAmount + 10_00,
    amount_received: payment.donationAmount + payment.contributionAmount + 10_00,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)])

  const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(response.statusCode).toBe(400)
  expect(response.body).toContain("payment intent amount does not match sum of donationAmount and contributionAmount on payment")
})

test("rejects payment for mismatched reference", async () => {
  const fundraiser = makeFundraiser()
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
  })
  const req = makeStripeWebhookRequest(undefined, {
    id: `pi_${ulid()}`,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)])

  const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(response.statusCode).toBe(400)
  expect(response.body).toContain("payment intent id does not match reference on payment")
})

test("rejects payment in invalid state", async () => {
  const fundraiser = makeFundraiser()
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "cancelled",
    reference: `pi_${ulid()}`,
  })
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference!,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)])

  const response = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(response.statusCode).toBe(400)
  expect(response.body).toContain("payment in invalid state 'cancelled' to be confirmed")
})

test("handles payments idempotently", async () => {
  const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingRemaining: 200_00 })
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false })
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 150_00,
    matchFundingAmount: null,
    contributionAmount: 10_00,
  })
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference!,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)])

  const response1 = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(response1.statusCode).toBe(204)
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 300_00,
    matchFundingRemaining: 50_00,
  })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    donationCounted: true,
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
    ...payment,
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    status: "paid",
  })

  const response2 = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(response2.statusCode).toBe(204)
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 300_00,
    matchFundingRemaining: 50_00,
  })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    donationCounted: true,
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
    ...payment,
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    status: "paid",
  })

  const response3 = await call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)

  expect(response3.statusCode).toBe(204)
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 300_00,
    matchFundingRemaining: 50_00,
  })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    donationCounted: true,
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
    ...payment,
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    status: "paid",
  })
})

test("handles parallel webhook calls for same payment", async () => {
  const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingRemaining: null })
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false })
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: "card",
    status: "pending",
    reference: `pi_${ulid()}`,
    donationAmount: 150_00,
    matchFundingAmount: null,
    contributionAmount: 10_00,
  })
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference!,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  })
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)])
  delayDb()

  const responses = await Promise.all(new Array(25).fill(0).map(() => call(main, { rawResponse: true, auth: false, headers: { "stripe-signature": "valid-signature" } })(req)))

  expect(responses.every((r) => r.statusCode === 204 || r.statusCode === 409)).toBeTruthy()
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 300_00,
  })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    donationCounted: true,
  })
  expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
    ...payment,
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    status: "paid",
  })
})

describe("handles database conflicts", () => {
  test.skip.each([
    ["payment status changed"],
    ["payment donation amount changed"],
    ["payment contribution amount changed"],
    ["payment match funding amount changed"],
    ["donation counted changed"],
    ["donation match funding amount changed"],
    ["donation amount changed"],
    ["fundraiser match funding per-donation limit changed"],
    ["fundraiser match funding remaining changed from null to value"],
    ["fundraiser match funding remaining changed from value to null"],
    ["fundraiser match funding remaining changed to too low value"],
    ["fundraiser match funding remaining changed to sufficient value"],
    ["payment deleted"],
    ["donation deleted"],
    ["fundraiser deleted"],
    ["series of payments: future payment donation amount changed"],
    ["series of payments: future payment match funding amount changed"],
    ["series of payments: future payment status changed"],
    ["series of payments: fundraiser match funding per-donation limit changed"],
    ["series of payments: fundraiser match funding remaining changed from null to value"],
    ["series of payments: fundraiser match funding remaining changed from value to null"],
    ["series of payments: fundraiser match funding remaining changed to too low value"],
    ["series of payments: fundraiser match funding remaining changed to sufficient value"],
  ])("%s", () => {
    // TODO
  })
})

const makeStripeWebhookRequest = (override?: Partial<StripeWebhookRequest>, overridePi?: Partial<StripeWebhookRequest["data"]["object"]>): StripeWebhookRequest => ({
  id: "evt_abcdef",
  object: "event",
  api_version: "2020-08-27",
  data: {
    object: {
      id: "pi_abcdef",
      object: "payment_intent",
      amount: 150_00,
      amount_received: 150_00,
      currency: "gbp",
      metadata: {
        fundraiserId: ulid(),
        donationId: ulid(),
        paymentId: ulid(),
      },
      status: "succeeded",
      payment_method: "card",
      setup_future_usage: null,
      created: 1638116942,
      ...overridePi,
    },
  },
  type: "payment_intent.succeeded",
  created: 1638116943,
  ...override,
})
