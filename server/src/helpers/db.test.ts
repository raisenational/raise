import { ulid } from "ulid"
import {
  insert, scan, get, query, insertAudit, update, inTransaction, updateT,
} from "./db"
import { fundraiserTable, donationTable } from "./tables"
import { makeFundraiser, makeDonation } from "../../local/testHelpers"

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

  const fundraiser = makeFundraiser()

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

  const fundraiser = makeFundraiser()

  await expect(insert(fundraiserTable, fundraiser, "10 = 11")).rejects.toThrowError()

  expect(await scan(fundraiserTable)).toHaveLength(0)
})

test("can insert and get an item again", async () => {
  const id = ulid()

  const fundraiser = makeFundraiser({ id })

  await insert(fundraiserTable, fundraiser)

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})

test("can insert and query an item", async () => {
  const id = ulid()

  const fundraiser = makeFundraiser({ id })

  const donationId = ulid()
  const donation = makeDonation({ id: donationId, fundraiserId: id })

  await insert(fundraiserTable, fundraiser)

  await insert(donationTable, donation)

  expect(await query(donationTable, { fundraiserId: id })).toEqual([donation])
})

test("can update an item", async () => {
  const id = ulid()

  const fundraiser = makeFundraiser({ id })

  await insert(fundraiserTable, fundraiser)

  await update(fundraiserTable, { id }, { donationsCount: 3, matchFundingRate: 1_00 })

  expect(await get(fundraiserTable, { id })).not.toEqual(fundraiser)

  fundraiser.donationsCount = 3
  fundraiser.matchFundingRate = 1_00

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})

test("fail to update an item if conditions not met", async () => {
  const id = ulid()

  const fundraiser = makeFundraiser({ id })

  await insert(fundraiserTable, fundraiser)

  await expect(() => update(fundraiserTable, { id }, { donationsCount: 3, matchFundingRate: 1_00 }, "donationsCount = :currentDonationCount",
    { ":currentDonationCount": 100 })).rejects.toThrowError()

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})

test("can update an item using updateT and inTransaction", async () => {
  const id = ulid()

  const fundraiser = makeFundraiser({ id })

  await insert(fundraiserTable, fundraiser)

  await inTransaction([updateT(fundraiserTable, { id }, { donationsCount: 3, matchFundingRate: 1_00 })])

  expect(await get(fundraiserTable, { id })).not.toEqual(fundraiser)

  fundraiser.donationsCount = 3
  fundraiser.matchFundingRate = 1_00

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})

test("fail to updateT an item if conditions not met", async () => {
  const id = ulid()

  const fundraiser = makeFundraiser({ id })

  await insert(fundraiserTable, fundraiser)

  await expect(() => inTransaction([updateT(fundraiserTable, { id }, { donationsCount: 3, matchFundingRate: 1_00 }, "donationsCount = :currentDonationCount",
    { ":currentDonationCount": 100 })])).rejects.toThrowError()

  expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
})
