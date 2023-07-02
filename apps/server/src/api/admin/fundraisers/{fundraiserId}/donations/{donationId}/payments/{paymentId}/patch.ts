import createHttpError from 'http-errors';
import { fixedGroups } from '@raise/shared';
import { middyfy } from '../../../../../../../../helpers/wrapper';
import {
  assertHasGroup, get, inTransaction, plusT, update, updateT,
} from '../../../../../../../../helpers/db';
import { donationTable, fundraiserTable, paymentTable } from '../../../../../../../../helpers/tables';
import type {
  AWSTransactionDefinition, AuditDefinition,
} from '../../../../../../../../helpers/db';
import {
  $PaymentPropertyEdits,
  Donation, Fundraiser, Payment,
} from '../../../../../../../../schemas';

export const main = middyfy($PaymentPropertyEdits, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.National);

  const { fundraiserId, donationId, paymentId } = event.pathParameters;

  // This will result in a 404 if these do not exist, confirming whether this payment/donation exists to an admin
  // However, this is a limited issue since only admins can call this endpoint and there's not much you can do with just an id
  const [fundraiser, donation, payment] = await Promise.all([
    get(fundraiserTable, { id: fundraiserId }),
    get(donationTable, { fundraiserId, id: donationId }),
    get(paymentTable, { donationId, id: paymentId }),
  ]);
  assertHasGroup(event, fundraiser, fixedGroups.National);

  // these are important for security as otherwise the payment might not really sit
  // under the fundraiser an admin has access to according to assertHasGroup
  if (donation.fundraiserId !== fundraiserId) {
    throw new createHttpError.Forbidden(`Donation ${donationId} does not match fundraiser ${fundraiserId}`);
  }
  if (payment.donationId !== donationId) {
    throw new createHttpError.Forbidden(`Payment ${paymentId} does not match donation ${donationId}`);
  }

  if ('matchFundingAmount' in event.body) {
    await updateMatchFundingAmount(event.body.matchFundingAmount, fundraiser, donation, payment);
  } else if ('status' in event.body) {
    await updateStatus(event.body.status, fundraiser, donation, payment);
  } else if ('donationAmount' in event.body) {
    await updateDonationAmount(event.body.donationAmount, fundraiser, donation, payment);
  } else if ('contributionAmount' in event.body && payment.method !== 'card') {
    await updateContributionAmount(event.body.contributionAmount, fundraiser, donation, payment);
  } else if ('reference' in event.body) {
    await updateReference(event.body.reference, donation, payment);
  } else {
    throw new createHttpError.BadRequest('You can only edit matchFundingAmount, status, donationAmount, contributionAmount and reference on a payment');
  }

  // Some notes on the logic here:
  // match funding amounts are reflected in the remaining balance on the fundraiser iff status is pending, scheduled or paid
  // donation and contribution amounts are reflected in the donation iff status is paid
  // donation and match funding amounts are reflected in the totalRaised on the fundraiser iff status is paid
  // we don't update the fundraiser donationsCount in this endpoint
});

// Allocate new match funding (if available) and update match funding amount on donation
// We can edit match funding on all payments: if status is pending, scheduled or paid, reallocate match funding amount
async function updateMatchFundingAmount(
  newMatchFundingAmount: number | null,
  fundraiser: Fundraiser,
  donation: Donation,
  payment: Payment,
) {
  const updates: { tDef: AWSTransactionDefinition, auditDef: AuditDefinition }[] = [];
  updates.push(updateT(
    paymentTable,
    { id: payment.id, donationId: donation.id },
    { matchFundingAmount: newMatchFundingAmount },
    'matchFundingAmount = :currentMatchFundingAmount AND #status = :currentStatus',
    { ':currentMatchFundingAmount': payment.matchFundingAmount, ':currentStatus': payment.status },
    { '#status': 'status' },
  ));

  if (payment.status === 'paid' || payment.status === 'pending' || payment.status === 'scheduled') {
    const matchFundingAdded: number = (newMatchFundingAmount ?? 0) - (payment.matchFundingAmount ?? 0);
    if (payment.status === 'paid') {
      updates.push(plusT(
        donationTable,
        { fundraiserId: fundraiser.id, id: donation.id },
        { matchFundingAmount: matchFundingAdded },
      ));
      if (fundraiser.matchFundingRemaining !== null) {
        updates.push(plusT(
          fundraiserTable,
          { id: fundraiser.id },
          { matchFundingRemaining: -matchFundingAdded, totalRaised: matchFundingAdded },
          'matchFundingRemaining >= :matchFundingAdded',
          { ':matchFundingAdded': matchFundingAdded },
        ));
      } else {
        updates.push(plusT(
          fundraiserTable,
          { id: fundraiser.id },
          { totalRaised: matchFundingAdded },
        ));
      }
    } else if (fundraiser.matchFundingRemaining !== null) {
      updates.push(plusT(
        fundraiserTable,
        { id: fundraiser.id },
        { matchFundingRemaining: -matchFundingAdded },
        'matchFundingRemaining >= :matchFundingAdded',
        { ':matchFundingAdded': matchFundingAdded },
      ));
    }
  }

  await inTransaction(updates);
}

