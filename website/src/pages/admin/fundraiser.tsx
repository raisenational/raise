import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import useAxios from "../../components/useAxios"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser, Donation } from "./types.d"
import Table, { amountFormatter, matchFundingRateFormatter, timestampFormatter } from "../../components/Table"
import PropertyEditor from "../../components/PropertyEditor"

const FundraiserPage: React.FC<RouteComponentProps & { fundraiserId?: string }> = ({ fundraiserId }) => {
  const [fundraisers, refetchFundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)

  const fundraiser = fundraisers.data?.find((f) => f.id === fundraiserId)

  return (
    <Section>
      <SectionTitle>{fundraiser?.name || "Fundraiser"}</SectionTitle>
      <PropertyEditor
        definition={{
          name: { label: "Name" },
          activeFrom: { label: "From", formatter: timestampFormatter },
          activeTo: { label: "To", formatter: timestampFormatter },
          totalRaised: { label: "Total", formatter: amountFormatter },
          goal: { label: "Goal", formatter: amountFormatter },
          matchFundingRate: { label: "Match funding rate", formatter: matchFundingRateFormatter },
          matchFundingPerDonationLimit: { label: "Match funding per donation limit", formatter: amountFormatter },
          matchFundingRemaining: { label: "Match funding remaining", formatter: amountFormatter },
          minimumDonationAmount: { label: "Minimum donation amount", formatter: amountFormatter },
        }}
        item={fundraiser}
      />

      <SectionTitle className="mt-12">Donations</SectionTitle>
      <Table
        definition={{
          name: { label: "Name" },
          email: { label: "Email" },
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
