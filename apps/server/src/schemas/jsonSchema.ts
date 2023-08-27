import type { JSONSchema7Definition } from 'json-schema';
import type * as S from './typescript';

// It'd be nice to use JSONSchemaType from AJV. However, it has poor performance and is incorrect: https://github.com/ajv-validator/ajv/issues/1664
export type JSONSchema<T> = JSONSchema7Definition & { __type?: T };

export const $Email: JSONSchema<S.Email> = {
  type: 'string',
  // Regex from https://html.spec.whatwg.org/multipage/forms.html#e-mail-state-(type=email)
  pattern: "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
};

export const $Ulid: JSONSchema<S.Ulid> = {
  type: 'string',
  // spell-checker: disable-next-line
  pattern: '^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$',
};

export const $Status: JSONSchema<S.Status> = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
  required: ['message'],
  additionalProperties: false,
};

export const $LoginResponse: JSONSchema<S.LoginResponse> = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'object',
      properties: {
        value: { type: 'string' },
        expiresAt: { type: 'integer' },
      },
      required: ['value', 'expiresAt']
    },
    refreshToken: {
      type: 'object',
      properties: {
        value: { type: 'string' },
        expiresAt: { type: 'integer' },
      },
      required: ['value', 'expiresAt']
    },
    groups: { type: 'array', items: { type: 'string' } },
  },
  required: ['accessToken', 'refreshToken', 'groups'],
  additionalProperties: false,
};

export const $GoogleLoginRequest: JSONSchema<S.GoogleLoginRequest> = {
  type: 'object',
  properties: {
    idToken: { type: 'string' },
  },
  required: ['idToken'],
  additionalProperties: false,
};

export const $ImpersonationLoginRequest: JSONSchema<S.ImpersonationLoginRequest> = {
  type: 'object',
  properties: {
    email: $Email,
  },
  required: ['email'],
  additionalProperties: false,
};

export const $RefreshLoginRequest: JSONSchema<S.RefreshLoginRequest> = {
  type: 'object',
  properties: {
    refreshToken: { type: 'string' },
  },
  required: ['refreshToken'],
  additionalProperties: false,
};

export const $Profile: JSONSchema<S.Profile> = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    groups: { type: 'array', items: { type: 'string' } },
    issuedAt: { type: 'integer' },
    expiresAt: { type: 'integer' },
    sourceIp: { type: 'string' },
  },
  required: ['email', 'groups', 'issuedAt', 'expiresAt', 'sourceIp'],
  additionalProperties: false,
};

export const $FundraiserCreation: JSONSchema<S.FundraiserCreation> = {
  type: 'object',
  properties: {
    internalName: { type: 'string', minLength: 1, maxLength: 128 },
    publicName: { type: 'string', minLength: 1, maxLength: 128 },
    activeFrom: { type: 'integer' },
    activeTo: { type: 'integer' },
    recurringDonationsTo: { type: 'integer' },
    paused: { type: 'boolean' },
    currency: { enum: ['gbp', 'usd'] },
    goal: { type: 'integer', exclusiveMinimum: 0 },
    totalRaised: { type: 'integer', minimum: 0 },
    donationsCount: { type: 'integer', minimum: 0 },
    matchFundingRate: { type: 'integer', minimum: 0 },
    matchFundingPerDonationLimit: { type: ['integer', 'null'], exclusiveMinimum: 0 },
    matchFundingRemaining: { type: ['integer', 'null'], minimum: 0 },
    minimumDonationAmount: { type: ['integer', 'null'], exclusiveMinimum: 0 },
    suggestedDonationAmountOneOff: { type: 'integer', minimum: 0 },
    suggestedDonationAmountWeekly: { type: 'integer', minimum: 0 },
    suggestedContributionAmount: { type: ['integer', 'null'], minimum: 0 },
    eventLink: { type: ['string', 'null'] },
    moreInvolvedLink: { type: ['string', 'null'] },
    archived: { type: 'boolean' },
    // TODO: change to ulid once all groups migrated
    groupsWithAccess: { type: 'array', items: { type: 'string' } },
  },
  additionalProperties: false,
};

