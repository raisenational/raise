import { fixedGroups } from '@raise/shared';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, update } from '../../../../helpers/db';
import { userTable } from '../../../../helpers/tables';
import { $UserEdits } from '../../../../schemas';

export const main = middyfy($UserEdits, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);
  await update(userTable, { id: event.pathParameters.userId }, event.body);
});
