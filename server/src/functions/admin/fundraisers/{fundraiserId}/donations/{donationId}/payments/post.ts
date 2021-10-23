import "source-map-support/register"
import { ulid } from "ulid"
import { middyfy } from "../../../../../../../helpers/wrapper"
import {
  appendList, assertHasGroup, get,
} from "../../../../../../../helpers/db"
import { paymentEditsSchema, ulidSchema } from "../../../../../../../helpers/schemas"
import { donationTable, fundraiserTable } from "../../../../../../../helpers/tables"

export const main = middyfy(paymentEditsSchema, ulidSchema, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))
  const paymentId = ulid()
  const { fundraiserId, donationId } = event.pathParameters

  appendList(donationTable, { fundraiserId, id: donationId }, "payments", {
    id: paymentId,
    at: event.body.at ?? Math.floor(new Date().getTime() / 1000),
    amount: event.body.amount ?? 0,
    method: event.body.method,
    reference: event.body.reference,
    status: event.body.status,
  })

  return paymentId
})
