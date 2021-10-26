import type { JSONSchema7Definition } from "json-schema"
import type * as S from "./schemaTypes"

// TODO: It'd be nice to use ajv's JSONSchemaType. However, it has poor performance and is incorrect: https://github.com/ajv-validator/ajv/issues/1664
export type JSONSchema<T> = JSONSchema7Definition & { __type?: T };

export const emailSchema: JSONSchema<S.Email> = {
  type: "string",
  pattern: "^(?:[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+\\/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])$",
}

export const ulidSchema: JSONSchema<S.Ulid> = {
  type: "string",
  pattern: "^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$",
}

export const statusSchema: JSONSchema<S.Status> = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
  required: ["message"],
  additionalProperties: false,
}

export const accessTokenSchema: JSONSchema<S.AccessToken> = {
  type: "object",
  properties: {
    accessToken: { type: "string" },
    expiresAt: { type: "integer" },
  },
  required: ["accessToken", "expiresAt"],
  additionalProperties: false,
}

export const idAndAccessTokenSchema: JSONSchema<S.IdAndAccessToken> = {
  type: "object",
  properties: {
    idToken: { type: "string" },
    accessToken: { type: "string" },
  },
  required: ["idToken", "accessToken"],
  additionalProperties: false,
}

export const profileSchema: JSONSchema<S.Profile> = {
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

export const fundraiserEditsSchema: JSONSchema<S.FundraiserEdits> = {
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

export const fundraiserSchema: JSONSchema<S.Fundraiser> = {
  type: "object",
  properties: {
    id: ulidSchema,
    ...fundraiserEditsSchema.properties,
  },
  required: ["id", "fundraiserName", "activeFrom", "activeTo", "paused", "goal", "totalRaised", "donationsCount", "matchFundingRate", "matchFundingPerDonationLimit", "matchFundingRemaining", "minimumDonationAmount", "suggestedDonationAmountOneOff", "suggestedDonationAmountWeekly", "suggestedContributionAmount", "groupsWithAccess"],
  additionalProperties: false,
}

export const fundraisersSchema: JSONSchema<S.Fundraiser[]> = { type: "array", items: fundraiserSchema }

export const donationEditsSchema: JSONSchema<S.DonationEdits> = {
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
    stripeCustomerId: { type: ["string", "null"] },
    charity: { type: "string" },
    overallPublic: { type: "boolean" },
    namePublic: { type: "boolean" },
    donationAmountPublic: { type: "boolean" },
  },
  minProperties: 1,
  additionalProperties: false,
}

export const donationSchema: JSONSchema<S.Donation> = {
  type: "object",
  properties: {
    ...donationEditsSchema.properties,
    id: ulidSchema,
    fundraiserId: ulidSchema,
  },
  required: ["id", "fundraiserId", "donorName", "donorEmail", "emailConsentInformational", "emailConsentMarketing", "createdAt", "addressLine1", "addressLine2", "addressLine3", "addressPostcode", "addressCountry", "giftAid", "comment", "donationAmount", "matchFundingAmount", "contributionAmount", "recurringAmount", "recurrenceFrequency", "stripeCustomerId", "charity", "overallPublic", "namePublic", "donationAmountPublic"],
  additionalProperties: false,
}

export const donationsSchema: JSONSchema<S.Donation[]> = { type: "array", items: donationSchema }

export const paymentEditsSchema: JSONSchema<S.PaymentEdits> = {
  type: "object",
  properties: {
    at: { type: "integer" },
    donationAmount: { type: "integer" },
    contributionAmount: { type: "integer" },
    matchFundingAmount: { type: ["integer", "null"] }, // null means we have not calculated/allocated it yet
    method: { enum: ["cash", "direct_to_charity"] },
    reference: { type: ["string", "null"] },
  },
  minProperties: 1,
  additionalProperties: false,
}

export const paymentSchema: JSONSchema<S.Payment> = {
  type: "object",
  properties: {
    ...paymentEditsSchema.properties,
    id: ulidSchema,
    donationId: ulidSchema,
    method: { enum: ["card", "cash", "direct_to_charity"] },
    status: { enum: ["paid", "pending", "cancelled"] },
  },
  required: ["id", "donationId", "at", "donationAmount", "contributionAmount", "matchFundingAmount", "method", "reference", "status"],
  additionalProperties: false,
}

export const paymentsSchema: JSONSchema<S.Payment[]> = { type: "array", items: paymentSchema }

export const auditLogSchema: JSONSchema<S.AuditLog> = {
  type: "object",
  properties: {
    id: ulidSchema,
    object: { type: "string" }, // a thing that can be created/edited e.g. a donation. If non-existent (e.g. for logins), same as id.
    subject: { type: "string" }, // e.g. a admin user, a public user, Stripe
    action: { enum: ["create", "edit", "login", "plus", "security"] },
    at: { type: "integer" },
    metadata: { type: "object", additionalProperties: { $ref: "#/definitions/auditLogMetadata" } },
    // TODO: potentially store IP address, API route key and/or Lambda invocation id?
    // TODO: add a TTL so that Amazon deletes old audit logs for us?
  },
  required: ["id", "object", "subject", "action", "at", "metadata"],
  additionalProperties: false,
  definitions: {
    auditLogMetadata: {
      oneOf: [
        { type: "null" },
        { type: "boolean" },
        { type: "number" },
        { type: "string" },
        { type: "array", items: { $ref: "#/definitions/auditLogMetadata" } },
        { type: "object", additionalProperties: { $ref: "#/definitions/auditLogMetadata" } },
      ],
    },
  },
}

export const publicFundraiserSchema: JSONSchema<S.PublicFundraiser> = {
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
    stripeClientSecret: { type: "string" },
    amount: { type: "integer", exclusiveMinimum: 0 },
    futurePayments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          amount: { type: "integer", exclusiveMinimum: 0 },
          at: { type: "integer" },
        },
        required: ["amount", "at"],
        additionalProperties: false,
      },
    },
  },
  required: ["stripeClientSecret", "amount", "futurePayments"],
  additionalProperties: false,
}

