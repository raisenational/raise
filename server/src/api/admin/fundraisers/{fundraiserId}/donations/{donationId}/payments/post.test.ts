import { makeFundraiser, makeDonation, call } from '../../../../../../../../local/testHelpers';
import { get, insert, query } from '../../../../../../../helpers/db';
import { fundraiserTable, donationTable, paymentTable } from '../../../../../../../helpers/tables';
import { PaymentCreation } from '../../../../../../../schemas';
import { main } from './post';

test('can insert multiple payments on a donation', async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingRate: 100, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);

  // when we call the endpoint
  const paymentCreation1: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    method: 'cash',
  };
  const response1 = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation1);

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response1).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response1 })).toMatchObject({ ...paymentCreation1, matchFundingAmount: 98_76 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 98_76 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 197_52, matchFundingRemaining: 26_24 });

  // when we call the endpoint again
  const paymentCreation2: PaymentCreation = {
    donationAmount: 45_68,
    contributionAmount: 2_00,
    method: 'cash',
  };
  const response2 = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation2);

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response2).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response2 })).toMatchObject({ ...paymentCreation2, matchFundingAmount: 26_24 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 144_44, contributionAmount: 3_24, matchFundingAmount: 125_00 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 269_44, matchFundingRemaining: 0 });
});

test('can insert multiple payments on a gift-aided donation', async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingRate: 100, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id, giftAid: true });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);

  // when we call the endpoint
  const paymentCreation1: PaymentCreation = {
    donationAmount: 98_77,
    contributionAmount: 1_23,
    method: 'cash',
  };
  const response1 = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation1);

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response1).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response1 })).toMatchObject({ ...paymentCreation1, matchFundingAmount: 98_77 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_77, contributionAmount: 1_23, matchFundingAmount: 98_77 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 222_23, matchFundingRemaining: 26_23 });

  // when we call the endpoint again
  const paymentCreation2: PaymentCreation = {
    donationAmount: 45_67,
    contributionAmount: 2_01,
    method: 'cash',
  };
  const response2 = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation2);

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response2).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response2 })).toMatchObject({ ...paymentCreation2, matchFundingAmount: 26_23 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 144_44, contributionAmount: 3_24, matchFundingAmount: 125_00 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 305_55, matchFundingRemaining: 0 });
});

test('can manually set match funding amount', async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);

  // when we call the endpoint
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 110_00,
    method: 'cash',
  };
  const response = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response })).toMatchObject({ ...paymentCreation });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 110_00 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 208_76, matchFundingRemaining: 15_00 });
});

test('can manually set match funding amount to more than available per donation', async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: null, matchFundingPerDonationLimit: 125_00 });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);

  // when we call the endpoint
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 130_00,
    method: 'cash',
  };
  const response = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // we get back a payment ulid, the payment is inserted and the donation and fundraiser are updated
  expect(typeof response).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response })).toMatchObject({ ...paymentCreation });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationAmount: 98_76, contributionAmount: 1_24, matchFundingAmount: 130_00 });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: 228_76 });
});

test('can not manually set match funding amount to more than available on fundraiser', async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 125_00, matchFundingPerDonationLimit: null });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);

  // when we call the endpoint
  const paymentCreation: PaymentCreation = {
    donationAmount: 98_76,
    contributionAmount: 1_24,
    matchFundingAmount: 130_00,
    method: 'cash',
  };
  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentCreation);

  // we get back a client error, and no payment is inserted
  expect(response.statusCode).toBeGreaterThanOrEqual(400);
  expect(response.statusCode).toBeLessThan(500);
  expect(await query(paymentTable, { donationId: donation.id })).toEqual([]);
});

