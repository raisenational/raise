import "source-map-support/register"
import { middyfy } from "../../../../helpers/wrapper"
import { fundraiserEditsSchema, fundraiserSchema } from "../../../../helpers/schemas"
import { assertHasGroup, get, update } from "../../../../helpers/db"

export const main = middyfy(fundraiserEditsSchema, null, true, async (event) => {
  assertHasGroup(event, await get(process.env.TABLE_NAME_FUNDRAISER!, fundraiserSchema, { id: event.pathParameters.fundraiserId }))

  // TODO: consider restricting editing totalRaised and donationsCount to national team?
  // TODO: require the fundraiser to be paused when editing totalRaised and donationsCount? (or at least require checks on previous value?)

  await update(process.env.TABLE_NAME_FUNDRAISER!, fundraiserEditsSchema, { id: event.pathParameters.fundraiserId }, event.body)

  // TODO: add audit log?
})
