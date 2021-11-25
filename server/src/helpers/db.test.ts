import { ulid } from "ulid"
import {
  insert, scan, get, query, insertAudit, update, inTransaction, updateT,
} from "./db"
import { fundraiserTable, donationTable } from "./tables"

/* jest.mock("./db", () => {
  const original = jest.requireActual("./db")
  return {
    ...original,
    insertAudit: jest.fn().mockImplementation(() => ({ mockedValue: 2 })),
  }
})

 beforeAll(() => {

})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
}) */
test("can insert an item", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  const fundraiser = {
    id: ulid(),
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  }

  await insert(fundraiserTable, fundraiser)

  /* expect(insertAudit).toHaveBeenCalledWith({
    object: fundraiser[fundraiserTable.primaryKey],
    action: "create",
    metadata: {
      tableName: fundraiserTable.entityName,
      fundraiser,
    },
  }) */

  expect(await scan(fundraiserTable)).toHaveLength(1)
})

test("insert fails with invalid expression", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  const fundraiser = {
    id: ulid(),
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  }

  await expect(insert(fundraiserTable, fundraiser, "10 = 11")).rejects.toThrowError()

  expect(await scan(fundraiserTable)).toHaveLength(0)
})

test("can insert and get an item again", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  const id = ulid()

  const fundraiser = {
    id,
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  }

  await insert(fundraiserTable, fundraiser)

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})

test("can insert and query an item", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  const id = ulid()

  const fundraiser = {
    id,
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  }

  const donationId = ulid()
  const donation = {
    id: donationId,
    fundraiserId: id,
    donorName: "John Doe",
    donorEmail: "johndoe@example.com",
    emailConsentInformational: true,
    emailConsentMarketing: false,
    createdAt: 1632840179,
    addressLine1: null,
    addressLine2: null,
    addressLine3: null,
    addressPostcode: null,
    addressCountry: null,
    giftAid: false,
    comment: null,
    donationAmount: 15000,
    matchFundingAmount: 15000,
    contributionAmount: 0,
    recurringAmount: null,
    recurrenceFrequency: null,
    stripeCustomerId: null,
    stripePaymentMethodId: null,
    charity: "AMF",
    overallPublic: true,
    namePublic: true,
    donationAmountPublic: false,
    donationCounted: true,
  }

  await insert(fundraiserTable, fundraiser)

  await insert(donationTable, donation)

  expect(await query(donationTable, { fundraiserId: id })).toEqual([donation])
})

test("can update an item", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  const id = ulid()

  const fundraiser = {
    id,
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  }

  await insert(fundraiserTable, fundraiser)

  await update(fundraiserTable, { id }, { donationsCount: 3, matchFundingRate: 1_00 })

  expect(await get(fundraiserTable, { id })).not.toEqual(fundraiser)

  fundraiser.donationsCount = 3
  fundraiser.matchFundingRate = 1_00

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})

test("fail to update an item if conditions not met", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  const id = ulid()

  const fundraiser = {
    id,
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  }

  await insert(fundraiserTable, fundraiser)

  await expect(() => update(fundraiserTable, { id }, { donationsCount: 3, matchFundingRate: 1_00 }, "donationsCount = :currentDonationCount",
    { ":currentDonationCount": 100 })).rejects.toThrowError()

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})

test("can update an item using updateT and inTransaction", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  const id = ulid()

  const fundraiser = {
    id,
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  }

  await insert(fundraiserTable, fundraiser)

  await inTransaction([updateT(fundraiserTable, { id }, { donationsCount: 3, matchFundingRate: 1_00 })])

  expect(await get(fundraiserTable, { id })).not.toEqual(fundraiser)

  fundraiser.donationsCount = 3
  fundraiser.matchFundingRate = 1_00

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})

test("fail to updateT an item if conditions not met", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  const id = ulid()

  const fundraiser = {
    id,
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  }

  await insert(fundraiserTable, fundraiser)

  await expect(() => inTransaction([updateT(fundraiserTable, { id }, { donationsCount: 3, matchFundingRate: 1_00 }, "donationsCount = :currentDonationCount",
    { ":currentDonationCount": 100 })])).rejects.toThrowError()

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})
