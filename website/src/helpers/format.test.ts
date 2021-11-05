import * as format from "./format"

test("amountFormatter on whole pound input", () => {
  expect(format.amountFormatter(1000)).toEqual("£10.00")
})
