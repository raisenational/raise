import * as React from "react"
import { navigate, RouteComponentProps } from "@reach/router"

import { PlusSmIcon } from "@heroicons/react/outline"
import { asResponseValues, useAxios, useRawAxios } from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Donation, Payment, PaymentCreation } from "./types.d"
import Table from "../../components/Table"
import PropertyEditor from "../../components/PropertyEditor"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import { Form } from "../../components/Form"
import { amountFormatter, booleanFormatter, timestampFormatter } from "../../helpers/format"

const DonationPage: React.FC<RouteComponentProps & { fundraiserId?: string, donationId?: string }> = ({ fundraiserId, donationId }) => {
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)
  const [payments, refetchPayments] = useAxios<Payment[]>(`/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments`)
  const axios = useRawAxios()

  const [newPaymentModalOpen, setNewPaymentModalOpen] = React.useState(false)

  const donation = asResponseValues(donations.data?.find((d) => d.fundraiserId === fundraiserId && d.id === donationId), donations)
  const giftAidEditWarning = "We must hold accurate names and addresses for gift-aided donations as per the Income Tax Act 2007"
  const amountEditWarning = "Do not edit amounts unless you know what you are doing. This will not update the fundraiser totals."
  const frequencyEditWarning = "Do not edit the frequency of payments unless you know what you are doing. This will not update the payments."
  const stripeCustomerIdWarning = "Do not edit the Stripe customer ID unless you know what you are doing"
  const stripePaymentMethodIdWarning = "Do not edit the Stripe payment method id unless you know what you are doing"

  return (
    <Section>
      <SectionTitle>{donation.data?.donorName ? `Donation from ${donation.data?.donorName}` : "Donation"}</SectionTitle>
      <PropertyEditor
        definition={{
          donorName: { label: "Donor name", inputType: "text", warning: giftAidEditWarning },
          donorEmail: { label: "Donor email", inputType: "email" },
          emailConsentInformational: { label: "Email consent: informational", formatter: booleanFormatter, inputType: "checkbox" },
          emailConsentMarketing: { label: "Email consent: marketing", formatter: booleanFormatter, inputType: "checkbox" },
          createdAt: { label: "At", formatter: timestampFormatter, inputType: "datetime-local" },
          addressLine1: { label: "Address line 1", inputType: "text", warning: giftAidEditWarning },
          addressLine2: { label: "Address line 2", inputType: "text", warning: giftAidEditWarning },
          addressLine3: { label: "Address line 3", inputType: "text", warning: giftAidEditWarning },
          addressPostcode: { label: "Address postcode", inputType: "text", warning: giftAidEditWarning },
          addressCountry: { label: "Address country", inputType: "text", warning: giftAidEditWarning },
          donationAmount: {
            label: "Donation amount", formatter: amountFormatter, inputType: "amount", warning: amountEditWarning,
          },
          recurringAmount: {
            label: "Recurring payment amount", formatter: amountFormatter, inputType: "amount", warning: amountEditWarning,
          },
          recurrenceFrequency: {
            label: "Frequency of recurrence", inputType: "text", warning: frequencyEditWarning,
          },
          matchFundingAmount: {
            label: "Match funding amount", formatter: amountFormatter, inputType: "amount", warning: amountEditWarning,
          },
          contributionAmount: {
            label: "Raise contribution amount", formatter: amountFormatter, inputType: "amount", warning: amountEditWarning,
          },
          stripeCustomerId: {
            label: "Stripe customer ID", inputType: "text", warning: stripeCustomerIdWarning,
          },
          stripePaymentMethodId: {
            label: "Stripe payment method", inputType: "text", warning: stripePaymentMethodIdWarning,
          },
          giftAid: {
            label: "Gift-aided", formatter: booleanFormatter, inputType: "checkbox", warning: giftAidEditWarning,
          },
          charity: { label: "Designated charity", inputType: "text" },
          comment: { label: "Donor comment", inputType: "text" },
          overallPublic: { label: "Donation is public", formatter: booleanFormatter, inputType: "checkbox" },
          namePublic: { label: "Donor name is public", formatter: booleanFormatter, inputType: "checkbox" },
          donationAmountPublic: { label: "Donation amount is public", formatter: booleanFormatter, inputType: "checkbox" },
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
          })
          refetchDonations()
        }}
      />

      <div className="flex mt-12">
        <SectionTitle className="flex-1">Payments</SectionTitle>
        <Button onClick={() => setNewPaymentModalOpen(true)}><PlusSmIcon className="h-6 mb-1" /> Record manual payment</Button>
      </div>
      <Modal open={newPaymentModalOpen} onClose={() => setNewPaymentModalOpen(false)}>
        <Form<PaymentCreation>
          title="New payment"
          definition={{
            at: { inputType: "hidden" },
            donationAmount: { label: "Donation amount", formatter: amountFormatter, inputType: "amount" },
            contributionAmount: { label: "Contribution amount", formatter: amountFormatter, inputType: "amount" },
            method: {
              label: "Method", inputType: "select", selectOptions: ["cash", "direct_to_charity"],
            },
            reference: { label: "Reference", inputType: "text" },
          }}
          initialValues={{
            at: Math.floor(new Date().getTime() / 1000),
            donationAmount: 0,
            contributionAmount: 0,
            method: "cash",
            reference: "",
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            await axios.post<string>(`/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments`, data)
            await refetchPayments()
            setNewPaymentModalOpen(false)
          }}
        />
      </Modal>
      <Table
        definition={{
          at: { label: "At", formatter: timestampFormatter },
          donationAmount: { label: "Donation", formatter: amountFormatter },
          contributionAmount: { label: "Contribution", formatter: amountFormatter },
          matchFundingAmount: { label: "Match funding", formatter: amountFormatter },
          method: { label: "Method" },
          status: { label: "Status" },
        }}
        items={payments}
        onClick={(payment) => navigate(`/admin/${fundraiserId}/${donationId}/${payment.id}`)}
      />

      {/* TODO: maybe helpful to have a preview of how the user's donation will display on the site? */}
    </Section>
  )
}

export default DonationPage
