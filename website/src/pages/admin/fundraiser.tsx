import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import useAxios from "../../components/useAxios"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser, Donation } from "./types.d"
import Table, { amountFormatter, matchFundingRateFormatter, timestampFormatter } from "../../components/Table"

const FundraiserPage: React.FC<RouteComponentProps & { fundraiserId?: string }> = ({ fundraiserId }) => {
  const [fundraisers, refetchFundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)

  const fundraiser = fundraisers.data?.find((f) => f.id === fundraiserId)

  return (
    <Section>
      <SectionTitle>{fundraiser?.name || "Fundraiser"}</SectionTitle>
      <Table
        definition={{
          label: { label: "Property" },
          value: { label: "Value" },
        }}
        items={[{
          property: "name",
          label: "Name",
          value: fundraiser?.name,
          type: "text",
        }, {
          property: "activeFrom",
          label: "From",
          value: timestampFormatter(fundraiser?.activeFrom),
          type: "timestamp",
        }, {
          property: "activeTo",
          label: "To",
          value: timestampFormatter(fundraiser?.activeFrom),
          type: "timestamp",
        }, {
          property: "totalRaised",
          label: "Total",
          value: amountFormatter(fundraiser?.totalRaised),
          type: "amount",
        }, {
          property: "goal",
          label: "Goal",
          value: amountFormatter(fundraiser?.goal),
          type: "amount",
        }, {
          property: "matchFundingRate",
          label: "Match funding rate",
          value: matchFundingRateFormatter(fundraiser?.matchFundingRate),
          type: "matchFundingRate",
        }, {
          property: "matchFundingPerDonationLimit",
          label: "Match funding per donation limit",
          value: amountFormatter(fundraiser?.matchFundingPerDonationLimit),
          type: "amount",
        }, {
          property: "matchFundingRemaining",
          label: "Match funding remaining",
          value: amountFormatter(fundraiser?.matchFundingRemaining),
          type: "amount",
        }, {
          property: "minimumDonationAmount",
          label: "Minimum donation amount",
          value: amountFormatter(fundraiser?.minimumDonationAmount),
          type: "amount",
        }]}
        primaryKey="property"
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
