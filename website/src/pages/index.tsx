import * as React from "react"
import Helmet from "react-helmet"

import { convert } from "@raise/shared"
import Page from "../components/Page"
import Section, { SectionTitle } from "../components/Section"
import Navigation from "../components/Navigation"
import { CTADown } from "../components/Cover"
import IntroStats from "../components/IntroStats"
import PhilosophyV2 from "../components/PhilosophyV2"
import ContactForm from "../components/ContactForm"
import Footer from "../components/Footer"
import SocialIcon from "../components/SocialIcon"

import email from "../images/email.svg"

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise</title>
      <meta property="og:title" content="Raise" />
    </Helmet>
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
    <Section className="px-8 my-16">
      <IntroStats
        title="Raise: A Celebration of Giving"
        tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving. Check out our chapter websites to learn more about what we do."
        statistics={{
          years: 4 + 1,
          students: 1366 + 733,
          raised: 284581 + 100445,
          protected: 340013 + convert.moneyToPeopleProtected("gbp", 10044544),
        }}
      />

    </Section>
    <CTADown
      text="Our philosophy"
      href="#our-philosophy"
    />

    <PhilosophyV2 />

    <Section id="contact">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="flex justify-center gap-8">
        <SocialIcon icon={email} alt="Email" href="mailto:raisenational@gmail.com" />
      </div>
      <ContactForm className="mt-8" action="https://formspree.io/f/mnqlrnvq" />
    </Section>

    <Footer />
  </Page>
)

export default IndexPage