export const $FundraiserEdits: JSONSchema<S.FundraiserEdits> = {
  type: 'object',
  properties: {
    ...$FundraiserCreation.properties,
    previous: {
      type: 'object',
      properties: {
        totalRaised: { type: 'integer', minimum: 0 },
        donationsCount: { type: 'integer', minimum: 0 },
      },
      additionalProperties: false,
    },
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $Fundraiser: JSONSchema<S.Fundraiser> = {
  type: 'object',
  properties: {
    id: $Ulid,
    ...$FundraiserCreation.properties,
  },
  required: ['id', 'internalName', 'publicName', 'activeFrom', 'activeTo', 'recurringDonationsTo', 'paused', 'currency', 'goal', 'totalRaised', 'donationsCount', 'matchFundingRate', 'matchFundingPerDonationLimit', 'matchFundingRemaining', 'minimumDonationAmount', 'suggestedDonationAmountOneOff', 'suggestedDonationAmountWeekly', 'suggestedContributionAmount', 'eventLink', 'moreInvolvedLink', 'archived', 'groupsWithAccess'],
  additionalProperties: false,
};

export const $Fundraisers: JSONSchema<S.Fundraiser[]> = { type: 'array', items: $Fundraiser };

export const $DonationCreation: JSONSchema<S.DonationCreation> = {
  type: 'object',
  properties: {
    donorName: { type: 'string' },
    donorEmail: $Email,
    emailConsentInformational: { type: 'boolean' },
    emailConsentMarketing: { type: 'boolean' },
    createdAt: { type: 'integer' },
    addressLine1: { type: ['string', 'null'] },
    addressLine2: { type: ['string', 'null'] },
    addressLine3: { type: ['string', 'null'] },
    addressPostcode: { type: ['string', 'null'] },
    addressCountry: { type: ['string', 'null'] },
    giftAid: { type: 'boolean' },
    comment: { type: ['string', 'null'] },
    recurringAmount: { type: ['integer', 'null'], minimum: 0 },
    recurrenceFrequency: { oneOf: [{ enum: ['WEEKLY', 'MONTHLY'] }, { type: 'null' }] },
    stripeCustomerId: { type: ['string', 'null'] },
    stripePaymentMethodId: { type: ['string', 'null'] },
    charity: { type: 'string' },
    overallPublic: { type: 'boolean' },
    namePublic: { type: 'boolean' },
    donationAmountPublic: { type: 'boolean' },
    donationCounted: { type: 'boolean' },
  },
  additionalProperties: false,
};

export const $DonationEdits: JSONSchema<S.DonationEdits> = {
  type: 'object',
  properties: {
    ...$DonationCreation.properties,
    donationAmount: { type: 'number', minimum: 0 },
    matchFundingAmount: { type: 'integer', minimum: 0 },
    contributionAmount: { type: 'integer', minimum: 0 },
    previous: {
      type: 'object',
      properties: {
        donationAmount: { type: 'number', minimum: 0 },
        matchFundingAmount: { type: 'integer', minimum: 0 },
        contributionAmount: { type: 'integer', minimum: 0 },
      },
      additionalProperties: false,
    },
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $Donation: JSONSchema<S.Donation> = {
  type: 'object',
  properties: {
    ...$DonationCreation.properties,
    id: $Ulid,
    fundraiserId: $Ulid,
    donationAmount: { type: 'number', minimum: 0 },
    matchFundingAmount: { type: 'integer', minimum: 0 },
    contributionAmount: { type: 'integer', minimum: 0 },
  },
  required: ['id', 'fundraiserId', 'donorName', 'donorEmail', 'emailConsentInformational', 'emailConsentMarketing', 'createdAt', 'addressLine1', 'addressLine2', 'addressLine3', 'addressPostcode', 'addressCountry', 'giftAid', 'comment', 'donationAmount', 'matchFundingAmount', 'contributionAmount', 'recurringAmount', 'recurrenceFrequency', 'stripeCustomerId', 'stripePaymentMethodId', 'charity', 'overallPublic', 'namePublic', 'donationAmountPublic', 'donationCounted'],
  additionalProperties: false,
};

export const $Donations: JSONSchema<S.Donation[]> = { type: 'array', items: $Donation };

export const $PaymentStatus: JSONSchema<S.Payment['status']> = {
  enum: [
    // A payment that is complete: the money has been transferred to the recipient
    // e.g. For card payments, this means Stripe has confirmed Raise has received the money
    'paid',

    // A payment that is pending confirmation
    // e.g. For card payments, this means we have created a Stripe payment intent but not received confirmation the payment has been made.
    'pending',

    // A payment that is confirmed to be made in future
    // e.g. For card payments, this means we have a card registered in Stripe allocated to pay this payment.
    'scheduled',

    // A payment that has been aborted
    // e.g. For card payments, this might be if a donor contacts us to cancel their future scheduled payments, or if we cancel them due to repeated payment failures and the donor is unresponsive.
    'cancelled',
  ]
};

export const $PaymentPropertyEdits: JSONSchema<S.PaymentPropertyEdits> = {
  oneOf: [{
    type: 'object',
    properties: {
      donationAmount: { type: 'integer' },
    },
    required: ['donationAmount'],
    additionalProperties: false,

  }, {
    type: 'object',
    properties: {
      contributionAmount: { type: 'integer' },
    },
    required: ['contributionAmount'],
    additionalProperties: false,
  }, {
    type: 'object',
    properties: {
      matchFundingAmount: { type: ['integer', 'null'] }, // null means we have not calculated/allocated it yet
    },
    required: ['matchFundingAmount'],
    additionalProperties: false,
  }, {
    type: 'object',
    properties: {
      reference: { type: ['string', 'null'] },
    },
    required: ['reference'],
    additionalProperties: false,
  }, {
    type: 'object',
    properties: {
      status: $PaymentStatus,
    },
    required: ['status'],
    additionalProperties: false,
  }],
};

export const $PaymentCreation: JSONSchema<S.PaymentCreation> = {
  type: 'object',
  properties: {
    at: { type: 'integer' },
    donationAmount: { type: 'integer' },
    contributionAmount: { type: 'integer' },
    matchFundingAmount: { type: ['integer', 'null'] }, // null means we have not calculated/allocated it yet
    method: { enum: ['card', 'cash', 'direct_to_charity'] },
    reference: { type: ['string', 'null'] },
  },
  additionalProperties: false,
};

export const $Payment: JSONSchema<S.Payment> = {
  type: 'object',
  properties: {
    ...$PaymentCreation.properties,
    status: $PaymentStatus,
    id: $Ulid,
    donationId: $Ulid,
    fundraiserId: $Ulid,
  },
  required: ['id', 'donationId', 'fundraiserId', 'at', 'donationAmount', 'contributionAmount', 'matchFundingAmount', 'method', 'reference', 'status'],
  additionalProperties: false,
};

export const $Payments: JSONSchema<S.Payment[]> = { type: 'array', items: $Payment };

export const $AuditLog: JSONSchema<S.AuditLog> = {
  type: 'object',
  properties: {
    id: $Ulid,
    object: { type: 'string' }, // a thing that can be created/edited e.g. a donation. If non-existent (e.g. for logins), same as id.
    subject: { type: 'string' }, // e.g. a admin user email, "public" | "stripe" | "scheduler"
    action: { enum: ['create', 'edit', 'login', 'plus', 'security', 'run'] },
    at: { type: 'integer' },
    sourceIp: { type: 'string' },
    userAgent: { type: 'string' },
    routeRaw: { type: 'string' },
    metadata: { type: 'object', additionalProperties: { $ref: '#/definitions/auditLogMetadata' } },
    ttl: { type: ['number', 'null'] }, // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html
  },
  required: ['id', 'object', 'subject', 'action', 'at', 'sourceIp', 'userAgent', 'routeRaw', 'metadata', 'ttl'],
  additionalProperties: false,
  definitions: {
    auditLogMetadata: {
      oneOf: [
        { type: 'null' },
        { type: 'boolean' },
        { type: 'number' },
        { type: 'string' },
        { type: 'array', items: { $ref: '#/definitions/auditLogMetadata' } },
        { type: 'object', additionalProperties: { $ref: '#/definitions/auditLogMetadata' } },
      ],
    },
  },
};

export const $AuditLogs: JSONSchema<S.AuditLog[]> = { type: 'array', items: $AuditLog, definitions: $AuditLog.definitions };

export const $PublicFundraiser: JSONSchema<S.PublicFundraiser> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    publicName: { type: 'string' },
    activeFrom: { type: 'integer' },
    activeTo: { type: 'integer' },
    recurringDonationsTo: { type: 'integer' },
    paused: { type: 'boolean' },
    currency: { enum: ['gbp', 'usd'] },
    goal: { type: 'integer', exclusiveMinimum: 0 },
    totalRaised: { type: 'integer', minimum: 0 },
    donationsCount: { type: 'integer', minimum: 0 },
    matchFundingRate: { type: 'integer', minimum: 0 },
    matchFundingPerDonationLimit: { type: ['integer', 'null'], exclusiveMinimum: 0 },
    matchFundingRemaining: { type: ['integer', 'null'], minimum: 0 },
    minimumDonationAmount: { type: ['integer', 'null'], exclusiveMinimum: 0 },
    suggestedDonationAmountOneOff: { type: 'integer', minimum: 0 },
    suggestedDonationAmountWeekly: { type: 'integer', minimum: 0 },
    suggestedContributionAmount: { type: ['integer', 'null'], minimum: 0 },
    eventLink: { type: ['string', 'null'] },
    moreInvolvedLink: { type: ['string', 'null'] },
    archived: { type: 'boolean' },
    donations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          donorName: { type: 'string' },
          createdAt: { type: 'integer' },
          giftAid: { type: 'boolean' },
          comment: { type: ['string', 'null'] },
          donationAmount: { type: 'number', minimum: 0 },
          matchFundingAmount: { type: 'integer', minimum: 0 },
          recurringAmount: { type: ['integer', 'null'], minimum: 0 },
          recurrenceFrequency: { oneOf: [{ enum: ['WEEKLY', 'MONTHLY'] }, { type: 'null' }] },
        },
        required: ['id', 'createdAt', 'comment'],
        additionalProperties: false,
      },
    },
  },
  required: ['id', 'publicName', 'activeFrom', 'activeTo', 'recurringDonationsTo', 'paused', 'currency', 'goal', 'totalRaised', 'donationsCount', 'matchFundingRate', 'matchFundingPerDonationLimit', 'matchFundingRemaining', 'minimumDonationAmount', 'suggestedDonationAmountOneOff', 'suggestedDonationAmountWeekly', 'suggestedContributionAmount', 'eventLink', 'moreInvolvedLink', 'archived', 'donations'],
  additionalProperties: false,
};

