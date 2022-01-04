import { auditLogsSchema } from "@raise/shared"
import { middyfy } from "../../../../../helpers/wrapper"
import { auditLogTable } from "../../../../../helpers/tables"
import { assertHasGroup, query } from "../../../../../helpers/db"
import { NATIONAL } from "../../../../../helpers/groups"

export const main = middyfy(null, auditLogsSchema, true, async (event) => {
  assertHasGroup(event, NATIONAL)
  return query(auditLogTable, { object: event.pathParameters.objectId })
})
