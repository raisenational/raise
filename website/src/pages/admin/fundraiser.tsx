import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import useAxios from "../../components/useAxios"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser, Donation } from "./types.d"
import Table, { amountFormatter, percentFormatter, timestampFormatter } from "../../components/Table"

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
          editor: "text",
        }, {
          property: "activeFrom",
          label: "From",
          value: timestampFormatter(fundraiser?.activeFrom),
          editor: "timestamp",
        }, {
          property: "activeTo",
          label: "To",
          value: timestampFormatter(fundraiser?.activeFrom),
          editor: "timestamp",
        }, {
          property: "totalRaised",
          label: "Total",
          value: amountFormatter(fundraiser?.totalRaised),
          editor: "amount_warn",
        }, {
          property: "goal",
          label: "Goal",
          value: amountFormatter(fundraiser?.goal),
          editor: "amount",
        }, {
          property: "matchFundingRate",
          label: "Match funding rate",
          value: percentFormatter(fundraiser?.matchFundingRate),
          editor: "matchFunding",
        }, {
          property: "matchFundingPerDonationLimit",
          label: "Match funding per donation limit",
          value: amountFormatter(fundraiser?.matchFundingPerDonationLimit),
          editor: "amount",
        }, {
          property: "matchFundingRemaining",
          label: "Match funding remaining",
          value: amountFormatter(fundraiser?.matchFundingRemaining),
          editor: "amount_warn",
        }, {
          property: "minimumDonationAmount",
          label: "Minimum donation amount",
          value: amountFormatter(fundraiser?.minimumDonationAmount),
          editor: "amount",
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
