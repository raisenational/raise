import { sendMessage } from '../helpers/slack';
import sendSlackTestMessage from './sendSlackTestMessage';

test('calls sendMessage once', async () => {
  await sendSlackTestMessage.run();

  expect(sendMessage).toBeCalledTimes(1);
});
