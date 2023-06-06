import Helmet from 'react-helmet';

import Page from '../components/Page';
import Section, { SectionTitle } from '../components/Section';
import { TopNavigation } from '../components/Navigation';
import Footer from '../components/Footer';
import env from '../env/env';
import Link from '../components/Link';

const PrivacyPage = () => (
  <Page>
    <Helmet>
      <title>Raise: Privacy Policy</title>
      <meta property="og:title" content="Raise: Privacy Policy" />
      <meta name="robots" content="noindex" />
      <meta httpEquiv="refresh" content={`0; url=//${env.CUSTOM_RAISE_DOMAIN}/policies/privacy/`} />
    </Helmet>
    <TopNavigation />

    <Section className="text-left">
      <SectionTitle>Privacy Policy</SectionTitle>

      <p>
        This page has moved. Please see the <Link href={`//${env.CUSTOM_RAISE_DOMAIN}/policies/privacy/`}>page at the updated URL</Link>
        .
      </p>
    </Section>

    <Footer />
  </Page>
);

export default PrivacyPage;
