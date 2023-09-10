import createHttpError from 'http-errors';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, insertAudit } from '../../../../helpers/db';
import tasks from '../../../../tasks';

export const main = middyfy(null, null, true, async (event) => {
  const task = tasks.find((t) => t.id === event.pathParameters.taskId);
  if (!task) throw new createHttpError.NotFound('task not found');
  await insertAudit({ action: 'run', object: event.pathParameters.taskId });
  assertHasGroup(event, task.groups);

  await task.run();
});
