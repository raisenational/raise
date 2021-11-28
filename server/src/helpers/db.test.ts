import { ulid } from "ulid"
import {
  insert, scan, get, query, insertAudit, update, inTransaction, updateT, plusT, insertT, AuditDefinition,
} from "./db"
import { fundraiserTable, donationTable, auditLogTable } from "./tables"
import {
  makeFundraiser, makeDonation, unsupressConsole, setMockDate,
} from "../../local/testHelpers"
import { auditContext } from "./auditContext"
import { AuditLog } from "./schemaTypes"

describe("insert", () => {
  test("can insert an item", async () => {
    expect(await scan(fundraiserTable)).toHaveLength(0)

    const fundraiser = makeFundraiser()

    await insert(fundraiserTable, fundraiser)

    expect(await scan(fundraiserTable)).toHaveLength(1)
  })

  test("insert fails with invalid expression", async () => {
    expect(await scan(fundraiserTable)).toHaveLength(0)

    const fundraiser = makeFundraiser()

    await expect(insert(fundraiserTable, fundraiser, "10 = 11")).rejects.toThrowError()

    expect(await scan(fundraiserTable)).toHaveLength(0)
  })
  test("fail to insert an item if it already exists", async () => {
    expect(await scan(fundraiserTable)).toHaveLength(0)

    const fundraiser = makeFundraiser()

    await insert(fundraiserTable, fundraiser)

    await expect(insert(fundraiserTable, fundraiser)).rejects.toThrowError()

    expect(await scan(fundraiserTable)).toHaveLength(1)
  })
})
describe("get", () => {
  test("can get an item", async () => {
    const id = ulid()

    const fundraiser = makeFundraiser({ id })

    await insert(fundraiserTable, fundraiser)

    expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
  })
  test("get fails if item doesn't exist", async () => {
    const id = ulid()

    await expect(() => get(fundraiserTable, { id })).rejects.toThrowError
  })
})

describe("query", () => {
  test("can query an item", async () => {
    const id = ulid()

    const fundraiser = makeFundraiser({ id })

    const donationId = ulid()
    const donation = makeDonation({ id: donationId, fundraiserId: id })

    await insert(fundraiserTable, fundraiser)

    await insert(donationTable, donation)

    expect(await query(donationTable, { fundraiserId: id })).toEqual([donation])
  })
  test("query returns empty array on empty table", async () => {
    const id = ulid()

    const fundraiser = makeFundraiser({ id })

    await insert(fundraiserTable, fundraiser)

    expect(await query(donationTable, { fundraiserId: id })).toEqual([])
  })
  test("query throws error if table doesn't exist", async () => {
    const id = ulid()

    await expect(() => query(donationTable, { fundraiserId: id })).rejects.toThrowError
  })
})

describe("update", () => {
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
})

describe("updateT", () => {
  test("can update an item using updateT and inTransaction", async () => {
    const id = ulid()
    const fundraiser = makeFundraiser({ id, donationsCount: 0, matchFundingRate: 1_00 })

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
})

describe("plusT", () => {
  test("can update an item using plusT and inTransaction", async () => {
    const id = ulid()
    const fundraiser = makeFundraiser({ id, donationsCount: 1 })

    await insert(fundraiserTable, fundraiser)

    await inTransaction([plusT(fundraiserTable, { id }, { donationsCount: 1 })])

    expect(await get(fundraiserTable, { id })).not.toEqual(fundraiser)

    fundraiser.donationsCount = 2

    expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
  })

  test("fail to plusT an item if conditions not met", async () => {
    const id = ulid()
    const fundraiser = makeFundraiser({ id, donationsCount: 1 })

    await insert(fundraiserTable, fundraiser)

    await expect(() => inTransaction([updateT(fundraiserTable, { id }, { donationsCount: 1 }, "donationsCount = :currentDonationCount",
      { ":currentDonationCount": 100 })])).rejects.toThrowError

    expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
  })
})

describe("insertT", () => {
  test("can insert an item using insertT and inTransaction", async () => {
    const id = ulid()
    const fundraiser = makeFundraiser({ id })

    await inTransaction([insertT(fundraiserTable, fundraiser)])

    expect(await scan(fundraiserTable)).toHaveLength(1)
    expect(await get(fundraiserTable, { id })).toEqual(fundraiser)
  })

  test("fail to insertT an item if conditions not met", async () => {
    const id = ulid()
    const fundraiser = makeFundraiser({ id })

    await expect(() => inTransaction([insertT(fundraiserTable, fundraiser, "10 = 11",
      { ":currentDonationCount": 100 })])).rejects.toThrowError

    expect(await scan(fundraiserTable)).toHaveLength(0)
  })

  test("fail to insertT an item if an item with its id already exists", async () => {
    const id = ulid()
    const fundraiser = makeFundraiser({ id, donationsCount: 0 })

    await insert(fundraiserTable, fundraiser)

    await expect(() => inTransaction([insertT(fundraiserTable, fundraiser)])).rejects.toThrowError

    expect(await scan(fundraiserTable)).toHaveLength(1)
  })
})

describe("inTransaction", () => {
  test("can do multiple things at once in transaction succesfully", async () => {
    const id1 = ulid()
    const fundraiser1 = makeFundraiser({ id: id1, donationsCount: 0 })
    const id2 = ulid()
    const fundraiser2 = makeFundraiser({ id: id2 })

    await insert(fundraiserTable, fundraiser1)

    await inTransaction([insertT(fundraiserTable, fundraiser2), updateT(fundraiserTable, { id: id1 }, { donationsCount: 3 })])

    expect(await scan(fundraiserTable)).toHaveLength(2)
    fundraiser1.donationsCount = 3
    expect(await get(fundraiserTable, { id: id1 })).toEqual(fundraiser1)
    expect(await get(fundraiserTable, { id: id2 })).toEqual(fundraiser2)
  })

  test("all edits fail if one edit fails in transaction", async () => {
    const id1 = ulid()
    const fundraiser1 = makeFundraiser({ id: id1, donationsCount: 0 })
    const id2 = ulid()
    const fundraiser2 = makeFundraiser({ id: id2 })

    await insert(fundraiserTable, fundraiser1)

    await expect(() => inTransaction([insertT(fundraiserTable, fundraiser2), updateT(fundraiserTable, { id: id1 }, { donationsCount: 3 }, "10 = 11")]))
      .rejects.toThrowError

    expect(await scan(fundraiserTable)).toHaveLength(1)
    expect(await get(fundraiserTable, { id: id1 })).toEqual(fundraiser1)
  })
})

describe("insertAudit", () => {
  test("can insert an audit log", async () => {
    const now = new Date().getTime() / 1000
    setMockDate(now)
    auditContext.value = {
      route: "POST /a/path/with/{param}",
      routeRaw: "POST /a/path/with/ABCD123",
      sourceIp: "123.123.123.123",
      subject: "public",
      userAgent: "some browser",
    }
    const person = {
      id: ulid(),
      firstName: "Person",
      lastName: "McPersonface",
    }
    const auditDefinition: AuditDefinition = {
      action: "create",
      object: person.id,
      metadata: { tableName: "persons", data: person },
    }

    await insertAudit(auditDefinition)

    const audits = await scan(auditLogTable)
    expect(audits).toMatchObject([{
      object: auditDefinition.object,
      subject: auditContext.value.subject,
      action: auditDefinition.action,
      at: Math.floor(now),
      sourceIp: auditContext.value.sourceIp,
      userAgent: auditContext.value.userAgent,
      routeRaw: auditContext.value.routeRaw,
      metadata: { tableName: "persons", data: person },
      ttl: null,
    }])
  })
})
