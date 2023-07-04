import { fixedGroups } from '@raise/shared';
import { middyfy } from '../../../../../../../helpers/wrapper';
import { fundraiserTable, paymentTable } from '../../../../../../../helpers/tables';
import {
  assertHasGroup, query, get,
} from '../../../../../../../helpers/db';
import { $Payments } from '../../../../../../../schemas';

export const main = middyfy(null, $Payments, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }), fixedGroups.National);
  return query(paymentTable, { donationId: event.pathParameters.donationId });
});
