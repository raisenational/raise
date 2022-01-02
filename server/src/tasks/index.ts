import { TaskDefinition } from "../helpers/types"
import eventLinkMigration from "./eventLinkMigration"
import sendSlackTestMessage from "./sendSlackTestMessage"

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
  eventLinkMigration,
]

export default tasks
