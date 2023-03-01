import { scan } from '../../../helpers/db';
import { fundraiserTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Fundraisers } from '../../../schemas';

export const main = middyfy(null, $Fundraisers, true, async () => scan(fundraiserTable));
