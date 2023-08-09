import { TaskDefinition } from '../helpers/types';
import sendSlackTestMessage from './sendSlackTestMessage';
import logStackTrace from './logStackTrace';
import initializeGroups from './initializeGroups';
import sendTestConfirmationEmail from './sendTestConfirmationEmail';
import SendTestUserEmail from './SendTestUserEmail';

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
  logStackTrace,
  initializeGroups,
  sendTestConfirmationEmail,
  SendTestUserEmail,
];

export default tasks;
