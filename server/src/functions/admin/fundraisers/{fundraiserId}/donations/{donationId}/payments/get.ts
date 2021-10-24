import "source-map-support/register"
import { middyfy } from "../../../../../../../helpers/wrapper"
import { paymentsSchema } from "../../../../../../../helpers/schemas"
import { fundraiserTable, paymentTable } from "../../../../../../../helpers/tables"
import { assertHasGroup, query, get } from "../../../../../../../helpers/db"

export const main = middyfy(null, paymentsSchema, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))
  return query(paymentTable, { donationId: event.pathParameters.donationId })
})
