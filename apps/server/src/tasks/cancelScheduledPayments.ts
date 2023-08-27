import { fixedGroups } from '@raise/shared';
import { scan, update } from '../helpers/db';
import { paymentTable } from '../helpers/tables';

// Purpose: For stopping pending payments at the end of the financial year so we can perform our accounting with a more clear cut-off
export default {
  id: '01H8VB3KZRCGP3HYKS97MH11G2',
  name: 'Cancel all scheduled card payments',
  groups: [fixedGroups.National],
  run: async (): Promise<void> => {
    const payments = await scan(paymentTable);

    const scheduledCardPayments = payments
      .filter((p) => p.status === 'scheduled' && p.method === 'card');

    await Promise.all(scheduledCardPayments.map((p) => update(paymentTable, { donationId: p.donationId, id: p.id }, { status: 'cancelled' })));
  },
};
