import { ulid } from 'ulid';
import {
  call, makeFundraiser, makeDonation, makePayment, delayDb,
} from '../../../../local/testHelpers';
import env from '../../../env/env';
import * as db from '../../../helpers/db';
import { get, insert, update } from '../../../helpers/db';
import { donationTable, fundraiserTable, paymentTable } from '../../../helpers/tables';
import { StripeWebhookRequest } from '../../../schemas';
import { main } from './post';

const webhookConstructEvent = jest.fn();
const customersCreate = jest.fn();

jest.mock('stripe', () => jest.fn().mockReturnValue({
  webhooks: {
    get constructEvent() { return webhookConstructEvent; },
  },
  customers: {
    get create() { return customersCreate; },
  },
}));

beforeEach(() => {
  customersCreate.mockResolvedValue({ id: 'cus_abcdef' });
});

describe('signature validation', () => {
  test('rejects request missing stripe signature', async () => {
    const req = makeStripeWebhookRequest();

    const response = await call(main, { rawResponse: true, auth: false })(req);

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain('Missing Stripe-Signature header');
  });

  test('rejects request with invalid stripe signature', async () => {
    const req = makeStripeWebhookRequest();
    webhookConstructEvent.mockImplementationOnce(() => { throw new Error(); });

    const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'not-valid' } })(req);

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain('Failed to validate webhook signature');
  });
});

describe('one-off donation', () => {
  test.each([
    ['no match funding limits', null, null, null, 150_00, false],
    ['fundraiser remaining match funding limit', 100_00, null, 0, 100_00, false],
    ['per-donation match funding limit', null, 100_00, null, 100_00, false],
    ['with gift aid', null, null, null, 150_00, true],
  ])('%s', async (description, matchFundingRemaining, matchFundingPerDonationLimit, matchFundingRemainingAfter, matchFundingAmount, giftAid) => {
    const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingPerDonationLimit, matchFundingRemaining });
    const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false, giftAid });
    const payment = makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      method: 'card',
      status: 'pending',
      reference: `pi_${ulid()}`,
      donationAmount: 150_00,
      contributionAmount: 10_00,
      matchFundingAmount: null,
    });
    const req = makeStripeWebhookRequest(undefined, {
      id: payment.reference,
      amount: payment.donationAmount + payment.contributionAmount,
      amount_received: payment.donationAmount + payment.contributionAmount,
      metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
    });
    await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);

    const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

    expect(webhookConstructEvent).toBeCalledTimes(1);
    expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), 'valid-signature', env.STRIPE_WEBHOOK_SECRET);
    expect(response.statusCode).toBe(204);

    expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
      donationsCount: 1,
      totalRaised: 150_00 + matchFundingAmount + (giftAid ? 37_50 : 0),
      matchFundingRemaining: matchFundingRemainingAfter,
    });
    expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
      donationAmount: 150_00,
      contributionAmount: 10_00,
      matchFundingAmount,
      donationCounted: true,
    });
    expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
      ...payment,
      donationAmount: 150_00,
      contributionAmount: 10_00,
      matchFundingAmount,
      status: 'paid',
    });
  });
});

test('can make first recurring donation without matchFundingPerDonationLimit', async () => {
  const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingPerDonationLimit: null, matchFundingRemaining: 100_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false });
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  })];
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[0].reference,
    amount: payments[0].donationAmount + payments[0].contributionAmount,
    amount_received: payments[0].donationAmount + payments[0].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[0].id },
    setup_future_usage: 'off_session',
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(webhookConstructEvent).toBeCalledTimes(1);
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), 'valid-signature', env.STRIPE_WEBHOOK_SECRET);
  expect(customersCreate).toBeCalledTimes(1);
  expect(customersCreate).toBeCalledWith({
    name: donation.donorName,
    email: donation.donorEmail,
    metadata: {
      fundraiserId: fundraiser.id,
      donationId: donation.id,
    },
    payment_method: req.data.object.payment_method,
  }, { idempotencyKey: donation.id });
  expect(response.statusCode).toBe(204);

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 60_00,
    matchFundingRemaining: 10_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    donationCounted: true,
    stripeCustomerId: 'cus_abcdef',
    stripePaymentMethodId: req.data.object.payment_method,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 30_00,
    status: 'scheduled',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 30_00,
    status: 'scheduled',
  });
});

