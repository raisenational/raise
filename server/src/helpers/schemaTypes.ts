/* eslint-disable */
/**
* This file was automatically generated. DO NOT MODIFY IT BY HAND.
* Instead, modify schemas.ts, and run "npm run schemas".
*/
export interface AccessToken {
  accessToken: string;
  expiresAt: number;
}

export type AuditLogMetadata =
  | null
  | boolean
  | number
  | string
  | AuditLogMetadata[]
  | {
      [k: string]: AuditLogMetadata;
    };

export interface AuditLog {
  id: string;
  object: string;
  subject: string;
  action: "create" | "edit" | "login" | "plus" | "security";
  at: number;
  metadata: {
    [k: string]: AuditLogMetadata;
  };
}

export interface DonationEdits {
  donorName?: string;
  donorEmail?: string;
  emailConsentInformational?: boolean;
  emailConsentMarketing?: boolean;
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
  recurringAmount?: number | null;
  recurrenceFrequency?: ("WEEKLY" | "MONTHLY") | null;
  stripeCustomerId?: string | null;
  charity?: string;
  overallPublic?: boolean;
  namePublic?: boolean;
  donationAmountPublic?: boolean;
}

export interface Donation {
  donorName: string;
  donorEmail: string;
  emailConsentInformational: boolean;
  emailConsentMarketing: boolean;
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
  recurringAmount: number | null;
  recurrenceFrequency: ("WEEKLY" | "MONTHLY") | null;
  stripeCustomerId: string | null;
  charity: string;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
  id: string;
  fundraiserId: string;
}

export type Donations = {
  donorName: string;
  donorEmail: string;
  emailConsentInformational: boolean;
  emailConsentMarketing: boolean;
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
  recurringAmount: number | null;
  recurrenceFrequency: ("WEEKLY" | "MONTHLY") | null;
  stripeCustomerId: string | null;
  charity: string;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
  id: string;
  fundraiserId: string;
}[];

export type Email = string;

export interface FundraiserEdits {
  fundraiserName?: string;
  activeFrom?: number;
  activeTo?: number;
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

export interface Fundraiser {
  id: string;
  fundraiserName: string;
  activeFrom: number;
  activeTo: number;
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

export type Fundraisers = {
  id: string;
  fundraiserName: string;
  activeFrom: number;
  activeTo: number;
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

export interface IdAndAccessToken {
  idToken: string;
  accessToken: string;
}

export interface PaymentEdits {
  at?: number;
  donationAmount?: number;
  contributionAmount?: number;
  matchFundingAmount?: number | null;
  method?: "cash" | "direct_to_charity";
  reference?: string | null;
}

export interface Payment {
  at: number;
  donationAmount: number;
  contributionAmount: number;
  matchFundingAmount: number | null;
  method: "card" | "cash" | "direct_to_charity";
  reference: string | null;
  id: string;
  donationId: string;
  status: "paid" | "pending" | "cancelled";
}

export type Payments = {
  at: number;
  donationAmount: number;
  contributionAmount: number;
  matchFundingAmount: number | null;
  method: "card" | "cash" | "direct_to_charity";
  reference: string | null;
  id: string;
  donationId: string;
  status: "paid" | "pending" | "cancelled";
}[];

export interface Profile {
  email: string;
  groups: string[];
  issuedAt: number;
  expiresAt: number;
  sourceIp: string;
}

export interface PublicDonationRequest {
  donationAmount: number;
  recurrenceFrequency: ("WEEKLY" | "MONTHLY") | null;
  contributionAmount: number;
  giftAid: boolean;
  donorName: string;
  donorEmail: string;
  emailConsentInformational: boolean;
  emailConsentMarketing: boolean;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  addressPostcode: string | null;
  addressCountry: string | null;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
  comment: string | null;
}

export interface PublicFundraiser {
  id: string;
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
    recurringAmount?: number | null;
    recurrenceFrequency?: ("WEEKLY" | "MONTHLY") | null;
  }[];
}

export interface PublicPaymentIntentResponse {
  stripeClientSecret: string;
  amount: number;
  futurePayments: {
    amount: number;
    at: number;
  }[];
}

export interface Status {
  message: string;
}

export interface StripeWebhookRequest {
  id: string;
  object: "event";
  api_version: "2020-08-27";
  data: {
    object: {
      id: string;
      object: "payment_intent";
      amount: number;
      amount_received: number;
      currency: "gbp";
      metadata: {
        fundraiserId: string;
        donationId: string;
        paymentId: string;
      };
      status: "succeeded";
      payment_method: string;
      setup_future_usage: null | "off_session";
      created: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  type: "payment_intent.succeeded";
  created: number;
  [k: string]: unknown;
}

export type Ulid = string;
