import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import { asResponseValues, useAxios } from "../../components/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser, Donation } from "./types.d"
import Table, {
  amountFormatter, booleanFormatter, matchFundingRateFormatter, timestampFormatter,
} from "../../components/Table"
import PropertyEditor from "../../components/PropertyEditor"

const FundraiserPage: React.FC<RouteComponentProps & { fundraiserId?: string }> = ({ fundraiserId }) => {
  const [fundraisers, refetchFundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)

  const fundraiser = asResponseValues(fundraisers.data?.find((f) => f.id === fundraiserId), fundraisers)

  return (
    <Section>
      <SectionTitle>{fundraiser.data?.fundraiserName || "Fundraiser"}</SectionTitle>
      <PropertyEditor
        definition={{
          fundraiserName: { label: "Name", inputType: "text" },
          activeFrom: { label: "From", formatter: timestampFormatter, inputType: "datetime-local" },
          activeTo: { label: "To", formatter: timestampFormatter, inputType: "datetime-local" },
          paused: { label: "Paused", formatter: booleanFormatter, inputType: "checkbox" },
          goal: { label: "Goal", formatter: amountFormatter, inputType: "amount" },
          totalRaised: {
            label: "Total", formatter: amountFormatter, inputType: "amount", editWarning: "Do not edit this unless you know what you are doing",
          },
          donationsCount: {
            label: "Donor count", inputType: "number", editWarning: "Do not edit this unless you know what you are doing",
          },
          matchFundingRate: { label: "Match funding rate", formatter: matchFundingRateFormatter, inputType: "number" },
          matchFundingPerDonationLimit: { label: "Match funding per donation limit", formatter: amountFormatter, inputType: "amount" },
          matchFundingRemaining: {
            label: "Match funding remaining", formatter: amountFormatter, inputType: "amount", editWarning: "Do not edit this unless you know what you are doing",
          },
          minimumDonationAmount: { label: "Minimum donation amount", formatter: amountFormatter, inputType: "amount" },
          groupsWithAccess: {
            label: "Groups with access", formatter: (groups: string[]) => groups.join(", "), // inputType: "multiselect", selectOptions: ["National"],
          },
        }}
        item={fundraiser}
        onSave={() => { refetchFundraisers() }}
        patchEndpoint={`/admin/fundraisers/${fundraiserId}`}
      />

      <SectionTitle className="mt-12">Donations</SectionTitle>
      <Table
        definition={{
          donorName: { label: "Name" },
          donorEmail: { label: "Email" },
          createdAt: { label: "At", formatter: timestampFormatter },
          donationAmount: { label: "Amount", formatter: amountFormatter },
          matchFundingAmount: { label: "Matched", formatter: amountFormatter },
        }}
        items={donations}
        onClick={(i) => alert(`TODO: Open full donation details + editor for donation id ${i.id}`)}
      />
    </Section>
  )
}

export default FundraiserPage
