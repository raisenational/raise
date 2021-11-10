import { ulid } from "ulid"
import { insert, scan } from "./db"
import { fundraiserTable } from "./tables"

test("can insert and retrieve an item", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  await insert(fundraiserTable, {
    id: ulid(),
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  })

  expect(await scan(fundraiserTable)).toHaveLength(1)
})

test("can insert and retrieve an item again", async () => {
  expect(await scan(fundraiserTable)).toHaveLength(0)

  await insert(fundraiserTable, {
    id: ulid(),
    fundraiserName: "New Fundraiser",
    activeFrom: Math.floor(new Date().getTime() / 1000),
    activeTo: Math.floor(new Date().getTime() / 1000),
    paused: false,
    goal: 1_00,
    totalRaised: 0,
    donationsCount: 0,
    matchFundingRate: 0,
    matchFundingPerDonationLimit: null,
    matchFundingRemaining: null,
    minimumDonationAmount: null,
    groupsWithAccess: ["National"],
    suggestedDonationAmountOneOff: 150_00,
    suggestedDonationAmountWeekly: 9_00,
    suggestedContributionAmount: 10_00,
  })

  expect(await scan(fundraiserTable)).toHaveLength(1)
})
