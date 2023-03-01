import { scan } from '../../../helpers/db';
import { groupTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Groups } from '../../../schemas';

export const main = middyfy(null, $Groups, true, async () => scan(groupTable));
