import "source-map-support/register"
import createHttpError from "http-errors"
import { ulid } from "ulid"
import { middyfy } from "../../../../../helpers/wrapper"
import { assertHasGroup, get, insert } from "../../../../../helpers/db"
import { donationEditsSchema, ulidSchema } from "../../../../../helpers/schemas"
import { donationTable, fundraiserTable } from "../../../../../helpers/tables"

export const main = middyfy(donationEditsSchema, ulidSchema, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))

  if (event.body.fundraiserId !== undefined && event.body.fundraiserId !== event.pathParameters.fundraiserId) {
    throw new createHttpError.BadRequest(`Fundraiser id in body (${event.body.fundraiserId}) does not match path parameter (${event.pathParameters.fundraiserId})`)
  }

  // TODO: validate match funding amount against limit? or not given this is a manual entry?
  // TODO: validate gift-aid requirements
  // TODO: add amount to fundraiser totalRaised, subtract amount from fundraiser matchFundingRemaining
  // TODO: do this in a transaction

  const donation = await insert(donationTable, {
    id: ulid(),
    fundraiserId: event.pathParameters.fundraiserId,
    donorName: event.body.donorName ?? "Unknown",
    donorEmail: event.body.donorEmail ?? "Unknown",
    createdAt: event.body.createdAt ?? Math.floor(new Date().getTime() / 1000),
    addressLine1: event.body.addressLine1 ?? null,
    addressLine2: event.body.addressLine2 ?? null,
    addressLine3: event.body.addressLine3 ?? null,
    addressPostcode: event.body.addressPostcode ?? null,
    addressCountry: event.body.addressCountry ?? null,
    giftAid: event.body.giftAid ?? false,
    comment: event.body.comment ?? null,
    donationAmount: event.body.donationAmount ?? 0,
    matchFundingAmount: event.body.matchFundingAmount ?? 0,
    contributionAmount: event.body.contributionAmount ?? 0,
    payments: event.body.payments ?? [],
    charity: event.body.charity ?? "AMF",
    overallPublic: event.body.overallPublic ?? false,
    namePublic: event.body.namePublic ?? false,
    commentPublic: event.body.commentPublic ?? false,
    donationAmountPublic: event.body.donationAmountPublic ?? false,
  })

  return donation.id
})