async function updateStatus(
  newStatus: Payment['status'],
  fundraiser: Fundraiser,
  donation: Donation,
  payment: Payment,
) {
  // you only can cancel pending or scheduled card payments
  if ((newStatus !== 'cancelled') || (payment.status !== 'pending' && payment.status !== 'scheduled')) {
    throw new createHttpError.BadRequest(`Invalid state transition: ${payment.status} to ${newStatus} (you may only cancel pending or scheduled payments)`);
  }
  if (payment.method !== 'card') {
    throw new createHttpError.BadRequest(`You can only cancel card payments, but you tried to cancel a ${payment.method} payment`);
  }

  // set status to cancelled, reallocate match funding amount
  const updates: { tDef: AWSTransactionDefinition, auditDef: AuditDefinition }[] = [];
  updates.push(updateT(
    paymentTable,
    { id: payment.id, donationId: donation.id },
    { status: newStatus },
    'matchFundingAmount = :currentMatchFundingAmount AND #status = :currentStatus',
    { ':currentStatus': payment.status, ':currentMatchFundingAmount': payment.matchFundingAmount },
    { '#status': 'status' },
  ));
  if (payment.matchFundingAmount !== null && fundraiser.matchFundingRemaining !== null) {
    updates.push(plusT(
      fundraiserTable,
      { id: fundraiser.id },
      { matchFundingRemaining: payment.matchFundingAmount },
    ));
  }
  await inTransaction(updates);
}

// for non-card payments you can edit donation and contribution amounts: if status paid, reallocate all amounts
async function updateDonationAmount(
  newDonationAmount: number,
  fundraiser: Fundraiser,
  donation: Donation,
  payment: Payment,
) {
  if (payment.method === 'card') {
    throw new createHttpError.BadRequest('You cannot change the donationAmount on a card payment');
  }
  const updates: { tDef: AWSTransactionDefinition, auditDef: AuditDefinition }[] = [];
  updates.push(updateT(
    paymentTable,
    { id: payment.id, donationId: donation.id },
    { donationAmount: newDonationAmount },
    'donationAmount = :currentDonationAmount',
    { ':currentDonationAmount': payment.donationAmount },
  ));
  if (payment.status === 'paid') {
    const donationAmountAdded: number = newDonationAmount - payment.donationAmount;

    const giftAidBefore = donation.giftAid ? Math.floor(donation.donationAmount * 0.25) : 0;
    const giftAidAfter = donation.giftAid ? Math.floor((donation.donationAmount + donationAmountAdded) * 0.25) : 0;
    const giftAidAdded = giftAidAfter - giftAidBefore;

    updates.push(plusT(
      donationTable,
      { id: donation.id, fundraiserId: fundraiser.id },
      { donationAmount: donationAmountAdded },
      'donationAmount = :currentDonationAmount AND giftAid = :currentGiftAid',
      {
        ':currentDonationAmount': donation.donationAmount, ':currentGiftAid': donation.giftAid,
      },
    ));
    updates.push(plusT(
      fundraiserTable,
      { id: fundraiser.id },
      { totalRaised: donationAmountAdded + giftAidAdded },
    ));
  }
  await inTransaction(updates);
}

async function updateContributionAmount(
  newContributionAmount: number,
  fundraiser: Fundraiser,
  donation: Donation,
  payment: Payment,
) {
  if (payment.method === 'card') {
    throw new createHttpError.BadRequest('You cannot change the contributionAmount on a card payment');
  }
  const updates: { tDef: AWSTransactionDefinition, auditDef: AuditDefinition }[] = [];
  updates.push(updateT(
    paymentTable,
    { id: payment.id, donationId: donation.id },
    { contributionAmount: newContributionAmount },
    'contributionAmount = :currentContributionAmount',
    { ':currentContributionAmount': payment.contributionAmount },
  ));
  if (payment.status === 'paid') {
    const contributionAmountAdded: number = newContributionAmount - payment.contributionAmount;
    updates.push(plusT(
      donationTable,
      { id: donation.id, fundraiserId: fundraiser.id },
      { contributionAmount: contributionAmountAdded },
    ));
  }
  await inTransaction(updates);
}

async function updateReference(
  newReference: string | null,
  donation: Donation,
  payment: Payment,
) {
  if (payment.method === 'card') {
    throw new createHttpError.BadRequest('You cannot change the reference on a card payment');
  }
  await update(
    paymentTable,
    { id: payment.id, donationId: donation.id },
    { reference: newReference },
  );
}
