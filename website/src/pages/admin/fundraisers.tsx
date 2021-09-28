import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import useAxios from "../../components/useAxios"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser } from "./types"
import Table, { amountFormatter, dateFormatter } from "../../components/Table"

const Fundraisers: React.FC<RouteComponentProps> = () => {
  const [fundraisers, refetchFundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")

  return (
    <Section>
      <SectionTitle>Fundraisers</SectionTitle>
      <Table
        definition={{
          name: { label: "Name", className: "whitespace-nowrap" },
          activeFrom: { label: "From", formatter: dateFormatter, className: "w-36" },
          activeTo: { label: "To", formatter: dateFormatter, className: "w-36" },
          goal: { label: "Goal", formatter: amountFormatter, className: "w-36" },
          totalRaised: { label: "Raised", formatter: amountFormatter, className: "w-36" },
        }}
        items={fundraisers}
        onClick={(i) => alert("TODO: open fundraiser")}
      />
    </Section>
  )
}

export default Fundraisers
