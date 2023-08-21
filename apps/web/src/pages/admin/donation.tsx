import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { PlusSmIcon } from '@heroicons/react/outline';
import { format } from '@raise/shared';
import { useState } from 'react';
import { asResponseValues, useReq, useRawAxios } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import Table from '../../components/Table';
import PropertyEditor from '../../components/PropertyEditor';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Form } from '../../components/Form';
import DonationCard from '../../components/DonationCard';
import { PaymentCreation } from '../../helpers/generated-api-client';

const DonationPage: React.FC<RouteComponentProps & { fundraiserId: string, donationId: string }> = ({ fundraiserId, donationId }) => {
  const [fundraisers] = useReq('get /admin/fundraisers');
  const [donations, refetchDonations] = useReq('get /admin/fundraisers/{fundraiserId}/donations', { fundraiserId });
  const [payments, refetchPayments] = useReq('get /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments', { fundraiserId, donationId });
  const axios = useRawAxios();

  const [newPaymentModalOpen, setNewPaymentModalOpen] = useState(false);

  const fundraiser = asResponseValues(fundraisers.data?.find((f) => f.id === fundraiserId), fundraisers);
  const donation = asResponseValues(donations.data?.find((d) => d.fundraiserId === fundraiserId && d.id === donationId), donations);
  const giftAidEditWarning = 'We must hold accurate names and addresses for gift-aided donations as per the Income Tax Act 2007';
  const amountEditWarning = 'Do not edit amounts unless you know what you are doing. This will not update the fundraiser totals.';
  const frequencyEditWarning = 'Do not edit the frequency of payments unless you know what you are doing. This will not update the payments.';
  const stripeCustomerIdWarning = 'Do not edit the Stripe customer ID unless you know what you are doing';
  const stripePaymentMethodIdWarning = 'Do not edit the Stripe payment method id unless you know what you are doing';

  return (
    <Section>
      <SectionTitle>{donation.data?.donorName ? `Donation from ${donation.data?.donorName}` : 'Donation'}</SectionTitle>
      <PropertyEditor
        definition={{
          donorName: { label: 'Donor name', inputType: 'text', warning: giftAidEditWarning },
          donorEmail: { label: 'Donor email', inputType: 'email' },
          emailConsentInformational: { label: 'Email consent: informational', formatter: format.boolean, inputType: 'checkbox' },
          emailConsentMarketing: { label: 'Email consent: marketing', formatter: format.boolean, inputType: 'checkbox' },
          createdAt: { label: 'At', formatter: format.timestamp, inputType: 'datetime-local' },
          addressLine1: { label: 'Address line 1', inputType: 'text', warning: giftAidEditWarning },
          addressLine2: { label: 'Address line 2', inputType: 'text', warning: giftAidEditWarning },
          addressLine3: { label: 'Address line 3', inputType: 'text', warning: giftAidEditWarning },
          addressPostcode: { label: 'Address postcode', inputType: 'text', warning: giftAidEditWarning },
          addressCountry: { label: 'Address country', inputType: 'text', warning: giftAidEditWarning },
          donationAmount: {
            label: 'Donation amount', formatter: (v: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount', warning: amountEditWarning,
          },
          recurringAmount: {
            label: 'Recurring payment amount', formatter: (v: number | null) => format.amount(fundraiser.data?.currency, v), inputType: 'amount', warning: amountEditWarning,
          },
          recurrenceFrequency: {
            label: 'Frequency of recurrence', inputType: 'text', warning: frequencyEditWarning,
          },
          matchFundingAmount: {
            label: 'Match funding amount', formatter: (v: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount', warning: amountEditWarning,
          },
          contributionAmount: {
            label: 'Raise contribution amount', formatter: (v: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount', warning: amountEditWarning,
          },
          stripeCustomerId: {
            label: 'Stripe customer ID', inputType: 'text', warning: stripeCustomerIdWarning,
          },
          stripePaymentMethodId: {
            label: 'Stripe payment method', inputType: 'text', warning: stripePaymentMethodIdWarning,
          },
          giftAid: {
            label: 'Gift-aided', formatter: format.boolean, inputType: 'checkbox', warning: giftAidEditWarning,
          },
          charity: { label: 'Designated charity', inputType: 'text' },
          comment: { label: 'Donor comment', inputType: 'text' },
          overallPublic: { label: 'Donation is public', formatter: format.boolean, inputType: 'checkbox' },
          namePublic: { label: 'Donor name is public', formatter: format.boolean, inputType: 'checkbox' },
          donationAmountPublic: { label: 'Donation amount is public', formatter: format.boolean, inputType: 'checkbox' },
          donationCounted: { label: 'Donation counted', formatter: format.boolean, inputType: 'checkbox' },
        }}
        item={donation}
        onSave={async (data) => {
          await axios.patch(`/admin/fundraisers/${fundraiserId}/donations/${donationId}`, {
            ...data,
            previous: {
              donationAmount: donation.data?.donationAmount,
              contributionAmount: donation.data?.contributionAmount,
              matchFundingAmount: donation.data?.matchFundingAmount,
            },
          });
          refetchDonations();
        }}
      />

      <div className="flex mt-12">
        <SectionTitle className="flex-1">Payments</SectionTitle>
        <Button onClick={() => setNewPaymentModalOpen(true)}>
          <PlusSmIcon className="h-6 mb-1" />
          {' '}
          New
          <span className="hidden lg:inline"> manual payment</span>
        </Button>
      </div>
      <Modal open={newPaymentModalOpen} onClose={() => setNewPaymentModalOpen(false)}>
        <Form<PaymentCreation>
          title="New payment"
          definition={{
            at: { inputType: 'hidden' },
            donationAmount: { label: 'Donation amount', formatter: (v?: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount' },
            contributionAmount: { label: 'Contribution amount', formatter: (v?: number) => format.amount(fundraiser.data?.currency, v), inputType: 'amount' },
            method: {
              label: 'Method', inputType: 'select', selectOptions: ['cash', 'direct_to_charity'],
            },
            reference: { label: 'Reference', inputType: 'text' },
          }}
          initialValues={{
            at: Math.floor(new Date().getTime() / 1000),
            donationAmount: 0,
            contributionAmount: 0,
            method: 'cash',
            reference: '',
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            await axios.post<string>(`/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments`, data);
            await Promise.all([refetchPayments(), refetchDonations()]);
            setNewPaymentModalOpen(false);
          }}
        />
      </Modal>
      <Table
        definition={{
          at: { label: 'At', formatter: format.timestamp },
          donationAmount: { label: 'Donation', formatter: (v: number) => format.amount(fundraiser.data?.currency, v) },
          contributionAmount: { label: 'Contribution', formatter: (v: number) => format.amount(fundraiser.data?.currency, v) },
          matchFundingAmount: { label: 'Match funding', formatter: (v: number | null) => format.amount(fundraiser.data?.currency, v) },
          method: { label: 'Method' },
          status: { label: 'Status' },
        }}
        items={asResponseValues(payments.data?.sort((a, b) => b.at - a.at), payments)}
        href={(payment) => `/admin/${fundraiserId}/${donationId}/${payment.id}`}
      />

      <SectionTitle className="mt-12">Public preview</SectionTitle>
      {donation.loading && (
        <DonationCard
          loading
          createdAt="1 hour ago"
          className="bg-raise-red"
          donorName={'a'.repeat(12)}
          matchFundingAmount={1234}
          comment={'a'.repeat(24)}
        />
      )}
      {donation.data?.overallPublic === false && <p>Donation is not publicly viewable</p>}
      {donation.data?.overallPublic && (
        <DonationCard
          createdAt={donation.data.createdAt}
          className="bg-raise-red"
          donorName={donation.data.namePublic ? donation.data.donorName : undefined}
          currency={donation.data.donationAmountPublic ? fundraiser.data?.currency : undefined}
          donationAmount={donation.data.donationAmountPublic ? donation.data.donationAmount : undefined}
          recurringAmount={donation.data.donationAmountPublic ? donation.data.recurringAmount : undefined}
          matchFundingAmount={donation.data.donationAmountPublic ? donation.data.matchFundingAmount : undefined}
          recurrenceFrequency={donation.data.donationAmountPublic ? donation.data.recurrenceFrequency : undefined}
          giftAid={donation.data.donationAmountPublic ? donation.data.giftAid : undefined}
          comment={donation.data.comment}
        />
      )}

    </Section>
  );
};

export default DonationPage;
