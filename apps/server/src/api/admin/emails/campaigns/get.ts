import { scan } from '../../../../helpers/db';
import { campaignTable } from '../../../../helpers/tables';
import { middyfy } from '../../../../helpers/wrapper';
import { $Campaigns } from '../../../../schemas';

export const main = middyfy(null, $Campaigns, true, async () => scan(campaignTable));
