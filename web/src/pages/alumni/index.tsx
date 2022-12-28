import * as React from "react"
import Helmet from "react-helmet"

import { UserGroupIcon } from "@heroicons/react/outline"
import Page from "../../components/Page"
import Section, { SectionTitle } from "../../components/Section"
import Navigation from "../../components/Navigation"
import Cover, { CTADown } from "../../components/Cover"
import IntroStats from "../../components/IntroStats"
import FAQs, { FAQ } from "../../components/FAQs"
import PhilosophyV2 from "../../components/Philosophy"
import ContactForm from "../../components/ContactForm"
import SocialIcon from "../../components/SocialIcon"
import Panel from "../../components/Panel"
import Button from "../../components/Button"

import facebook from "../../images/facebook.svg"
import email from "../../images/email.svg"
import { MoneyBox, Party } from "../../images/Icons"
import Footer from "../../components/Footer"
import Link from "../../components/Link"

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise Alumni</title>
      <meta property="og:title" content="Raise Alumni" />
    </Helmet>
    <Cover>
      <Navigation
        left={[
          { text: "Home", href: "." },
          { text: "How It Works", href: "#how-it-works" },
          { text: "FAQs", href: "#faq" },
          { text: "Our Philosophy", href: "#our-philosophy" },
          { text: "Contact", href: "#contact" },
        ]}
        right={[
          { text: "Join Facebook group", href: "https://www.facebook.com/groups/966154864287768" },
        ]}
      />
      <Section className="px-8">
        <IntroStats
          title="Raise Alumni"
          tagline="Raise is a charitable movement encouraging students to adopt a positive approach towards deliberate, effective giving. Check out our national impact below."
          statistics={{
            years: 5,
            students: 2099,
            raised: 382739,
            protected: 455285,
          }}
        />
        <div className="mb-12">
          <Button variant="outline" size="large" className="mt-4" href="https://www.facebook.com/groups/966154864287768">Join Facebook group</Button>
        </div>
      </Section>
      <CTADown
        text="How it works"
        href="#how-it-works"
      />
    </Cover>

    <Section id="how-it-works" className="mt-0">
      <SectionTitle>How it Works</SectionTitle>
      <div className="grid gap-5 md:grid-cols-3 md:gap-8">
        <Panel
          image={<MoneyBox className="h-16 mb-4" />}
          title="Donate"
          text="We invite you to make a personally significant donation to charity as a way of celebrating giving. We welcome any amount that is significant to you."
          className="bg-raise-purple"
        />
        <Panel
          image={<Party className="h-16 mb-4" />}
          title="Celebrate"
          text="At the end of the donations period, we'll come together as a community to celebrate our collective impact at an event in London. We're also looking into inviting alumni back to their affiliated university chapter's summer party."
          className="bg-raise-red"
        />
        <Panel
          image={<UserGroupIcon className="h-16 mb-4" />}
          title="Connect"
          text="We'll bring the Raise alumni community together through both virtual and in-person events, continuing with our ultimate goal of encouraging a positive approach towards deliberate, effective giving."
          className="bg-raise-yellow text-black"
        />
      </div>

      <iframe className="w-full max-w-2xl mx-auto mt-12 rounded shadow-raise" title="YouTube: Raise: A Celebration of Giving" width="672" height="378" src="https://www.youtube-nocookie.com/embed/6bEloAzIV2c?rel=0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    </Section>

    <Section id="faq">
      <SectionTitle>More Info</SectionTitle>
      <FAQs>
        <FAQ title="How can I get involved?">
          <p>First off, we're so glad you had good experiences with Raise that you want to stay involved with the Raise community. We'd love your support, and to stay in touch whether or not you do any of the following.</p>
          <p><b>Facebook group:</b> To foster a two-way dialogue, you're invited to join our <Link href="https://www.facebook.com/groups/966154864287768">Facebook group</Link>. This is probably the first place to see what we're up to and how things are going.</p>
          <p><b>Advisory board:</b> We'd love alumni to get involved in steering the direction of Raise or picking up more self-contained projects. To do this, we've set up an advisory board of trusted Raise members who meet on a (semi-) regular basis to discuss what's going on with Raise. Get in touch if this sounds interesting to you!</p>
          <p><b>Helping us grow:</b> Are you able to help us by sponsoring Raise's efforts (whether through in-kind or direct donations), or know someone who can? Do you have some free time to improve how we run our operations, or mentor new chapters? Whatever it is, we'd love to hear from you!</p>
        </FAQ>

        <FAQ title="For the donations push, can I donate to a different charity?">
          <p>At Raise, we think very carefully about which charity to recommend (see below), particularly given how much money you're donating. However, we recognise that you might want to join us in celebrating through giving to a different charity. This is absolutely fine, but please get in touch with us beforehand so that we are aware.</p>
          <p>To make our decision to recommend the Against Malaria Foundation (AMF), we have taken the advice of independent charity evaluators <a href="https://www.givewell.org/charities/top-charities">GiveWell</a> and <a href="https://www.givingwhatwecan.org">Giving What We Can</a>, which both rank AMF as one of the most effective charities in the world.</p>
          <p>Tragically, malaria causes 400,000 preventable deaths every year, disproportionately affecting young children and pregnant women, and has a knock-on effect on the local economy. AMF works with local partners to provide life-saving bed-nets which protect people as they sleep. To find out more about their work, see <a href="https://www.againstmalaria.com/">AMF's website</a>. The specific net distributions for which we have funded nets can be seen on <a href="https://www.againstmalaria.com/FundraiserGroup.aspx?FundraiserID=8339">Raise's dedicated AMF page</a>.</p>
          <p>Because AMF's intervention is so effective at preventing malaria, each donation can have a huge impact. In fact, the money we raised nationally in 2020 was enough to protect over 120,000 people!</p>
        </FAQ>
      </FAQs>
      <Button variant="outline" className="mt-4" href="https://www.facebook.com/groups/966154864287768">Join Facebook group</Button>
    </Section>

    <PhilosophyV2 />

    <Section id="contact">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="flex justify-center gap-8">
        <SocialIcon icon={facebook} alt="Facebook" href="https://www.facebook.com/groups/966154864287768" />
        <SocialIcon icon={email} alt="Email" href="mailto:raisenational@gmail.com" />
      </div>
      <ContactForm className="mt-8" action="https://formspree.io/f/mnqlrnvq" />
    </Section>

    <Footer />
  </Page>
)

export default IndexPage
