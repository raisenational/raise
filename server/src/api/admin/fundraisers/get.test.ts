// This test is probably a bit over the top, but it also acts as a test for get
// endpoints generally: that the wrapper, logic and database all glue together

import { ulid } from "ulid"
import { insert } from "../../../helpers/db"
import { fundraiserTable } from "../../../helpers/tables"
import { callWithAuth, makeFundraiser } from "../../../helpers/testHelpers.test"
import { main } from "./get"

test("retrieves no fundraisers", async () => {
  // given no fundraisers in the db

  // when we call the endpoint
  const response = await callWithAuth(main)(null)

  // we get back an empty array
  expect(response).toEqual([])
})

test("retrives one fundraiser", async () => {
  // given a fundraiser in the db
  const fundraiser = makeFundraiser()
  await insert(fundraiserTable, fundraiser)

  // when we call the endpoint
  const response = await callWithAuth(main)(null)

  // we get back an empty array
  expect(response).toEqual([fundraiser])
})

test("retrives multiple fundraisers", async () => {
  // given multiple fundraisers in the db
  const fundraisers = [makeFundraiser(), makeFundraiser()]
  await Promise.all(fundraisers.map((f) => insert(fundraiserTable, f)))

  // when we call the endpoint
  const response = await callWithAuth(main)(null)

  // we get back the fundraisers
  expect(response).toHaveLength(2)
  expect(response).toContainEqual(fundraisers[0])
  expect(response).toContainEqual(fundraisers[1])
})

test("validates schema before return", async () => {
  const consoleSpy = jest.spyOn(console, "error").mockImplementation()

  // given an invalid fundraiser in the db (missing properties)
  await insert({ ...fundraiserTable, schema: { type: "object", properties: { id: { type: "string" } } } }, { id: ulid() })

  // when we call the endpoint
  const response = await callWithAuth(main, { rawResponse: true })(null)

  // we get back an error
  expect(response.statusCode).toEqual(500)

  consoleSpy.mockRestore()
})
