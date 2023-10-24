import { ulid } from 'ulid';
import createHttpError from 'http-errors';
import { middyfy } from '../../../../helpers/wrapper';
import { insert, scan, update } from '../../../../helpers/db';
import { $CampaignMemberCreation, $Ulid } from '../../../../schemas';
import { campaignMemberTable, memberTable } from '../../../../helpers/tables';

export const main = middyfy($CampaignMemberCreation, $Ulid, false, async (event) => {
  if ((event.body.name === '') || (event.body.name === undefined)) throw new createHttpError.BadRequest('No Name Provided');
  if ((event.body.email === '') || (event.body.email === undefined)) throw new createHttpError.BadRequest('No Email Provided');
  if (event.body.email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === (false || null)) throw new createHttpError.BadRequest('Invalid Email Format');

  const usersFromDb = await scan(memberTable);
  const campaignMembersFromDb = await scan(campaignMemberTable);

  let member = usersFromDb.find((u) => u.email === event.body.email);

  if (member) {
    if (campaignMembersFromDb.find((cm) => (cm.memberId === member?.id) && (cm.campaignId === event.body.campaignId) && (cm.active === true))) {
      throw new createHttpError.BadRequest('This email has already been used to sign up to this campaign');
    } else if (campaignMembersFromDb.find((cm) => (cm.memberId === member?.id) && (cm.campaignId === event.body.campaignId) && (cm.active === false))) {
      await update(campaignMemberTable, { memberId: member.id, campaignId: event.body.campaignId }, { active: true }); // re-signs-up member to the campaign (if they had previously unsubscribed)
      if (member.name !== event.body.name) {
        await update(memberTable, { id: member.id }, { name: event.body.name }); // updates the name should there be a change in name
      }
    } else {
      await insert(campaignMemberTable, {
        id: ulid(),
        memberId: member.id,
        campaignId: event.body.campaignId,
        active: true,
      });
    }
  } else {
    member = await insert(memberTable, {
      id: ulid(),
      joined: Math.floor(new Date().getTime() / 1000),
      active: true,
      name: event.body.name,
      email: event.body.email,
    });
    await insert(campaignMemberTable, {
      id: ulid(),
      memberId: member.id,
      campaignId: event.body.campaignId,
      active: true,
    });
  }

  return member.id;
});
