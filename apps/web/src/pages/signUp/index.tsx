import Helmet from 'react-helmet';
import { Router } from '@gatsbyjs/reach-router';
import Page from '../../components/Page';
import CampaignPage from './CampaignPage';
import TasksPage from '../admin/tasks';
import NotFoundPage from '../404';
import SignUpPage from '../../components/SignUpPage';

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
    <Router basepath="/signUp" className="text-left">
      <>
        <TasksPage path="/tasks" />
        <SignUpPage path="/" />
        <CampaignPage chapterName="" campaignName="" path="/:chapterName/:campaignName" />
        <NotFoundPage default />
      </>
    </Router>
  );
};

export default IndexPage;
