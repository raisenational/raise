import * as format from "./format"

describe("amount", () => {
  test.each([
    [0, "£0.00"],
    [1, "£0.01"],
    [10, "£0.10"],
    [1_00, "£1.00"],
    [10_00, "£10.00"],
    [100_00, "£100.00"],
    [12_34, "£12.34"],
    [-56_78, "£-56.78"],
    [undefined, "—"],
    [null, "—"],
  ])("%s → %s", (value, expected) => {
    expect(format.amount(value)).toEqual(expected)
  })
})

describe("amountDropPenceIfZero", () => {
  test.each([
    [0, "£0"],
    [1, "£0.01"],
    [10, "£0.10"],
    [1_00, "£1"],
    [10_00, "£10"],
    [100_00, "£100"],
    [12_34, "£12.34"],
    [-56_78, "£-56.78"],
    [undefined, "—"],
    [null, "—"],
  ])("%s → %s", (value, expected) => {
    expect(format.amountDropPenceIfZero(value)).toEqual(expected)
  })
})

describe("boolean", () => {
  test.each([
    [true, "Yes"],
    [false, "No"],
    [undefined, "—"],
    [null, "—"],
  ])("%s → %s", (value, expected) => {
    expect(format.boolean(value)).toEqual(expected)
  })
})

describe("date", () => {
  test.each([
    [0, "01/01/1970"],
    [1632959999, "29/09/2021"],
    [1632960000, "30/09/2021"],
    [-86400, "31/12/1969"],
    [undefined, "—"],
    [null, "—"],
  ])("%s → %s", (value, expected) => {
    expect(format.date(value)).toEqual(expected)
  })
})

describe("matchFundingRate", () => {
  test.each([
    [0, "0% (i.e. £1 donated, £0 matched, £1 total)"],
    [50, "50% (i.e. £1 donated, £0.50 matched, £1.50 total)"],
    [100, "100% (i.e. £1 donated, £1 matched, £2 total)"],
    [200, "200% (i.e. £1 donated, £2 matched, £3 total)"],
    [123, "123% (i.e. £1 donated, £1.23 matched, £2.23 total)"],
    [undefined, "—"],
    [null, "—"],
  ])("%s → %s", (value, expected) => {
    expect(format.matchFundingRate(value)).toEqual(expected)
  })
})

describe("percent", () => {
  test.each([
    [0, "0%"],
    [50, "50%"],
    [100, "100%"],
    [200, "200%"],
    [123, "123%"],
    [undefined, "—"],
    [null, "—"],
  ])("%s → %s", (value, expected) => {
    expect(format.percent(value)).toEqual(expected)
  })
})

describe("timestamp", () => {
  test.each([
    [0, "01/01/1970, 00:00:00"],
    [123456, "02/01/1970, 10:17:36"],
    [1632959999, "29/09/2021, 23:59:59"],
    [1632960000, "30/09/2021, 00:00:00"],
    [-86400, "31/12/1969, 00:00:00"],
    [undefined, "—"],
    [null, "—"],
  ])("%s → %s", (value, expected) => {
    expect(format.timestamp(value)).toEqual(expected)
  })
})

describe("json", () => {
  test.each([
    [0, "0"],
    ["hello", "\"hello\""],
    [true, "true"],
    [{ p: "v" }, "{\"p\":\"v\"}"],
    [undefined, "undefined"],
    [null, "null"],
  ])("%s → %s", (value, expected) => {
    expect(format.json(value)).toEqual(expected)
  })
})
