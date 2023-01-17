import { ulid } from "ulid"
import { fixedGroups } from "@raise/shared"
import { middyfy } from "../../../helpers/wrapper"
import { assertHasGroup, insert } from "../../../helpers/db"
import { userTable } from "../../../helpers/tables"
import { $Ulid, $UserCreation } from "../../../schemas"

export const main = middyfy($UserCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.National)

  const user = await insert(userTable, {
    id: ulid(),
    ...event.body,
  })

  return user.id
})
