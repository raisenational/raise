import { TaskDefinition } from '../helpers/types';
import sendSlackTestMessage from './sendSlackTestMessage';
import logStackTrace from './logStackTrace';
import initializeGroups from './initializeGroups';
import sendTestConfirmationEmail from './sendTestConfirmationEmail';
import sendTestUserEmails from './sendTestUserEmails';
import cancelScheduledPayments from './cancelScheduledPayments';

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
  logStackTrace,
  initializeGroups,
  sendTestConfirmationEmail,
  sendTestUserEmails,
  cancelScheduledPayments,
];

export default tasks;
