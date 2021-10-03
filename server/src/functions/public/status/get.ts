import "source-map-support/register"
import { statusSchema } from "../../../helpers/schemas"
import { middyfy } from "../../../helpers/wrapper"

export const main = middyfy(null, statusSchema, async () => ({
  message: "Service online",
}))
