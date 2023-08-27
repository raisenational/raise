import { makePayment } from '../../local/testHelpers';
import { get, insert } from '../helpers/db';
import { paymentTable } from '../helpers/tables';
import cancelScheduledPayments from './cancelScheduledPayments';

test('cancels scheduled card payments', async () => {
  // Given
  const scheduledPayment = makePayment({ status: 'scheduled', method: 'card' });
  await insert(paymentTable, scheduledPayment);

  // When
  await cancelScheduledPayments.run();

  // Then
  const paymentAfter = await get(paymentTable, { donationId: scheduledPayment.donationId, id: scheduledPayment.id });
  expect(paymentAfter.status).toBe('cancelled');
});

test.each([
  ['pending'],
  ['paid'],
] as const)('doesn\'t cancel %s card payments', async (status) => {
  // Given
  const paymentThatShouldntBeCancelled = makePayment({ status, method: 'card' });
  await insert(paymentTable, paymentThatShouldntBeCancelled);

  // When
  await cancelScheduledPayments.run();

  // Then
  const paymentAfter = await get(paymentTable, { donationId: paymentThatShouldntBeCancelled.donationId, id: paymentThatShouldntBeCancelled.id });
  expect(paymentAfter.status).toBe(status);
  expect(paymentAfter.status).not.toBe('cancelled');
});
