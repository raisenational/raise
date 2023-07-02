import { middyfy } from '../../../helpers/wrapper';
import { $Tasks } from '../../../schemas';
import tasks from '../../../tasks';

export const main = middyfy(null, $Tasks, true, async () => tasks.map((t) => ({ id: t.id, name: t.name })));
