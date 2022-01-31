import { auditLogsSchema, g } from "@raise/shared"
import { middyfy } from "../../../../../helpers/wrapper"
import { auditLogTable } from "../../../../../helpers/tables"
import { assertHasGroup, scan } from "../../../../../helpers/db"

export const main = middyfy(null, auditLogsSchema, true, async (event) => {
  assertHasGroup(event, g.National)
  return (await scan(auditLogTable)).filter((l) => l.subject === event.pathParameters.subjectId).sort((a, b) => b.at - a.at)
})
