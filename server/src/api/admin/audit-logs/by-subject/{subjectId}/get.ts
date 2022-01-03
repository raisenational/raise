import { auditLogsSchema } from "@raise/shared"
import { middyfy } from "../../../../../helpers/wrapper"
import { auditLogTable } from "../../../../../helpers/tables"
import { assertHasGroup, scan } from "../../../../../helpers/db"
import { NATIONAL } from "../../../../../helpers/groups"

export const main = middyfy(null, auditLogsSchema, true, async (event) => {
  assertHasGroup(event, NATIONAL)
  return (await scan(auditLogTable)).filter((l) => l.subject === event.pathParameters.subjectId).sort((a, b) => b.at - a.at)
})
