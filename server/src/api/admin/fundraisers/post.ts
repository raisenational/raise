import { ulid } from "ulid"
import { fundraiserCreationSchema, ulidSchema } from "@raise/shared"
import { middyfy } from "../../../helpers/wrapper"
import { assertHasGroup, insert } from "../../../helpers/db"
import { fundraiserTable } from "../../../helpers/tables"
import { NATIONAL } from "../../../helpers/groups"

export const main = middyfy(fundraiserCreationSchema, ulidSchema, true, async (event) => {
  assertHasGroup(event, NATIONAL)

  const fundraiser = await insert(fundraiserTable, {
    id: ulid(),
    fundraiserName: event.body.fundraiserName ?? "New Fundraiser",
    activeFrom: event.body.activeFrom ?? Math.floor(new Date().getTime() / 1000),
    activeTo: event.body.activeTo ?? Math.floor(new Date().getTime() / 1000),
    recurringDonationsTo: event.body.recurringDonationsTo ?? Math.floor(new Date().getTime() / 1000),
    paused: event.body.paused ?? false,
    currency: event.body.currency ?? "gbp",
    goal: event.body.goal ?? 1_00,
    totalRaised: event.body.totalRaised ?? 0,
    donationsCount: event.body.donationsCount ?? 0,
    matchFundingRate: event.body.matchFundingRate ?? 0,
    matchFundingPerDonationLimit: event.body.matchFundingPerDonationLimit ?? null,
    matchFundingRemaining: event.body.matchFundingRemaining ?? null,
    minimumDonationAmount: event.body.minimumDonationAmount ?? null,
    suggestedDonationAmountOneOff: event.body.suggestedDonationAmountOneOff ?? 150_00,
    suggestedDonationAmountWeekly: event.body.suggestedDonationAmountWeekly ?? 9_00,
    suggestedContributionAmount: event.body.suggestedContributionAmount ?? 10_00,
    eventLink: event.body.eventLink ?? null,
    groupsWithAccess: event.body.groupsWithAccess ?? event.auth.payload.groups,
  })

  return fundraiser.id
})
