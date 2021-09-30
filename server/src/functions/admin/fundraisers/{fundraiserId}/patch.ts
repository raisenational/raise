import 'source-map-support/register';
import * as Joi from '@hapi/joi'
import { middyfy } from '../../../../helpers/wrapper';

const schema = Joi.object({
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

export const main = middyfy<typeof schema>(schema, async (event) => {
  return {
    message: 'Validated schema, but persistence not yet implemented',
    fundraiser: event.body,
  }
});
