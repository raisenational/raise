import "source-map-support/register"
import createHttpError from "http-errors"
import { middyfy } from "../../../../../../helpers/wrapper"
import { donationEditsSchema } from "../../../../../../helpers/schemas"
import {
  assertHasGroup, assertHasGroupForProperties, checkPrevious, get, update,
} from "../../../../../../helpers/db"
import { donationTable, fundraiserTable } from "../../../../../../helpers/tables"
import { NATIONAL } from "../../../../../../helpers/groups"

export const main = middyfy(donationEditsSchema, null, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))
  assertHasGroupForProperties(event, NATIONAL, ["donationAmount", "matchFundingAmount", "contributionAmount", "stripeCustomerId", "stripePaymentMethodId"])

  // If enabling giftAid, or removing an address component, validate gift aid requirements
  if (event.body.giftAid
    || event.body.addressLine1 === null || event.body.addressLine1 === ""
    || event.body.addressPostcode === null || event.body.addressPostcode === ""
    || event.body.addressCountry === null || event.body.addressCountry === "") {
    const current = await get(donationTable, { fundraiserId: event.pathParameters.fundraiserId, id: event.pathParameters.donationId })
    const after = { ...current, ...event.body }

    if (after.giftAid && (!after.addressLine1 || !after.addressPostcode || !after.addressCountry)) {
      throw new createHttpError.BadRequest("Gift-aided donation must have an address line 1, postcode and country")
    }

    await update(donationTable, { fundraiserId: event.pathParameters.fundraiserId, id: event.pathParameters.donationId }, ...checkPrevious({
      ...event.body,
      previous: {
        ...event.body.previous,
        giftAid: current.giftAid,
        addressLine1: current.addressLine1,
        addressPostcode: current.addressPostcode,
        addressCountry: current.addressCountry,
      },
    }))
  } else {
    await update(donationTable, { fundraiserId: event.pathParameters.fundraiserId, id: event.pathParameters.donationId }, ...checkPrevious(event.body))
  }
})
