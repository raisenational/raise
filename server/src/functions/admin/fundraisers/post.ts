import "source-map-support/register"
import { ulid } from "ulid"
import { middyfy } from "../../../helpers/wrapper"
import { insert } from "../../../helpers/db"
import { fundraiserEditsSchema, ulidSchema } from "../../../helpers/schemas"
import { fundraiserTable } from "../../../helpers/tables"

export const main = middyfy(fundraiserEditsSchema, ulidSchema, true, async (event) => {
  const fundraiser = await insert(fundraiserTable, {
    id: ulid(),
    fundraiserName: event.body.fundraiserName ?? "New Fundraiser",
    activeFrom: event.body.activeFrom ?? Math.floor(new Date().getTime() / 1000),
    activeTo: event.body.activeTo ?? null,
    paused: event.body.paused ?? false,
    goal: event.body.goal ?? 1_00,
    totalRaised: event.body.totalRaised ?? 0,
    donationsCount: event.body.donationsCount ?? 0,
    matchFundingRate: event.body.matchFundingRate ?? 0,
    matchFundingPerDonationLimit: event.body.matchFundingPerDonationLimit ?? null,
    matchFundingRemaining: event.body.matchFundingRemaining ?? null,
    minimumDonationAmount: event.body.minimumDonationAmount ?? null,
    groupsWithAccess: event.body.groupsWithAccess ?? event.auth.payload.groups,
  })

  return fundraiser.id
})
