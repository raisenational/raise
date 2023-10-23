import { scan } from '../../../../helpers/db';
import { campaignMemberTable } from '../../../../helpers/tables';
import { middyfy } from '../../../../helpers/wrapper';
import { $CampaignMembers, } from '../../../../schemas';

export const main = middyfy(null, $CampaignMembers, true, async () => scan(campaignMemberTable));
