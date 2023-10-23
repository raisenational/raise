import { ulid } from 'ulid';
import createHttpError from 'http-errors';
import { middyfy } from '../../../../helpers/wrapper';
import { insert, scan } from '../../../../helpers/db';
import { $CampaignMemberCreation, $Ulid } from '../../../../schemas';
import { campaignMemberTable, memberTable } from '../../../../helpers/tables';

export const main = middyfy($CampaignMemberCreation, $Ulid, false, async (event) => {
  if ((event.body.name === '') || (event.body.name === undefined)) throw new createHttpError.BadRequest('No Name Provided');
  if ((event.body.email === '') || (event.body.email === undefined)) throw new createHttpError.BadRequest('No Email Provided');
  if (event.body.email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === (false || null)) throw new createHttpError.BadRequest('Invalid Email Format');
  // This is a general intrest list
  const usersFromDb = await scan(memberTable);
  const campaignMembersFromDb = await scan(campaignMemberTable);

  let member = usersFromDb.find((u) => u.email === event.body.email);

  if (member) {
    if (campaignMembersFromDb.find((cm) => (cm.memberId === member?.id) && (cm.campaignId === event.body.campaignId))) {
      throw new createHttpError.BadRequest('This email has already been used to sign up to this campaign');
    }
    await insert(campaignMemberTable, {
      id: ulid(),
      memberId: member.id,
      campaignId: event.body.campaignId,
      active: true,
    });
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

  // (done) day/timestamp of sign up
  // joinraise.org/bristol/signup?utm_campaign=Freshers fair 2023
  // (done) unsubscribe page, enter email (Perhaps autofill joinraise.org/unsubscribe?email=adam@joinraise.org)
  // (done) unsubscribe property for members
  // auto clear form when success, maybe clear success message after a few seconds
  // string array for chapters
  // mini-segments within chapters???
  // joinraise.org./signup/{campaign} (Exmaple RSVP form)
  // sign up to Mailchimp and what kind of list (subset of a table) and campaigns.
  // Subscribers Table (name, email, day of signup, opt out, id), kinda what the member list is right now
  // then another list table for each chapter, (Summer party, Raise bristol 2022, Raise Bristol 2023),
  // then another list that say which person is on which list.

  return member.id;
});
