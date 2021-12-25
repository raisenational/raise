import { gbpToPeopleProtected } from "./convert"

describe("gbpToPeopleProtected", () => {
  test.each([
    // Regular amounts
    [0, 0],
    [100, 1],
    [500, 6],
    [1000, 12],
    [2000, 24],
    [2500, 30],
    [5000, 60],
    [7500, 90],
    [10000, 120],
    // Irregular amounts
    [123, 1],
    [4567, 54],
    [89, 1],
  ])("%s → %s", (value, expected) => {
    expect(gbpToPeopleProtected(value)).toEqual(expected)
  })
})
