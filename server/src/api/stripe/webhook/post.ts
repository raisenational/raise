import "source-map-support/register"
import createHttpError from "http-errors"
import Stripe from "stripe"
import { middyfy } from "../../../helpers/wrapper"
import {
  get, inTransaction, plusT, query, update, updateT,
} from "../../../helpers/db"
import { stripeWebhookRequest } from "../../../helpers/schemas"
import { donationTable, fundraiserTable, paymentTable } from "../../../helpers/tables"
import env from "../../../env/env"
import { auditContext } from "../../../helpers/auditContext"
import matchFunding from "../../../helpers/matchFunding"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2020-08-27", typescript: true, timeout: 30_000 })

export const main = middyfy(stripeWebhookRequest, null, false, async (event) => {
  const signature = event.headers["stripe-signature"]
  if (!signature) throw new createHttpError.Unauthorized("Missing Stripe-Signature header")
  try {
    stripe.webhooks.constructEvent(
      event.rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    throw new createHttpError.Unauthorized("Failed to validate webhook signature")
  }
  auditContext.value!.subject = "stripe"

  if (event.body.data.object.amount !== event.body.data.object.amount_received) {
    throw new createHttpError.BadRequest("amount does not match amount_received")
  }

  const { fundraiserId, donationId, paymentId } = event.body.data.object.metadata

  const [fundraiser, donation, payment] = await Promise.all([
    get(fundraiserTable, { id: fundraiserId }),
    get(donationTable, { fundraiserId, id: donationId }),
    get(paymentTable, { donationId, id: paymentId }),
  ])

  if (event.body.data.object.amount !== payment.donationAmount + payment.contributionAmount) {
    throw new createHttpError.BadRequest("payment intent amount does not match sum of donationAmount and contributionAmount on payment")
  }

  if (payment.reference && event.body.data.object.id !== payment.reference) {
    throw new createHttpError.BadRequest("payment intent id does not match reference on payment")
  }

  if (payment.status !== "pending" && payment.status !== "paid") {
    throw new createHttpError.BadRequest(`payment in invalid state ${payment.status} to be confirmed`)
  }

  const matchFundingAdded = payment.matchFundingAmount !== null ? payment.matchFundingAmount : matchFunding({
    donationAmount: payment.donationAmount,
    alreadyMatchFunded: donation.matchFundingAmount,
    matchFundingRate: fundraiser.matchFundingRate,
    matchFundingRemaining: fundraiser.matchFundingRemaining,
    matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
  })

  // If the payment is not pending, we've already done this. We should only do this if the payment is still pending.
  if (payment.status === "pending") {
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
      await update(donationTable, { fundraiserId, id: donationId }, { stripeCustomerId: stripeCustomer.id, stripePaymentMethodId: event.body.data.object.payment_method })
    }

    await inTransaction([
      // Mark the payment as paid
      updateT(
        paymentTable,
        { donationId, id: paymentId },
        { status: "paid", matchFundingAmount: matchFundingAdded },
        // Validate the reference and amounts have not changed since we got the data and did our custom validation, and that the payment is pending
        "#reference = :cReference AND #donationAmount = :cDonationAmount AND #contributionAmount = :cContributionAmount AND #matchFundingAmount = :pMatchFundingAmount AND #status = :pStatus",
        {
          ":cReference": payment.reference, ":cDonationAmount": payment.donationAmount, ":cContributionAmount": payment.contributionAmount, ":pMatchFundingAmount": payment.matchFundingAmount, ":pStatus": "pending",
        },
        {
          "#reference": "reference", "#donationAmount": "donationAmount", "#contributionAmount": "contributionAmount", "#matchFundingAmount": "matchFundingAmount", "#status": "status",
        },
      ),
      plusT(
        donationTable,
        { fundraiserId, id: donationId },
        {
          donationAmount: payment.donationAmount, contributionAmount: payment.contributionAmount, matchFundingAmount: matchFundingAdded, donationCounted: true,
        },
        // Validate the matchFundingAmount has not changed since we got the data so that we do not violate the matchFundingPerDonation limit
        // Validate the donationCounted has not changed since we got the data so that we do not double count donations
        "matchFundingAmount = :currentMatchFundingAmount AND donationCounted = :currentDonationCounted",
        { ":currentMatchFundingAmount": donation.matchFundingAmount, ":currentDonationCounted": donation.donationCounted },
      ),
      // If matchFundingRemaining === null there is no overall limit on match funding
      //   If this is the case, we need to check that is still the case at the point of crediting the amount on the donation
      //   Otherwise, we need to check that there is still enough match funding left for this payment
      // We also validate that the matchFundingPerDonationLimit has not changed since we just got the data
      fundraiser.matchFundingRemaining === null
        ? plusT(fundraiserTable, { id: fundraiserId }, { totalRaised: payment.donationAmount + matchFundingAdded, donationsCount: donation.donationCounted ? 0 : 1 }, "matchFundingRemaining = :matchFundingRemaining AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit", { ":matchFundingRemaining": fundraiser.matchFundingRemaining, ":matchFundingPerDonationLimit": fundraiser.matchFundingPerDonationLimit })
        : plusT(fundraiserTable, { id: fundraiserId }, { totalRaised: payment.donationAmount + matchFundingAdded, matchFundingRemaining: -matchFundingAdded, donationsCount: donation.donationCounted ? 0 : 1 }, "matchFundingRemaining >= :matchFundingAdded AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit", { ":matchFundingAdded": matchFundingAdded, ":matchFundingPerDonationLimit": fundraiser.matchFundingPerDonationLimit }),
    ])
  }

  // For the first of a series of recurring donations, confirm future payments' matchFundingAmounts now
  const payments = await query(paymentTable, { donationId })
  const donationMatchFundingAlready = payments.reduce((acc, p) => acc + (p.matchFundingAmount ?? 0), 0)
  let donationMatchFundingAdded = 0
  const paymentTransactions = payments.filter((p) => p.status === "pending" && p.matchFundingAmount === null).sort((a, b) => a.at - b.at).map((p) => {
    const matchFundingAmount = matchFunding({
      donationAmount: p.donationAmount,
      alreadyMatchFunded: donationMatchFundingAlready + donationMatchFundingAdded,
      matchFundingRate: fundraiser.matchFundingRate,
      matchFundingRemaining: fundraiser.matchFundingRemaining === null ? null : fundraiser.matchFundingRemaining - matchFundingAdded - donationMatchFundingAdded,
      matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
    })
    donationMatchFundingAdded += matchFundingAmount
    return updateT(paymentTable, { donationId, id: p.id }, { matchFundingAmount },
      // Validate the amounts and status have not changed since we got the data
      "#donationAmount = :pDonationAmount AND #matchFundingAmount = :pMatchFundingAmount AND #status = :pStatus",
      {
        ":pDonationAmount": p.donationAmount, ":pMatchFundingAmount": p.matchFundingAmount, ":pStatus": "pending",
      },
      {
        "#donationAmount": "donationAmount", "#matchFundingAmount": "matchFundingAmount", "#status": "status",
      })
  })
  if (paymentTransactions.length > 0) {
    await inTransaction([
      ...paymentTransactions,
      // If matchFundingRemaining === null there is no overall limit on match funding
      //   If this is the case, we need to check that is still the case at the point of crediting the amount on the donation
      //   Otherwise, we need to check that there is still enough match funding left for this payment
      // We also validate that the matchFundingPerDonationLimit has not changed since we just got the data
      fundraiser.matchFundingRemaining === null
        ? plusT(fundraiserTable, { id: fundraiserId }, { donationsCount: 0 /* noop hack */ }, "matchFundingRemaining = :matchFundingRemaining AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit", { ":matchFundingRemaining": fundraiser.matchFundingRemaining, ":matchFundingPerDonationLimit": fundraiser.matchFundingPerDonationLimit })
        : plusT(fundraiserTable, { id: fundraiserId }, { matchFundingRemaining: -donationMatchFundingAdded }, "matchFundingRemaining >= :matchFundingAdded AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit", { ":matchFundingAdded": donationMatchFundingAdded, ":matchFundingPerDonationLimit": fundraiser.matchFundingPerDonationLimit }),
    ])
  }

  // TODO: send a confirmation email if they've consented to receiving informational emails
})
