import { auditLogsSchema, g } from "@raise/shared"
import { middyfy } from "../../../../../helpers/wrapper"
import { auditLogTable } from "../../../../../helpers/tables"
import { assertHasGroup, query } from "../../../../../helpers/db"

export const main = middyfy(null, auditLogsSchema, true, async (event) => {
  assertHasGroup(event, g.National)
  return query(auditLogTable, { object: event.pathParameters.objectId })
})
