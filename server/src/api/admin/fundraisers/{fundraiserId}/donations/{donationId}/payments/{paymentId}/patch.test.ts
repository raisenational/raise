import { call, makeDonation, makeFundraiser } from '../../../../../../../../../local/testHelpers';
import { get, insert, update } from '../../../../../../../../helpers/db';
import { donationTable, fundraiserTable, paymentTable } from '../../../../../../../../helpers/tables';
import { PaymentCreation } from '../../../../../../../../schemas';
import { main as create } from '../post';
import { main } from './patch';

test('can edit payment donation amount', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: 'cash',
  };
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ donationAmount: 105_00 });

  // then the payment, donation and fundraiser are updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ ...paymentCreation, donationAmount: 105_00 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 105_00, contributionAmount: 1_24, matchFundingAmount: 110_00 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 215_00, matchFundingRemaining: 15_00 });
});

test('can edit payment donation amount on a gift-aided donation', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ totalRaised: 100_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, giftAid: true });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentCreation: PaymentCreation = {
    donationAmount: 11_11,
    contributionAmount: 1_24,
    matchFundingAmount: 11_11,
    method: 'cash',
  };
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 11_11, contributionAmount: 1_24, matchFundingAmount: 11_11 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 124_99 });

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ donationAmount: 11_12 });

  // then the payment, donation and fundraiser are updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ ...paymentCreation, donationAmount: 11_12 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 11_12, contributionAmount: 1_24, matchFundingAmount: 11_11 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 125_01 });
});

test('can edit payment contribution amount', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: 'cash',
  };
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ contributionAmount: 2_00 });

  // then the payment, donation and fundraiser are updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ ...paymentCreation, contributionAmount: 2_00 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 2_00, matchFundingAmount: 110_00 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 208_76, matchFundingRemaining: 15_00 });
});

test('can edit payment match funding amount', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: 'cash',
  };
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ matchFundingAmount: 120_00 });

  // then the payment, donation and fundraiser are updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ ...paymentCreation, matchFundingAmount: 120_00 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 120_00 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 218_76, matchFundingRemaining: 5_00 });
});

test('can set payment match funding amount to null', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: 'cash',
  };
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ matchFundingAmount: null });

  // then the payment, donation and fundraiser are updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ ...paymentCreation, matchFundingAmount: null });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 0 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 98_76, matchFundingRemaining: 125_00 });
});

test('can manually set match funding amount to more than available per donation', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: null, matchFundingPerDonationLimit: 125_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: 'cash',
  };
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ matchFundingAmount: 126_00 });

  // then the payment, donation and fundraiser are updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ ...paymentCreation, matchFundingAmount: 126_00 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 126_00 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 224_76, matchFundingRemaining: null });
});

test('can not manually set match funding amount to more than available on fundraiser', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: 'cash',
  };
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // when we edit the payment
  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ matchFundingAmount: 126_00 });

  // we get back a client error, and the payment is unchanged
  expect(response.statusCode).toBeGreaterThanOrEqual(400);
  expect(response.statusCode).toBeLessThan(500);
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ ...paymentCreation });
});

test.each([
  ['pending'], ['scheduled'], ['paid'], ['cancelled'],
] as const)('can edit payment match funding amount on %s card payment', async (status) => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({ method: 'card' });
  await update(paymentTable, { donationId: donation.id, id: paymentId }, { status });

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ matchFundingAmount: 50_00 });

  // then the payment, donation and fundraiser are updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ method: 'card', matchFundingAmount: 50_00 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 0, contributionAmount: 0, matchFundingAmount: status === 'paid' ? 50_00 : 0 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: status === 'paid' ? 50_00 : 0, matchFundingRemaining: status === 'cancelled' ? 125_00 : 75_00 });
});

test.each([
  ['donationAmount'], ['contributionAmount'],
])('cannot update %s on card payment', async (property) => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: 'card',
  };
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // when we edit the payment
  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ [property]: 25_00 });

  // we get back a client error, and the payment is unchanged
  expect(response.statusCode).toBeGreaterThanOrEqual(400);
  expect(response.statusCode).toBeLessThan(500);
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ ...paymentCreation });
});

test.each([
  ['pending'], ['scheduled'],
] as const)('can cancel a %s card payment', async (status) => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 116_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({ method: 'card' });
  // amounts set in update, as when pending/scheduled should not affect donation/fundraiser
  await update(paymentTable, { donationId: donation.id, id: paymentId }, {
    status, donationAmount: 12_34, contributionAmount: 56_78, matchFundingAmount: 9_00,
  });

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ status: 'cancelled' });

  // then the payment, donation and fundraiser are updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({
    status: 'cancelled', method: 'card', donationAmount: 12_34, contributionAmount: 56_78, matchFundingAmount: 9_00,
  });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 0, contributionAmount: 0, matchFundingAmount: 0 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 0, matchFundingRemaining: 125_00 });
});

test.each([
  ['a string', 'cash'],
  ['a string', 'direct_to_charity'],
  [null, 'cash'],
  [null, 'direct_to_charity'],
] as const)('can set reference to %s on a %s payment', async (reference, method) => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser();
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({ method, reference: 'original' });

  // when we edit the payment
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ reference });

  // then the payment is updated
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ reference });
});

test.each([
  ['a string', 'card'],
  [null, 'card'],
])('cannot set reference to %s on a %s payment', async (reference, method) => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser();
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  const paymentId = await call(create, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({ method, reference: 'original' });

  // when we edit the payment
  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id, paymentId } })({ reference });

  // we get back a client error, and the payment is unchanged
  expect(response.statusCode).toBeGreaterThanOrEqual(400);
  expect(response.statusCode).toBeLessThan(500);
  expect(await get(paymentTable, { donationId: donation.id, id: paymentId })).toMatchObject({ reference: 'original' });
});
