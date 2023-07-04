import { call, makeDonation, makeFundraiser } from '../../../../../../../local/testHelpers';
import { get, insert } from '../../../../../../helpers/db';
import { donationTable, fundraiserTable } from '../../../../../../helpers/tables';
import { main } from './patch';

test('can set whether donation is counted', async () => {
  // given a fundraiser and donation in the db
  const fundraiser = makeFundraiser({ donationsCount: 0 });
  const donation = makeDonation({ fundraiserId: fundraiser.id, donationCounted: false });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);

  // when we call the endpoint
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({ donationCounted: true });

  // the donation and fundraiser are updated
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationCounted: true });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ donationsCount: 1 });

  // when we call the endpoint again
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({ donationCounted: false });

  // the donation and fundraiser are updated
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationCounted: false });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ donationsCount: 0 });
});

test.each([
  [100_00, 125_00],
  [123_00, 153_75],
  [77_77, 97_21],
  [0, 0],
  [1, 1],
  [4, 5],
])('can set whether %sp donation is gift-aided', async (donationAmount, afterGiftAidAmount) => {
  // given a fundraiser and donation in the db
  // fundraiser has 123_45 to simulate having some other donations we don't want to interfere with
  const fundraiser = makeFundraiser({ totalRaised: donationAmount + 123_45 });
  const donation = makeDonation({
    fundraiserId: fundraiser.id, donationAmount, giftAid: false, addressLine1: '10 Downing Street', addressPostcode: 'SW1A 2AA', addressCountry: 'UK',
  });
  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);

  // when we call the endpoint
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({ giftAid: true });

  // the donation and fundraiser are updated
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ giftAid: true, donationAmount });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: afterGiftAidAmount + 123_45 });

  // when we call the endpoint again
  await call(main, { pathParameters: { fundraiserId: fundraiser.id, donationId: donation.id } })({ giftAid: false });

  // the donation and fundraiser are updated
  expect(await get(donationTable, { fundraiserId: fundraiser.id, id: donation.id })).toMatchObject({ donationCounted: false });
  expect(await get(fundraiserTable, { id: fundraiser.id })).toMatchObject({ totalRaised: donationAmount + 123_45 });
});