export const $PublicDonationRequest: JSONSchema<S.PublicDonationRequest> = {
  type: 'object',
  properties: {
    charity: { type: 'string' },
    donationAmount: { type: 'number', minimum: 0 },
    recurrenceFrequency: { oneOf: [{ enum: ['WEEKLY', 'MONTHLY'] }, { type: 'null' }] },
    contributionAmount: { type: 'integer', minimum: 0 },
    giftAid: { type: 'boolean' },
    donorName: { type: 'string' },
    donorEmail: $Email,
    emailConsentInformational: { type: 'boolean' },
    emailConsentMarketing: { type: 'boolean' },
    addressLine1: { type: ['string', 'null'] },
    addressLine2: { type: ['string', 'null'] },
    addressLine3: { type: ['string', 'null'] },
    addressPostcode: { type: ['string', 'null'] },
    addressCountry: { type: ['string', 'null'] },
    overallPublic: { type: 'boolean' },
    namePublic: { type: 'boolean' },
    donationAmountPublic: { type: 'boolean' },
    comment: { type: ['string', 'null'] },
  },
  required: ['donationAmount', 'recurrenceFrequency', 'contributionAmount', 'giftAid', 'donorName', 'donorEmail', 'emailConsentInformational', 'emailConsentMarketing', 'addressLine1', 'addressLine2', 'addressLine3', 'addressPostcode', 'addressCountry', 'overallPublic', 'namePublic', 'donationAmountPublic', 'comment'],
  additionalProperties: false,
};

