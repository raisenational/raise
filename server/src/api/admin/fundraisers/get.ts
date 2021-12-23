import { scan } from "../../../helpers/db"
import { fundraisersSchema } from "../../../helpers/schemas"
import { fundraiserTable } from "../../../helpers/tables"
import { middyfy } from "../../../helpers/wrapper"

export const main = middyfy(null, fundraisersSchema, true, async () => scan(fundraiserTable))
