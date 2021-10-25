import "source-map-support/register"
import { middyfy } from "../../../../helpers/wrapper"
import { publicFundraiserSchema } from "../../../../helpers/schemas"
import { donationTable, fundraiserTable } from "../../../../helpers/tables"
import { query, get } from "../../../../helpers/db"

export const main = middyfy(null, publicFundraiserSchema, false, async (event) => {
  const [fundraiser, donations] = await Promise.all([
    get(fundraiserTable, { id: event.pathParameters.fundraiserId }),
    query(donationTable, { fundraiserId: event.pathParameters.fundraiserId }),
  ])

  return {
    id: fundraiser.id,
    activeFrom: fundraiser.activeFrom,
    activeTo: fundraiser.activeTo,
    paused: fundraiser.paused,
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
    donations: donations.filter((d) => d.overallPublic).map((d) => ({
      donorName: d.namePublic ? d.donorName : undefined,
      createdAt: d.createdAt,
      giftAid: d.donationAmountPublic ? d.giftAid : undefined,
      comment: d.comment,
      donationAmount: d.donationAmountPublic ? d.donationAmount : undefined,
      matchFundingAmount: d.donationAmountPublic ? d.matchFundingAmount : undefined,
      recurringAmount: d.donationAmountPublic ? d.recurringAmount : undefined,
      recurrenceFrequency: d.donationAmountPublic ? d.recurrenceFrequency : undefined,
    })),
  }
})