export const $PublicPaymentIntentResponse: JSONSchema<S.PublicPaymentIntentResponse> = {
  type: 'object',
  properties: {
    stripeClientSecret: { type: 'string' },
    currency: { enum: ['gbp', 'usd'] },
    amount: { type: 'integer', exclusiveMinimum: 0 },
    totalDonationAmount: { type: 'integer', minimum: 0 },
    futurePayments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          amount: { type: 'integer', exclusiveMinimum: 0 },
          at: { type: 'integer' },
        },
        required: ['amount', 'at'],
        additionalProperties: false,
      },
    },
  },
  required: ['stripeClientSecret', 'currency', 'amount', 'totalDonationAmount', 'futurePayments'],
  additionalProperties: false,
};

// https://stripe.com/docs/api/events/object
export const $StripeWebhookRequest: JSONSchema<S.StripeWebhookRequest> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    object: { enum: ['event'] },
    api_version: { enum: ['2020-08-27'] },
    data: {
      type: 'object',
      properties: {
        // https://stripe.com/docs/api/payment_intents/object
        object: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            object: { enum: ['payment_intent'] },
            amount: { type: 'integer', exclusiveMinimum: 0 },
            amount_received: { type: 'integer', exclusiveMinimum: 0 },
            // we only accept gbp payments
            currency: { enum: ['gbp'] },
            // these are set when creating the payment intent
            metadata: {
              type: 'object',
              properties: {
                fundraiserId: $Ulid,
                donationId: $Ulid,
                paymentId: $Ulid,
              },
              required: ['fundraiserId', 'donationId', 'paymentId'],
              additionalProperties: false,
            },
            // we only subscribe to payment_intent.succeeded
            status: { enum: ['succeeded'] },
            payment_method: { type: 'string' },
            // null for one-off donations, off_session for recurring donations
            setup_future_usage: { oneOf: [{ type: 'null' }, { enum: ['off_session'] }] },
            created: { type: 'integer' },
          },
          required: ['id', 'object', 'amount', 'amount_received', 'currency', 'metadata', 'status', 'payment_method', 'setup_future_usage', 'created'],
          additionalProperties: true,
        },
      },
      required: ['object'],
      additionalProperties: true,
    },
    // If we subscribe to more webhooks, we must make sure the data.object is updated accordingly
    type: { enum: ['payment_intent.succeeded'] },
    created: { type: 'integer' },
  },
  required: ['id', 'api_version', 'data', 'type', 'object', 'created'],
  additionalProperties: true,
};

