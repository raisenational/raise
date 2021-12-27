import { TaskDefinition } from "../helpers/types"
import sendSlackTestMessage from "./sendSlackTestMessage"

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
]

export default tasks