test('can make first recurring donation with matchFundingPerDonationLimit', async () => {
  const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingPerDonationLimit: 50_00, matchFundingRemaining: 100_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false });
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  })];
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[0].reference,
    amount: payments[0].donationAmount + payments[0].contributionAmount,
    amount_received: payments[0].donationAmount + payments[0].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[0].id },
    setup_future_usage: 'off_session',
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(webhookConstructEvent).toBeCalledTimes(1);
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), 'valid-signature', env.STRIPE_WEBHOOK_SECRET);
  expect(customersCreate).toBeCalledTimes(1);
  expect(customersCreate).toBeCalledWith({
    name: donation.donorName,
    email: donation.donorEmail,
    metadata: {
      fundraiserId: fundraiser.id,
      donationId: donation.id,
    },
    payment_method: req.data.object.payment_method,
  }, { idempotencyKey: donation.id });
  expect(response.statusCode).toBe(204);

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 60_00,
    matchFundingRemaining: 50_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    donationCounted: true,
    stripeCustomerId: 'cus_abcdef',
    stripePaymentMethodId: req.data.object.payment_method,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
    status: 'scheduled',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: 'scheduled',
  });
});

test('can make later recurring donation with gift-aid and match funding committed previously', async () => {
  const fundraiser = makeFundraiser({
    matchFundingRate: 100,
    matchFundingPerDonationLimit: 50_00,
    donationsCount: 1,
    totalRaised: 67_54,
    matchFundingRemaining: 50_00,
  });
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 30_02,
    contributionAmount: 10_00,
    matchFundingAmount: 30_02,
    donationCounted: true,
    giftAid: true,
  });
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'paid',
    reference: `pi_${ulid()}`,
    donationAmount: 30_02,
    contributionAmount: 10_00,
    matchFundingAmount: 30_02,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'scheduled',
    reference: `pi_${ulid()}`,
    donationAmount: 30_02,
    contributionAmount: 0,
    matchFundingAmount: 19_98,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'scheduled',
    reference: `pi_${ulid()}`,
    donationAmount: 30_02,
    contributionAmount: 0,
    matchFundingAmount: 0,
  })];
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[1].reference,
    amount: payments[1].donationAmount + payments[1].contributionAmount,
    amount_received: payments[1].donationAmount + payments[1].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[1].id },
    setup_future_usage: 'off_session',
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(webhookConstructEvent).toBeCalledTimes(1);
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), 'valid-signature', env.STRIPE_WEBHOOK_SECRET);
  expect(customersCreate).toBeCalledTimes(1);
  expect(customersCreate).toBeCalledWith({
    name: donation.donorName,
    email: donation.donorEmail,
    metadata: {
      fundraiserId: fundraiser.id,
      donationId: donation.id,
    },
    payment_method: req.data.object.payment_method,
  }, { idempotencyKey: donation.id });
  expect(response.statusCode).toBe(204);

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 125_05,
    matchFundingRemaining: 50_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 60_04,
    contributionAmount: 10_00,
    matchFundingAmount: 50_00,
    donationCounted: true,
    stripeCustomerId: 'cus_abcdef',
    stripePaymentMethodId: req.data.object.payment_method,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_02,
    contributionAmount: 10_00,
    matchFundingAmount: 30_02,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_02,
    contributionAmount: 0,
    matchFundingAmount: 19_98,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_02,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: 'scheduled',
  });
});

test('can make later recurring donation with match funding committed previously with zero match funding remaining', async () => {
  const fundraiser = makeFundraiser({
    matchFundingRate: 100,
    matchFundingPerDonationLimit: 50_00,
    donationsCount: 1,
    totalRaised: 67_54,
    matchFundingRemaining: 0,
  });
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 30_02,
    contributionAmount: 10_00,
    matchFundingAmount: 30_02,
    donationCounted: true,
    giftAid: true,
  });
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'paid',
    reference: `pi_${ulid()}`,
    donationAmount: 30_02,
    contributionAmount: 10_00,
    matchFundingAmount: 30_02,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'scheduled',
    reference: `pi_${ulid()}`,
    donationAmount: 30_02,
    contributionAmount: 0,
    matchFundingAmount: 19_98,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'scheduled',
    reference: `pi_${ulid()}`,
    donationAmount: 30_02,
    contributionAmount: 0,
    matchFundingAmount: 0,
  })];
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[1].reference,
    amount: payments[1].donationAmount + payments[1].contributionAmount,
    amount_received: payments[1].donationAmount + payments[1].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[1].id },
    setup_future_usage: 'off_session',
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(webhookConstructEvent).toBeCalledTimes(1);
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), 'valid-signature', env.STRIPE_WEBHOOK_SECRET);
  expect(customersCreate).toBeCalledTimes(1);
  expect(customersCreate).toBeCalledWith({
    name: donation.donorName,
    email: donation.donorEmail,
    metadata: {
      fundraiserId: fundraiser.id,
      donationId: donation.id,
    },
    payment_method: req.data.object.payment_method,
  }, { idempotencyKey: donation.id });
  expect(response.statusCode).toBe(204);

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 125_05,
    matchFundingRemaining: 0,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 60_04,
    contributionAmount: 10_00,
    matchFundingAmount: 50_00,
    donationCounted: true,
    stripeCustomerId: 'cus_abcdef',
    stripePaymentMethodId: req.data.object.payment_method,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_02,
    contributionAmount: 10_00,
    matchFundingAmount: 30_02,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_02,
    contributionAmount: 0,
    matchFundingAmount: 19_98,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_02,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: 'scheduled',
  });
});

