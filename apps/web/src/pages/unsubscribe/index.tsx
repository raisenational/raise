import Helmet from 'react-helmet';
import { Router } from '@gatsbyjs/reach-router';
import Page from '../../components/Page';
import NotFoundPage from '../404';
import UnsubscribePage from './UnsubscribePage';

const IndexPage = () => (
  <Page className="pb-8">
    <Helmet>
      <title>Raise Sign Up</title>
      <meta property="og:title" content="Raise Sign Up" />
      <meta name="robots" content="noindex" />
    </Helmet>
    <IndexLayout />
  </Page>
);

const IndexLayout = () => {
  return (
    <Router basepath="/unsubscribe" className="text-left">
      <>
        <UnsubscribePage chapterName="" campaignName="" path="/:chapterName/:campaignName" />
        <NotFoundPage default />
      </>
    </Router>
  );
};

export default IndexPage;
