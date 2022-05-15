import { TaskDefinition } from "../helpers/types"
import sendSlackTestMessage from "./sendSlackTestMessage"
import logStackTrace from "./logStackTrace"

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
  logStackTrace,
]

export default tasks
