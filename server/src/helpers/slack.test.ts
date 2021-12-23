import { unsupressConsole } from "../../local/testHelpers"
import { main } from "./slack"

test.skip("Call slack API", async () => {
  unsupressConsole()
  await main()
})
