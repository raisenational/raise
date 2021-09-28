import 'source-map-support/register';
import * as Joi from '@hapi/joi'
import { middyfy } from '../../../helpers/wrapper';

const schema = Joi.object({
  name: Joi.string().required(),
  activeFrom: Joi.number().required(),
  activeTo: Joi.number(),
  goal: Joi.number().required(),
  matchFundingRate: Joi.number().integer().min(0).required(),
  matchFundingPerDonationLimit: Joi.number().integer().min(0),
  matchFundingRemaining: Joi.number().integer().min(0),
  minimumDonationAmount: Joi.number().integer().min(0),
});

export const main = middyfy<typeof schema>(schema, async (event) => {
  return {
    message: 'Validated schema, but persistence not yet implemented',
    fundraiser: event.body,
  }
});
