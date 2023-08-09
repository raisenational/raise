import { fixedGroups } from '@raise/shared';
import { sendMessage } from '../helpers/slack';

// Purpose: For testing the Slack connection is working correctly
export default {
  id: '01FQWSP20Y4TD3N6WZY0YSBDPN',
  name: 'Send Slack test message',
  groups: [fixedGroups.National],
  run: async (): Promise<void> => {
    await sendMessage('🧪 This is a test message sent from a task');
  },
};
