import Helmet from 'react-helmet';

import Page from '../components/Page';
import Section, { SectionTitle } from '../components/Section';
import { TopNavigation } from '../components/Navigation';
import Footer from '../components/Footer';
import env from '../env/env';
import Link from '../components/Link';
import { useReq } from '../helpers/networking';

const PrivacyPage = () => {
  const result = useReq(
    'get /public/Deevan'
  );
  return (
    <Page>
      <Helmet>
        <title>Raise: Privacy Policy</title>
        <meta property="og:title" content="Raise: Privacy Policy" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <TopNavigation />

      <Section className="text-left">
        <SectionTitle>Deevan</SectionTitle>

        <p>
          {result[0].data?.message ?? 'Loading'}
        </p>
      </Section>

      <Footer />
    </Page>
  );
};

export default PrivacyPage;
