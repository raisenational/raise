import * as React from "react"
import Helmet from "react-helmet"

import Page from "../components/Page"
import Section, { SectionTitle } from "../components/Section"
import Navigation from "../components/Navigation"
import Table from "../components/Table"
import Footer from "../components/Footer"

const PrivacyPage = () => (
  <Page>
    <Helmet>
      <title>Privacy Policy - Raise</title>
      <meta property="og:title" content="Privacy Policy - Raise" />
    </Helmet>
    <Navigation
      left={[
        { text: "Cambridge", href: "https://www.mayweekalternative.org.uk/" },
        { text: "Durham", href: "/durham/" },
        { text: "Glasgow", href: "/glasgow/" },
        { text: "Oxford", href: "/oxford/" },
        { text: "Sheffield", href: "/sheffield/" },
        { text: "Warwick", href: "/warwick/" },
        { text: "Edinburgh", href: "/edinburgh/" },
        { text: "Alumni", href: "/alumni/" },
      ]}
      right={[
      ]}
    />

    <Section className="text-left">
      <SectionTitle>Raise Privacy Policy</SectionTitle>

      <p className="font-black font-raise-header mt-8">Who we are</p>
      <p>We are Raise, also known as May Week Alternative (MWA), a non-profit umbrella organisation that supports Raise chapters (local Raise groups). We are a data controller.</p>

      <p className="font-black font-raise-header mt-8">How to contact us</p>
      <p>You can contact us via email at raisenational@gmail.com.</p>

      <p className="font-black font-raise-header mt-8 mb-2">Why we process your personal data</p>
      <Table
        definition={{
          purpose: { label: "Purpose", className: "whitespace-pre-line align-top" },
          legalBasis: { label: "Legal basis", className: "whitespace-pre-line align-top" },
        }}
        items={[{
          purpose: `Maintaining members’ personal details (e.g. name and preferred contact details, year of study, degree subject, college), including to communicate with you.

          Maintaining a formal record of your activities with us.

          Managing events and attendance at events, for example knowing who to invite to an online social.

          Selecting and training members e.g. chapter committees and the Raise National team.

          Responding to and managing feedback, complaints and other communications to or involving us.

          Delivering services you request or accommodating for special requirements.

          Collecting and administering your donation, contacting you about your donation, the summer party or other relevant information, and assisting donors with queries.

          Calculating aggregated statistics for publication, such as total amount of money raised.

          Improving the quality of services we deliver and the effectiveness of our operations.

          Recruiting Raise presidents, committee members, reps, other volunteers and attracting and managing sponsors.`,
          legalBasis: "Our legitimate interest in order to manage membership, committees, events, fundraising, communications, publicity and enabling the initiative to run effectively and efficiently",
        }, {
          purpose: "Complying with laws and regulations, for example to prevent fraud or process taxes.",
          legalBasis: "Our legal obligations",
        }, {
          purpose: "Carrying out obligations arising from contracts with you.",
          legalBasis: "Any contracts we have with you",
        }, {
          purpose: `Sending you direct marketing communications such as emails or social media messages.

          Creating and publishing marketing materials for publicity purposes relating to the movement, such as posting a photo of you at the summer party on Instagram.`,
          legalBasis: "Your consent (which you may withdraw by contacting us)",
        }]}
      />

      <p className="font-black font-raise-header mt-8 mb-2">How long we store your personal data</p>
      <Table
        definition={{
          category: { label: "Category", className: "whitespace-pre-line align-top" },
          heldUntil: { label: "How long is it held?", className: "whitespace-pre-line align-top" },
        }}
        items={[{
          category: "Data where we have your consent, such as mailing lists or yearbook pages",
          heldUntil: "Until you withdraw your consent.",
        }, {
          category: "Data we need to keep to comply with a legal obligation, such as tax or accounting records",
          heldUntil: "Until the end of the academic year after the legal obligation no longer requires us to hold the data. For most subcategories that is 6 years.",
        }, {
          category: "Data we need to keep for the establishment, exercise or defence of legal claims, such as communications relating to a complaint",
          heldUntil: "Until the end of the academic year after we no longer need it for the establishment, exercise or defence of legal claims.",
        }, {
          category: "All other data",
          heldUntil: "Until the end of the academic year.",
        }]}
      />

      <p className="font-black font-raise-header mt-8 mb-2">Your rights</p>
      <p>As a data subject, you have several data protection rights:</p>
      <ul className="list-disc ml-12 my-2">
        <li>Access to personal data - you can ask us for a copy of data we hold about you</li>
        <li>Rectification of personal data - you can ask us to correct data we hold about you</li>
        <li>Erasure of personal data - you can ask us to delete data we hold about you</li>
        <li>Restriction of processing of personal data - you can ask us to stop processing data we hold about you</li>
        <li>Lodging a complaint with the Commissioner - if you are unhappy with how we have handled your data or with the response received from us, you can lodge a complaint with the ICO at Wycliffe House, Water Lane, Wilmslow, SK9 5AF.</li>
      </ul>
      <p>These rights are not absolute and may be limited in some cases. To exercise your data protection rights, or for more information, contact us.</p>
    </Section>

    <Footer />
  </Page>
)

export default PrivacyPage
