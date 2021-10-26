import "source-map-support/register"
import createHttpError from "http-errors"
import { ulid } from "ulid"
import Stripe from "stripe"
import { middyfy } from "../../../../../helpers/wrapper"
import { get, insert } from "../../../../../helpers/db"
import { publicDonationRequest, publicPaymentIntentResponse } from "../../../../../helpers/schemas"
import { donationTable, fundraiserTable, paymentTable } from "../../../../../helpers/tables"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2020-08-27", typescript: true })

export const main = middyfy(publicDonationRequest, publicPaymentIntentResponse, false, async (event) => {
  const fundraiser = await get(fundraiserTable, { id: event.pathParameters.fundraiserId })

  // TODO: validate gift-aid requirements

  // TODO: validate donationAmount is greater than minimum (account for recurring donations?)

  // TODO: validate donationAmount is greater than a global minimum (https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts)

  // TODO: validate the fundraiser is not paused

  // TODO: validate the fundraiser is within its active period

  // Calculate amount due
  const amount = event.body.donationAmount + event.body.contributionAmount

  const now = Math.floor(new Date().getTime() / 1000)
  const donationId = ulid()
  const paymentId = ulid()

  // Get stripe payment intent (attach metadata for fundraiserId, donationId, paymentId and contribution/donation amount)
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "gbp",
    payment_method_types: [
      "card",
    ],
    statement_descriptor_suffix: "Raise Demo", // TODO: use fundraiser public name
    metadata: {
      fundraiserId: event.pathParameters.fundraiserId,
      donationId,
      paymentId,
    },
    setup_future_usage: event.body.recurrenceFrequency ? "off_session" : undefined,
  })
  const stripeClientSecret = paymentIntent.client_secret
  if (!stripeClientSecret) throw new Error("Failed to create Stripe client secret")

  // TODO: delete unpaid/failed donations after some timeout?
  // Insert the donation
  await insert(donationTable, {
    id: donationId,
    fundraiserId: event.pathParameters.fundraiserId,
    donorName: event.body.donorName,
    donorEmail: event.body.donorEmail,
    emailConsentInformational: event.body.emailConsentInformational,
    emailConsentMarketing: event.body.emailConsentMarketing,
    createdAt: now,
    addressLine1: event.body.addressLine1 || null,
    addressLine2: event.body.addressLine2 || null,
    addressLine3: event.body.addressLine3 || null,
    addressPostcode: event.body.addressPostcode || null,
    addressCountry: event.body.addressCountry || null,
    giftAid: event.body.giftAid,
    comment: event.body.comment || null,
    // The amounts are all zero, as at this point the donor hasn't given money
    // Once Stripe confirms their payment, we update all of these
    donationAmount: 0,
    matchFundingAmount: 0,
    contributionAmount: 0,
    recurringAmount: event.body.recurrenceFrequency ? event.body.donationAmount : null,
    recurrenceFrequency: event.body.recurrenceFrequency,
    // If this is a recurring donation, this will be filled in later once Stripe confirms the first payment. Otherwise, this will not be filled in
    stripeCustomerId: null,
    // Donations to other charities should be manually added
    charity: "AMF",
    overallPublic: event.body.overallPublic,
    namePublic: event.body.namePublic,
    donationAmountPublic: event.body.donationAmountPublic,
  })

  // Can insert all the payments in parallel
  // If any fail, we abort and we just have a donation with some funky payments
  // We can't do it in parallel with the donation, as if the donation insert fails we may be left with orphaned payments
  const dbPromises: Promise<unknown>[] = []

  // Insert the payment
  dbPromises.push(insert(paymentTable, {
    id: paymentId,
    donationId,
    at: now,
    donationAmount: event.body.donationAmount,
    contributionAmount: event.body.contributionAmount,
    matchFundingAmount: null,
    method: "card",
    reference: paymentIntent.id,
    status: "pending",
  }))

  const futurePayments: { amount: number, at: number }[] = []

  // For recurring donations, insert future payments
  if (event.body.recurrenceFrequency) {
    // TODO: maybe we should calculate this differently, e.g. so it's always on the same day of the month, and scheudled for 00:00 on that day (so that the daily runner runs it that day)
    const recurrencePeriod = {
      WEEKLY: 604800,
      MONTHLY: 2628000,
    }[event.body.recurrenceFrequency]
    let date = now + recurrencePeriod
    while (date < fundraiser.activeTo) {
      futurePayments.push({ amount: event.body.donationAmount, at: date })
      dbPromises.push(insert(paymentTable, {
        id: ulid(),
        donationId,
        at: date,
        donationAmount: event.body.donationAmount,
        contributionAmount: 0,
        matchFundingAmount: null,
        method: "card",
        reference: null,
        status: "pending",
      }))
      date += recurrencePeriod
    }
  }

  await Promise.all(dbPromises)

  // TODO: return future amounts and schedule
  return {
    amount,
    stripeClientSecret,
    futurePayments,
  }
})
