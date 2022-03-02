import { donationsSchema } from "@raise/shared"
import { middyfy } from "../../../../../helpers/wrapper"
import { donationTable, fundraiserTable } from "../../../../../helpers/tables"
import {
  assertHasGroup, query, get, withNational, normalizeGroups,
} from "../../../../../helpers/db"

export const main = middyfy(null, donationsSchema, true, async (event) => {
  assertHasGroup(event, withNational(normalizeGroups(await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))))
  return query(donationTable, { fundraiserId: event.pathParameters.fundraiserId })
})
