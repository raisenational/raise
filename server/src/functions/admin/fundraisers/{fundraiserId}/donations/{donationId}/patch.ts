import "source-map-support/register"
import { middyfy } from "../../../../../../helpers/wrapper"
import { donationEditsSchema, fundraiserSchema } from "../../../../../../helpers/schemas"
import { assertHasGroup, get, update } from "../../../../../../helpers/db"

export const main = middyfy(donationEditsSchema, null, true, async (event) => {
  assertHasGroup(event, await get(process.env.TABLE_NAME_FUNDRAISER!, fundraiserSchema, { id: event.pathParameters.fundraiserId }))

  // TODO: consider restricting editing gift-aided, amounts, at, payment method, payments, payment ref to national team?
  // TODO: validate match funding amount against limit? or not given this is a manual entry?
  // TODO: validate gift-aid requirements

  await update(process.env.TABLE_NAME_DONATION!, donationEditsSchema, { fundraiserId: event.pathParameters.fundraiserId, id: event.pathParameters.donationId }, event.body)

  // TODO: add audit log?
})
