import Helmet from 'react-helmet';

import Page from '../../components/Page';
import Section, { SectionTitle } from '../../components/Section';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import env from '../../env/env';
import config from './_config';
import Link from '../../components/Link';

const PrivacyPage = () => (
  <Page brand={config.brand}>
    <Helmet>
      <title>May Week Alternative: Privacy Policy</title>
      <meta property="og:title" content="May Week Alternative: Privacy Policy" />
      <meta name="robots" content="noindex" />
      <meta httpEquiv="refresh" content={`0; url=//${env.CUSTOM_RAISE_DOMAIN}/policies/privacy/`} />
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
        MWA is part of Raise, who is a data controller. Please see the <Link href={`//${env.CUSTOM_RAISE_DOMAIN}/policies/privacy/`}>Raise privacy policy</Link>
        .
      </p>
    </Section>

    <Footer />
  </Page>
);

export default PrivacyPage;
