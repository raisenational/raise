/* eslint-disable */
/**
* This file was automatically generated. DO NOT MODIFY IT BY HAND.
* Instead, modify schemas.ts, and run "npm run schemas".
*/
export interface AccessTokenSchema {
  accessToken: string;
  expiresAt: number;
}

export type AuditLogMetadataSchema =
  | null
  | boolean
  | number
  | string
  | AuditLogMetadataSchema[]
  | {
      [k: string]: AuditLogMetadataSchema;
    };

export interface AuditLogSchema {
  id: string;
  objectId: string;
  subjectId: string;
  action: "create" | "edit" | "login";
  at: number;
  metadata: {
    [k: string]: AuditLogMetadataSchema;
  };
}

export interface DonationEditsSchema {
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
  stripeId?: string | null;
  charity?: string;
  overallPublic?: boolean;
  namePublic?: boolean;
  donationAmountPublic?: boolean;
}

export interface DonationSchema {
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
  stripeId: string | null;
  charity: string;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
  id: string;
  fundraiserId: string;
}

export type DonationsSchema = {
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
  stripeId: string | null;
  charity: string;
  overallPublic: boolean;
  namePublic: boolean;
  donationAmountPublic: boolean;
  id: string;
  fundraiserId: string;
}[];

export type EmailSchema = string;

export interface FundraiserEditsSchema {
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

export interface FundraiserSchema {
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

export type FundraisersSchema = {
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

export interface IdAndAccessTokenSchema {
  idToken: string;
  accessToken: string;
}

export interface PaymentEditsSchema {
  at?: number;
  amount?: number;
  method?: "cash" | "direct_to_charity";
  reference?: string | null;
}

export interface PaymentSchema {
  at: number;
  amount: number;
  method: "card" | "cash" | "direct_to_charity";
  reference: string | null;
  id: string;
  donationId: string;
  status: "paid" | "pending" | "cancelled";
}

export type PaymentsSchema = {
  at: number;
  amount: number;
  method: "card" | "cash" | "direct_to_charity";
  reference: string | null;
  id: string;
  donationId: string;
  status: "paid" | "pending" | "cancelled";
}[];

export interface ProfileSchema {
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

export interface PublicFundraiserSchema {
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
  donationId: string;
  paymentId: string;
  amount: number;
  stripeClientSecret: string;
}

export interface StatusSchema {
  message: string;
}

export type UlidSchema = string;
