import { ulid } from "ulid"
import {
  insert, scan, get, query, insertAudit, update, inTransaction, updateT, plusT, insertT, AuditDefinition,
} from "./db"
import {
  fundraiserTable, donationTable, auditLogTable, tables,
} from "./tables"
import { makeFundraiser, makeDonation, setMockDate } from "../../local/testHelpers"
import { auditContext } from "./auditContext"

describe("scan", () => {
  test.each(Object.entries(tables))("%s table is empty by default", async (name, table) => {
    expect(await scan(table as any)).toHaveLength(0)
  })

  test("can retrieve several items", async () => {
    const fundraisers = new Array(123).fill(0).map(() => makeFundraiser())
    await Promise.all(fundraisers.map((f) => insert(fundraiserTable, f)))

    expect(await scan(fundraiserTable)).toHaveLength(123)
  })

  // a test for pagination would be nice, but looks difficult to write efficiently
  // maybe we could intercept the ScanCommand and add a low limit for this?
})

describe("insert", () => {
  test("can insert an item", async () => {
    const fundraiser = makeFundraiser()

    await insert(fundraiserTable, fundraiser)

    expect(await scan(fundraiserTable)).toEqual([fundraiser])
  })

  test("can insert two items", async () => {
    const fundraisers = [makeFundraiser(), makeFundraiser()]

    await insert(fundraiserTable, fundraisers[0])
    await insert(fundraiserTable, fundraisers[1])

    const scanResult = await scan(fundraiserTable)
    expect(scanResult).toHaveLength(2)
    expect(scanResult).toContainEqual(fundraisers[0])
    expect(scanResult).toContainEqual(fundraisers[1])
  })

  test("fails with condition expression that evaluates to false", async () => {
    await expect(insert(fundraiserTable, makeFundraiser(), "id = fundraiserName")).rejects.toThrowError("failed conditional expression")

    expect(await scan(fundraiserTable)).toHaveLength(0)
  })

  test("fails with an invalid condition expression", async () => {
    await expect(insert(fundraiserTable, makeFundraiser(), "?")).rejects.toThrowError("Invalid ConditionExpression")

    expect(await scan(fundraiserTable)).toHaveLength(0)
  })

  test("fails if an item with that id already exists", async () => {
    const fundraiser = makeFundraiser()
    await insert(fundraiserTable, fundraiser)

    await expect(insert(fundraiserTable, makeFundraiser({ id: fundraiser.id }))).rejects.toThrowError()

    expect(await scan(fundraiserTable)).toEqual([fundraiser])
  })

  describe("composite key tables", () => {
    test("can insert an item", async () => {
      const donation = makeDonation()

      await insert(donationTable, donation)

      expect(await scan(donationTable)).toEqual([donation])
    })

    test("can insert multiple items", async () => {
      const fundraisers = [makeFundraiser(), makeFundraiser()]
      const donations = [
        makeDonation({ fundraiserId: fundraisers[0].id }),
        makeDonation({ fundraiserId: fundraisers[0].id }),
        makeDonation({ fundraiserId: fundraisers[1].id }),
      ]

      await insert(donationTable, donations[0])
      await insert(donationTable, donations[1])
      await insert(donationTable, donations[2])

      const scanResult = await scan(donationTable)
      expect(scanResult).toHaveLength(3)
      expect(scanResult).toContainEqual(donations[0])
      expect(scanResult).toContainEqual(donations[1])
      expect(scanResult).toContainEqual(donations[2])
    })

    // this is more a bug than a feature, but we'd like to know if this behaviour changes so here's a test for that
    test("can insert multiple items with same sort key if they're in in different partitions", async () => {
      const fundraisers = [makeFundraiser(), makeFundraiser()]
      const donationId = ulid()
      const donations = [
        makeDonation({ fundraiserId: fundraisers[0].id, id: donationId }),
        makeDonation({ fundraiserId: fundraisers[1].id, id: donationId }),
      ]

      await insert(donationTable, donations[0])
      await insert(donationTable, donations[1])

      const scanResult = await scan(donationTable)
      expect(scanResult).toHaveLength(2)
      expect(scanResult).toContainEqual(donations[0])
      expect(scanResult).toContainEqual(donations[1])
    })

    test("fails if an item with that id already exists", async () => {
      const fundraiser = makeFundraiser()
      const donation = makeDonation({ fundraiserId: fundraiser.id })
      await insert(donationTable, donation)

      await expect(insert(donationTable, makeDonation({ fundraiserId: fundraiser.id, id: donation.id }))).rejects.toThrowError()

      expect(await scan(donationTable)).toEqual([donation])
    })
  })
})

