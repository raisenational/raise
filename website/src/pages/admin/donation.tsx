import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import { asResponseValues, useAxios } from "../../components/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Donation } from "./types.d"
import {
  amountFormatter, booleanFormatter, timestampFormatter,
} from "../../components/Table"
import PropertyEditor from "../../components/PropertyEditor"

const DonationPage: React.FC<RouteComponentProps & { fundraiserId?: string, donationId?: string }> = ({ fundraiserId, donationId }) => {
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)

  const donation = asResponseValues(donations.data?.find((d) => d.fundraiserId === fundraiserId && d.id === donationId), donations)
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
          paymentMethod: { label: "Payment method", inputType: "select", selectOptions: ["card", "cash", "direct_to_charity"] },
          payments: { label: "Payments", formatter: (p: { at: number, amount: number }[]) => JSON.stringify(p) }, // TODO: display better, maybe in their own table?
          paymentGatewayId: { label: "Payment reference", inputType: "text" },
          charity: { label: "Designated charity", inputType: "text" },
          comment: { label: "Donor comment", inputType: "text" },
          overallPublic: { label: "Donation is public", formatter: booleanFormatter, inputType: "checkbox" },
          namePublic: { label: "Donor name is public", formatter: booleanFormatter, inputType: "checkbox" },
          commentPublic: { label: "Comment is public", formatter: booleanFormatter, inputType: "checkbox" },
          donationAmountPublic: { label: "Donation amount is public", formatter: booleanFormatter, inputType: "checkbox" },
        }}
        item={donation}
        onSave={() => { refetchDonations() }}
        patchEndpoint={`/admin/fundraisers/${fundraiserId}/donations/${donationId}`}
      />

      {/* TODO: maybe helpful to have a preview of how the user's donation will display on the site? */}
    </Section>
  )
}

export default DonationPage
