import 'source-map-support/register';
import { middyfy } from '../../../helpers/wrapper';

export const main = middyfy(async (event) => {
  return {
    message: 'Service online'
  }
});
