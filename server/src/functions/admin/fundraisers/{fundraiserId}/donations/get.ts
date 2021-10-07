import "source-map-support/register"
import { middyfy } from "../../../../../helpers/wrapper"
import { donationsSchema, fundraiserSchema } from "../../../../../helpers/schemas"
import { assertHasGroup, query, get } from "../../../../../helpers/db"

export const main = middyfy(null, donationsSchema, true, async (event) => {
  assertHasGroup(event, await get(process.env.TABLE_NAME_FUNDRAISER!, fundraiserSchema, { id: event.pathParameters.fundraiserId }))
  return query(process.env.TABLE_NAME_DONATION!, donationsSchema, { fundraiserId: event.pathParameters.fundraiserId })
})
