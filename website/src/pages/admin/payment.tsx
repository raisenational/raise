import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { ExternalLinkIcon, ReceiptRefundIcon } from "@heroicons/react/outline"
import {
  format, Donation, Payment, PaymentCreation,
} from "@raise/shared"
import { asResponseValues, useAxios, useRawAxios } from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import PropertyEditor from "../../components/PropertyEditor"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import { Form } from "../../components/Form"

const PaymentPage: React.FC<RouteComponentProps & { fundraiserId?: string, donationId?: string, paymentId?: string }> = ({ fundraiserId, donationId, paymentId }) => {
  const [payments, refetchPayments] = useAxios<Payment[]>(`/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments`)
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)
  const axios = useRawAxios()

  const [refundModalOpen, setRefundModalOpen] = React.useState(false)

  const payment = asResponseValues(payments.data?.find((d) => d.fundraiserId === fundraiserId && d.donationId === donationId && d.id === paymentId), payments)
  const donation = asResponseValues(donations.data?.find((d) => d.fundraiserId === fundraiserId && d.id === donationId), donations)

  return (
    <Section>
      <div className="flex mt-12">
        <SectionTitle className="flex-1">{donation.data?.donorName ? `Payment from ${donation.data?.donorName}` : "Payment"}</SectionTitle>
        {payment.data?.method === "card" && payment.data.reference && <Button href={`https://dashboard.stripe.com/payments/${payment.data?.reference}`} target="_blank"><ExternalLinkIcon className="h-6 mb-1" /> View on Stripe</Button>}
        {(payment.data?.status === "paid" && (payment.data.donationAmount + payment.data.contributionAmount + (payment.data.matchFundingAmount ?? 0)) > 0) && <Button onClick={() => setRefundModalOpen(true)}><ReceiptRefundIcon className="h-6 mb-1" /> Mark refunded</Button>}
      </div>
      <Modal open={refundModalOpen} onClose={() => setRefundModalOpen(false)}>
        <Form<PaymentCreation>
          title={`Mark payment ${donation.data?.donorName ? `from ${donation.data?.donorName}` : ""} as refunded`}
          warning={`This marks the payment as refunded in the Raise platform, but does not actually refund it.${payment.data?.method === "card" ? " You probably want to also refund it in the Stripe dashboard." : ""}`}
          definition={{
            at: { inputType: "hidden" },
            donationAmount: { label: "Refunded donation amount", formatter: format.amount, inputType: "amount" },
            contributionAmount: { label: "Refunded contribution amount", formatter: format.amount, inputType: "amount" },
            matchFundingAmount: { label: "Refunded match funding amount", formatter: format.amount, inputType: "amount" },
            method: { inputType: "hidden" },
            reference: { inputType: "hidden" },
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
            await axios.post<string>(`/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments`, {
              ...data,
              donationAmount: data.donationAmount !== undefined ? -data.donationAmount : 0,
              contributionAmount: data.contributionAmount !== undefined ? -data.contributionAmount : 0,
              matchFundingAmount: data.matchFundingAmount !== undefined && data.matchFundingAmount !== null ? -data.matchFundingAmount : 0,
            })
            await refetchPayments()
            setRefundModalOpen(false)
          }}
        />
      </Modal>
      <PropertyEditor
        definition={{
          at: { label: "At", formatter: format.timestamp },
          donationAmount: { label: "Donation", formatter: format.amount, inputType: "amount" },
          contributionAmount: { label: "Contribution", formatter: format.amount, inputType: "amount" },
          matchFundingAmount: { label: "Match funding", formatter: format.amount, inputType: "amount" },
          method: { label: "Method" },
          reference: { label: "Ref", inputType: payment.data?.method === "card" ? undefined : "text" },
          status: { label: "Status", selectOptions: ["cancelled"], inputType: "select" },
        }}
        item={payment}
        onSave={async (data) => {
          await axios.patch(`/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments/${paymentId}`, data)
          refetchPayments()
        }}
      />
    </Section>
  )
}

export default PaymentPage
