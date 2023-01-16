import { TaskDefinition } from "../helpers/types"
import sendSlackTestMessage from "./sendSlackTestMessage"
import logStackTrace from "./logStackTrace"
import intialiseGroups from "./intialiseGroups"

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
  logStackTrace,
  intialiseGroups,
]

export default tasks