describe("get", () => {
  test("can get an item", async () => {
    const fundraiser = makeFundraiser()
    await insert(fundraiserTable, fundraiser)

    const result = await get(fundraiserTable, { id: fundraiser.id })

    expect(result).toEqual(fundraiser)
  })

  test("composite key tables: can get an item", async () => {
    const donation = makeDonation()
    await insert(donationTable, donation)

    const result = await get(donationTable, { fundraiserId: donation.fundraiserId, id: donation.id })

    expect(result).toEqual(donation)
  })

  test("get fails if item doesn't exist", async () => {
    await expect(() => get(fundraiserTable, { id: ulid() })).rejects.toThrowError("not found")
  })

  test("get fails if item doesn't exist", async () => {
    await expect(() => get(donationTable, { fundraiserId: ulid(), id: ulid() })).rejects.toThrowError("not found")
  })
})

describe("query", () => {
  test("can query an item", async () => {
    const fundraiser = makeFundraiser()
    const donation = makeDonation({ fundraiserId: fundraiser.id })
    await insert(fundraiserTable, fundraiser)
    await insert(donationTable, donation)

    const result = await query(donationTable, { fundraiserId: fundraiser.id })

    expect(result).toEqual([donation])
  })

  test("can query multiple items", async () => {
    const fundraiser = makeFundraiser()
    const donations = [makeDonation({ fundraiserId: fundraiser.id }), makeDonation({ fundraiserId: fundraiser.id })]
    await insert(fundraiserTable, fundraiser)
    await insert(donationTable, donations[0])
    await insert(donationTable, donations[1])

    const result = await query(donationTable, { fundraiserId: fundraiser.id })

    expect(result).toHaveLength(2)
    expect(result).toContainEqual(donations[0])
    expect(result).toContainEqual(donations[1])
  })

  test("query returns empty array on empty table", async () => {
    const result = await query(donationTable, { fundraiserId: ulid() })

    expect(result).toEqual([])
  })

  test("query returns empty array on empty partition of non-empty table", async () => {
    const fundraiser = makeFundraiser()
    const donation = makeDonation({ fundraiserId: fundraiser.id })
    await insert(fundraiserTable, fundraiser)
    await insert(donationTable, donation)

    const result = await query(donationTable, { fundraiserId: ulid() })

    expect(result).toEqual([])
  })
})

describe("update", () => {
  test("can update an item", async () => {
    const fundraiser = makeFundraiser()
    await insert(fundraiserTable, fundraiser)

    await update(fundraiserTable, { id: fundraiser.id }, { donationsCount: 3, matchFundingRate: 200 })

    expect(await get(fundraiserTable, { id: fundraiser.id })).toEqual({ ...fundraiser, donationsCount: 3, matchFundingRate: 200 })
  })

  test("fails to update an item if conditions not met", async () => {
    const fundraiser = makeFundraiser()

    await insert(fundraiserTable, fundraiser)

    await expect(() => update(
      fundraiserTable, { id: fundraiser.id }, { donationsCount: 3, matchFundingRate: 200 }, "donationsCount = :currentDonationsCount", { ":currentDonationsCount": 100 },
    )).rejects.toThrowError("failed conditional expression")

    expect(await get(fundraiserTable, { id: fundraiser.id })).toEqual(fundraiser)
  })
})

