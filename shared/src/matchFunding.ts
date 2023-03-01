export default (params: {
  donationAmount: number,
  alreadyMatchFunded?: number,
  matchFundingRate: number,
  matchFundingRemaining: number | null,
  matchFundingPerDonationLimit: number | null,
}): number => Math.max(
  Math.min(
    Math.floor(params.donationAmount * (params.matchFundingRate / 100)),
    params.matchFundingRemaining ?? Infinity,
    (params.matchFundingPerDonationLimit ?? Infinity) - (params.alreadyMatchFunded ?? 0),
  ),
  0,
);
