import type { JSONSchema7Definition } from "json-schema"
import type * as S from "./schemaTypes"

// TODO: It'd be nice to use ajv's JSONSchemaType. However, it has poor performance and is incorrect: https://github.com/ajv-validator/ajv/issues/1664
export type JSONSchema<T> = JSONSchema7Definition & { __type?: T };

export const emailSchema: JSONSchema<S.EmailSchema> = {
  type: "string",
  pattern: "^(?:[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])$",
}

export const ulidSchema: JSONSchema<S.UlidSchema> = {
  type: "string",
  pattern: "^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$",
}

export const statusSchema: JSONSchema<S.StatusSchema> = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
  required: ["message"],
  additionalProperties: false,
}

export const accessTokenSchema: JSONSchema<S.AccessTokenSchema> = {
  type: "object",
  properties: {
    accessToken: { type: "string" },
    expiresAt: { type: "integer" },
  },
  required: ["accessToken", "expiresAt"],
  additionalProperties: false,
}

export const idAndAccessTokenSchema: JSONSchema<S.IdAndAccessTokenSchema> = {
  type: "object",
  properties: {
    idToken: { type: "string" },
    accessToken: { type: "string" },
  },
  required: ["idToken", "accessToken"],
  additionalProperties: false,
}

export const profileSchema: JSONSchema<S.ProfileSchema> = {
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

export const fundraiserEditsSchema: JSONSchema<S.FundraiserEditsSchema> = {
  type: "object",
  properties: {
    fundraiserName: { type: "string", minLength: 1, maxLength: 128 },
    activeFrom: { type: "integer" },
    activeTo: { type: "integer" },
    paused: { type: "boolean" },
    goal: { type: "integer", exclusiveMinimum: 0 },
    totalRaised: { type: "integer", minimum: 0 },
    donationsCount: { type: "integer", minimum: 0 },
    matchFundingRate: { type: "integer", minimum: 0 },
    matchFundingPerDonationLimit: { type: ["integer", "null"], exclusiveMinimum: 0 },
    matchFundingRemaining: { type: ["integer", "null"], minimum: 0 },
    minimumDonationAmount: { type: ["integer", "null"], exclusiveMinimum: 0 },
    suggestedDonationAmountOneOff: { type: "integer", minimum: 0 },
    suggestedDonationAmountWeekly: { type: "integer", minimum: 0 },
    suggestedContributionAmount: { type: ["integer", "null"], minimum: 0 },
    groupsWithAccess: { type: "array", items: { type: "string" } },
  },
  minProperties: 1,
  additionalProperties: false,
}

export const fundraiserSchema: JSONSchema<S.FundraiserSchema> = {
  type: "object",
  properties: {
    id: ulidSchema,
    ...fundraiserEditsSchema.properties,
  },
  required: ["id", "fundraiserName", "activeFrom", "activeTo", "paused", "goal", "totalRaised", "donationsCount", "matchFundingRate", "matchFundingPerDonationLimit", "matchFundingRemaining", "minimumDonationAmount", "suggestedDonationAmountOneOff", "suggestedDonationAmountWeekly", "suggestedContributionAmount", "groupsWithAccess"],
  additionalProperties: false,
}

export const fundraisersSchema: JSONSchema<S.FundraiserSchema[]> = { type: "array", items: fundraiserSchema }

export const donationEditsSchema: JSONSchema<S.DonationEditsSchema> = {
  type: "object",
  properties: {
    donorName: { type: "string" },
    donorEmail: emailSchema,
    emailConsentInformational: { type: "boolean" },
    emailConsentMarketing: { type: "boolean" },
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
    recurringAmount: { type: ["integer", "null"], minimum: 0 },
    recurrenceFrequency: { oneOf: [{ enum: ["WEEKLY", "MONTHLY"] }, { type: "null" }] },
    stripeId: { type: ["string", "null"] },
    charity: { type: "string" },
    overallPublic: { type: "boolean" },
    namePublic: { type: "boolean" },
    donationAmountPublic: { type: "boolean" },
  },
  minProperties: 1,
  additionalProperties: false,
}

export const donationSchema: JSONSchema<S.DonationSchema> = {
  type: "object",
  properties: {
    ...donationEditsSchema.properties,
    id: ulidSchema,
    fundraiserId: ulidSchema,
  },
  required: ["id", "fundraiserId", "donorName", "donorEmail", "emailConsentInformational", "emailConsentMarketing", "createdAt", "addressLine1", "addressLine2", "addressLine3", "addressPostcode", "addressCountry", "giftAid", "comment", "donationAmount", "matchFundingAmount", "contributionAmount", "recurringAmount", "recurrenceFrequency", "stripeId", "charity", "overallPublic", "namePublic", "donationAmountPublic"],
  additionalProperties: false,
}

export const donationsSchema: JSONSchema<S.DonationSchema[]> = { type: "array", items: donationSchema }

export const paymentEditsSchema: JSONSchema<S.PaymentEditsSchema> = {
  type: "object",
  properties: {
    at: { type: "integer" },
    amount: { type: "integer" },
    method: { enum: ["cash", "direct_to_charity"] },
    reference: { type: ["string", "null"] },
  },
  minProperties: 1,
  additionalProperties: false,
}

export const paymentSchema: JSONSchema<S.PaymentSchema> = {
  type: "object",
  properties: {
    ...paymentEditsSchema.properties,
    id: ulidSchema,
    donationId: ulidSchema,
    method: { enum: ["card", "cash", "direct_to_charity"] },
    status: { enum: ["paid", "pending", "cancelled"] },
  },
  required: ["id", "donationId", "at", "amount", "method", "reference", "status"],
  additionalProperties: false,
}

export const paymentsSchema: JSONSchema<S.PaymentSchema[]> = { type: "array", items: paymentSchema }

export const auditLogSchema: JSONSchema<S.AuditLogSchema> = {
  type: "object",
  properties: {
    id: ulidSchema,
    objectId: ulidSchema, // a thing that can be created/edited e.g. a donation. If non-existent (e.g. for logins), same as id.
    subjectId: { type: "string" }, // e.g. a admin user, a public user, Stripe
    action: { enum: ["create", "edit", "login"] },
    at: { type: "integer" },
    metadata: { type: "object", additionalProperties: { $ref: "#/definitions/auditLogMetadataSchema" } },
    // TODO: potentially store IP address, API route key and/or Lambda invocation id?
    // TODO: add a TTL so that Amazon deletes old audit logs for us?
  },
  required: ["id", "objectId", "subjectId", "action", "at", "metadata"],
  additionalProperties: false,
  definitions: {
    auditLogMetadataSchema: {
      oneOf: [
        { type: "null" },
        { type: "boolean" },
        { type: "number" },
        { type: "string" },
        { type: "array", items: { $ref: "#/definitions/auditLogMetadataSchema" } },
        { type: "object", additionalProperties: { $ref: "#/definitions/auditLogMetadataSchema" } },
      ],
    },
  },
}

export const publicFundraiserSchema: JSONSchema<S.PublicFundraiserSchema> = {
  type: "object",
  properties: {
    id: { type: "string" },
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
    suggestedDonationAmountOneOff: { type: "integer", minimum: 0 },
    suggestedDonationAmountWeekly: { type: "integer", minimum: 0 },
    suggestedContributionAmount: { type: ["integer", "null"], minimum: 0 },
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
          recurringAmount: { type: ["integer", "null"], minimum: 0 },
          recurrenceFrequency: { oneOf: [{ enum: ["WEEKLY", "MONTHLY"] }, { type: "null" }] },
        },
        required: ["createdAt", "comment"],
        additionalProperties: false,
      },
    },
  },
  required: ["id", "activeFrom", "activeTo", "paused", "goal", "totalRaised", "donationsCount", "matchFundingRate", "matchFundingPerDonationLimit", "matchFundingRemaining", "minimumDonationAmount", "suggestedDonationAmountOneOff", "suggestedDonationAmountWeekly", "suggestedContributionAmount", "donations"],
  additionalProperties: false,
}

