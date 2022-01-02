import { scan, update } from "../helpers/db"
import { fundraiserTable } from "../helpers/tables"

export default {
  id: "01FRE0X24HG1V5MW7HXD08ZAFY",
  name: "migrate(eventLink)",
  run: async (): Promise<void> => {
    const fundraisers = await scan(fundraiserTable)
    await Promise.all(fundraisers.map((f) => update(fundraiserTable, { id: f.id }, { eventLink: null })))
  },
}
