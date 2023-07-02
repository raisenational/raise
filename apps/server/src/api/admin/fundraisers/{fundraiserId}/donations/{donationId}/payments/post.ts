import { ulid } from 'ulid';
import { calcMatchFunding, fixedGroups } from '@raise/shared';
import createHttpError from 'http-errors';
import { middyfy } from '../../../../../../../helpers/wrapper';
import {
  assertHasGroup, get, inTransaction, insertT, plusT, updateT,
} from '../../../../../../../helpers/db';
import { fundraiserTable, donationTable, paymentTable } from '../../../../../../../helpers/tables';
import { $PaymentCreation, $Ulid } from '../../../../../../../schemas';

export const main = middyfy($PaymentCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }), fixedGroups.National);
  if (event.body.method === 'card') assertHasGroup(event, fixedGroups.National);

  const paymentId = ulid();
  const { fundraiserId, donationId } = event.pathParameters;
  const donationAmount = event.body.donationAmount ?? 0;
  const contributionAmount = event.body.contributionAmount ?? 0;

  const [fundraiser, donation] = await Promise.all([
    get(fundraiserTable, { id: fundraiserId }),
    get(donationTable, { fundraiserId, id: donationId }),
  ]);

  const matchFundingAdded = event.body.matchFundingAmount ?? calcMatchFunding({
    donationAmount,
    alreadyMatchFunded: donation.matchFundingAmount,
    matchFundingRate: fundraiser.matchFundingRate,
    matchFundingRemaining: fundraiser.matchFundingRemaining,
    matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
  });

  if (donationAmount + donation.donationAmount < 0) throw new createHttpError.BadRequest('This payment would cause the donation to have a negative donation amount');
  if (contributionAmount + donation.contributionAmount < 0) throw new createHttpError.BadRequest('This payment would cause the donation to have a negative contribution amount');
  if (matchFundingAdded + donation.matchFundingAmount < 0) throw new createHttpError.BadRequest('This payment would cause the donation to have a negative match funding amount');

  const giftAidBefore = donation.giftAid ? Math.floor(donation.donationAmount * 0.25) : 0;
  const giftAidAfter = donation.giftAid ? Math.floor((donation.donationAmount + donationAmount) * 0.25) : 0;
  const giftAidAdded = giftAidAfter - giftAidBefore;

  await inTransaction([
    insertT(paymentTable, {
      id: paymentId,
      donationId,
      fundraiserId,
      at: event.body.at ?? Math.floor(new Date().getTime() / 1000),
      donationAmount,
      contributionAmount,
      matchFundingAmount: matchFundingAdded,
      method: event.body.method ?? 'cash',
      reference: event.body.reference ?? null,
      status: 'paid',
    }),
    // we need to check the matchFundingAmount on this donation has not increased since we got the data
    // so that we do not go over the limit on match funding per donation
    // we also need to check that we're not making the donation go negative
    plusT(
      donationTable,
      { fundraiserId, id: donationId },
      { donationAmount, contributionAmount: event.body.contributionAmount ?? 0, matchFundingAmount: matchFundingAdded },
      // Validate the matchFundingAmount on this donation has not changed since we got the data so that we do not violate the matchFundingPerDonation limit
      'matchFundingAmount = :currentMatchFundingAmount AND donationAmount = :currentDonationAmount AND contributionAmount = :currentContributionAmount',
      {
        ':currentMatchFundingAmount': donation.matchFundingAmount, ':currentDonationAmount': donation.donationAmount, ':currentContributionAmount': donation.contributionAmount,
      },
    ),
    // we differentiate between matchFundingRemaining === null which is when there is infinite match funding
    // if there is infinite match funding we need to check that is still the case when we try to add the matchFundingAmount
    // if there is limited match funding we need to check that there is still enough match funding left for this payment (and this hasn't changed since we got the data from the database)
    fundraiser.matchFundingRemaining === null
      ? plusT(fundraiserTable, { id: event.pathParameters.fundraiserId }, { totalRaised: donationAmount + matchFundingAdded + giftAidAdded }, 'matchFundingRemaining = :null', { ':null': null })
      : plusT(fundraiserTable, { id: event.pathParameters.fundraiserId }, { totalRaised: donationAmount + matchFundingAdded + giftAidAdded, matchFundingRemaining: -matchFundingAdded }, 'matchFundingRemaining >= :matchFundingAdded', { ':matchFundingAdded': matchFundingAdded }),
  ]);

  // If the donation and contribution amounts are now zero, and the donation was counted make it uncounted.
  // This is outside the other transaction, so could fail separately. Risk here is that this fails and a user expects the whole payment creation to fail, and sets up a duplicate payment.
  // NB: A donation could in theory still have some match funding after this, but that is unlikely - and at that point it's still not really a donation if it's just match funding nothing.
  if (donation.donationAmount + donation.contributionAmount + donationAmount + contributionAmount === 0 && donation.donationCounted) {
    await inTransaction([
      updateT(donationTable, { fundraiserId, id: donationId }, { donationCounted: false }, 'donationAmount = :zero AND contributionAmount = :zero AND donationCounted = :true', { ':zero': 0, ':true': true }),
      plusT(fundraiserTable, { id: fundraiserId }, { donationsCount: -1 }),
    ]);
  }

  return paymentId;
});
