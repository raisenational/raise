import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { navigate } from "gatsby"

import { useAxios } from "../../components/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser } from "./types.d"
import Table, { amountFormatter, dateFormatter } from "../../components/Table"

const FundraisersPage: React.FC<RouteComponentProps> = () => {
  const [fundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")

  return (
    <Section>
      <SectionTitle>Fundraisers</SectionTitle>
      <Table
        definition={{
          fundraiserName: { label: "Name", className: "whitespace-nowrap" },
          activeFrom: { label: "From", formatter: dateFormatter, className: "w-36" },
          activeTo: { label: "To", formatter: dateFormatter, className: "w-36" },
          goal: { label: "Goal", formatter: amountFormatter, className: "w-36" },
          totalRaised: { label: "Raised", formatter: amountFormatter, className: "w-36" },
        }}
        items={fundraisers}
        onClick={(fundraiser) => navigate(`/admin/${fundraiser.id}/`)}
      />
    </Section>
  )
}

export default FundraisersPage
