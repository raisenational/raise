import createHttpError from 'http-errors';
import Stripe from 'stripe';
import { calcMatchFunding } from '@raise/shared';
import { middyfy } from '../../../helpers/wrapper';
import {
  get, inTransaction, plusT, query, update, updateT,
} from '../../../helpers/db';
import { donationTable, fundraiserTable, paymentTable } from '../../../helpers/tables';
import env from '../../../env/env';
import { auditContext } from '../../../helpers/auditContext';
import { sendEmail } from '../../../helpers/email';
import confirmation from '../../../helpers/email/confirmation';
import { $StripeWebhookRequest } from '../../../schemas';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27', typescript: true, timeout: 30_000 });

export const main = middyfy($StripeWebhookRequest, null, false, async (event) => {
  const signature = event.headers['stripe-signature'];
  if (!signature) throw new createHttpError.Unauthorized('Missing Stripe-Signature header');
  try {
    stripe.webhooks.constructEvent(
      event.rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw new createHttpError.Unauthorized('Failed to validate webhook signature');
  }
  if (!auditContext.value) throw new createHttpError.InternalServerError('Not in an audit context');
  auditContext.value.subject = 'stripe';

  if (event.body.data.object.amount !== event.body.data.object.amount_received) {
    throw new createHttpError.BadRequest('amount does not match amount_received');
  }

  const { fundraiserId, donationId, paymentId } = event.body.data.object.metadata;

  const [fundraiser, donation, payment] = await Promise.all([
    get(fundraiserTable, { id: fundraiserId }),
    get(donationTable, { fundraiserId, id: donationId }),
    get(paymentTable, { donationId, id: paymentId }),
  ]);

  if (event.body.data.object.amount !== payment.donationAmount + payment.contributionAmount) {
    throw new createHttpError.BadRequest('payment intent amount does not match sum of donationAmount and contributionAmount on payment');
  }

  if (payment.method !== 'card') {
    throw new createHttpError.BadRequest(`payment method is '${payment.method}', not card`);
  }

  if (payment.reference && event.body.data.object.id !== payment.reference) {
    throw new createHttpError.BadRequest('payment intent id does not match reference on payment');
  }

  if (payment.status !== 'pending' && payment.status !== 'scheduled' && payment.status !== 'paid') {
    throw new createHttpError.BadRequest(`payment in invalid state '${payment.status}' to be confirmed`);
  }

  const matchFundingAdded = payment.matchFundingAmount !== null ? 0 : calcMatchFunding({
    donationAmount: payment.donationAmount,
    alreadyMatchFunded: donation.matchFundingAmount,
    matchFundingRate: fundraiser.matchFundingRate,
    matchFundingRemaining: fundraiser.matchFundingRemaining,
    matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
  });
  const matchFundingOnPayment = payment.matchFundingAmount ?? matchFundingAdded;

  const giftAidBefore = donation.giftAid ? Math.floor(donation.donationAmount * 0.25) : 0;
  const giftAidAfter = donation.giftAid ? Math.floor((donation.donationAmount + payment.donationAmount) * 0.25) : 0;
  const giftAidAdded = giftAidAfter - giftAidBefore;

  // If the payment is paid, we've already done this. We should only do this if the payment is pending/scheduled.
  if (payment.status !== 'paid') {
    // If recurring, create a Stripe customer and attach this payment method to them
    if (event.body.data.object.setup_future_usage !== null && (donation.stripeCustomerId === null || donation.stripePaymentMethodId === null)) {
      const stripeCustomer = await stripe.customers.create({
        name: donation.donorName,
        email: donation.donorEmail,
        metadata: {
          fundraiserId,
          donationId,
        },
        payment_method: event.body.data.object.payment_method,
      }, { idempotencyKey: donation.id });
      await update(
        donationTable,
        { fundraiserId, id: donationId },
        { stripeCustomerId: stripeCustomer.id, stripePaymentMethodId: event.body.data.object.payment_method },
        'stripeCustomerId = :cStripeCustomerId AND stripePaymentMethodId = :cStripePaymentMethodId',
        { ':cStripeCustomerId': donation.stripeCustomerId, ':cStripePaymentMethodId': donation.stripePaymentMethodId },
      );
    }

    await inTransaction([
      // Mark the payment as paid
      updateT(
        paymentTable,
        { donationId, id: paymentId },
        { status: 'paid', matchFundingAmount: matchFundingOnPayment },
        // Validate the reference, amounts and status have not changed since we got the data and did our custom validation
        '#reference = :cReference AND #donationAmount = :cDonationAmount AND #contributionAmount = :cContributionAmount AND #matchFundingAmount = :pMatchFundingAmount AND #status = :pStatus',
        {
          ':cReference': payment.reference, ':cDonationAmount': payment.donationAmount, ':cContributionAmount': payment.contributionAmount, ':pMatchFundingAmount': payment.matchFundingAmount, ':pStatus': payment.status,
        },
        {
          '#reference': 'reference', '#donationAmount': 'donationAmount', '#contributionAmount': 'contributionAmount', '#matchFundingAmount': 'matchFundingAmount', '#status': 'status',
        },
      ),
      plusT(
        donationTable,
        { fundraiserId, id: donationId },
        {
          donationAmount: payment.donationAmount, contributionAmount: payment.contributionAmount, matchFundingAmount: matchFundingOnPayment, donationCounted: true,
        },
        // Validate the matchFundingAmount has not changed since we got the data so that we do not violate the matchFundingPerDonation limit
        // Validate the donationCounted has not changed since we got the data so that we do not double count donations
        // Validate the donationAmount and giftAid has not changed since we got the data so that we apply the right amount to the fundraiser total
        'matchFundingAmount = :currentMatchFundingAmount AND donationCounted = :currentDonationCounted AND donationAmount = :currentDonationAmount AND giftAid = :currentGiftAid',
        {
          ':currentMatchFundingAmount': donation.matchFundingAmount, ':currentDonationCounted': donation.donationCounted, ':currentDonationAmount': donation.donationAmount, ':currentGiftAid': donation.giftAid,
        },
      ),
      // If matchFundingRemaining === null there is no overall limit on match funding
      //   If this is the case, we need to check that is still the case at the point of crediting the amount on the donation
      //   Otherwise, we need to check that there is still enough match funding left for this payment
      // We also validate that the matchFundingPerDonationLimit has not changed since we just got the data
      // We only take off the match funding we did't commit before this point - i.e. if the payment already had a match funding amount on it this has already been accounted for in the match funding remaining of the fundraiser
      fundraiser.matchFundingRemaining === null
        ? plusT(fundraiserTable, { id: fundraiserId }, { totalRaised: payment.donationAmount + matchFundingOnPayment + giftAidAdded, donationsCount: donation.donationCounted ? 0 : 1 }, 'matchFundingRemaining = :matchFundingRemaining AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit', { ':matchFundingRemaining': fundraiser.matchFundingRemaining, ':matchFundingPerDonationLimit': fundraiser.matchFundingPerDonationLimit })
        : plusT(fundraiserTable, { id: fundraiserId }, { totalRaised: payment.donationAmount + matchFundingOnPayment + giftAidAdded, matchFundingRemaining: -matchFundingAdded, donationsCount: donation.donationCounted ? 0 : 1 }, 'matchFundingRemaining >= :matchFundingAdded AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit', { ':matchFundingAdded': matchFundingAdded, ':matchFundingPerDonationLimit': fundraiser.matchFundingPerDonationLimit }),
    ]);
  }

  // For the first of a series of recurring donations, update future payments:
  // - mark them as scheduled
  // - allocate their matchFundingAmounts
  const payments = (await query(paymentTable, { donationId })).sort((a, b) => a.at - b.at);
  const donationMatchFundingAlready = payments.reduce((acc, p) => acc + (p.matchFundingAmount ?? 0), 0);
  let donationMatchFundingAdded = 0;
  const paymentTransactions = payments.filter((p) => (p.status === 'pending' || p.status === 'scheduled') && p.matchFundingAmount === null).map((p) => {
    const matchFundingAmount = calcMatchFunding({
      donationAmount: p.donationAmount,
      alreadyMatchFunded: donationMatchFundingAlready + donationMatchFundingAdded,
      matchFundingRate: fundraiser.matchFundingRate,
      matchFundingRemaining: fundraiser.matchFundingRemaining === null ? null : fundraiser.matchFundingRemaining - matchFundingAdded - donationMatchFundingAdded,
      matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
    });
    donationMatchFundingAdded += matchFundingAmount;
    return updateT(
      paymentTable,
      { donationId, id: p.id },
      { status: 'scheduled', matchFundingAmount },
      // Validate the amounts and status have not changed since we got the data
      '#donationAmount = :pDonationAmount AND #matchFundingAmount = :pMatchFundingAmount AND #status = :pStatus',
      {
        ':pDonationAmount': p.donationAmount, ':pMatchFundingAmount': p.matchFundingAmount, ':pStatus': p.status,
      },
      {
        '#donationAmount': 'donationAmount', '#matchFundingAmount': 'matchFundingAmount', '#status': 'status',
      },
    );
  });
  if (paymentTransactions.length > 0) {
    await inTransaction([
      ...paymentTransactions,
      // If matchFundingRemaining === null there is no overall limit on match funding
      //   If this is the case, we need to check that is still the case at the point of crediting the amount on the donation
      //   Otherwise, we need to check that there is still enough match funding left for this payment
      // We also validate that the matchFundingPerDonationLimit has not changed since we just got the data
      fundraiser.matchFundingRemaining === null
        ? plusT(fundraiserTable, { id: fundraiserId }, { donationsCount: 0 /* noop hack */ }, 'matchFundingRemaining = :matchFundingRemaining AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit', { ':matchFundingRemaining': fundraiser.matchFundingRemaining, ':matchFundingPerDonationLimit': fundraiser.matchFundingPerDonationLimit })
        : plusT(fundraiserTable, { id: fundraiserId }, { matchFundingRemaining: -donationMatchFundingAdded }, 'matchFundingRemaining >= :matchFundingAdded AND matchFundingPerDonationLimit = :matchFundingPerDonationLimit', { ':matchFundingAdded': donationMatchFundingAdded, ':matchFundingPerDonationLimit': fundraiser.matchFundingPerDonationLimit }),
    ]);
  }

  if (payments[0].id === paymentId) {
    await sendEmail(
      "We've received your donation",
      confirmation(fundraiser, donation, payments),
      donation.donorEmail,
      fundraiser.publicName
    );
  }
});
