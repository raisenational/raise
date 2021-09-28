export interface Fundraiser {
  id: string,
  name: string,
  activeFrom: number,
  activeTo?: number,
  totalRaised: number,
  goal: number,
  matchFundingRate?: number,
  matchFundingPerDonationLimit?: number,
  matchFundingRemaining?: number,
  minimumDonationAmount?: number,
}
