import { call, makeDonation, makeFundraiser } from '../../../../../local/testHelpers';
import { insert } from '../../../../helpers/db';
import { donationTable, fundraiserTable } from '../../../../helpers/tables';
import { main } from './get';

test('does not return private donations', async () => {
  const fundraiser = makeFundraiser();
  const privateDonation = makeDonation({
    fundraiserId: fundraiser.id, overallPublic: false, comment: 'Never seen', donationCounted: true,
  });
  const publicDonation = makeDonation({
    fundraiserId: fundraiser.id, overallPublic: true, comment: 'A comment!', donationCounted: true,
  });

  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, privateDonation);
  await insert(donationTable, publicDonation);

  const response = await call(main, { auth: false, pathParameters: { fundraiserId: fundraiser.id } })(null);

  expect(response.donations).toHaveLength(1);
  expect(response.donations[0].id).toBe(publicDonation.id);
  expect(response.donations[0].comment).toBe(publicDonation.comment);
});

test.each([
  ['public name and amount', true, true, false, false],
  ['public name and amount (recurring)', true, true, true, false],
  ['public name and amount (gift-aided)', true, true, false, true],
  ['public name and amount (recurring + gift-aided)', true, true, true, true],
  ['private name and public amount', false, true, false, false],
  ['private name and public amount (recurring)', false, true, true, false],
  ['private name and public amount (gift-aided)', false, true, false, true],
  ['private name and public amount (recurring + gift-aided)', false, true, true, true],
  ['public name and private amount', true, false, false, false],
  ['public name and private amount (recurring)', true, false, true, false],
  ['public name and private amount (gift-aided)', true, false, false, true],
  ['public name and private amount (recurring + gift-aided)', true, false, true, true],
  ['private name and amount', false, false, false, false],
  ['private name and amount (recurring)', false, false, true, false],
  ['private name and amount (gift-aided)', false, false, false, true],
  ['private name and amount (recurring + gift-aided)', false, false, true, true],
])('appropriately redacts donation with %s', async (description, namePublic, donationAmountPublic, recurring, giftAid) => {
  const fundraiser = makeFundraiser();
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    overallPublic: true,
    namePublic,
    donationAmountPublic,
    recurrenceFrequency: recurring ? 'WEEKLY' : null,
    recurringAmount: recurring ? 50_00 : null,
    giftAid,
    donationCounted: true,
  });

  await insert(fundraiserTable, fundraiser);
  await insert(donationTable, donation);

  const response = await call(main, { auth: false, pathParameters: { fundraiserId: fundraiser.id } })(null);

  if (namePublic && donationAmountPublic) {
    expect(response.donations).toEqual([{
      id: donation.id,
      donorName: donation.donorName,
      createdAt: donation.createdAt,
      giftAid,
      comment: donation.comment,
      donationAmount: donation.donationAmount,
      matchFundingAmount: donation.matchFundingAmount,
      recurringAmount: donation.recurringAmount,
      recurrenceFrequency: donation.recurrenceFrequency,
    }]);
  } else if (namePublic) {
    expect(response.donations).toEqual([{
      id: donation.id,
      donorName: donation.donorName,
      createdAt: donation.createdAt,
      comment: donation.comment,
    }]);
  } else if (donationAmountPublic) {
    expect(response.donations).toEqual([{
      id: donation.id,
      createdAt: donation.createdAt,
      giftAid,
      comment: donation.comment,
      donationAmount: donation.donationAmount,
      matchFundingAmount: donation.matchFundingAmount,
      recurringAmount: donation.recurringAmount,
      recurrenceFrequency: donation.recurrenceFrequency,
    }]);
  } else {
    expect(response.donations).toEqual([{
      id: donation.id,
      createdAt: donation.createdAt,
      comment: donation.comment,
    }]);
  }
});
