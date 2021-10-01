import 'source-map-support/register';
import { middyfy } from '../../../helpers/wrapper';
import { fundraiserEditsSchema } from '../../../helpers/schemas';

export const main = middyfy<typeof fundraiserEditsSchema>(fundraiserEditsSchema, async (event) => {
  return {
    message: 'Validated schema, but persistence not yet implemented',
    fundraiser: event.body,
  }
});
