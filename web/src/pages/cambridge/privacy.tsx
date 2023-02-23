import Helmet from 'react-helmet';

import Page from '../../components/Page';
import Section, { SectionTitle } from '../../components/Section';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import config from './_config';

const PrivacyPage = () => (
  <Page brand={config.brand}>
    <Helmet>
      <title>May Week Alternative: Privacy Policy</title>
      <meta property="og:title" content="May Week Alternative: Privacy Policy" />
    </Helmet>
    <Navigation
      left={[
        { text: 'Home', href: '..' },
        { text: 'How It Works', href: '../#how-it-works' },
        { text: 'FAQs', href: '../#faq' },
        { text: 'Our Philosophy', href: '../#our-philosophy' },
        { text: 'Contact', href: '../#contact' },
        { text: 'Partner', href: '../partner/' },
      ]}
      right={[
      ]}
    />

    <Section className="text-left">
      <SectionTitle>MWA Privacy Policy</SectionTitle>

      <p>
        MWA is part of Raise, who is a data controller. Please see the
        <a href="https://www.joinraise.org/privacy/">Raise privacy policy</a>
        .
      </p>
    </Section>

    <Footer />
  </Page>
);

export default PrivacyPage;
