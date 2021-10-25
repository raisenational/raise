import "source-map-support/register"
import { ulid } from "ulid"
import { middyfy } from "../../../../../../../helpers/wrapper"
import {
  assertHasGroup, get, insertT, inTransaction, plusT, insert,
} from "../../../../../../../helpers/db"
import { paymentEditsSchema, ulidSchema } from "../../../../../../../helpers/schemas"
import { fundraiserTable, donationTable, paymentTable } from "../../../../../../../helpers/tables"

export const main = middyfy(paymentEditsSchema, ulidSchema, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }))
  const paymentId = ulid()
  const { fundraiserId, donationId } = event.pathParameters
  const paymentAmount = event.body.amount ?? 0

  if (event.body.status !== "paid") {
    await insert(paymentTable, {
      id: paymentId,
      donationId,
      at: event.body.at ?? Math.floor(new Date().getTime() / 1000),
      amount: paymentAmount,
      method: event.body.method ?? "cash",
      reference: event.body.reference ?? null,
      status: event.body.status ?? "paid",
    })
    return paymentId
  }

  const [fundraiser, donation] = await Promise.all([
    get(fundraiserTable, { id: fundraiserId }),
    get(donationTable, { fundraiserId, id: donationId }),
  ])

  const matchFundingAdded = Math.max(Math.min(Math.floor(paymentAmount * (fundraiser.matchFundingRate / 100)), fundraiser.matchFundingRemaining ?? Infinity, (fundraiser.matchFundingPerDonationLimit ?? Infinity) - donation.matchFundingAmount), 0)

  inTransaction([
    insertT(paymentTable, {
      id: paymentId,
      donationId,
      at: event.body.at ?? Math.floor(new Date().getTime() / 1000),
      amount: paymentAmount,
      method: event.body.method ?? "cash",
      reference: event.body.reference ?? null,
      status: event.body.status ?? "paid",
    }),
    // we need to check the matchfundingamount on this donation has not increased since we got the data
    // so that we do not go over the limit on matchfunding per donation
    plusT(donationTable, { fundraiserId: event.pathParameters.fundraiserId, id: donationId }, { donationAmount: paymentAmount, matchFundingAmount: matchFundingAdded }, "matchFundingAmount = :currentMatchFundingAmount", { ":currentMatchFundingAmount": donation.matchFundingAmount }),
    // we differentiate between matchFundingRemaining === null which is when there is infinite matchfunding
    // if there is infinite matchfunding we need to check that is still the case when we try to add the matchfundingamount
    // if there is limited matchfunding we need to check that there is still enough matchfunding left for this payment (and this hasn't changed since we got the data from the database)
    fundraiser.matchFundingRemaining === null
      ? plusT(fundraiserTable, { id: event.pathParameters.fundraiserId }, { totalRaised: paymentAmount + matchFundingAdded }, "matchFundingRemaining = :null", { ":null": null })
      : plusT(fundraiserTable, { id: event.pathParameters.fundraiserId }, { totalRaised: paymentAmount + matchFundingAdded, matchFundingRemaining: -matchFundingAdded }, "matchFundingRemaining >= :matchFundingAdded", { ":matchFundingAdded": matchFundingAdded }),
  ])

  return paymentId
})
