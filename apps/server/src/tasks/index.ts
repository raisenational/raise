import { TaskDefinition } from '../helpers/types';
import sendSlackTestMessage from './sendSlackTestMessage';
import logStackTrace from './logStackTrace';
import initializeGroups from './initializeGroups';
import sendTestConfirmationEmail from './sendTestConfirmationEmail';
import sendTestUserEmail from './sendTestUserEmail';

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
  logStackTrace,
  initializeGroups,
  sendTestConfirmationEmail,
  sendTestUserEmail,
];

export default tasks;