test('can make later recurring donation with match funding committed previously and existing stripe customer', async () => {
  const fundraiser = makeFundraiser({
    matchFundingRate: 100,
    matchFundingPerDonationLimit: 50_00,
    donationsCount: 1,
    totalRaised: 60_00,
    matchFundingRemaining: 50_00,
  });
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    donationCounted: true,
    stripeCustomerId: 'cus_123456',
    stripePaymentMethodId: 'pm_1234',
  });
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'paid',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'scheduled',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'scheduled',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
  })];
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[1].reference,
    amount: payments[1].donationAmount + payments[1].contributionAmount,
    amount_received: payments[1].donationAmount + payments[1].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[1].id },
    setup_future_usage: 'off_session',
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(webhookConstructEvent).toBeCalledTimes(1);
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), 'valid-signature', env.STRIPE_WEBHOOK_SECRET);
  expect(customersCreate).not.toBeCalled();
  expect(response.statusCode).toBe(204);

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 110_00,
    matchFundingRemaining: 50_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 60_00,
    contributionAmount: 10_00,
    matchFundingAmount: 50_00,
    donationCounted: true,
    stripeCustomerId: 'cus_123456',
    stripePaymentMethodId: 'pm_1234',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: 'scheduled',
  });
});

test('can make later recurring donation without match funding committed previously', async () => {
  const fundraiser = makeFundraiser({
    matchFundingRate: 100,
    matchFundingPerDonationLimit: 50_00,
    donationsCount: 1,
    totalRaised: 60_00,
    matchFundingRemaining: 70_00,
  });
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    donationCounted: true,
  });
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'paid',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  })];
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[1].reference,
    amount: payments[1].donationAmount + payments[1].contributionAmount,
    amount_received: payments[1].donationAmount + payments[1].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[1].id },
    setup_future_usage: 'off_session',
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(webhookConstructEvent).toBeCalledTimes(1);
  expect(webhookConstructEvent).toBeCalledWith(JSON.stringify(req), 'valid-signature', env.STRIPE_WEBHOOK_SECRET);
  expect(customersCreate).toBeCalledTimes(1);
  expect(customersCreate).toBeCalledWith({
    name: donation.donorName,
    email: donation.donorEmail,
    metadata: {
      fundraiserId: fundraiser.id,
      donationId: donation.id,
    },
    payment_method: req.data.object.payment_method,
  }, { idempotencyKey: donation.id });
  expect(response.statusCode).toBe(204);

  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 110_00,
    matchFundingRemaining: 50_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 60_00,
    contributionAmount: 10_00,
    matchFundingAmount: 50_00,
    donationCounted: true,
    stripeCustomerId: 'cus_abcdef',
    stripePaymentMethodId: req.data.object.payment_method,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: 'scheduled',
  });
});

test('rejects partially captured payment intent', async () => {
  const fundraiser = makeFundraiser();
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
  });
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: Math.floor((payment.donationAmount + payment.contributionAmount) / 2),
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(response.statusCode).toBe(400);
  expect(response.body).toContain('amount does not match amount_received');
});

test.each([['cash'], ['direct_to_charity']] as const)('rejects %s payment', async (method) => {
  const fundraiser = makeFundraiser();
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method,
    status: 'pending',
    reference: `pi_${ulid()}`,
  });
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(response.statusCode).toBe(400);
  expect(response.body).toContain(`payment method is '${method}', not card`);
});

test('rejects payment for mismatched amount', async () => {
  const fundraiser = makeFundraiser();
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
  });
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference,
    amount: payment.donationAmount + payment.contributionAmount + 10_00,
    amount_received: payment.donationAmount + payment.contributionAmount + 10_00,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(response.statusCode).toBe(400);
  expect(response.body).toContain('payment intent amount does not match sum of donationAmount and contributionAmount on payment');
});

