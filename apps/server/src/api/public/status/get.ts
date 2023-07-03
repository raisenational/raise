import { middyfy } from '../../../helpers/wrapper';
import { $Status } from '../../../schemas';

export const main = middyfy(null, $Status, false, async () => ({
  message: 'Service online',
}));