// https://stripe.com/docs/api/events/object
export const stripeWebhookRequest: JSONSchema<S.StripeWebhookRequest> = {
  type: "object",
  properties: {
    id: { type: "string" },
    object: { enum: ["event"] },
    api_version: { enum: ["2020-08-27"] },
    data: {
      type: "object",
      properties: {
        // https://stripe.com/docs/api/payment_intents/object
        object: {
          type: "object",
          properties: {
            id: { type: "string" },
            object: { enum: ["payment_intent"] },
            amount: { type: "integer", exclusiveMinimum: 0 },
            amount_received: { type: "integer", exclusiveMinimum: 0 },
            // we only accept gbp payments
            currency: { enum: ["gbp"] },
            // these are set when creating the payment intent
            metadata: {
              type: "object",
              properties: {
                fundraiserId: ulidSchema,
                donationId: ulidSchema,
                paymentId: ulidSchema,
              },
              required: ["fundraiserId", "donationId", "paymentId"],
              additionalProperties: false,
            },
            // we only subscribe to payment_intent.succeeded
            status: { enum: ["succeeded"] },
            payment_method: { type: "string" },
            // null for one-off donations, off_session for recurring donations
            setup_future_usage: { oneOf: [{ type: "null" }, { enum: ["off_session"] }] },
            created: { type: "integer" },
          },
          required: ["id", "object", "amount", "amount_received", "currency", "metadata", "status", "payment_method", "setup_future_usage", "created"],
          additionalProperties: true,
        },
      },
      required: ["object"],
      additionalProperties: true,
    },
    // If we subscribe to more webhooks, we must make sure the data.object is updated accordingly
    type: { enum: ["payment_intent.succeeded"] },
    created: { type: "integer" },
  },
  required: ["id", "api_version", "data", "type", "object", "created"],
  additionalProperties: true,
}
