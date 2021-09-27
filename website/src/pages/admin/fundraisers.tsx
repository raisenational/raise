import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import Section, { SectionTitle } from "../../components/Section"

const Fundraisers: React.FC<RouteComponentProps> = () => (
  <Section>
    <SectionTitle>Fundraisers</SectionTitle>
    <p>Fundraisers would appear here</p>
  </Section>
)

export default Fundraisers