export const $Task: JSONSchema<S.Task> = {
  type: 'object',
  properties: {
    id: $Ulid,
    name: { type: 'string' },
    groups: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'name', 'groups'],
  additionalProperties: false,
};

export const $Tasks: JSONSchema<S.Task[]> = { type: 'array', items: $Task };

export const $GroupCreation: JSONSchema<S.GroupCreation> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  additionalProperties: false,
  required: ['name'],
};

export const $GroupEdits: JSONSchema<S.GroupEdits> = {
  type: 'object',
  properties: {
    ...$GroupCreation.properties,
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $Group: JSONSchema<S.Group> = {
  type: 'object',
  properties: {
    ...$GroupCreation.properties,
    id: $Ulid,
  },
  required: ['id', 'name'],
  additionalProperties: false,
};

export const $Groups: JSONSchema<S.Group[]> = { type: 'array', items: $Group };

export const $UserCreation: JSONSchema<S.UserCreation> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    groups: { type: 'array', items: $Ulid },
    securityTrainingCompletedAt: { type: 'integer' },
    sendAccountCreationEmail: { type: 'boolean' }
  },
  additionalProperties: false,
  required: ['name', 'email', 'groups', 'securityTrainingCompletedAt', 'sendAccountCreationEmail'],
};

export const $UserEdits: JSONSchema<S.UserEdits> = {
  type: 'object',
  properties: {
    ...$UserCreation.properties,
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $User: JSONSchema<S.User> = {
  type: 'object',
  properties: {
    ...$UserCreation.properties,
    id: $Ulid,
  },
  required: ['id', 'name', 'email', 'groups', 'securityTrainingCompletedAt'],
  additionalProperties: false,
};

export const $Users: JSONSchema<S.User[]> = { type: 'array', items: $User };
