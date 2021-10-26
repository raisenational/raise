import "source-map-support/register"
import createHttpError from "http-errors"
import Stripe from "stripe"
import { middyfy } from "../../../helpers/wrapper"
import {
  get, inTransaction, plusT, update, updateT,
} from "../../../helpers/db"
import { stripeWebhookRequest } from "../../../helpers/schemas"
import { donationTable, fundraiserTable, paymentTable } from "../../../helpers/tables"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2020-08-27", typescript: true })

// TODO: make idempotent (i.e. if the payment is already marked as paid, do nothing) - maybe other considerations too?
export const main = middyfy(stripeWebhookRequest, null, false, async (event) => {
  const signature = event.headers["Stripe-Signature"]
  if (!signature) throw new createHttpError.Unauthorized("Missing Stripe-Signature header")
  try {
    stripe.webhooks.constructEvent(
      event.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    throw new createHttpError.Unauthorized("Failed to validate webhook signature")
  }

  const {
    fundraiserId, donationId, paymentId, donationAmount: donationAmountStr, contributionAmount: contributionAmountStr,
  } = event.body.data.object.metadata

  const donationAmount = parseInt(donationAmountStr, 10)
  if (donationAmount.toString() !== donationAmountStr) {
    throw new createHttpError.BadRequest("Non-integer donationAmount in metadata")
  }

  const contributionAmount = parseInt(contributionAmountStr, 10)
  if (contributionAmount.toString() !== contributionAmountStr) {
    throw new createHttpError.BadRequest("Non-integer contributionAmount in metadata")
  }

  if (event.body.data.object.amount !== donationAmount + contributionAmount) {
    throw new createHttpError.BadRequest("amount does not match sum of donationAmount and contributionAmount")
  }

  if (event.body.data.object.amount !== event.body.data.object.amount_received) {
    throw new createHttpError.BadRequest("amount does not match amount_received")
  }

  const [fundraiser, donation] = await Promise.all([
    get(fundraiserTable, { id: fundraiserId }),
    get(donationTable, { fundraiserId, id: donationId }),
  ])

  const matchFundingAdded = Math.max(Math.min(Math.floor(donationAmount * (fundraiser.matchFundingRate / 100)), fundraiser.matchFundingRemaining ?? Infinity, (fundraiser.matchFundingPerDonationLimit ?? Infinity) - donation.matchFundingAmount), 0)

  // If recurring, create a Stripe customer and attach this payment method to them
  if (event.body.data.object.setup_future_usage !== null) {
    const stripeCustomer = await stripe.customers.create({
      name: donation.donorName,
      email: donation.donorEmail,
      metadata: {
        fundraiserId,
        donationId,
      },
      payment_method: event.body.data.object.payment_method,
    })
    await update(donationTable, { fundraiserId, id: donationId }, { stripeCustomerId: stripeCustomer.id })
  }

  await inTransaction([
    // Mark the payment as paid
    updateT(
      paymentTable,
      { donationId, id: paymentId },
      { status: "paid" },
      // Validate the reference matches the payment intent id
      // Validate the amount on the payment is the amount the payment intent collected
      "#reference = :paymentIntentId AND #amount = :paymentIntentAmount",
      { ":paymentIntentId": event.body.data.object.id, ":paymentIntentAmount": event.body.data.object.amount },
      { "#reference": "reference", "#amount": "amount" },
    ),
    plusT(
      donationTable,
      { fundraiserId, id: donationId },
      { donationAmount, contributionAmount, matchFundingAmount: matchFundingAdded },
      // Validate the matchFundingAmount on this donation has not changed since we got the data so that we do not violate the matchFundingPerDonation limit
      "matchFundingAmount = :currentMatchFundingAmount",
      { ":currentMatchFundingAmount": donation.matchFundingAmount },
    ),
    // If matchFundingRemaining === null there is no overall limit on match funding
    //   If this is the case, we need to check that is still the case at the point of crediting the amount on the donation
    //   Otherwise, we need to check that there is still enough match funding left for this payment
    // We also validate that the matchFundingPerDonationLimit has not changed since we just got the data
    fundraiser.matchFundingRemaining === null
      ? plusT(fundraiserTable, { id: fundraiserId }, { totalRaised: donationAmount + matchFundingAdded }, "matchFundingRemaining = :matchFundingRemaining AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit", { ":matchFundingRemaining": fundraiser.matchFundingRemaining, ":matchFundingPerDonationLimit": fundraiser.matchFundingPerDonationLimit })
      : plusT(fundraiserTable, { id: fundraiserId }, { totalRaised: donationAmount + matchFundingAdded, matchFundingRemaining: -matchFundingAdded }, "matchFundingRemaining >= :matchFundingAdded AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit", { ":matchFundingAdded": matchFundingAdded, ":matchFundingPerDonationLimit": fundraiser.matchFundingPerDonationLimit }),
  ])
})
