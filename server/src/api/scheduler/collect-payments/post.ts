import "source-map-support/register"
import createHttpError from "http-errors"
import Stripe from "stripe"
import { middyfy } from "../../../helpers/wrapper"
import {
  get, inTransaction, plusT, scan, update, updateT,
} from "../../../helpers/db"
import { donationTable, fundraiserTable, paymentTable } from "../../../helpers/tables"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2020-08-27", typescript: true })

export const main = middyfy(null, null, true, async (event) => {
  // TODO: rename email property to subject
  if (event.auth.payload.email !== "scheduler") throw new createHttpError.Forbidden("Only scheduler can call /scheduler endpoints")

  // TODO: handle the case we have >1MB payments (approx 3500 payments)
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
  // We'll definitely want pagination at some point
  // Additionally, we'll probably want to add a secondary index to the payment table to get pending payments efficiently
  const payments = await scan(paymentTable)

  const now = Math.floor(new Date().getTime() / 1000)
  const pendingCardPaymentsDue = payments.filter((p) => p.status === "pending" && p.method === "card" && p.at <= now)

  // TODO: handle Stripe rate limiting (<25reqs/s in test mode, <100reqs/s in live mode)
  // TODO: consider how doing many writes to the same tables in quick succession may hit AWS rate limits, or at least cause other concurrency related failures
  // Either with the async-sema library, or just waiting one second between batches
  await Promise.all(pendingCardPaymentsDue.map(async (payment) => {
    const donation = await get(donationTable, { id: payment.donationId, fundraiserId: payment.fundraiserId })

    // TODO: calculate any relevant match funding etc.

    // TODO: actually do the payment

    // TODO: send a confirmation email if they've consented to receiving informational emails
  }))
})
