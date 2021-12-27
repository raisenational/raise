import { tasksSchema } from "@raise/shared"
import { middyfy } from "../../../helpers/wrapper"
import tasks from "../../../tasks"

export const main = middyfy(null, tasksSchema, true, async () => tasks.map((t) => ({ id: t.id, name: t.name })))
