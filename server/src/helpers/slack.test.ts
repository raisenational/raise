import axios from 'axios';
import env from '../env/env';
import { auditContext } from './auditContext';
import { sendMessage, sendMessageWithLogsLink } from './slack';

jest.mock('axios', jest.fn);
jest.unmock('./slack');

beforeEach(() => {
  (axios as unknown as jest.Mock).mockResolvedValue({ data: { ok: true } });
});

test('sendMessage calls Slack API correctly', async () => {
  await sendMessage('This message was sent from slack.test.ts.');

  expect(axios).toHaveBeenCalledTimes(1);
  expect(axios).toHaveBeenCalledWith({
    method: 'post',
    baseURL: 'https://slack.com/api/',
    url: 'chat.postMessage',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
    data: {
      channel: env.SLACK_CHANNEL_ID,
      text: 'This message was sent from slack.test.ts.',
    },
  });
});

test('sendMessageWithLogsLink calls Slack API correctly when can determine logs url', async () => {
  const envBefore = { ...env };
  env.STAGE = 'dev';

  await sendMessageWithLogsLink('This message was sent from slack.test.ts.');

  expect(axios).toHaveBeenCalledTimes(1);
  expect(axios).toHaveBeenCalledWith({
    method: 'post',
    baseURL: 'https://slack.com/api/',
    url: 'chat.postMessage',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
    data: {
      channel: env.SLACK_CHANNEL_ID,
      text: 'This message was sent from slack.test.ts. <https://eu-test-1.console.aws.amazon.com/cloudwatch/home?region=eu-test-1#logsV2:log-groups/log-group/aws$252Flambda$252Fraise-server-stage-myFunc/log-events/2022$252F01$252F01$252F$255B$2524LATEST$255D123456789|View the logs>.',
    },
  });

  env.STAGE = envBefore.STAGE;
});

test("sendMessageWithLogsLink calls Slack API correctly when can't determine logs url", async () => {
  const envBefore = { ...env };
  env.STAGE = 'dev';
  auditContext.value = undefined;

  await sendMessageWithLogsLink('This message was sent from slack.test.ts.');

  expect(axios).toHaveBeenCalledTimes(1);
  expect(axios).toHaveBeenCalledWith({
    method: 'post',
    baseURL: 'https://slack.com/api/',
    url: 'chat.postMessage',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
    data: {
      channel: env.SLACK_CHANNEL_ID,
      text: 'This message was sent from slack.test.ts.',
    },
  });

  env.STAGE = envBefore.STAGE;
});

test('rethrows axios error', async () => {
  (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { ok: false, error: 'not_in_channel' } });

  await expect(() => sendMessage('This message was sent from slack.test.ts'))
    .rejects.toThrowError('Slack API: not_in_channel');

  expect(axios).toHaveBeenCalledTimes(1);
});

test('rethrows Slack API error', async () => {
  (axios as unknown as jest.Mock).mockRejectedValueOnce(new Error('this would be an axios error'));

  await expect(() => sendMessage('This message was sent from slack.test.ts'))
    .rejects.toThrowError('this would be an axios error');

  expect(axios).toHaveBeenCalledTimes(1);
});
