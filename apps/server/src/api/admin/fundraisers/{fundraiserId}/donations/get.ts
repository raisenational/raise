import { fixedGroups } from '@raise/shared';
import { middyfy } from '../../../../../helpers/wrapper';
import { donationTable, fundraiserTable } from '../../../../../helpers/tables';
import {
  assertHasGroup, query, get,
} from '../../../../../helpers/db';
import { $Donations } from '../../../../../schemas';

export const main = middyfy(null, $Donations, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }), fixedGroups.National);
  return query(donationTable, { fundraiserId: event.pathParameters.fundraiserId });
});
