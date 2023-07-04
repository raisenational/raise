import createHttpError from 'http-errors';
import Stripe from 'stripe';
import { middyfy } from '../../../helpers/wrapper';
import { get, scan, update } from '../../../helpers/db';
import { donationTable, fundraiserTable, paymentTable } from '../../../helpers/tables';
import env from '../../../env/env';
import { sendMessageWithLogsLink } from '../../../helpers/slack';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27', typescript: true, timeout: 30_000 });

export const main = middyfy(null, null, true, async (event) => {
  if (event.auth.payload.subject !== 'scheduler') throw new createHttpError.Forbidden('Only scheduler can call /scheduler endpoints');

  // When this becomes slow, we probably want to add a secondary index to the payment table to get scheduled payments efficiently e.g.:
  // GlobalSecondaryIndexes: [{
  //   IndexName: "scheduled-payment",
  //   KeySchema: [{
  //     AttributeName: "isScheduled", // a boolean property (always true) only present on scheduled payments to minimize index size
  //     KeyType: "HASH",
  //   }, {
  //     AttributeName: "at",
  //     KeyType: "RANGE",
  //   }],
  //   Projection: {
  //     ProjectionType: "ALL", // maybe KEYS_ONLY, but then we'd need to fetch each payment again
  //   },
  // }],
  const payments = await scan(paymentTable);

  const now = Math.floor(new Date().getTime() / 1000);
  const scheduledCardPaymentsDue = payments.filter((p) => p.status === 'scheduled' && p.method === 'card' && p.at <= now);

  // eslint-disable-next-line no-console
  console.log(`Found ${scheduledCardPaymentsDue.length} scheduled card payments due`);

  const results = (await Promise.allSettled(scheduledCardPaymentsDue.map(async (payment, index) => {
    // To avoid hitting Stripe rate limits (25 requests/s in test mode, 100 requests/s in live mode)
    await wait(index * 50);

    const [fundraiser, donation] = await Promise.all([
      get(fundraiserTable, { id: payment.fundraiserId }),
      get(donationTable, { id: payment.donationId, fundraiserId: payment.fundraiserId }),
    ]);

    // Without these stripe ids we cannot make this payment - this payment is probably a one-off payment they haven't completed yet
    if (!donation.stripeCustomerId || !donation.stripePaymentMethodId) return;

    // If there's nothing to capture, we're in a weird state and should report this to be handled manually
    if (payment.donationAmount === 0 && payment.contributionAmount === 0) {
      throw new createHttpError.InternalServerError('Nothing to capture on scheduled card payment as donation amount and contribution amount are zero');
    }

    // TODO: get existing payment intent if there is a reference on the payment

    const paymentIntent = await stripe.paymentIntents.create({
      amount: payment.donationAmount + payment.contributionAmount,
      currency: fundraiser.currency,
      payment_method_types: ['card'],
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
    }, { idempotencyKey: payment.id });

    await update(paymentTable, { id: payment.id, donationId: payment.donationId }, { reference: paymentIntent.id });

    // NB: the rest of the processing (validating amounts, marking the payment as paid, updating amounts on donation and fundraiser etc. are done when we get the stripe webhook confirming successful payment)
  }))).map((r, i) => ({
    ...r,
    paymentId: scheduledCardPaymentsDue[i].id,
    donationId: scheduledCardPaymentsDue[i].donationId,
    fundraiserId: scheduledCardPaymentsDue[i].fundraiserId,
  }));

  const successes = results.filter((r) => r.status === 'fulfilled');
  const failures = results.filter((r) => r.status === 'rejected');

  // Log how everything went
  const message = `Tried to collect ${scheduledCardPaymentsDue.length} payments: ${successes.length} succeeded, ${failures.length} failed`;
  // eslint-disable-next-line no-console
  console.log(message);
  failures.forEach((failure) => {
    // eslint-disable-next-line no-console
    console.error(`Payment ${failure.paymentId} (donation ${failure.donationId}, fundraiser ${failure.fundraiserId}) failed:`);
    // eslint-disable-next-line no-console
    console.error((failure as PromiseRejectedResult).reason);
  });
  if (failures.length) {
    await sendMessageWithLogsLink(`💸 Scheduled payments: ${message}.`);
  }
});

const wait = async (timeInMilliseconds: number) => new Promise((resolve) => {
  setTimeout(resolve, timeInMilliseconds);
});
