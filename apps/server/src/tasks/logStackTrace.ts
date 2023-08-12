import { fixedGroups } from '@raise/shared';

// Purpose: For checking log output ends up in the right place, and source maps work as expected
export default {
  id: '01G33RD8YDEYHQF3DZFJ5ZWDFH',
  name: 'Log a stack trace',
  groups: [fixedGroups.National],
  run: async (): Promise<void> => {
    const e = new Error('Stack trace from task 01G33RD8YDEYHQF3DZFJ5ZWDFH');
    e.name = 'LogAStackTraceTask';
    // eslint-disable-next-line no-console
    console.log(e);
  },
};
