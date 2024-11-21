import createHttpError from 'http-errors';
import { middyfy } from '../../../../helpers/wrapper';
import {
  scan, update
} from '../../../../helpers/db';
import { $CampaignMemberRemoval, $Ulid } from '../../../../schemas';
import { campaignMemberTable, memberTable } from '../../../../helpers/tables';

export const main = middyfy($CampaignMemberRemoval, $Ulid, false, async (event) => {
  if ((event.body.email === '') || (event.body.email === undefined)) throw new createHttpError.BadRequest('No Email Provided');
  if (event.body.email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) === (false || null)) throw new createHttpError.BadRequest('Invalid Email Format');

  const usersFromDb = await scan(memberTable);
  const user = usersFromDb.find((u) => (u.email === event.body.email));
  if (user) {
    await update(campaignMemberTable, { memberId: user.id, campaignId: event.body.campaignId }, { active: false }); // Fix campaign Id in table issue
  } else {
    throw new createHttpError.BadRequest('Account could not be found. Please check your details');
  }
  return user.id;
});
