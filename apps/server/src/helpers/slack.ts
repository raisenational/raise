import axios from 'axios';
import env from '../env/env';
import { auditContext } from './auditContext';

export const sendMessage = async (text: string): Promise<void> => {
  const response = await axios({
    method: 'post',
    baseURL: 'https://slack.com/api/',
    url: 'chat.postMessage',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
    data: {
      channel: env.SLACK_CHANNEL_ID,
      text,
    },
  });

  if (!response.data.ok) {
    throw new Error(`Error from Slack API: ${response.data.error}`);
  }
};

export const sendMessageWithLogsLink = async (text: string): Promise<void> => {
  const cloudWatchLink = env.STAGE === 'local' || !auditContext.value ? undefined : `https://${auditContext.value.awsRegion}.console.aws.amazon.com/cloudwatch/home?region=${auditContext.value.awsRegion}#logsV2:log-groups/log-group/${encodeURIComponent(encodeURIComponent(auditContext.value.logGroupName)).replace(/%/g, '$')}/log-events/${encodeURIComponent(encodeURIComponent(auditContext.value.logStreamName)).replace(/%/g, '$')}`;

  return sendMessage(text + (cloudWatchLink ? ` <${cloudWatchLink}|View the logs>.` : ''));
};