test('rejects payment for mismatched reference', async () => {
  const fundraiser = makeFundraiser();
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
  });
  const req = makeStripeWebhookRequest(undefined, {
    id: `pi_${ulid()}`,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(response.statusCode).toBe(400);
  expect(response.body).toContain('payment intent id does not match reference on payment');
});

test('rejects payment in invalid state', async () => {
  const fundraiser = makeFundraiser();
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'cancelled',
    reference: `pi_${ulid()}`,
  });
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);

  const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(response.statusCode).toBe(400);
  expect(response.body).toContain("payment in invalid state 'cancelled' to be confirmed");
});

test('handles payments idempotently', async () => {
  const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingRemaining: 200_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false });
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 150_00,
    matchFundingAmount: null,
    contributionAmount: 10_00,
  });
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);

  const response1 = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(response1.statusCode).toBe(204);
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 300_00,
    matchFundingRemaining: 50_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    donationCounted: true,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
    ...payment,
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    status: 'paid',
  });

  const response2 = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(response2.statusCode).toBe(204);
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 300_00,
    matchFundingRemaining: 50_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    donationCounted: true,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
    ...payment,
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    status: 'paid',
  });

  const response3 = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

  expect(response3.statusCode).toBe(204);
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 300_00,
    matchFundingRemaining: 50_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    donationCounted: true,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
    ...payment,
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    status: 'paid',
  });
});

test('handles parallel webhook calls for same one-off payment', async () => {
  const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingRemaining: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false });
  const payment = makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 150_00,
    matchFundingAmount: null,
    contributionAmount: 10_00,
  });
  const req = makeStripeWebhookRequest(undefined, {
    id: payment.reference,
    amount: payment.donationAmount + payment.contributionAmount,
    amount_received: payment.donationAmount + payment.contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);
  delayDb();

  const responses = await Promise.all(new Array(25).fill(0).map(() => call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req)));

  expect(responses.some((r) => r.statusCode === 204)).toBe(true);
  expect(responses.every((r) => r.statusCode === 204 || r.statusCode === 409)).toBe(true);
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 300_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    donationCounted: true,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({
    ...payment,
    donationAmount: 150_00,
    matchFundingAmount: 150_00,
    contributionAmount: 10_00,
    status: 'paid',
  });
});

test('handles parallel webhook calls for same first recurring payment', async () => {
  const fundraiser = makeFundraiser({ matchFundingRate: 100, matchFundingPerDonationLimit: 50_00, matchFundingRemaining: 100_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false });
  const payments = [makePayment({
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  }), makePayment({
    at: Math.floor(new Date().getTime() / 1000) + 1209600, // 2 weeks
    fundraiserId: fundraiser.id,
    donationId: donation.id,
    method: 'card',
    status: 'pending',
    reference: `pi_${ulid()}`,
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: null,
  })];
  const req = makeStripeWebhookRequest(undefined, {
    id: payments[0].reference,
    amount: payments[0].donationAmount + payments[0].contributionAmount,
    amount_received: payments[0].donationAmount + payments[0].contributionAmount,
    metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payments[0].id },
    setup_future_usage: 'off_session',
  });
  await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), Promise.all(payments.map((p) => insert(paymentTable, p)))]);
  delayDb();

  const responses = await Promise.all(new Array(25).fill(0).map(() => call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req)));

  expect(responses.some((r) => r.statusCode === 204)).toBe(true);
  expect(responses.every((r) => r.statusCode === 204 || r.statusCode === 409)).toBe(true);
  expect(customersCreate).toHaveBeenCalled();
  customersCreate.mock.calls.forEach((c) => expect(c).toEqual([{
    name: donation.donorName,
    email: donation.donorEmail,
    metadata: {
      fundraiserId: fundraiser.id,
      donationId: donation.id,
    },
    payment_method: req.data.object.payment_method,
  }, { idempotencyKey: donation.id }]));
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    donationsCount: 1,
    totalRaised: 60_00,
    matchFundingRemaining: 50_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    donationCounted: true,
    stripeCustomerId: 'cus_abcdef',
    stripePaymentMethodId: req.data.object.payment_method,
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[0].id })).toEqual({
    ...payments[0],
    donationAmount: 30_00,
    contributionAmount: 10_00,
    matchFundingAmount: 30_00,
    status: 'paid',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[1].id })).toEqual({
    ...payments[1],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 20_00,
    status: 'scheduled',
  });
  expect(await get(paymentTable, { donationId: donation.id, id: payments[2].id })).toEqual({
    ...payments[2],
    donationAmount: 30_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    status: 'scheduled',
  });
});

