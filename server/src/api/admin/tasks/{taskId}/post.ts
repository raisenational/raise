import createHttpError from "http-errors"
import { middyfy } from "../../../../helpers/wrapper"
import { assertHasGroup, insertAudit } from "../../../../helpers/db"
import { NATIONAL } from "../../../../helpers/groups"
import tasks from "../../../../tasks"

export const main = middyfy(null, null, true, async (event) => {
  assertHasGroup(event, NATIONAL)
  const task = tasks.find((t) => t.id === event.pathParameters.taskId)
  if (!task) throw new createHttpError.NotFound("task not found")
  await insertAudit({ action: "run", object: event.pathParameters.taskId })

  await task.run()
})
