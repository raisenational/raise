import { paymentsSchema } from "@raise/shared"
import { middyfy } from "../../../../../../../helpers/wrapper"
import { fundraiserTable, paymentTable } from "../../../../../../../helpers/tables"
import { assertHasGroup, query, get } from "../../../../../../../helpers/db"

export const main = middyfy(null, paymentsSchema, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))
  return query(paymentTable, { donationId: event.pathParameters.donationId })
})
