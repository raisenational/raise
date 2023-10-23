import { scan } from '../../../helpers/db';
import { memberTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Members } from '../../../schemas';

export const main = middyfy(null, $Members, true, async () => scan(memberTable));
