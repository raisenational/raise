import "source-map-support/register"
import { middyfy } from "../../../../helpers/wrapper"
import { fundraiserEditsSchema } from "../../../../helpers/schemas"
import { assertHasGroup, get, update } from "../../../../helpers/db"
import { fundraiserTable } from "../../../../helpers/tables"

export const main = middyfy(fundraiserEditsSchema, null, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))

  // TODO: consider restricting editing totalRaised and donationsCount to national team?
  // TODO: require the fundraiser to be paused when editing totalRaised and donationsCount? (or at least require checks on previous value?)

  await update(fundraiserTable, { id: event.pathParameters.fundraiserId }, event.body)

  // TODO: add audit log?
})
