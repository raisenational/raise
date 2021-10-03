import 'source-map-support/register';
import { middyfy } from '../../../helpers/wrapper';
import { fundraiserEditsSchema } from '../../../helpers/schemas';

export const main = middyfy(fundraiserEditsSchema, null, async (event) => {
  // TODO

  return
});
