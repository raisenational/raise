import { fixedGroups } from '@raise/shared';
import { ulid } from 'ulid';
import createHttpError from 'http-errors';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert, scan } from '../../../helpers/db';
import { $CampaignCreation, $Ulid } from '../../../schemas';
import { campaignTable } from '../../../helpers/tables';

export const main = middyfy($CampaignCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);

  const campaignsFromDb = await scan(campaignTable);
  if (campaignsFromDb.find((u) => (u.campaign === event.body.campaign) && (u.chapter === event.body.chapter))) {
    throw new createHttpError.BadRequest('The campaign name has already been used for this chapter. Please pick a different name.');
  }

  const campaign = await insert(campaignTable, {
    id: ulid(),
    archived: false,
    ...event.body,
  });

  return campaign.id;
});
