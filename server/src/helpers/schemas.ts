import type { JSONSchema7Definition } from "json-schema"
import type {
  AccessTokenSchema, DonationEditsSchema, DonationSchema, EmailSchema, FundraiserEditsSchema, FundraiserSchema, IdAndAccessTokenSchema, ProfileSchema, PublicDonationSchema, PublicFundraiserSchema, StatusSchema, UlidSchema,
} from "./schemaTypes"

// TODO: It'd be nice to use ajv's JSONSchemaType. However, it has poor performance and is incorrect: https://github.com/ajv-validator/ajv/issues/1664
export type JSONSchema<T> = JSONSchema7Definition & { __type?: T };

export const emailSchema: JSONSchema<EmailSchema> = {
  type: "string",
  pattern: "^(?:[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])$",
}

export const ulidSchema: JSONSchema<UlidSchema> = {
  type: "string",
  pattern: "^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$",
}

export const statusSchema: JSONSchema<StatusSchema> = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
  required: ["message"],
  additionalProperties: false,
}

export const accessTokenSchema: JSONSchema<AccessTokenSchema> = {
  type: "object",
  properties: {
    accessToken: { type: "string" },
    expiresAt: { type: "integer" },
  },
  required: ["accessToken", "expiresAt"],
  additionalProperties: false,
}

export const idAndAccessTokenSchema: JSONSchema<IdAndAccessTokenSchema> = {
  type: "object",
  properties: {
    idToken: { type: "string" },
    accessToken: { type: "string" },
  },
  required: ["idToken", "accessToken"],
  additionalProperties: false,
}

export const profileSchema: JSONSchema<ProfileSchema> = {
  type: "object",
  properties: {
    email: { type: "string" },
    groups: { type: "array", items: { type: "string" } },
    issuedAt: { type: "integer" },
    expiresAt: { type: "integer" },
    sourceIp: { type: "string" },
  },
  required: ["email", "groups", "issuedAt", "expiresAt", "sourceIp"],
  additionalProperties: false,
}

export const fundraiserEditsSchema: JSONSchema<FundraiserEditsSchema> = {
  type: "object",
  properties: {
    fundraiserName: { type: "string", minLength: 1, maxLength: 128 },
    activeFrom: { type: "number" },
    activeTo: { type: ["number", "null"] },
    paused: { type: "boolean" },
    goal: { type: "integer", exclusiveMinimum: 0 },
    totalRaised: { type: "integer", minimum: 0 },
    donationsCount: { type: "integer", minimum: 0 },
    matchFundingRate: { type: "integer", minimum: 0 },
    matchFundingPerDonationLimit: { type: ["integer", "null"], exclusiveMinimum: 0 },
    matchFundingRemaining: { type: ["integer", "null"], minimum: 0 },
    minimumDonationAmount: { type: ["integer", "null"], exclusiveMinimum: 0 },
    groupsWithAccess: { type: "array", items: { type: "string" } },
  },
  minProperties: 1,
  additionalProperties: false,
}

export const fundraiserSchema: JSONSchema<FundraiserSchema> = {
  type: "object",
  properties: {
    id: ulidSchema,
    ...fundraiserEditsSchema.properties,
  },
  required: ["id", "fundraiserName", "activeFrom", "activeTo", "paused", "goal", "totalRaised", "donationsCount", "matchFundingRate", "matchFundingPerDonationLimit", "matchFundingRemaining", "minimumDonationAmount", "groupsWithAccess"],
  additionalProperties: false,
}

export const fundraisersSchema: JSONSchema<FundraiserSchema[]> = { type: "array", items: fundraiserSchema }

export const donationEditsSchema: JSONSchema<DonationEditsSchema> = {
  type: "object",
  properties: {
    fundraiserId: ulidSchema,
    donorName: { type: "string" },
    donorEmail: emailSchema,
    createdAt: { type: "integer" },
    addressLine1: { type: ["string", "null"] },
    addressLine2: { type: ["string", "null"] },
    addressLine3: { type: ["string", "null"] },
    addressPostcode: { type: ["string", "null"] },
    addressCountry: { type: ["string", "null"] },
    giftAid: { type: "boolean" },
    comment: { type: ["string", "null"] },
    donationAmount: { type: "number", minimum: 0 },
    matchFundingAmount: { type: "integer", minimum: 0 },
    contributionAmount: { type: "integer", minimum: 0 },
    payments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          at: { type: "integer" },
          amount: { type: "integer" },
          method: { enum: ["card", "cash", "direct_to_charity"] },
          reference: { type: ["string", "null"] },
        },
        required: ["at", "amount", "method", "reference"],
        additionalProperties: false,
      },
    },
    charity: { type: "string" },
    overallPublic: { type: "boolean" },
    namePublic: { type: "boolean" },
    donationAmountPublic: { type: "boolean" },
  },
  minProperties: 1,
  additionalProperties: false,
}

export const donationSchema: JSONSchema<DonationSchema> = {
  type: "object",
  properties: {
    id: ulidSchema,
    ...donationEditsSchema.properties,
  },
  required: ["id", "fundraiserId", "donorName", "donorEmail", "createdAt", "addressLine1", "addressLine2", "addressLine3", "addressPostcode", "addressCountry", "giftAid", "comment", "donationAmount", "matchFundingAmount", "contributionAmount", "payments", "charity", "overallPublic", "namePublic", "donationAmountPublic"],
  additionalProperties: false,
}

export const donationsSchema: JSONSchema<DonationSchema[]> = { type: "array", items: donationSchema }

export const publicFundraiserSchema: JSONSchema<PublicFundraiserSchema> = {
  type: "object",
  properties: {
    activeFrom: { type: "number" },
    activeTo: { type: ["number", "null"] },
    paused: { type: "boolean" },
    goal: { type: "integer", exclusiveMinimum: 0 },
    totalRaised: { type: "integer", minimum: 0 },
    donationsCount: { type: "integer", minimum: 0 },
    matchFundingRate: { type: "integer", minimum: 0 },
    matchFundingPerDonationLimit: { type: ["integer", "null"], exclusiveMinimum: 0 },
    matchFundingRemaining: { type: ["integer", "null"], minimum: 0 },
    minimumDonationAmount: { type: ["integer", "null"], exclusiveMinimum: 0 },
    donations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          donorName: { type: "string" },
          createdAt: { type: "integer" },
          giftAid: { type: "boolean" },
          comment: { type: ["string", "null"] },
          donationAmount: { type: "number", minimum: 0 },
          matchFundingAmount: { type: "integer", minimum: 0 },
          contributionAmount: { type: "integer", minimum: 0 },
        },
        required: ["createdAt", "comment"],
        additionalProperties: false,
      },
    },
  },
  required: ["activeFrom", "activeTo", "paused", "goal", "totalRaised", "donationsCount", "matchFundingRate", "matchFundingPerDonationLimit", "matchFundingRemaining", "minimumDonationAmount", "donations"],
  additionalProperties: false,
}
