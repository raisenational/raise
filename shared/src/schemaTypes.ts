/* eslint-disable */
/**
* This file was automatically generated. DO NOT MODIFY IT BY HAND.
* Instead, modify schemas.ts, and run "npm run build".
*/
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
  action: "create" | "edit" | "login" | "plus" | "security" | "run";
  at: number;
  sourceIp: string;
  userAgent: string;
  routeRaw: string;
  metadata: {
    [k: string]: AuditLogMetadata;
  };
  ttl: number | null;
}

export interface DonationCreation {
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
  recurringAmount?: number | null;
  recurrenceFrequency?: ("WEEKLY" | "MONTHLY") | null;
  stripeCustomerId?: string | null;
  stripePaymentMethodId?: string | null;
  charity?: string;
  overallPublic?: boolean;
  namePublic?: boolean;
  donationAmountPublic?: boolean;
  donationCounted?: boolean;
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
  recurringAmount?: number | null;
  recurrenceFrequency?: ("WEEKLY" | "MONTHLY") | null;
  stripeCustomerId?: string | null;
  stripePaymentMethodId?: string | null;
  charity?: string;
  overallPublic?: boolean;
  namePublic?: boolean;
  donationAmountPublic?: boolean;
  donationCounted?: boolean;
  donationAmount?: number;
  matchFundingAmount?: number;
  contributionAmount?: number;
  previous?: {
    donationAmount?: number;
    matchFundingAmount?: number;
    contributionAmount?: number;
  };
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
  recurringAmount: number | null;
  recurrenceFrequency: ("WEEKLY" | "MONTHLY") | null;
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;
  charity: string;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
  donationCounted: boolean;
  id: string;
  fundraiserId: string;
  donationAmount: number;
  matchFundingAmount: number;
  contributionAmount: number;
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
  recurringAmount: number | null;
  recurrenceFrequency: ("WEEKLY" | "MONTHLY") | null;
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;
  charity: string;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
  donationCounted: boolean;
  id: string;
  fundraiserId: string;
  donationAmount: number;
  matchFundingAmount: number;
  contributionAmount: number;
}[];

export type Email = string;

export interface FundraiserCreation {
  internalName?: string;
  publicName?: string;
  activeFrom?: number;
  activeTo?: number;
  recurringDonationsTo?: number;
  paused?: boolean;
  currency?: "gbp" | "usd";
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
  eventLink?: string | null;
  groupsWithAccess?: string[];
}

export interface FundraiserEdits {
  internalName?: string;
  publicName?: string;
  activeFrom?: number;
  activeTo?: number;
  recurringDonationsTo?: number;
  paused?: boolean;
  currency?: "gbp" | "usd";
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
  eventLink?: string | null;
  groupsWithAccess?: string[];
  previous?: {
    totalRaised?: number;
    donationsCount?: number;
  };
}

export interface Fundraiser {
  id: string;
  internalName: string;
  publicName: string;
  activeFrom: number;
  activeTo: number;
  recurringDonationsTo: number;
  paused: boolean;
  currency: "gbp" | "usd";
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
  eventLink: string | null;
  groupsWithAccess: string[];
}

export type Fundraisers = {
  id: string;
  internalName: string;
  publicName: string;
  activeFrom: number;
  activeTo: number;
  recurringDonationsTo: number;
  paused: boolean;
  currency: "gbp" | "usd";
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
  eventLink: string | null;
  groupsWithAccess: string[];
}[];

export interface GoogleLoginRequest {
  idToken: string;
  accessToken: string;
}

export interface ImpersonationLoginRequest {
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: number;
  groups: string[];
}

export interface PaymentCreation {
  at?: number;
  donationAmount?: number;
  contributionAmount?: number;
  matchFundingAmount?: number | null;
  method?: "card" | "cash" | "direct_to_charity";
  reference?: string | null;
}

export type PaymentPropertyEdits =
  | {
      donationAmount: number;
    }
  | {
      contributionAmount: number;
    }
  | {
      matchFundingAmount: number | null;
    }
  | {
      reference: string | null;
    }
  | {
      status: "paid" | "pending" | "scheduled" | "cancelled";
    };

export interface Payment {
  at: number;
  donationAmount: number;
  contributionAmount: number;
  matchFundingAmount: number | null;
  method: "card" | "cash" | "direct_to_charity";
  reference: string | null;
  status: "paid" | "pending" | "scheduled" | "cancelled";
  id: string;
  donationId: string;
  fundraiserId: string;
}

export type Payments = {
  at: number;
  donationAmount: number;
  contributionAmount: number;
  matchFundingAmount: number | null;
  method: "card" | "cash" | "direct_to_charity";
  reference: string | null;
  status: "paid" | "pending" | "scheduled" | "cancelled";
  id: string;
  donationId: string;
  fundraiserId: string;
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
  publicName: string;
  activeFrom: number;
  activeTo: number;
  recurringDonationsTo: number;
  paused: boolean;
  currency: "gbp" | "usd";
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
  eventLink: string | null;
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
  currency: "gbp" | "usd";
  amount: number;
  totalDonationAmount: number;
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

export interface Task {
  id: string;
  name: string;
}

export type Tasks = {
  id: string;
  name: string;
}[];

export type Ulid = string;
