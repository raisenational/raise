import { fundraiserEditsSchema, g } from "@raise/shared"
import createHttpError from "http-errors"
import { middyfy } from "../../../../helpers/wrapper"
import {
  assertHasGroup, assertHasGroupForProperties, checkPrevious, get, query, update, normalizeGroups, withNational,
} from "../../../../helpers/db"
import { donationTable, fundraiserTable } from "../../../../helpers/tables"

export const main = middyfy(fundraiserEditsSchema, null, true, async (event) => {
  assertHasGroup(event, withNational(normalizeGroups(await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))))
  assertHasGroupForProperties(event, ["currency", "matchFundingRate", "matchFundingPerDonationLimit", "matchFundingRemaining", "groupsWithAccess"], g.National)
  assertHasGroupForProperties(event, ["totalRaised", "donationsCount"], g.NationalTech)

  if (event.body.currency) {
    const donations = await query(donationTable, { fundraiserId: event.pathParameters.fundraiserId })
    if (donations.length > 0) {
      throw new createHttpError.BadRequest("Cannot edit currency on fundraiser with donations")
    }
  }

  await update(fundraiserTable, { id: event.pathParameters.fundraiserId }, ...checkPrevious(event.body))
})
