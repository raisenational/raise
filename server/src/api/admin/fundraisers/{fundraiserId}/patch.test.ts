import { g } from "@raise/shared"
import { call, makeFundraiser } from "../../../../../local/testHelpers"
import { get, insert } from "../../../../helpers/db"
import { fundraiserTable } from "../../../../helpers/tables"
import { main } from "./patch"

test("Cannot edit totalRaised as National", async () => {
  // given a fundraiser in the db
  const fundraiser = makeFundraiser({ groupsWithAccess: [g.National], totalRaised: 0 })
  await insert(fundraiserTable, fundraiser)

  // when we call the endpoint with National
  const response = await call(main, { auth: { groups: [g.National] }, pathParameters: { fundraiserId: fundraiser.id }, rawResponse: true })({ totalRaised: 1000 })

  // we get back a forbidden error response
  expect(response.body).toContain(`[${g.NationalTech}]`)
})
test("Can edit totalRaised as NationalTech", async () => {
  // given a fundraiser in the db
  const fundraiser = makeFundraiser({ groupsWithAccess: [g.NationalTech], totalRaised: 0 })
  await insert(fundraiserTable, fundraiser)

  // when we call the endpoint with NationalTech
  await call(main, { auth: { groups: [g.NationalTech] }, pathParameters: { fundraiserId: fundraiser.id }, rawResponse: true })({ totalRaised: 1000 })

  // we have edited the totalraised
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 1000 })
})
