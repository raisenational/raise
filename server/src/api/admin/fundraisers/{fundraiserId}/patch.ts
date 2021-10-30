import "source-map-support/register"
import { middyfy } from "../../../../helpers/wrapper"
import { fundraiserEditsSchema } from "../../../../helpers/schemas"
import {
  assertHasGroup, assertHasGroupForProperties, checkPrevious, get, update,
} from "../../../../helpers/db"
import { fundraiserTable } from "../../../../helpers/tables"
import { NATIONAL } from "../../../../helpers/groups"

export const main = middyfy(fundraiserEditsSchema, null, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))
  assertHasGroupForProperties(event, NATIONAL, ["totalRaised", "donationsCount", "matchFundingRate", "matchFundingPerDonationLimit", "matchFundingRemaining", "groupsWithAccess"])

  await update(fundraiserTable, { id: event.pathParameters.fundraiserId }, ...checkPrevious(event.body))
})