export const publicDonationRequest: JSONSchema<S.PublicDonationRequest> = {
  type: "object",
  properties: {
    donationAmount: { type: "number", minimum: 0 },
    recurrenceFrequency: { oneOf: [{ enum: ["WEEKLY", "MONTHLY"] }, { type: "null" }] },
    contributionAmount: { type: "integer", minimum: 0 },
    giftAid: { type: "boolean" },
    donorName: { type: "string" },
    donorEmail: emailSchema,
    emailConsentInformational: { type: "boolean" },
    emailConsentMarketing: { type: "boolean" },
    addressLine1: { type: ["string", "null"] },
    addressLine2: { type: ["string", "null"] },
    addressLine3: { type: ["string", "null"] },
    addressPostcode: { type: ["string", "null"] },
    addressCountry: { type: ["string", "null"] },
    overallPublic: { type: "boolean" },
    namePublic: { type: "boolean" },
    donationAmountPublic: { type: "boolean" },
    comment: { type: ["string", "null"] },
  },
  required: ["donationAmount", "recurrenceFrequency", "contributionAmount", "giftAid", "donorName", "donorEmail", "emailConsentInformational", "emailConsentMarketing", "addressLine1", "addressLine2", "addressLine3", "addressPostcode", "addressCountry", "overallPublic", "namePublic", "donationAmountPublic", "comment"],
  additionalProperties: false,
}

export const publicPaymentIntentResponse: JSONSchema<S.PublicPaymentIntentResponse> = {
  type: "object",
  properties: {
    donationId: ulidSchema, // TODO: do we need this?
    paymentId: ulidSchema, // TODO: do we need this?
    amount: { type: "integer", exclusiveMinimum: 0 },
    stripeClientSecret: { type: "string" },
  },
  required: ["donationId", "paymentId", "amount", "stripeClientSecret"],
  additionalProperties: false,
}
