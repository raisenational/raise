import matchFunding from './matchFunding';

test.each([
  // Basics
  [10, 10, 100, null, null, undefined],
  [20, 20, 100, null, null, undefined],
  [20, 10, 200, null, null, undefined],

  // Rounds things
  [12, 10, 125, null, null, undefined],
  [17, 10, 175, null, null, undefined],
  [22, 10, 225, null, null, undefined],
  [10, 8, 125, null, null, undefined],
  [11, 9, 125, null, null, undefined],

  // If there is a per-donation limit, accounts for amount already donated
  [20, 20, 100, null, null, 0],
  [20, 20, 100, null, 20, 0],
  [15, 20, 100, null, 20, 5],
  [10, 20, 100, null, 20, 10],
  [20, 20, 100, null, null, 10],
  [10, 30, 100, null, 100, 90],

  // Limit to match funding remaining
  [10, 10, 100, 15, null, undefined],
  [15, 20, 100, 15, null, undefined],
  [15, 10, 200, 15, null, undefined],

  // Handles amount already donated, per-donation limit and match funding remaining together
  [5, 10, 100, 25, 10, 5],
  [5, 10, 100, 5, 25, 5],
  [15, 20, 100, 15, 20, 5],
  [15, 20, 100, 25, 20, 5],
  [15, 20, 100, 15, 25, 5],
  [10, 10, 100, 15, 25, 10],
])('expects match funding of %sp for %sp donation, %s% rate, %sp remaining, %sp limit, %sp already', async (expected, donationAmount, matchFundingRate, matchFundingRemaining, matchFundingPerDonationLimit, alreadyMatchFunded) => {
  expect(matchFunding({
    donationAmount,
    alreadyMatchFunded,
    matchFundingRate,
    matchFundingRemaining,
    matchFundingPerDonationLimit,
  })).toBe(expected);
});
