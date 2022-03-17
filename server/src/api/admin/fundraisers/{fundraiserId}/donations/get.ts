import { donationsSchema, g } from "@raise/shared"
import { middyfy } from "../../../../../helpers/wrapper"
import { donationTable, fundraiserTable } from "../../../../../helpers/tables"
import {
  assertHasGroup, query, get,
} from "../../../../../helpers/db"

export const main = middyfy(null, donationsSchema, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }), g.National)
  return query(donationTable, { fundraiserId: event.pathParameters.fundraiserId })
})
