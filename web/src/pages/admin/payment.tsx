import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { ExternalLinkIcon, ReceiptRefundIcon } from '@heroicons/react/outline';
import { fixedGroups, format } from '@raise/shared';
import { useState } from 'react';
import { asResponseValues, useReq, useRawReq } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import PropertyEditor from '../../components/PropertyEditor';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Form } from '../../components/Form';
import { RequireGroup } from '../../helpers/security';
import { PaymentCreation, PaymentPropertyEdits } from '../../helpers/generated-api-client';

const PaymentPage: React.FC<RouteComponentProps & { fundraiserId: string, donationId: string, paymentId: string }> = ({ fundraiserId, donationId, paymentId }) => {
  const [fundraisers] = useReq('get /admin/fundraisers');
  const [donations] = useReq('get /admin/fundraisers/{fundraiserId}/donations', { fundraiserId });
  const [payments, refetchPayments] = useReq('get /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments', { fundraiserId, donationId });
  const req = useRawReq();

  const [refundModalOpen, setRefundModalOpen] = useState(false);

  const fundraiser = asResponseValues(fundraisers.data?.find((f) => f.id === fundraiserId), fundraisers);
  const donation = asResponseValues(donations.data?.find((d) => d.fundraiserId === fundraiserId && d.id === donationId), donations);
  const payment = asResponseValues(payments.data?.find((p) => p.fundraiserId === fundraiserId && p.donationId === donationId && p.id === paymentId), payments);

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">{donation.data?.donorName ? `Payment from ${donation.data?.donorName}` : 'Payment'}</SectionTitle>
        <RequireGroup group={fixedGroups.National}>
          {payment.data?.method === 'card' && payment.data.reference && (
          <Button href={`https://dashboard.stripe.com/payments/${payment.data?.reference}`} target="_blank">
            <ExternalLinkIcon className="h-6 mb-1" />
            {' '}
            View on Stripe
          </Button>
          )}
        </RequireGroup>
        {(payment.data?.status === 'paid' && (payment.data.donationAmount + payment.data.contributionAmount + (payment.data.matchFundingAmount ?? 0)) > 0) && (
        <Button onClick={() => setRefundModalOpen(true)}>
          <ReceiptRefundIcon className="h-6 mb-1" />
          {' '}
          Mark refunded
        </Button>
        )}
      </div>
      <Modal open={refundModalOpen} onClose={() => setRefundModalOpen(false)}>
        <Form<PaymentCreation>
          title={`Mark payment ${donation.data?.donorName ? `from ${donation.data?.donorName}` : ''} as refunded`}
          warning={`This marks the payment as refunded in the Raise platform, but does not actually refund it.${payment.data?.method === 'card' ? ' You probably want to also refund it in the Stripe dashboard.' : ''}`}
          definition={{
            at: { inputType: 'hidden' },
            donationAmount: { label: 'Refunded donation amount', formatter: (v?: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount' },
            contributionAmount: { label: 'Refunded contribution amount', formatter: (v?: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount' },
            matchFundingAmount: { label: 'Refunded match funding amount', formatter: (v?: number | null) => format.amount(fundraiser.data?.currency, v), inputType: 'amount' },
            method: { inputType: 'hidden' },
            reference: { inputType: 'hidden' },
          }}
          initialValues={{
            at: Math.floor(new Date().getTime() / 1000),
            donationAmount: payment.data?.donationAmount,
            contributionAmount: payment.data?.contributionAmount,
            matchFundingAmount: payment.data?.matchFundingAmount,
            method: payment.data?.method,
            reference: payment.data?.reference,
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            await req('post /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments', { fundraiserId, donationId }, {
              ...data,
              donationAmount: data.donationAmount !== undefined ? -data.donationAmount : 0,
              contributionAmount: data.contributionAmount !== undefined ? -data.contributionAmount : 0,
              matchFundingAmount: data.matchFundingAmount !== undefined && data.matchFundingAmount !== null ? -data.matchFundingAmount : 0,
            });
            await refetchPayments();
            setRefundModalOpen(false);
          }}
        />
      </Modal>
      <PropertyEditor
        definition={{
          at: { label: 'At', formatter: format.timestamp },
          donationAmount: { label: 'Donation', formatter: (v: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount' },
          contributionAmount: { label: 'Contribution', formatter: (v: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount' },
          matchFundingAmount: { label: 'Match funding', formatter: (v: number | null) => format.amount(fundraiser.data?.currency, v), inputType: 'amount' },
          method: { label: 'Method' },
          reference: { label: 'Ref', inputType: payment.data?.method === 'card' ? undefined : 'text' },
          status: { label: 'Status', selectOptions: ['cancelled'], inputType: 'select' },
        }}
        item={payment}
        onSave={async (data) => {
          // TODO: We shouldn't have to do the cast to never, but we do because of the weirdness created by the arg array expasion.
          await req('patch /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/{paymentId}', { fundraiserId, donationId, paymentId }, data as PaymentPropertyEdits as never);
          refetchPayments();
        }}
      />
    </Section>
  );
};

export default PaymentPage;
