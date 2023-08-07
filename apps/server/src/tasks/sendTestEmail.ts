import { makeDonation, makeFundraiser, makePayment } from '../../local/testHelpers';
import { sendEmail } from '../helpers/email';
import confirmation from '../helpers/email/confirmation';

const testEmail = 'raisedemo@gmail.com';

export default {
  id: '01H6HY9VN4N085956S09NP1GSC',
  name: 'Send test email',
  run: async (): Promise<void> => {
    await sendEmail(
      "We've received your donation",
      confirmation(makeFundraiser(), makeDonation({}), [makePayment(), makePayment(), makePayment()]),
      testEmail,
      testEmail,
    );
  },
};
