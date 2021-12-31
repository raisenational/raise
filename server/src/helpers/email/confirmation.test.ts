import { makeDonation, makeFundraiser, makePayment } from "../../../local/testHelpers"
import confirmation from "./confirmation"

test("renders email correctly with one payment", () => {
  // given fundraiser, donation and payments
  const fundraiser = makeFundraiser({ currency: "gbp" })
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 100_00,
    contributionAmount: 10_00,
    matchFundingAmount: 100_00,
    donorName: "Greg McGregFace",
  })
  const payments = [
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 100_00,
      contributionAmount: 10_00,
      matchFundingAmount: 100_00,
    }),
  ]

  // when we render the email
  const email = confirmation(fundraiser, donation, payments).replace(/\s+/g, " ")

  // then we have expected data filled in
  expect(email).toContain("Greg, you've done a great thing today")
  expect(email).toContain("Your donation will protect 243 people from malaria.")
  expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>£100<\/td>/)
  expect(email).toMatch(/<td[^>]*>Your contribution to Raise<\/td>\s*<td[^>]*>£10<\/td>/)
  expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>£110<\/td>/)
  expect(email).not.toContain("You also set up future donations to AMF:")
})

test("renders email correctly for payments with no contribution or match funding", () => {
  // given fundraiser, donation and payments
  const fundraiser = makeFundraiser({ currency: "gbp" })
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 100_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    donorName: "Greg McGregFace",
  })
  const payments = [
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 100_00,
      contributionAmount: 0,
      matchFundingAmount: null,
    }),
  ]

  // when we render the email
  const email = confirmation(fundraiser, donation, payments).replace(/\s+/g, " ")

  // then we have expected data filled in
  expect(email).toContain("Greg, you've done a great thing today")
  expect(email).toContain("Your donation will protect 121 people from malaria.")
  expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>£100<\/td>/)
  expect(email).not.toContain("Your contribution to Raise")
  expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>£100<\/td>/)
  expect(email).not.toContain("You also set up future donations to AMF:")
})

test.each([
  ["gbp"], ["usd"],
] as const)("renders email correctly with %s scheduled payment", (currency) => {
  // given fundraiser, donation and payments
  const fundraiser = makeFundraiser({ currency })
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 9_00,
    contributionAmount: 10_00,
    matchFundingAmount: 9_00,
    donorName: "Greg McGregFace",
  })
  const payments = [
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 9_00,
      contributionAmount: 10_00,
      matchFundingAmount: 9_00,
      status: "paid",
      at: 1639267200,
    }),
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 9_00,
      contributionAmount: 0,
      matchFundingAmount: 9_00,
      status: "scheduled",
      at: 1639872000,
    }),
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 9_00,
      contributionAmount: 0,
      matchFundingAmount: 9_00,
      status: "scheduled",
      at: 1640476800,
    }),
  ]

  // when we render the email
  const email = confirmation(fundraiser, donation, payments).replace(/\s+/g, " ")

  // then we have expected data filled in
  expect(email).toContain("Greg, you've done a great thing today")
  if (currency === "gbp") {
    expect(email).toContain("Your donation will protect 21 people from malaria.")
    expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>£9<\/td>/)
    expect(email).toMatch(/<td[^>]*>Your contribution to Raise<\/td>\s*<td[^>]*>£10<\/td>/)
    expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>£19<\/td>/)
  } else {
    expect(email).toContain("Your donation will protect 16 people from malaria.")
    expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>\$9<\/td>/)
    expect(email).toMatch(/<td[^>]*>Your contribution to Raise<\/td>\s*<td[^>]*>\$10<\/td>/)
    expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>\$19<\/td>/)
  }
  expect(email).toContain("You also set up future donations to AMF:")
  if (currency === "gbp") {
    expect(email).toMatch(/<td[^>]*>19\/12\/2021<\/td>\s*<td[^>]*>£9<\/td>/)
    expect(email).toMatch(/<td[^>]*>26\/12\/2021<\/td>\s*<td[^>]*>£9<\/td>/)
    expect(email).toMatch(/<td[^>]*>Total future donations<\/td>\s*<td[^>]*>£18<\/td>/)
  } else {
    expect(email).toMatch(/<td[^>]*>19\/12\/2021<\/td>\s*<td[^>]*>\$9<\/td>/)
    expect(email).toMatch(/<td[^>]*>26\/12\/2021<\/td>\s*<td[^>]*>\$9<\/td>/)
    expect(email).toMatch(/<td[^>]*>Total future donations<\/td>\s*<td[^>]*>\$18<\/td>/)
  }
})
