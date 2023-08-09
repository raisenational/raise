import { fixedGroups } from '@raise/shared';
import { sendEmail } from '../helpers/email';
import newUser from '../helpers/email/newUser';
import { UserCreation } from '../schemas';

const testEmail = 'Raise';

export default {
  id: '01H7DWQ77TZG31E8E1ADWVA15W',
  name: 'Send test user email',
  groups: [fixedGroups.National, fixedGroups.NationalTech],
  run: async (): Promise<void> => {
    const body: UserCreation = {
      name: 'Greg McGregFace',
      email: 'raisedemo@gmail.com',
      // the below information is not required for this task
      groups: [],
      autoEmail: true,
      securityTrainingCompletedAt: Math.floor(new Date().getTime() / 1000),
    };

    const sender = 'Raise National Team';

    await sendEmail(
      'Your account has been created!',
      newUser(body, sender),
      body.email, // to email
      testEmail, // from Name
    );
  },
};
