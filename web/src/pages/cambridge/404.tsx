import { RouteComponentProps } from '@gatsbyjs/reach-router';

import Helmet from 'react-helmet';
import Page from '../../components/Page';
import Section from '../../components/Section';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import config from './_config';

const NotFoundPage: React.FC<RouteComponentProps> = () => (
  <Page brand={config.brand}>
    <Helmet>
      <meta name="robots" content="noindex" />
      <title>MWA: Page not found</title>
      <meta property="og:title" content="MWA: Page not found" />
    </Helmet>
    <Section>
      <Logo className="my-8 w-24" />
      <h1 className="text-5xl sm:text-6xl font-raise-header font-black mb-8">MWA: Page not found</h1>
      <p>We couldn't find the page you requested.</p>
      <Button href="/" variant="red" className="inline-block mt-4">View homepage</Button>
    </Section>
  </Page>
);

export default NotFoundPage;
