import { fundraiserEditsSchema } from "@raise/shared"
import createHttpError from "http-errors"
import { middyfy } from "../../../../helpers/wrapper"
import {
  assertHasGroup, assertHasGroupForProperties, checkPrevious, get, query, update,
} from "../../../../helpers/db"
import { donationTable, fundraiserTable } from "../../../../helpers/tables"
import { NATIONAL } from "../../../../helpers/groups"

export const main = middyfy(fundraiserEditsSchema, null, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))
  assertHasGroupForProperties(event, NATIONAL, ["currency", "totalRaised", "donationsCount", "matchFundingRate", "matchFundingPerDonationLimit", "matchFundingRemaining", "groupsWithAccess"])

  if (event.body.currency) {
    const donations = await query(donationTable, { fundraiserId: event.pathParameters.fundraiserId })
    if (donations.length > 0) {
      throw new createHttpError.BadRequest("Cannot edit currency on fundraiser with donations")
    }
  }

  await update(fundraiserTable, { id: event.pathParameters.fundraiserId }, ...checkPrevious(event.body))
})
