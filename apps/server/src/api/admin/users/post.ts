import { ulid } from 'ulid';
import { fixedGroups } from '@raise/shared';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert, scan } from '../../../helpers/db';
import { userTable } from '../../../helpers/tables';
import { $Ulid, $UserCreation } from '../../../schemas';
import { sendEmail } from '../../../helpers/email';
import newUser from '../../../helpers/email/newUser';

export const main = middyfy($UserCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);
  const user = await insert(userTable, {
    id: ulid(),
    ...event.body,
  });

  // finds name of the logged in user who made the user. If for some reason, the user's name is undefined, it will use The Raise National Team instead
  const usersFromDb = await scan(userTable);
  const sender: string = usersFromDb.find((u) => u.email === event.auth.payload.subject)?.name ?? 'The Raise National Team';

  if (event.body.sendAccountCreationEmail === true) {
    await sendEmail(
      'Your account has been created!',
      newUser(event.body, sender),
      event.body.email,
      'Raise National',
    );
  }

  return user.id;
});
