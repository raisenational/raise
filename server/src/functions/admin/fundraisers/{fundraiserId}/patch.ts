import 'source-map-support/register';
import * as Joi from '@hapi/joi'
import { middyfy } from '../../../../helpers/wrapper';
import { fundraiserEditsSchema } from '../../../../helpers/schemas';

export const main = middyfy<typeof fundraiserEditsSchema, undefined>(fundraiserEditsSchema, undefined, async (event) => {
  return {
    message: 'Validated schema, but persistence not yet implemented',
    fundraiser: event.body,
  }
});
