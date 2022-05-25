import * as React from "react"
import Helmet from "react-helmet"

import Page from "../../components/Page"
import Section, { SectionTitle } from "../../components/Section"
import Navigation from "../../components/Navigation"
import FAQs, { FAQ } from "../../components/FAQs"
import Footer from "../../components/Footer"

import IntroStats from "../../components/IntroStats"
import Link from "../../components/Link"
import Quote from "../../components/Quote"

const IndexPage = () => (
  <Page>
    <Helmet>
      <meta name="robots" content="noindex" />
      <title>Raise Demo: Yearbook</title>
      <meta property="og:title" content="Raise Demo: Yearbook" />
    </Helmet>

    <Navigation
      left={[
        { text: "< back to main site", href: "../" },
      ]}
      right={[
      ]}
    />
    <Section className="px-8">
      <IntroStats
        title="Raise Demo"
        tagline="Raise Demo wouldn't be the success it is today without its amazing community! This yearbook celebrates their impact, which together is an incredible:"
        statistics={{
          years: 4,
          students: 1366,
          raised: 284581,
          protected: 340013,
        }}
      />
    </Section>

    <Section>
      <SectionTitle>Members</SectionTitle>
      {[
        {
          name: "Karla Baker, Geography @ Kitty College",
          quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ultrices vitae auctor eu augue ut lectus. Consectetur adipiscing elit duis tristique sollicitudin nibh sit. Ornare lectus sit amet est placerat in. Rhoncus mattis rhoncus urna neque. Suspendisse potenti nullam ac tortor vitae purus faucibus. Urna et pharetra pharetra massa massa ultricies.",
          img: "https://placekitten.com/160/160?image=1",
        },
        {
          name: "Alice Schirmer, Maths @ Meow College",
          quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          img: "https://placekitten.com/160/160?image=2",
        },
        {
          name: "Dan Bibeau, History @ Furball College",
          quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          img: "https://placekitten.com/160/160?image=3",
        },
        {
          name: "Anonymous, Student @ Mew College",
          quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          img: "https://placekitten.com/160/160?image=4",
        },
        {
          name: "Fernando Acevedo, Computer Science @ Cat College",
          img: "https://placekitten.com/160/160?image=5",
        },
        {
          name: "Hui Ying Peng, Anthropology @ Paw College",
          quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
        {
          name: "Saskia Luijsterburg, Biology @ Catty College",
          quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ultrices vitae auctor eu augue ut lectus. Consectetur adipiscing elit duis tristique sollicitudin nibh sit. Ornare lectus sit amet est placerat in.",
        },
        {
          name: "Michal Zajíček, Chemistry @ Purring College",
        },
      ].map((m, i) => (
        <Quote by={m.name} headshotSrc={m.img} imagePlacement={i % 2 === 0 ? "left" : "right"} className="mt-20">
          {m.quote}
        </Quote>
      ))}
    </Section>

    <Section id="faq">
      <SectionTitle>FAQs</SectionTitle>
      <FAQs>
        <FAQ title="How can I stay involved with Raise?">
          <p>We'd love to keep in touch, and continue celebrating positive, deliberate and effective giving as you go out and do exciting things! Come and join the <Link href="/alumni/">Raise Alumni community</Link> to stay up to date with the latest news, events and opportunities.</p>
        </FAQ>

        <FAQ title="Where do I learn more about Raise Demo?">
          <p>We're excited you're interested in Raise! For more details on what it is we do, see <a href="../">our main chapter website</a>!</p>
        </FAQ>

        <FAQ title="How can I get added or removed from the yearbook?">
          <p>If you'd like to be added or removed, <Link href="../#contact">contact us</Link> with your details and we'd be happy to help! Similarly, if you'd like to tweak your quote, change your name or anything else do let us know.</p>
          <p>If you're on this page, it's because you previously provided your personal details and consented to being added to the yearbook. To get a complete picture of how we use your personal data at Raise, or understand how to exercise your rights under data protection legislation see <Link href="/privacy/">our privacy policy</Link>.</p>
        </FAQ>
      </FAQs>
    </Section>

    <Footer />
  </Page>
)

export default IndexPage
