import Helmet from 'react-helmet';
import { Router } from '@gatsbyjs/reach-router';
import { useEffect, useState } from 'react';
import Page from '../../components/Page';
import FundraisersPage from './fundraisers';
import ProfilePage from './profile';
import TasksPage from './tasks';
import Login, { OauthCallbackPage } from './login';
import NotFoundPage from '../404';
import Navigation from '../../components/Navigation';
import FundraiserPage from './fundraiser';
import { useAuthState } from '../../helpers/networking';
import Alert from '../../components/Alert';
import Section from '../../components/Section';
import DonationPage from './donation';
import PaymentPage from './payment';
import AuditPage from './audit';
import UsersPage from './users';
import UserPage from './user';
import GroupPage from './group';
import { helpLink } from './_helpLink';

const IndexPage = () => (
  <Page className="pb-8">
    <Helmet>
      <title>Raise Admin</title>
      <meta property="og:title" content="Raise Admin" />
      <meta name="robots" content="noindex" />
    </Helmet>
    <IndexLayout />
  </Page>
);

const IndexLayout = () => {
  const [auth, setAuth] = useAuthState();
  const [logoutWarning, setLogoutWarning] = useState<string | undefined>();
  // This logs out the user when their access token expires
  useEffect(() => {
    if (typeof auth?.refreshToken.expiresAt !== 'number') return undefined;

    const msUntilExpiration = (auth.refreshToken.expiresAt * 1000) - Date.now();

    const warningTimeout = setTimeout(() => {
      setLogoutWarning('You will be logged out in the next minute');
    }, msUntilExpiration - 60_000);

    return () => {
      clearTimeout(warningTimeout);
    };
  }, [auth?.refreshToken.expiresAt]);

  // This ensures server-side rendering + hydration does not cause weirdness on these authenticated pages
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;

  return (
    <>
      {auth && (
        <Navigation
          left={[
            { text: 'Fundraisers', href: '/admin/' },
            { text: 'Tasks', href: '/admin/tasks' },
            { text: 'Audit', href: '/admin/audit' },
            { text: 'Users', href: '/admin/users' },
            { text: 'Profile', href: '/admin/profile' },
            { text: 'Help', href: helpLink },
          ]}
          right={[
            { text: 'Logout', onClick: () => setAuth() },
          ]}
        />
      )}
      {logoutWarning && auth && (
        <Section>
          <Alert variant="warning">{logoutWarning}</Alert>
        </Section>
      )}
      <Router basepath="/admin" className="text-left">
        <OauthCallbackPage path="/oauth-callback" />

        {auth && (
          <>
            <FundraisersPage path="/" />
            <FundraiserPage fundraiserId="" path="/:fundraiserId" />
            <DonationPage fundraiserId="" donationId="" path="/:fundraiserId/:donationId" />
            <PaymentPage fundraiserId="" donationId="" paymentId="" path="/:fundraiserId/:donationId/:paymentId" />
            <TasksPage path="/tasks" />
            <AuditPage path="/audit" />
            <UsersPage path="/users" />
            <UserPage userId="" path="/users/:userId" />
            <GroupPage groupId="" path="/groups/:groupId" />
            <ProfilePage path="/profile" />
            <NotFoundPage default />
          </>
        )}

        {!auth && <Login default />}
      </Router>
    </>
  );
};

export default IndexPage;