describe('handles database conflicts', () => {
  test.each([
    ['payment', 'status', 'pending', 'paid'],
    ['payment', 'status', 'pending', 'cancelled'],
    ['payment', 'donationAmount', 150_00, 175_00],
    ['payment', 'contributionAmount', 10_00, 15_00],
    ['payment', 'matchFundingAmount', 150_00, 175_00],
    ['donation', 'donationCounted', false, true],
    ['donation', 'donationCounted', true, false],
    ['donation', 'matchFundingAmount', 0, 20_00],
    ['donation', 'matchFundingAmount', 20_00, 0],
    ['donation', 'stripeCustomerId', null, 'cus_1234'],
    ['fundraiser', 'matchFundingPerDonationLimit', 150_00, 100_00],
    ['fundraiser', 'matchFundingPerDonationLimit', null, 100_00],
    ['fundraiser', 'matchFundingPerDonationLimit', 150_00, null],
    ['fundraiser', 'matchFundingPerDonationLimit', 150_00, 250_00],
    ['fundraiser', 'matchFundingRemaining', null, 150_00],
    ['fundraiser', 'matchFundingRemaining', 150_00, null],
    ['fundraiser', 'matchFundingRemaining', 150_00, 9_00],
  ] as const)('%s %s changed from %s to %s', async (obj, property, before, after) => {
    const fundraiser = makeFundraiser({
      matchFundingPerDonationLimit: 150_00, matchFundingRemaining: 250_00, matchFundingRate: 100, ...(obj === 'fundraiser' ? { [property]: before } : {}),
    });
    const donation = makeDonation({ fundraiserId: fundraiser.id, ...(obj === 'donation' ? { [property]: before } : {}) });
    const payment = makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      method: 'card',
      status: 'pending',
      reference: `pi_${ulid()}`,
      matchFundingAmount: null,
      ...(obj === 'payment' ? { [property]: before } : {}),
    });
    const req = makeStripeWebhookRequest(undefined, {
      id: payment.reference,
      amount: payment.donationAmount + payment.contributionAmount,
      amount_received: payment.donationAmount + payment.contributionAmount,
      metadata: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId: payment.id },
      setup_future_usage: property === 'stripeCustomerId' ? 'off_session' : null,
    });
    await Promise.all([insert(fundraiserTable, fundraiser), insert(donationTable, donation), insert(paymentTable, payment)]);
    const realGet = db.get;
    jest.spyOn(db, 'get').mockImplementation(async (...args) => {
      const result = await realGet(...args);
      if (args[0].entityName === 'fundraiser' && obj === 'fundraiser') {
        await update(fundraiserTable, { id: fundraiser.id }, { [property]: after });
      }
      if (args[0].entityName === 'donation' && obj === 'donation') {
        await update(donationTable, { fundraiserId: fundraiser.id, id: donation.id }, { [property]: after });
      }
      if (args[0].entityName === 'payment' && obj === 'payment') {
        await update(paymentTable, { donationId: donation.id, id: payment.id }, { [property]: after });
      }
      return result;
    });

    const response = await call(main, { rawResponse: true, auth: false, headers: { 'stripe-signature': 'valid-signature' } })(req);

    expect(response.statusCode).toBe(409);
    expect(await get(fundraiserTable, { id: fundraiser.id })).toEqual({ ...fundraiser, ...(obj === 'fundraiser' ? { [property]: after } : {}) });
    expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toEqual({ ...donation, ...(obj === 'donation' ? { [property]: after } : {}) });
    expect(await get(paymentTable, { donationId: donation.id, id: payment.id })).toEqual({ ...payment, ...(obj === 'payment' ? { [property]: after } : {}) });
  });
});

const makeStripeWebhookRequest = (override?: Partial<StripeWebhookRequest>, overridePi?: Partial<StripeWebhookRequest['data']['object']>): StripeWebhookRequest => ({
  id: `evt_${ulid()}`,
  object: 'event',
  api_version: '2020-08-27',
  data: {
    object: {
      id: `pi_${ulid()}`,
      object: 'payment_intent',
      amount: 150_00,
      amount_received: 150_00,
      currency: 'gbp',
      metadata: {
        fundraiserId: ulid(),
        donationId: ulid(),
        paymentId: ulid(),
      },
      status: 'succeeded',
      payment_method: `pm_${ulid()}`,
      setup_future_usage: null,
      created: 1638116942,
      ...overridePi,
    },
  },
  type: 'payment_intent.succeeded',
  created: 1638116943,
  ...override,
});
