import "source-map-support/register"
import createHttpError from "http-errors"
import Stripe from "stripe"
import { middyfy } from "../../../helpers/wrapper"
import { get, scan, update } from "../../../helpers/db"
import { donationTable, paymentTable } from "../../../helpers/tables"
import env from "../../../env/env"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2020-08-27", typescript: true })

export const main = middyfy(null, null, true, async (event) => {
  if (event.auth.payload.subject !== "scheduler") throw new createHttpError.Forbidden("Only scheduler can call /scheduler endpoints")

  // TODO: handle the case we have >1MB payments (approx 3500 payments)
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
  // We'll definitely want pagination at some point
  // Additionally, we'll probably want to add a secondary index to the payment table to get pending payments efficiently
  const payments = await scan(paymentTable)

  const now = Math.floor(new Date().getTime() / 1000)
  const pendingCardPaymentsDue = payments.filter((p) => p.status === "pending" && p.method === "card" && p.at <= now)

  // TODO: handle Stripe rate limiting (<25reqs/s in test mode, <100reqs/s in live mode)
  // TODO: consider how doing many writes to the same tables in quick succession may hit AWS rate limits, or at least cause other concurrency related failures
  // Possible mitigations: use the async-sema library, do request sequentially (given our low volumes) or just wait one second between batches
  const results = await Promise.allSettled(pendingCardPaymentsDue.map(async (payment) => {
    const donation = await get(donationTable, { id: payment.donationId, fundraiserId: payment.fundraiserId })

    // Without these stripe ids we cannot make this payment - this payment is probably a one-off payment they haven't completed yet
    if (!donation.stripeCustomerId || !donation.stripePaymentMethodId) return

    if (payment.donationAmount + payment.contributionAmount === 0) {
      // TODO: in future, maybe just log this as a warning and mark the payment as paid?
      throw new Error(`Payment ${payment.id}: Nothing to capture`)
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: payment.donationAmount + payment.contributionAmount,
      currency: "gbp",
      payment_method_types: ["card"],
      statement_descriptor_suffix: "Raise Demo", // TODO: use fundraiser public name
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
  }))

  // TODO: some kind of logging or reporting on how it went?
})
