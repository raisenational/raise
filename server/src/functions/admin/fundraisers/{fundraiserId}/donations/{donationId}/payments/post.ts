import "source-map-support/register"
import { ulid } from "ulid"
import { middyfy } from "../../../../../../../helpers/wrapper"
import {
  assertHasGroup, get, insert,
} from "../../../../../../../helpers/db"
import { paymentEditsSchema, ulidSchema } from "../../../../../../../helpers/schemas"
import { fundraiserTable, donationTable, paymentTable } from "../../../../../../../helpers/tables"

export const main = middyfy(paymentEditsSchema, ulidSchema, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))
  const paymentId = ulid()
  const { fundraiserId, donationId } = event.pathParameters

  insert(paymentTable, {
    id: paymentId,
    donationId,
    at: event.body.at ?? Math.floor(new Date().getTime() / 1000),
    amount: event.body.amount ?? 0,
    method: event.body.method ?? "cash",
    reference: event.body.reference ?? null,
    status: event.body.status ?? "paid",
  })

  // TODO: update donation amount
  // TODO: update fundraiser amount
  // TODO: do all three tasks in a transaction

  return paymentId
})
