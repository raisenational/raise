import "source-map-support/register"
import createHttpError from "http-errors"
import Stripe from "stripe"
import { middyfy } from "../../../helpers/wrapper"
import {
  get, inTransaction, plusT, scan, update, updateT,
} from "../../../helpers/db"
import { donationTable, fundraiserTable, paymentTable } from "../../../helpers/tables"
import env from "../../../env/env"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2020-08-27", typescript: true })

export const main = middyfy(null, null, true, async (event) => {
  if (event.auth.payload.subject !== "scheduler") throw new createHttpError.Forbidden("Only scheduler can call /scheduler endpoints")

  // When this becomes slow, we probably want to add a secondary index to the payment table to get pending payments efficiently e.g.:
  // GlobalSecondaryIndexes: [{
  //   IndexName: "pending-payment",
  //   KeySchema: [{
  //     AttributeName: "isPending", // a boolean property (always true) only present on pending payments to minimize index size
  //     KeyType: "HASH",
  //   }, {
  //     AttributeName: "at",
  //     KeyType: "RANGE",
  //   }],
  //   Projection: {
  //     ProjectionType: "ALL", // maybe KEYS_ONLY, but then we'd need to fetch each payment again
  //   },
  // }],
  const payments = await scan(paymentTable)

  const now = Math.floor(new Date().getTime() / 1000)
  const pendingCardPaymentsDue = payments.filter((p) => p.status === "pending" && p.method === "card" && p.at <= now)

  console.log(`Found ${pendingCardPaymentsDue.length} pending card payments due`)

  const results = (await Promise.allSettled(pendingCardPaymentsDue.map(async (payment, index) => {
    // To avoid hitting Stripe rate limits (25reqs/s in test mode, 100reqs/s in live mode)
    await wait(index * 50)

    const donation = await get(donationTable, { id: payment.donationId, fundraiserId: payment.fundraiserId })

    // Without these stripe ids we cannot make this payment - this payment is probably a one-off payment they haven't completed yet
    if (!donation.stripeCustomerId || !donation.stripePaymentMethodId) return

    // If there's nothing to capture, mark the payment as paid and handle match funding
    if (payment.donationAmount + payment.contributionAmount === 0) {
      console.warn(`Payment ${payment.id}: Nothing to capture, marking as paid.`)

      if (payment.matchFundingAmount === null || payment.matchFundingAmount === 0) {
        await update(paymentTable,
          { id: payment.id, donationId: payment.donationId },
          { status: "paid", matchFundingAmount: 0 },
          "status = :previousStatus AND donationAmount = :previousDonationAmount AND contributionAmount = :previousContributionAmount AND matchFundingAmount = :previousMatchFundingAmount",
          {
            ":previousStatus": payment.status, ":previousDonationAmount": payment.donationAmount, ":previousContributionAmount": payment.contributionAmount, ":previousMatchFundingAmount": payment.matchFundingAmount,
          })
      } else {
        const matchFundingAdded = payment.matchFundingAmount
        await inTransaction([
          updateT(paymentTable,
            { id: payment.id, donationId: payment.donationId },
            { status: "paid" },
            "status = :previousStatus AND donationAmount = :previousDonationAmount AND contributionAmount = :previousContributionAmount AND matchFundingAmount = :previousMatchFundingAmount",
            {
              ":previousStatus": payment.status, ":previousDonationAmount": payment.donationAmount, ":previousContributionAmount": payment.contributionAmount, ":previousMatchFundingAmount": payment.matchFundingAmount,
            }),
          plusT(donationTable,
            { id: payment.donationId, fundraiserId: payment.fundraiserId },
            { matchFundingAmount: matchFundingAdded }),
          plusT(fundraiserTable,
            { id: payment.fundraiserId },
            { totalRaised: matchFundingAdded }),
        ])
      }

      return
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: payment.donationAmount + payment.contributionAmount,
      currency: "gbp",
      payment_method_types: ["card"],
      metadata: {
        fundraiserId: payment.fundraiserId,
        donationId: payment.donationId,
        paymentId: payment.id,
      },
      confirm: true,
      off_session: true,
      customer: donation.stripeCustomerId,
      payment_method: donation.stripePaymentMethodId,
      error_on_requires_action: true,
    }, { idempotencyKey: payment.id })

    await update(paymentTable, { id: payment.id, donationId: payment.donationId }, { reference: paymentIntent.id })

    // NB: the rest of the processing (validating amounts, marking the payment as paid, updating amounts on donation and fundraiser etc. are done when we get the stripe webhook confirming successful payment)
  }))).map((r, i) => ({
    ...r, paymentId: payments[i].id, donationId: payments[i].donationId, fundraiserId: payments[i].fundraiserId,
  }))

  const successes = results.filter((r) => r.status === "fulfilled")
  const failures = results.filter((r) => r.status === "rejected")

  // Log how everything went
  console.log(`Tried to collect ${pendingCardPaymentsDue.length} payments: ${successes.length} succeeded, ${failures.length} failed`)
  failures.forEach((failure) => {
    console.error(`Payment ${failure.paymentId} (donation ${failure.donationId}, fundraiser ${failure.fundraiserId}) failed:`)
    console.error((failure as PromiseRejectedResult).reason)
  })
})

const wait = async (timeInMilliseconds: number) => new Promise((resolve) => setTimeout(resolve, timeInMilliseconds))