test('can partially refund a payment', async () => {
  // given a fundraiser, donation and payments in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 200_00, donationsCount: 1 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: true });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({
    donationAmount: 50_00, contributionAmount: 10_00, matchFundingAmount: 25_00, reference: 'a',
  });
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({
    donationAmount: 40_00, contributionAmount: 15_00, matchFundingAmount: 20_00, reference: 'b',
  });

  // when we call the endpoint
  const paymentRefund: PaymentCreation = {
    donationAmount: -25_00,
    contributionAmount: -5_00,
    matchFundingAmount: -12_50,
    reference: 'a',
  };
  const response = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentRefund);

  // a new 'partial refund' payment is inserted, and the donation and fundraiser are updated
  expect(typeof response).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response })).toMatchObject({ ...paymentRefund });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 65_00, contributionAmount: 20_00, matchFundingAmount: 32_50, donationCounted: true,
  });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    totalRaised: 97_50, matchFundingRemaining: 167_50, donationsCount: 1,
  });
});

test('can fully refund a payment', async () => {
  // given a fundraiser, donation and payments in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 200_00, donationsCount: 1 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: true });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({
    donationAmount: 50_00, contributionAmount: 10_00, matchFundingAmount: 25_00, reference: 'a',
  });
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({
    donationAmount: 40_00, contributionAmount: 15_00, matchFundingAmount: 20_00, reference: 'b',
  });

  // when we call the endpoint
  const paymentRefund: PaymentCreation = {
    donationAmount: -50_00,
    contributionAmount: -10_00,
    matchFundingAmount: -25_00,
    reference: 'a',
  };
  const response = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentRefund);

  // a new 'full refund' payment is inserted, and the donation and fundraiser are updated
  expect(typeof response).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response })).toMatchObject({ ...paymentRefund });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 40_00, contributionAmount: 15_00, matchFundingAmount: 20_00, donationCounted: true,
  });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    totalRaised: 60_00, matchFundingRemaining: 180_00, donationsCount: 1,
  });
});

test('can fully refund all payments on a donation', async () => {
  // given a fundraiser, donation and payments in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 200_00, donationsCount: 1 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: true });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({
    donationAmount: 50_00, contributionAmount: 10_00, matchFundingAmount: 25_00, reference: 'a',
  });
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({
    donationAmount: 40_00, contributionAmount: 15_00, matchFundingAmount: 20_00, reference: 'b',
  });

  // when we call the endpoint
  const paymentRefund1: PaymentCreation = {
    donationAmount: -50_00,
    contributionAmount: -10_00,
    matchFundingAmount: -25_00,
    reference: 'a',
  };
  const response1 = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentRefund1);
  const paymentRefund2: PaymentCreation = {
    donationAmount: -40_00,
    contributionAmount: -15_00,
    matchFundingAmount: -20_00,
    reference: 'b',
  };
  const response2 = await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentRefund2);

  // new 'full refund' payments are inserted, and the donation and fundraiser are updated
  expect(typeof response1).toBe('string');
  expect(typeof response2).toBe('string');
  expect(await get(paymentTable, { donationId: donation.id, id: response1 })).toMatchObject({ ...paymentRefund1 });
  expect(await get(paymentTable, { donationId: donation.id, id: response2 })).toMatchObject({ ...paymentRefund2 });
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({
    donationAmount: 0, contributionAmount: 0, matchFundingAmount: 0, donationCounted: false,
  });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({
    totalRaised: 0, matchFundingRemaining: 200_00, donationsCount: 0,
  });
});

test.each([
  ['donationAmount'], ['contributionAmount'], ['matchFundingAmount'],
])('can not add a payment with %s that would result in amount on donation being negative', async (property) => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ matchFundingRemaining: 200_00, donationsCount: 1 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: true });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({
    donationAmount: 50_00, contributionAmount: 10_00, matchFundingAmount: 25_00, reference: 'a',
  });

  // when we call the endpoint
  const paymentRefund: PaymentCreation = {
    donationAmount: -50_00,
    contributionAmount: -10_00,
    matchFundingAmount: -25_00,
    [property]: -100_00,
    reference: 'a',
  };
  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(paymentRefund);

  // we get back a client error, and no additional payment is inserted
  expect(response.statusCode).toBeGreaterThanOrEqual(400);
  expect(response.statusCode).toBeLessThan(500);
  expect(await query(paymentTable, { donationId: donation.id })).toHaveLength(1);
});
