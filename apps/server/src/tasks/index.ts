import { TaskDefinition } from '../helpers/types';
import sendSlackTestMessage from './sendSlackTestMessage';
import logStackTrace from './logStackTrace';
import initializeGroups from './initializeGroups';
import sendTestConfirmationEmail from './sendTestConfirmationEmail';

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
  logStackTrace,
  initializeGroups,
  sendTestConfirmationEmail,
];

export default tasks;
