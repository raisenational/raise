import { makeFundraiser, makeDonation, call } from "../../../../../../../../local/testHelpers"
import { get, insert, query } from "../../../../../../../helpers/db"
import { PaymentCreation } from "../../../../../../../helpers/schemaTypes"
import { fundraiserTable, donationTable, paymentTable } from "../../../../../../../helpers/tables"
import { main } from "./post"

test("can insert multiple payments on a donation", async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({
    groupsWithAccess: ["Test"], matchFundingRemaining: 125_00, matchFundingRate: 100, matchFundingPerDonationLimit: null,
  })
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  await insert(fundraiserTable, fundraiser)
  await insert(donationTable, donation)

  // when we call the endpoint
  const paymentCreation1: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    method: "cash",
  }
  const response1 = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation1)

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response1).toBe("string")
  expect(await get(paymentTable, { donationId: donation.id, id: response1 })).toMatchObject({ ...paymentCreation1, matchFundingAmount: 98_76 })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 98_76 })
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 197_52, matchFundingRemaining: 26_24 })

  // when we call the endpoint again
  const paymentCreation2: PaymentCreation = {
    donationAmount: 45_68,
    contributionAmount: 2_00,
    method: "cash",
  }
  const response2 = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation2)

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response2).toBe("string")
  expect(await get(paymentTable, { donationId: donation.id, id: response2 })).toMatchObject({ ...paymentCreation2, matchFundingAmount: 26_24 })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 144_44, contributionAmount: 3_24, matchFundingAmount: 125_00 })
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 269_44, matchFundingRemaining: 0 })
})

test("can manually set match funding amount", async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({
    groupsWithAccess: ["Test"], matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null,
  })
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  await insert(fundraiserTable, fundraiser)
  await insert(donationTable, donation)

  // when we call the endpoint
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: "cash",
  }
  const response = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation)

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response).toBe("string")
  expect(await get(paymentTable, { donationId: donation.id, id: response })).toMatchObject({ ...paymentCreation })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 110_00 })
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 208_76, matchFundingRemaining: 15_00 })
})

test("can manually set match funding amount to more than available per donation", async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({
    groupsWithAccess: ["Test"], matchFundingRemaining: null, matchFundingPerDonationLimit: 125_00,
  })
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  await insert(fundraiserTable, fundraiser)
  await insert(donationTable, donation)

  // when we call the endpoint
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 130_00,
    method: "cash",
  }
  const response = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation)

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response).toBe("string")
  expect(await get(paymentTable, { donationId: donation.id, id: response })).toMatchObject({ ...paymentCreation })
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 130_00 })
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 228_76 })
})

test("can not manually set match funding amount to more than available on fundraiser", async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({
    groupsWithAccess: ["Test"], matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null,
  })
  const donation = makeDonation({ fundraiserId: fundraiser.id })
  await insert(fundraiserTable, fundraiser)
  await insert(donationTable, donation)

  // when we call the endpoint
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 130_00,
    method: "cash",
  }
  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation)

  // we get back an error, and no payment is inserted
  expect(response.statusCode).toBeGreaterThanOrEqual(400)
  expect(await query(paymentTable, { donationId: donation.id })).toEqual([])
})
