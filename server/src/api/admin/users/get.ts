import { fixedGroups } from '@raise/shared';
import { assertHasGroup, scan } from '../../../helpers/db';
import { userTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Users } from '../../../schemas';

export const main = middyfy(null, $Users, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);
  return scan(userTable);
});
