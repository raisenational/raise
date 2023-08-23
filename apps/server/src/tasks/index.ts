import { TaskDefinition } from '../helpers/types';
import sendSlackTestMessage from './sendSlackTestMessage';
import logStackTrace from './logStackTrace';
import initializeGroups from './initializeGroups';
import sendTestConfirmationEmail from './sendTestConfirmationEmail';
import sendTestUserEmails from './sendTestUserEmails';
import UpdateFundraisers from './UpdateFundraisers';

const tasks: TaskDefinition[] = [
  sendSlackTestMessage,
  logStackTrace,
  initializeGroups,
  sendTestConfirmationEmail,
  sendTestUserEmails,
  UpdateFundraisers
];

export default tasks;
