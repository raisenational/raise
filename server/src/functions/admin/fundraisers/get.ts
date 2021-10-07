import "source-map-support/register"

import { scan } from "../../../helpers/db"
import { fundraisersSchema } from "../../../helpers/schemas"
import { middyfy } from "../../../helpers/wrapper"

export const main = middyfy(null, fundraisersSchema, true, async () => scan(process.env.TABLE_NAME_FUNDRAISER!, fundraisersSchema))
