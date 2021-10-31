import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { asResponseValues, useAxios, useRawAxios } from "../../components/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Donation, Payment } from "./types.d"
import { amountFormatter, timestampFormatter } from "../../helpers/format"
import PropertyEditor from "../../components/PropertyEditor"

const PaymentPage: React.FC<RouteComponentProps & { fundraiserId?: string, donationId?: string, paymentId?: string }> = ({ fundraiserId, donationId, paymentId }) => {
  const [payments, refetchPayments] = useAxios<Payment[]>(`/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments`)
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)

  const axios = useRawAxios()

  const payment = asResponseValues(payments.data?.find((d) => d.fundraiserId === fundraiserId && d.donationId === donationId && d.id === paymentId), payments)
  const donation = asResponseValues(donations.data?.find((d) => d.fundraiserId === fundraiserId && d.id === donationId), donations)

  return (
    <Section>
      <SectionTitle>{donation.data?.donorName ? `Payment from ${donation.data?.donorName}` : "Payment"}</SectionTitle>
      <PropertyEditor
        definition={{
          at: { label: "At", formatter: timestampFormatter },
          donationAmount: { label: "Donation", formatter: amountFormatter, inputType: "amount" },
          contributionAmount: { label: "Contribution", formatter: amountFormatter, inputType: "amount" },
          matchFundingAmount: { label: "Match funding", formatter: amountFormatter, inputType: "amount" },
          method: { label: "Method" },
          reference: { label: "Ref", inputType: "text" },
          status: { label: "Status", selectOptions: ["cancelled", "refunded"], inputType: "select" },
        }}
        item={payment}
        onSave={async (data) => {
          await axios.patch(`/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments/${paymentId}`, data)
          refetchPayments()
          refetchDonations()
        }}
      />
    </Section>
  )
}

export default PaymentPage
