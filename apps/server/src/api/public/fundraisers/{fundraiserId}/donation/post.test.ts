import { ulid } from 'ulid';
import { call, makeFundraiser, setMockDate } from '../../../../../../local/testHelpers';
import { insert, scan } from '../../../../../helpers/db';
import { donationTable, fundraiserTable, paymentTable } from '../../../../../helpers/tables';
import { PublicDonationRequest } from '../../../../../schemas';
import { main } from './post';

const paymentIntentCreate = jest.fn();

jest.mock('stripe', () => jest.fn().mockReturnValue({
  paymentIntents: {
    get create() { return paymentIntentCreate; },
  },
}));

beforeEach(() => {
  paymentIntentCreate.mockResolvedValue({
    id: 'pi_123456',
    client_secret: 'pi_123456_secret_abcdef',
  });
});

test.each([
  ['gbp'], ['usd'],
] as const)('can create a one-off %s donation', async (currency) => {
  const fundraiser = makeFundraiser({ currency });
  await insert(fundraiserTable, fundraiser);
  const donationRequest = makeDonationRequest({ recurrenceFrequency: null });

  const response = await call(main, { pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  expect(response).toEqual({
    currency,
    amount: donationRequest.donationAmount + donationRequest.contributionAmount,
    futurePayments: [],
    stripeClientSecret: 'pi_123456_secret_abcdef',
    totalDonationAmount: donationRequest.donationAmount,
  });
  const donations = await scan(donationTable);
  const payments = await scan(paymentTable);
  expect(donations).toMatchObject([{
    ...donationRequest,
    donationAmount: 0, // as we haven't paid it yet
    contributionAmount: 0, // as we haven't paid it yet
    matchFundingAmount: 0, // as we haven't paid it yet
    donationCounted: false, // as we haven't paid it yet
    charity: 'AMF',
    fundraiserId: fundraiser.id,
    recurrenceFrequency: null,
    recurringAmount: null,
  }]);
  expect(payments).toMatchObject([{
    donationAmount: donationRequest.donationAmount,
    contributionAmount: donationRequest.contributionAmount,
    matchFundingAmount: null, // as we haven't paid it yet
    method: 'card',
    reference: 'pi_123456',
    status: 'pending',
    donationId: donations[0].id,
    fundraiserId: fundraiser.id,
  }]);
  expect(paymentIntentCreate).toHaveBeenCalledTimes(1);
  expect(paymentIntentCreate).toHaveBeenCalledWith({
    amount: donationRequest.donationAmount + donationRequest.contributionAmount,
    currency: fundraiser.currency,
    payment_method_types: ['card'],
    metadata: {
      fundraiserId: fundraiser.id,
      donationId: donations[0].id,
      paymentId: payments[0].id,
    },
    setup_future_usage: undefined,
  });
});

test('can create a weekly donation', async () => {
  setMockDate(1638028787);
  const fundraiser = makeFundraiser({ recurringDonationsTo: Math.floor(new Date().getTime() / 1000) + 1512000 /* 2.5 weeks */ });
  await insert(fundraiserTable, fundraiser);
  const donationRequest = makeDonationRequest({ recurrenceFrequency: 'WEEKLY' });

  const response = await call(main, { pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  const nextWeek = Math.floor(new Date(2021, 11 /* December */, 4, 0, 0, 0).getTime() / 1000);
  const nextNextWeek = Math.floor(new Date(2021, 11 /* December */, 11, 0, 0, 0).getTime() / 1000);
  expect(response).toEqual({
    currency: fundraiser.currency,
    amount: donationRequest.donationAmount + donationRequest.contributionAmount,
    futurePayments: [{
      amount: donationRequest.donationAmount,
      at: nextWeek,
    }, {
      amount: donationRequest.donationAmount,
      at: nextNextWeek,
    }],
    stripeClientSecret: 'pi_123456_secret_abcdef',
    totalDonationAmount: donationRequest.donationAmount * 3,
  });

  const donations = await scan(donationTable);
  const payments = await scan(paymentTable);
  expect(donations).toMatchObject([{
    ...donationRequest,
    donationAmount: 0, // as we haven't paid it yet
    contributionAmount: 0, // as we haven't paid it yet
    matchFundingAmount: 0, // as we haven't paid it yet
    donationCounted: false, // as we haven't paid it yet
    charity: 'AMF',
    fundraiserId: fundraiser.id,
    recurrenceFrequency: 'WEEKLY',
    recurringAmount: donationRequest.donationAmount,
  }]);
  expect(payments.sort((a, b) => a.at - b.at)).toMatchObject([{
    at: 1638028787,
    donationAmount: donationRequest.donationAmount,
    contributionAmount: donationRequest.contributionAmount,
    matchFundingAmount: null, // as we haven't paid it yet
    method: 'card',
    reference: 'pi_123456',
    status: 'pending',
    donationId: donations[0].id,
    fundraiserId: fundraiser.id,
  }, {
    at: nextWeek,
    donationAmount: donationRequest.donationAmount,
    contributionAmount: 0,
    matchFundingAmount: null, // as we haven't paid it yet
    method: 'card',
    reference: null,
    status: 'pending',
    donationId: donations[0].id,
    fundraiserId: fundraiser.id,
  }, {
    at: nextNextWeek,
    donationAmount: donationRequest.donationAmount,
    contributionAmount: 0,
    matchFundingAmount: null, // as we haven't paid it yet
    method: 'card',
    reference: null,
    status: 'pending',
    donationId: donations[0].id,
    fundraiserId: fundraiser.id,
  }]);
});

test.each([
  ['address line 1', { addressLine1: null }],
  ['address postcode', { addressPostcode: null }],
  ['address country', { addressCountry: null }],
])('rejects bad gift-aid donation: missing %s', async (missingData, override) => {
  const fundraiser = makeFundraiser();
  await insert(fundraiserTable, fundraiser);
  const donationRequest = makeDonationRequest({ giftAid: true, ...override });

  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  expect(response.statusCode).toEqual(400);
  expect(response.body).toContain(`Gift-aided donation must provide ${missingData}`);
  await expectNoDonationInserted();
});

test('rejects donation when fundraiser is paused', async () => {
  const fundraiser = makeFundraiser({ paused: true });
  await insert(fundraiserTable, fundraiser);
  const donationRequest = makeDonationRequest();

  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  expect(response.statusCode).toEqual(400);
  expect(response.body).toContain('paused');
  await expectNoDonationInserted();
});

test('rejects donation to non-existent fundraiser', async () => {
  const donationRequest = makeDonationRequest();

  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: ulid() } })(donationRequest);

  expect(response.statusCode).toEqual(404);
  expect(response.body).toContain('fundraiser not found');
  await expectNoDonationInserted();
});

test.each([
  ['gbp'], ['usd'],
] as const)('rejects donation when %s payment amount is too small', async (currency) => {
  const fundraiser = makeFundraiser({ currency });
  await insert(fundraiserTable, fundraiser);
  const donationRequest = makeDonationRequest({ donationAmount: 49, contributionAmount: 49 });

  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  expect(response.statusCode).toEqual(400);
  expect(response.body).toContain(`Payment amount must be greater than ${currency === 'gbp' ? '£' : '$'}1`);
  await expectNoDonationInserted();
});

test.each([
  ['gbp'], ['usd'],
] as const)('rejects donation when %s payment recurring amount is too small', async (currency) => {
  const fundraiser = makeFundraiser({ currency });
  await insert(fundraiserTable, fundraiser);
  const donationRequest = makeDonationRequest({ donationAmount: 99, contributionAmount: 1_00, recurrenceFrequency: 'WEEKLY' });

  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  expect(response.statusCode).toEqual(400);
  expect(response.body).toContain(`Future payments must be greater than ${currency === 'gbp' ? '£' : '$'}1`);
  await expectNoDonationInserted();
});

test.each([
  ['gbp'], ['usd'],
] as const)('rejects donation when %s donation amount is too small for fundraiser', async (currency) => {
  const fundraiser = makeFundraiser({ currency, minimumDonationAmount: 10_00 });
  await insert(fundraiserTable, fundraiser);
  const donationRequest = makeDonationRequest({ donationAmount: 9_99 });

  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  expect(response.statusCode).toEqual(400);
  expect(response.body).toContain(`Donation amount must be greater than ${currency === 'gbp' ? '£' : '$'}10`);
  await expectNoDonationInserted();
});

test.each([
  ['gbp'], ['usd'],
] as const)('rejects donation when recurring donation amount is too small for fundraiser', async (currency) => {
  const fundraiser = makeFundraiser({ currency, minimumDonationAmount: 10_00, recurringDonationsTo: Math.floor(new Date().getTime() / 1000) + 1512000 /* 2.5 weeks */ });
  await insert(fundraiserTable, fundraiser);
  const donationRequest = makeDonationRequest({ donationAmount: 3_33, recurrenceFrequency: 'WEEKLY' });

  const response = await call(main, { rawResponse: true, pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  expect(response.statusCode).toEqual(400);
  expect(response.body).toContain(`Donation amount must be greater than ${currency === 'gbp' ? '£' : '$'}10`);
  await expectNoDonationInserted();
});

test('can donate to a custom charity', async () => {
  const charity = 'Clear Air Task Force';
  const fundraiser = await insert(fundraiserTable, makeFundraiser());
  const donationRequest = makeDonationRequest({ charity });

  await call(main, { pathParameters: { fundraiserId: fundraiser.id } })(donationRequest);

  const donations = await scan(donationTable);
  expect(donations).toMatchObject([{
    fundraiserId: fundraiser.id,
    charity,
  }]);
});

const makeDonationRequest = (override?: Partial<PublicDonationRequest>): PublicDonationRequest => ({
  donationAmount: Math.ceil(Math.random() * 4) * 50_00,
  recurrenceFrequency: null,
  contributionAmount: Math.random() < 0.5 ? 10_00 : 0,
  giftAid: Math.random() < 0.5,
  donorName: 'Person McPersonface',
  donorEmail: 'person@example.com',
  emailConsentInformational: Math.random() < 0.5,
  emailConsentMarketing: Math.random() < 0.5,
  addressLine1: '123 Streets Street',
  addressLine2: null,
  addressLine3: null,
  addressPostcode: 'SW1A 1AA',
  addressCountry: 'United Kingdom',
  overallPublic: Math.random() < 0.5,
  namePublic: Math.random() < 0.5,
  donationAmountPublic: Math.random() < 0.5,
  comment: 'Doing good and feeling good!',
  charity: 'AMF',
  ...override,
});

const expectNoDonationInserted = async () => {
  expect(await scan(donationTable)).toHaveLength(0);
};
