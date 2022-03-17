import { g, paymentsSchema } from "@raise/shared"
import { middyfy } from "../../../../../../../helpers/wrapper"
import { fundraiserTable, paymentTable } from "../../../../../../../helpers/tables"
import {
  assertHasGroup, query, get, normalizeGroups,
} from "../../../../../../../helpers/db"

export const main = middyfy(null, paymentsSchema, true, async (event) => {
  assertHasGroup(event, normalizeGroups(await get(fundraiserTable, { id: event.pathParameters.fundraiserId })), g.National)
  return query(paymentTable, { donationId: event.pathParameters.donationId })
})
