import * as Joi from '@hapi/joi'

export const fundraiserEditsSchema = Joi.object({
  name: Joi.string(),
  activeFrom: Joi.number(),
  activeTo: Joi.number(),
  paused: Joi.boolean(),
  goal: Joi.number().integer().min(0),
  totalRaised: Joi.number().integer().min(0),
  donationsCount: Joi.number().integer().min(0),
  matchFundingRate: Joi.number().integer().min(0),
  matchFundingPerDonationLimit: Joi.number().integer().min(0),
  matchFundingRemaining: Joi.number().integer().min(0),
  minimumDonationAmount: Joi.number().integer().min(0),
  groupsWithAccess: Joi.array().items(Joi.string().required()),
});

export const fundraiserSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  activeFrom: Joi.number().required(),
  activeTo: Joi.number().allow(null).required(),
  paused: Joi.boolean().required(),
  goal: Joi.number().integer().min(0).required(),
  totalRaised: Joi.number().integer().min(0).required(),
  donationsCount: Joi.number().integer().min(0).required(),
  matchFundingRate: Joi.number().integer().min(0).required(),
  matchFundingPerDonationLimit: Joi.number().integer().min(0).allow(null).required(),
  matchFundingRemaining: Joi.number().integer().min(0).allow(null).required(),
  minimumDonationAmount: Joi.number().integer().min(0).allow(null).required(),
  groupsWithAccess: Joi.array().items(Joi.string().required()).required(),
});

export const fundraisersSchema = Joi.array().items(fundraiserSchema)