describe("updateT", () => {
  test("can update an item using updateT and inTransaction", async () => {
    const fundraiser = makeFundraiser({ donationsCount: 0, matchFundingRate: 200 })
    await insert(fundraiserTable, fundraiser)

    await inTransaction([updateT(fundraiserTable, { id: fundraiser.id }, { donationsCount: 3, matchFundingRate: 200 })])

    expect(await get(fundraiserTable, { id: fundraiser.id })).toEqual({ ...fundraiser, donationsCount: 3, matchFundingRate: 200 })
  })

  test("fails to updateT an item if conditions not met", async () => {
    const fundraiser = makeFundraiser()
    await insert(fundraiserTable, fundraiser)

    await expect(() => inTransaction([
      updateT(fundraiserTable, { id: fundraiser.id }, { donationsCount: 3, matchFundingRate: 200 }, "donationsCount = :currentDonationsCount", { ":currentDonationsCount": 100 }),
    ])).rejects.toThrowError("failed conditional expression")

    expect(await get(fundraiserTable, { id: fundraiser.id })).toEqual(fundraiser)
  })
})

describe("plusT", () => {
  test("can update an item using plusT and inTransaction", async () => {
    const fundraiser = makeFundraiser({ donationsCount: 1 })
    await insert(fundraiserTable, fundraiser)

    await inTransaction([plusT(fundraiserTable, { id: fundraiser.id }, { donationsCount: 1 })])

    expect(await get(fundraiserTable, { id: fundraiser.id })).toEqual({ ...fundraiser, donationsCount: 2 })
  })

  test("fails to plusT an item if conditions not met", async () => {
    const fundraiser = makeFundraiser({ donationsCount: 1 })
    await insert(fundraiserTable, fundraiser)

    await expect(() => inTransaction([
      updateT(fundraiserTable, { id: fundraiser.id }, { donationsCount: 1 }, "donationsCount = :currentDonationsCount", { ":currentDonationsCount": 100 }),
    ])).rejects.toThrowError("failed conditional expression")

    expect(await get(fundraiserTable, { id: fundraiser.id })).toEqual(fundraiser)
  })
})

describe("insertT", () => {
  test("can insert an item using insertT and inTransaction", async () => {
    const fundraiser = makeFundraiser()

    await inTransaction([insertT(fundraiserTable, fundraiser)])

    expect(await scan(fundraiserTable)).toHaveLength(1)
    expect(await get(fundraiserTable, { id: fundraiser.id })).toEqual(fundraiser)
  })

  test("fails to insertT an item if conditions not met", async () => {
    const fundraiser = makeFundraiser()

    await expect(() => inTransaction([
      insertT(fundraiserTable, fundraiser, "donationsCount = :currentDonationsCount", { ":currentDonationsCount": 100 }),
    ])).rejects.toThrowError("failed conditional expression")

    expect(await scan(fundraiserTable)).toHaveLength(0)
  })

  test("fails to insertT an item if an item with its id already exists", async () => {
    const fundraiser = makeFundraiser({ donationsCount: 0 })
    await insert(fundraiserTable, fundraiser)

    await expect(() => inTransaction([insertT(fundraiserTable, makeFundraiser({ id: fundraiser.id }))])).rejects.toThrowError()

    expect(await scan(fundraiserTable)).toHaveLength(1)
  })
})

describe("inTransaction", () => {
  test("can do multiple things at once in transaction succesfully", async () => {
    const fundraiser1 = makeFundraiser({ donationsCount: 0 })
    const fundraiser2 = makeFundraiser()
    await insert(fundraiserTable, fundraiser1)

    await inTransaction([insertT(fundraiserTable, fundraiser2), updateT(fundraiserTable, { id: fundraiser1.id }, { donationsCount: 3 })])

    expect(await scan(fundraiserTable)).toHaveLength(2)
    fundraiser1.donationsCount = 3
    expect(await get(fundraiserTable, { id: fundraiser1.id })).toEqual(fundraiser1)
    expect(await get(fundraiserTable, { id: fundraiser2.id })).toEqual(fundraiser2)
  })

  test("all edits fail if one edit fails in transaction", async () => {
    const fundraiser1 = makeFundraiser({ donationsCount: 0 })
    const fundraiser2 = makeFundraiser()
    await insert(fundraiserTable, fundraiser1)

    await expect(() => inTransaction([
      insertT(fundraiserTable, fundraiser2),
      updateT(fundraiserTable, { id: fundraiser1.id }, { donationsCount: 3 }, "donationsCount = :donationsCount"),
    ])).rejects.toThrowError("failed conditional expression")

    expect(await scan(fundraiserTable)).toHaveLength(1)
    expect(await get(fundraiserTable, { id: fundraiser1.id })).toEqual(fundraiser1)
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
