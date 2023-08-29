import { fixedGroups } from '@raise/shared';
import { ulid } from 'ulid';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert } from '../../../helpers/db';
import { $EmailCreation, $Ulid } from '../../../schemas';
import { sendEmail } from '../../../helpers/email';
import emailTemplate from '../../../helpers/email/emailTemplate';
import { emailTable } from '../../../helpers/tables';

export const main = middyfy($EmailCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);

  const email = await insert(emailTable, {
    id: ulid(),
    time: Math.floor(new Date().getTime() / 1000),
    ...event.body,
  });

  const recipients = event.body.recipient.replace(/ /g, '').split(',');

  recipients.forEach(async (recipient) => ((recipient.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== (false || null))
    ? sendEmail(
      event.body.subject,
      emailTemplate(event.body),
      recipient,
      'raisedemo@gmail.com',
    ) : null));

  return email.id;
});
