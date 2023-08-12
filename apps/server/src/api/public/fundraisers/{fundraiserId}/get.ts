import { middyfy } from '../../../../helpers/wrapper';
import { donationTable, fundraiserTable } from '../../../../helpers/tables';
import { query, get } from '../../../../helpers/db';
import { $PublicFundraiser } from '../../../../schemas';

export const main = middyfy(null, $PublicFundraiser, false, async (event) => {
  const [fundraiser, donations] = await Promise.all([
    get(fundraiserTable, { id: event.pathParameters.fundraiserId }),
    query(donationTable, { fundraiserId: event.pathParameters.fundraiserId }),
  ]);

  return {
    id: fundraiser.id,
    publicName: fundraiser.publicName,
    activeFrom: fundraiser.activeFrom,
    activeTo: fundraiser.activeTo,
    recurringDonationsTo: fundraiser.recurringDonationsTo,
    paused: fundraiser.paused,
    currency: fundraiser.currency,
    goal: fundraiser.goal,
    totalRaised: fundraiser.totalRaised,
    donationsCount: fundraiser.donationsCount,
    matchFundingRate: fundraiser.matchFundingRate,
    matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
    matchFundingRemaining: fundraiser.matchFundingRemaining,
    minimumDonationAmount: fundraiser.minimumDonationAmount,
    suggestedDonationAmountOneOff: fundraiser.suggestedDonationAmountOneOff,
    suggestedDonationAmountWeekly: fundraiser.suggestedDonationAmountWeekly,
    suggestedContributionAmount: fundraiser.suggestedContributionAmount,
    eventLink: fundraiser.eventLink,
    moreInvolvedLink: fundraiser.moreInvolvedLink,
    archived: fundraiser.archived,
    donations: donations.filter((d) => d.overallPublic && d.donationCounted).map((d) => ({
      id: d.id,
      donorName: d.namePublic ? d.donorName : undefined,
      createdAt: d.createdAt,
      giftAid: d.donationAmountPublic ? d.giftAid : undefined,
      comment: d.comment,
      donationAmount: d.donationAmountPublic ? d.donationAmount : undefined,
      matchFundingAmount: d.donationAmountPublic ? d.matchFundingAmount : undefined,
      recurringAmount: d.donationAmountPublic ? d.recurringAmount : undefined,
      recurrenceFrequency: d.donationAmountPublic ? d.recurrenceFrequency : undefined,
    })),
  };
});
