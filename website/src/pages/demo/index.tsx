import * as React from "react"
import Helmet from "react-helmet"

import Page from "../../components/Page"
import Section, { SectionTitle } from "../../components/Section"
import Navigation from "../../components/Navigation"
import FAQs, { FAQ } from "../../components/FAQs"
import Philosophy from "../../components/Philosophy"
import ContactForm from "../../components/ContactForm"
import Panel from "../../components/Panel"
import Footer from "../../components/Footer"

import logo from "../../images/logo.png"
import moneyBox from "../../images/moneyBox.svg"
import doubled from "../../images/doubled.png"
import party from "../../images/party.svg"
import Button from "../../components/Button"
import IntroFundraiser from "../../components/IntroFundraiser"

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise Demo</title>
      <meta property="og:title" content="Raise Demo" />
    </Helmet>

    <Navigation
      left={[
        { text: "Home", href: "/demo/" },
        { text: "How It Works", href: "/demo/#how-it-works" },
        { text: "FAQs", href: "/demo/#faq" },
        { text: "Our Philosophy", href: "/demo/#our-philosophy" },
        { text: "Contact", href: "/demo/#contact" },
      ]}
      right={[
        // { text: "Get Involved!", href: "https://example.com" },
      ]}
    />

    <Section>
      <IntroFundraiser
        title="Raise Demo"
        tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving."
        fundraiserId="01FGNSHH6X6X878ZNBZKY44JQA"
      />
    </Section>

    <Section id="how-it-works">
      <SectionTitle>How it Works</SectionTitle>
      <div className="grid gap-5 md:grid-cols-3 md:gap-8">
        <Panel
          image={moneyBox}
          title="Donate"
          text="We invite students to make a personally significant donation to charity. We recommend a donation of £150 to the Against Malaria Foundation, but welcome any amount that is significant to you."
          className="bg-raise-purple"
        />
        <Panel
          image={doubled}
          title="Doubled"
          text="Thanks to our matched funding, 200% of the money you donate goes directly to AMF. That means that your £150, when doubled, can help protect over 350 people from malaria!"
          className="bg-raise-red"
        />
        <Panel
          image={party}
          title="Celebrate"
          text="In third term, we come together as a community to celebrate the end of the academic year and our collective impact. There's food and drink, great company and live entertainment!"
          className="bg-raise-yellow text-black"
        />
      </div>
    </Section>

    <Section id="faq">
      <SectionTitle>More Info</SectionTitle>
      <FAQs>
        <FAQ title="Sounds great, where do I sign up?">
          <p>Awesome! This isn't a real chapter, but you can view our real ones <a href="/">here</a>!</p>
        </FAQ>

        <FAQ title="How can I get involved?">
          <p>We're so pleased you're interested in Raise, and look forward to celebrating with you!</p>
          <p>If you're interested in helping out, <a href="/demo/#contact">get in touch</a>.</p>
        </FAQ>
      </FAQs>
      
      <FAQ title="What about COVID-19?">
        <p>Naturally, we are aware that the COVID-19 pandemic may affect the ways in which we can come together over the course of this year, and we are keeping a close eye on the local and national guidance at every stage. However, even if we are not able to come together as an entire community, this will not stop us from marking the end of the year in true Raise style.  Whether in smaller groups or all together, we aim to create a meaningful and enjoyable format to bring the community together and celebrate our collective impact under these different circumstances.</p>
      </FAQ>
    </Section>

    <Section id="our-philosophy">
      <SectionTitle>Our Philosophy</SectionTitle>
      <Philosophy />
    </Section>

    <Section id="contact">
      <SectionTitle>Get in Touch</SectionTitle>
      <ContactForm className="mt-8" action="https://formspree.io/f/mnqlrnvq" />
    </Section>

    <Footer />
  </Page>
)

export default IndexPage
