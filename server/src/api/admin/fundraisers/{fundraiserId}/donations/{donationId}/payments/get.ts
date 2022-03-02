import { paymentsSchema } from "@raise/shared"
import { middyfy } from "../../../../../../../helpers/wrapper"
import { fundraiserTable, paymentTable } from "../../../../../../../helpers/tables"
import {
  assertHasGroup, query, get, withNational, normalizeGroups,
} from "../../../../../../../helpers/db"

export const main = middyfy(null, paymentsSchema, true, async (event) => {
  assertHasGroup(event, withNational(normalizeGroups(await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))))
  return query(paymentTable, { donationId: event.pathParameters.donationId })
})
