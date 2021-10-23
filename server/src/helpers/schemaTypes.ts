/* eslint-disable */
/**
* This file was automatically generated. DO NOT MODIFY IT BY HAND.
* Instead, modify schemas.ts, and run "npm run schemas".
*/
export interface AccessTokenSchema {
  accessToken: string;
  expiresAt: number;
}

export interface DonationEditsSchema {
  fundraiserId?: string;
  donorName?: string;
  donorEmail?: string;
  createdAt?: number;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressLine3?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
  giftAid?: boolean;
  comment?: string | null;
  donationAmount?: number;
  matchFundingAmount?: number;
  contributionAmount?: number;
  charity?: string;
  overallPublic?: boolean;
  namePublic?: boolean;
  donationAmountPublic?: boolean;
}

export interface DonationSchema {
  id: string;
  payments: {
    id: string;
    at: number;
    amount: number;
    method: "card" | "cash" | "direct_to_charity";
    reference: string | null;
    status?: "paid" | "pending" | "cancelled";
  }[];
  fundraiserId: string;
  donorName: string;
  donorEmail: string;
  createdAt: number;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  addressPostcode: string | null;
  addressCountry: string | null;
  giftAid: boolean;
  comment: string | null;
  donationAmount: number;
  matchFundingAmount: number;
  contributionAmount: number;
  charity: string;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
}

export type DonationsSchema = {
  id: string;
  payments: {
    id: string;
    at: number;
    amount: number;
    method: "card" | "cash" | "direct_to_charity";
    reference: string | null;
    status?: "paid" | "pending" | "cancelled";
  }[];
  fundraiserId: string;
  donorName: string;
  donorEmail: string;
  createdAt: number;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  addressPostcode: string | null;
  addressCountry: string | null;
  giftAid: boolean;
  comment: string | null;
  donationAmount: number;
  matchFundingAmount: number;
  contributionAmount: number;
  charity: string;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
}[];

export type EmailSchema = string;

export interface FundraiserEditsSchema {
  fundraiserName?: string;
  activeFrom?: number;
  activeTo?: number | null;
  paused?: boolean;
  goal?: number;
  totalRaised?: number;
  donationsCount?: number;
  matchFundingRate?: number;
  matchFundingPerDonationLimit?: number | null;
  matchFundingRemaining?: number | null;
  minimumDonationAmount?: number | null;
  suggestedDonationAmountOneOff?: number;
  suggestedDonationAmountWeekly?: number;
  suggestedContributionAmount?: number | null;
  groupsWithAccess?: string[];
}

export interface FundraiserSchema {
  id: string;
  fundraiserName: string;
  activeFrom: number;
  activeTo: number | null;
  paused: boolean;
  goal: number;
  totalRaised: number;
  donationsCount: number;
  matchFundingRate: number;
  matchFundingPerDonationLimit: number | null;
  matchFundingRemaining: number | null;
  minimumDonationAmount: number | null;
  suggestedDonationAmountOneOff: number;
  suggestedDonationAmountWeekly: number;
  suggestedContributionAmount: number | null;
  groupsWithAccess: string[];
}

export type FundraisersSchema = {
  id: string;
  fundraiserName: string;
  activeFrom: number;
  activeTo: number | null;
  paused: boolean;
  goal: number;
  totalRaised: number;
  donationsCount: number;
  matchFundingRate: number;
  matchFundingPerDonationLimit: number | null;
  matchFundingRemaining: number | null;
  minimumDonationAmount: number | null;
  suggestedDonationAmountOneOff: number;
  suggestedDonationAmountWeekly: number;
  suggestedContributionAmount: number | null;
  groupsWithAccess: string[];
}[];

export interface IdAndAccessTokenSchema {
  idToken: string;
  accessToken: string;
}

export interface PaymentEditsSchema {
  at: number;
  amount: number;
  method: "card" | "cash" | "direct_to_charity";
  reference: string | null;
  status: "paid" | "pending" | "cancelled";
}

export interface ProfileSchema {
  email: string;
  groups: string[];
  issuedAt: number;
  expiresAt: number;
  sourceIp: string;
}

export interface PublicFundraiserSchema {
  activeFrom: number;
  activeTo: number | null;
  paused: boolean;
  goal: number;
  totalRaised: number;
  donationsCount: number;
  matchFundingRate: number;
  matchFundingPerDonationLimit: number | null;
  matchFundingRemaining: number | null;
  minimumDonationAmount: number | null;
  suggestedDonationAmountOneOff: number;
  suggestedDonationAmountWeekly: number;
  suggestedContributionAmount: number | null;
  donations: {
    donorName?: string;
    createdAt: number;
    giftAid?: boolean;
    comment: string | null;
    donationAmount?: number;
    matchFundingAmount?: number;
    contributionAmount?: number;
  }[];
}

export interface StatusSchema {
  message: string;
}

export type UlidSchema = string;
