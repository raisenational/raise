import { Helmet } from 'react-helmet';
import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { CampaignMemberRemoval } from '@raise/server/src/schemas';
import Footer from '../../components/Footer';
import Navigation from '../../components/Navigation';
import Page from '../../components/Page';
import Section, { SectionTitle } from '../../components/Section';
import { asResponseValues, useRawReq, useReq } from '../../helpers/networking';
import { SignUpForm } from '../../components/SignUpForm';
import NotFoundPage from '../404';
import Spinner from '../../components/Spinner';
import Logo from '../../components/Logo';

const UnsubscribePage: React.FC<RouteComponentProps & { campaignName: string, chapterName: string } > = ({ campaignName, chapterName }) => {
  const req = useRawReq();
  const [campaigns] = useReq('get /admin/emails/campaigns');
  const campaign = asResponseValues(campaigns.data?.find((u) => (u.campaign.toLowerCase() === campaignName.toLowerCase()) && (u.chapter.toLowerCase() === chapterName.toLowerCase())), campaigns); // Allows for chapters to use the same campaign name. MWA may cause issues?
  const search = new URL(window.location.href).searchParams;
  const emailQuery = search.get('email') || '';
  if (campaigns.loading === true) {
    return (
      <Spinner />
    );
  } if (campaign.data?.id === undefined) {
    return (
      <NotFoundPage />
    );
  }
  const campaignid = campaign.data?.id;

  return (
    <Page className="flex flex-col">
      <Helmet>
        <title>
          Sign Up
        </title>
        <meta property="og:title" content={`${chapterName}: Unsubscribe from ${campaignName}`} />
      </Helmet>
      <div className="flex-1">
        <Navigation
          left={[
            { text: '< back to main site', href: '../' },
          ]}
          right={[]}
        />

        <Section>
          <Logo className="my-8 w-24" />
          <SectionTitle>Unsubscribe</SectionTitle>
          <div>
            Please enter your email below to unscribe from {campaign.data.chapter}'s {campaign.data.campaign}.
          </div>
          <SignUpForm<CampaignMemberRemoval>
            title=""
            definition={{
              email: { label: 'Email', inputType: 'text' },
              campaignId: { label: 'chapter', inputType: 'hidden' },
            }}
            initialValues={{
              email: emailQuery,
              campaignId: campaignid,
            }}
            showCurrent={false}
            subscribe={false}
            onSubmit={async (data) => {
              if (data.email === null) {
                // eslint-disable-next-line no-param-reassign
                data.email = '';
              }
              await req('post /public/members/unsubscribe', data);
            }}
          />
        </Section>
      </div>

      <Footer />
    </Page>
  );
};

export default UnsubscribePage;
