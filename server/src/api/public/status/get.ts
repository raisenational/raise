import { statusSchema } from "@raise/shared"
import { middyfy } from "../../../helpers/wrapper"

export const main = middyfy(null, statusSchema, false, async () => ({
  message: "Service online",
}))
