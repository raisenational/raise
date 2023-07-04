import {
  call, makeFundraiser, makeDonation, makePayment,
} from '../../../../../../../../local/testHelpers';
import { insert } from '../../../../../../../helpers/db';
import { donationTable, fundraiserTable, paymentTable } from '../../../../../../../helpers/tables';
import { main } from './get';

test('can view payments if in correct group', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ groupsWithAccess: ['Test'] });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  const payment = makePayment({ fundraiserId: fundraiser.id, donationId: donation.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  await insert(paymentTable, payment);

  // when we call the endpoint
  const response = await call(main, { auth: { groups: ['Test'] }, pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(null);

  // we get back the payment
  expect(response).toEqual([payment]);
});

test('can not view payments if not in correct group', async () => {
  // given a fundraiser, donation and payment in the db
  const fundraiser = makeFundraiser({ groupsWithAccess: ['NotTest'] });
  const donation = makeDonation({ fundraiserId: fundraiser.id });
  const payment = makePayment({ fundraiserId: fundraiser.id, donationId: donation.id });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);
  await insert(paymentTable, payment);

  // when we call the endpoint
  const response = await call(main, { rawResponse: true, auth: { groups: ['Test'] }, pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })(null);

  // we get back a forbidden error response
  expect(response.statusCode).toEqual(403);
});
