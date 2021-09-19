import * as React from "react"
import Helmet from "react-helmet"

import Page from "../components/Page"
import { SectionNoPadding } from "../components/Section"
import Navigation from "../components/Navigation"
import Cover from "../components/Cover"
import IntroStats from "../components/IntroStats"

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise</title>
      <meta property="og:title" content="Raise" />
    </Helmet>
    <Cover>
      <Navigation
        left={[
          { text: "Cambridge", href: "https://www.mayweekalternative.org.uk/" },
          { text: "Durham", href: "/durham/" },
          { text: "Glasgow", href: "/glasgow/" },
          { text: "Oxford", href: "/oxford/" },
        ]}
        right={[
        ]}
      />
      <SectionNoPadding className="m-auto px-8 pb-8">
        <IntroStats
          title="Raise: A Celebration of Giving"
          tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving. Check out our four chapter websites to learn more about what we do."
          statistics={{
            years: 4,
            students: 1366,
            raised: 284581,
            protected: 340013,
          }}
        />
      </SectionNoPadding>
    </Cover>
  </Page>
)

export default IndexPage
