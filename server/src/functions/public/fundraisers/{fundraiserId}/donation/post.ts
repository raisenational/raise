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

  // Calculate amount due
  const amount = event.body.donationAmount + event.body.contributionAmount

  const now = Math.floor(new Date().getTime() / 1000)
  const donationId = ulid(now)
  const paymentId = ulid(now)

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
      donationAmount: event.body.donationAmount,
      contributionAmount: event.body.contributionAmount,
    },
  })
  const stripeClientSecret = paymentIntent.client_secret
  if (!stripeClientSecret) throw new Error("Failed to create Stripe client secret")

  // TODO: do the insertions in a transaction
  // TODO: delete unpaid/failed donations after some timeout?
  // Insert the donation
  const donation = await insert(donationTable, {
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
    // TODO: We need to create these pending payments at some point. Now, or fill in once Stripe confirms payment? (leaning towards the latter)
    recurringAmount: event.body.recurrenceFrequency ? event.body.donationAmount : null,
    recurrenceFrequency: event.body.recurrenceFrequency,
    // TODO: rename to stripeCustomerId
    // TODO: Add this now? Or fill it in later once Stripe confirms the payment? (leaning towards the latter)
    stripeId: null,
    // Donations to other charities should be manually added
    charity: "AMF",
    overallPublic: event.body.overallPublic,
    namePublic: event.body.namePublic,
    donationAmountPublic: event.body.donationAmountPublic,
  })

  // Insert the payment
  const payment = await insert(paymentTable, {
    id: paymentId,
    donationId,
    at: now,
    amount,
    method: "card",
    reference: paymentIntent.id,
    status: "pending",
  })

  return {
    donationId: donation.id,
    paymentId: payment.id,
    amount,
    stripeClientSecret,
  }
})
