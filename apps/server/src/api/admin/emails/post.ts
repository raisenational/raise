import { fixedGroups } from '@raise/shared';
import { ulid } from 'ulid';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert, scan } from '../../../helpers/db';
import { $EmailCreation, $Ulid } from '../../../schemas';
import { sendEmail } from '../../../helpers/email';
import {
  campaignMemberTable, campaignTable, emailTable, memberTable
} from '../../../helpers/tables';
import emailTemplate from '../../../helpers/email/emailTemplate';

export const main = middyfy($EmailCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);

  const email = await insert(emailTable, {
    id: ulid(),
    time: Math.floor(new Date().getTime() / 1000),
    ...event.body,
  });

  const campaignsFromDb = await scan(campaignTable);
  const campaignMembersFromDb = await scan(campaignMemberTable);
  const memberFromDb = await scan(memberTable);

  const campaign = campaignsFromDb.find((c) => (c.id === event.body.recipient));
  const campaignMembers = campaignMembersFromDb.filter((cm) => (cm.campaignId === campaign?.id) && (cm.active === true));
  const campaignMembersEmails = memberFromDb.filter((m) => campaignMembers.find((cm) => cm.memberId === m.id));

  campaignMembersEmails.forEach(async (member) => (sendEmail(
    event.body.subject,
    emailTemplate(event.body),
    member.email,
    'raisedemo@gmail.com',
  )));

  return email.id;
});
