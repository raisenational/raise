import { scan } from '../../../helpers/db';
import { emailTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Emails } from '../../../schemas';

export const main = middyfy(null, $Emails, true, async () => scan(emailTable));
