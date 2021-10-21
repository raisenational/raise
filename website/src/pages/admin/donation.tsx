import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import { PlusSmIcon } from "@heroicons/react/outline"
import { asResponseValues, useAxios, useRawAxios } from "../../components/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Donation } from "./types.d"
import Table, {
  amountFormatter, booleanFormatter, timestampFormatter,
} from "../../components/Table"
import PropertyEditor from "../../components/PropertyEditor"
import Button from "../../components/Button"

const DonationPage: React.FC<RouteComponentProps & { fundraiserId?: string, donationId?: string }> = ({ fundraiserId, donationId }) => {
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)
  const axios = useRawAxios()

  const donation = asResponseValues(donations.data?.find((d) => d.fundraiserId === fundraiserId && d.id === donationId), donations)
  const payments = asResponseValues(donation.data?.payments, donation)
  const giftAidEditWarning = "We must hold accurate names and addresses for gift-aided donations as per the Income Tax Act 2007"
  const amountEditWarning = "Do not edit amounts unless you know what you are doing. This will not update the fundraiser totals."

  return (
    <Section>
      <SectionTitle>{donation.data?.donorName ? `Donation from ${donation.data?.donorName}` : "Donation"}</SectionTitle>
      <PropertyEditor
        definition={{
          donorName: { label: "Donor name", inputType: "text", warning: giftAidEditWarning },
          donorEmail: { label: "Donor email", inputType: "email" },
          createdAt: { label: "At", formatter: timestampFormatter, inputType: "datetime-local" },
          addressLine1: { label: "Address line 1", inputType: "text", warning: giftAidEditWarning },
          addressLine2: { label: "Address line 2", inputType: "text", warning: giftAidEditWarning },
          addressLine3: { label: "Address line 3", inputType: "text", warning: giftAidEditWarning },
          addressPostcode: { label: "Address postcode", inputType: "text", warning: giftAidEditWarning },
          addressCountry: { label: "Address country", inputType: "text", warning: giftAidEditWarning },
          donationAmount: {
            label: "Donation amount", formatter: amountFormatter, inputType: "amount", warning: amountEditWarning,
          },
          matchFundingAmount: {
            label: "Match funding amount", formatter: amountFormatter, inputType: "amount", warning: amountEditWarning,
          },
          contributionAmount: {
            label: "Raise contribution amount", formatter: amountFormatter, inputType: "amount", warning: amountEditWarning,
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
          await axios.patch(`/admin/fundraisers/${fundraiserId}/donations/${donationId}`, data)
          refetchDonations()
        }}
      />

      <div className="flex mt-12">
        <SectionTitle className="flex-1">Payments</SectionTitle>
        <Button onClick={() => alert("TODO: record manual payment")} disabled><PlusSmIcon className="h-6 mb-1" /> Record manual payment</Button>
      </div>
      <Table
        definition={{
          at: { label: "At", formatter: timestampFormatter },
          amount: { label: "Amount", formatter: amountFormatter },
          method: { label: "Method" },
          reference: { label: "Ref" },
        }}
        items={payments}
      />

      {/* TODO: maybe helpful to have a preview of how the user's donation will display on the site? */}
    </Section>
  )
}

export default DonationPage
