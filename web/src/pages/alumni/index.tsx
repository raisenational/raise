import Helmet from 'react-helmet';

import { UserGroupIcon } from '@heroicons/react/outline';
import Page from '../../components/Page';
import Section, { SectionTitle } from '../../components/Section';
import Navigation from '../../components/Navigation';
import Cover, { CTADown } from '../../components/Cover';
import IntroStats from '../../components/IntroStats';
import FAQs, { FAQ } from '../../components/FAQs';
import Philosophy from '../../components/Philosophy';
import { SocialIconV2 } from '../../components/SocialIcon';
import Panel from '../../components/Panel';
import Button from '../../components/Button';

import { MoneyBox, Party } from '../../images/Icons';
import Footer from '../../components/Footer';
import Link from '../../components/Link';

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise Alumni</title>
      <meta property="og:title" content="Raise Alumni" />
    </Helmet>
    <Cover>
      <Navigation
        left={[
          { text: 'Home', href: '.' },
          { text: 'How It Works', href: '#how-it-works' },
          { text: 'FAQs', href: '#faq' },
          { text: 'Our Philosophy', href: '#our-philosophy' },
          { text: 'Contact', href: '#contact' },
        ]}
        right={[
          { text: 'Donate', href: 'donate/' },
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
        <div className="mt-4 mb-12 flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="large" href="donate/">Donate</Button>
          <Button variant="outline" size="large" href="https://www.facebook.com/groups/966154864287768">Join Facebook group</Button>
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
          text="We'll bring the Raise alumni community together through both virtual and in-person events, continuing with our ultimate goal of making charity something that is actively embraced and enjoyed, and a meaningful part of all of our lives."
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
          <p>
            <b>Facebook group:</b>
            {' '}
            To foster a two-way dialogue, you're invited to join our
            {' '}
            <Link href="https://www.facebook.com/groups/966154864287768">Facebook group</Link>
            . This is probably the first place to see what we're up to and how things are going.
          </p>
          <p>
            <b>Advisory board:</b>
            {' '}
            We'd love alumni to get involved in steering the direction of Raise or picking up more self-contained projects. To do this, we've set up an advisory board of trusted Raise members who meet on a (semi-) regular basis to discuss what's going on with Raise. Get in touch if this sounds interesting to you!
          </p>
          <p>
            <b>Helping us grow:</b>
            {' '}
            Are you able to help us by sponsoring Raise's efforts (whether through in-kind or direct donations), or know someone who can? Do you have some free time to improve how we run our operations, or mentor new chapters? Whatever it is,
            {' '}
            <Link href="#contact">we'd love to hear from you</Link>
            !
          </p>
        </FAQ>

        <FAQ title="How did you choose your charity recommendations?">
          <p>
            To decide which charities to recommend, we reviewed the research of independent charity evaluators
            {' '}
            <Link href="https://www.givewell.org/charities/top-charities">GiveWell</Link>
            ,
            {' '}
            <Link href="https://www.givingwhatwecan.org">Giving What We Can</Link>
            , and
            {' '}
            <Link href="https://founderspledge.com/">Founders Pledge</Link>
            , as well as explored other literature discussing effective charities.
          </p>
          <p>
            We've also considered feedback from donors from previous years, as well as considered which charities best fit with our philosophy of positive, deliberate, and effective giving.
          </p>
          <p>
            We've intentionally tried to support a wide range of cause areas, so that you can find one that you connect with. However, you're also welcome to donate to another charity (see below).
          </p>
        </FAQ>

        <FAQ title="For the donations push, can I donate to a different charity?">
          <p>
            At Raise, we think very carefully about which charities to recommend, particularly given how much money you're donating. However, we recognise that you might want to join us in celebrating through giving to a different charity. This is absolutely fine, but please
            {' '}
            <Link href="#contact">get in touch</Link>
            {' '}
            with us beforehand so that we are aware.
          </p>
        </FAQ>
      </FAQs>
      <Button variant="outline" className="mt-4" href="https://www.facebook.com/groups/966154864287768">Join Facebook group</Button>
    </Section>

    <Philosophy />

    <Section id="contact">
      <SectionTitle>Get in Touch</SectionTitle>
      <div className="inline-block text-left">
        <SocialIconV2 type="email" id="raisealumni@gmail.com" />
        <SocialIconV2 type="facebook" id="groups/966154864287768" linkTextOverride="Raise/MWA Alumni!" />
      </div>
    </Section>

    <Footer />
  </Page>
);

export default IndexPage;
