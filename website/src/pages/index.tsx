import * as React from "react"
import Helmet from "react-helmet"

import Page from "../components/Page"
import Section, { SectionTitle } from "../components/Section"
import Navigation from "../components/Navigation"
import Cover, { CTADown } from "../components/Cover"
import IntroStats from "../components/IntroStats"
import Philosophy from "../components/Philosophy"
import PhilosophyV2 from "../components/PhilosophyV2"
import ContactForm from "../components/ContactForm"
import Footer from "../components/Footer"
import env from "../env/env"

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
          { text: "Sheffield", href: "/sheffield/" },
          { text: "Warwick", href: "/warwick/" },
          { text: "Alumni", href: "/alumni/" },
        ]}
        right={[
        ]}
      />
      <Section className="px-8">
        <IntroStats
          title="Raise: A Celebration of Giving"
          tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving. Check out our chapter websites to learn more about what we do."
          statistics={{
            years: 4,
            students: 1366,
            raised: 284581,
            protected: 340013,
          }}
        />
      </Section>
      <CTADown
        text="Our philosophy"
        href="#our-philosophy"
      />
    </Cover>

    {env.STAGE === "prod" ? (
      <Section id="our-philosophy">
        <SectionTitle>Our Philosophy</SectionTitle>
        <Philosophy />
      </Section>
    ) : <PhilosophyV2 />}

    <Section id="contact">
      <SectionTitle>Get in Touch</SectionTitle>
      <ContactForm className="mt-8" action="https://formspree.io/f/mnqlrnvq" />
    </Section>

    <Footer />
  </Page>
)

export default IndexPage
