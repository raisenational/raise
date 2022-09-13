import * as React from "react"
import Helmet from "react-helmet"

import Page from "../components/Page"
import Section, { SectionTitle } from "../components/Section"
import Navigation from "../components/Navigation"
import Cover, { CTADown } from "../components/Cover"
import IntroStats from "../components/IntroStats"
import PhilosophyV2 from "../components/PhilosophyV2"
import ContactForm from "../components/ContactForm"
import Footer from "../components/Footer"
import SocialIcon from "../components/SocialIcon"

import email from "../images/email.svg"

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise: A charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving</title>
      <meta property="og:title" content="Raise: A charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving" />
    </Helmet>
    <Cover>
      <Navigation
        left={[
          { text: "Alumni", href: "/alumni/" },
          { text: "Bristol", href: "/bristol/" },
          { text: "Cambridge", href: "https://www.mayweekalternative.org.uk/" },
          { text: "Durham", href: "/durham/" },
          { text: "Edinburgh", href: "/edinburgh/" },
          { text: "Glasgow", href: "/glasgow/" },
          { text: "Oxford", href: "/oxford/" },
          { text: "Sheffield", href: "/sheffield/" },
          { text: "Warwick", href: "/warwick/" },
        ]}
        right={[
        ]}
      />
      <Section className="px-8 my-16">
        <IntroStats
          title="Raise: A Celebration of Giving"
          tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving. Check out our chapter websites to learn more about what we do."
          statistics={{
            years: 5,
            students: 2099,
            raised: 382739,
            protected: 455285,
          }}
        />

        <iframe className="w-full max-w-2xl mx-auto mt-12 rounded shadow-raise" title="YouTube: Raise: A Celebration of Giving" width="672" height="378" src="https://www.youtube-nocookie.com/embed/6bEloAzIV2c?rel=0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </Section>
      <CTADown
        text="Our philosophy"
        href="#our-philosophy"
      />
    </Cover>

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
