/* import { fixedGroups } from '@raise/shared'; */
import { middyfy } from '../../../helpers/wrapper';
import { $Tasks, Task } from '../../../schemas';
import tasks from '../../../tasks';
/* import { assertHasGroup } from '../../../helpers/db'; */

/* export const main = middyfy(null, $Tasks, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);
  return (tasks.map((t) => ({ id: t.id, name: t.name })));
});
*/

export const main = middyfy(null, $Tasks, true, async (event) => {
  const overlap = (a: string[], b: string[]): boolean => a.some((v) => b.includes(v));
  const listOfAllTasks = tasks.map((t) => ({ id: t.id, name: t.name, groups: t.groups }));
  const listOfTasks: Task[] = [];
  listOfAllTasks.forEach((task) => {
    if (overlap(event.auth.payload.groups, task.groups)) {
      listOfTasks.push(task);
    }
  });
  return (listOfTasks.map((t) => ({ id: t.id, name: t.name })));
});
