import { ulid } from 'ulid';
import { fixedGroups } from '@raise/shared';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert } from '../../../helpers/db';
import { groupTable } from '../../../helpers/tables';
import { $GroupCreation, $Ulid } from '../../../schemas';

export const main = middyfy($GroupCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);

  const group = await insert(groupTable, {
    id: ulid(),
    ...event.body,
  });

  return group.id;
});
