import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { Helmet } from 'react-helmet';
import { CampaignMemberCreation } from '@raise/server/src/schemas';
import Page from '../../components/Page';
import Navigation from '../../components/Navigation';
import { SignUpForm } from '../../components/SignUpForm';
import Footer from '../../components/Footer';
import { asResponseValues, useRawReq, useReq } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import NotFoundPage from '../404';
import Spinner from '../../components/Spinner';
import Logo from '../../components/Logo';

const CampaignPage: React.FC<RouteComponentProps & { campaignName: string, chapterName: string } > = ({ campaignName, chapterName }) => {
  const [campaigns] = useReq('get /admin/emails/campaigns');
  const req = useRawReq();
  const campaign = asResponseValues(campaigns.data?.find((u) => (u.campaign.toLowerCase() === campaignName.toLowerCase()) && (u.chapter.toLowerCase() === chapterName.toLowerCase())), campaigns); // Allows for chapters to use the same campaign name. MWA may cause issues?
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
        <meta property="og:title" content={`${campaign.data?.chapter || 'Raise'}: Sign Up`} />
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
          <div className="flex">
            <SectionTitle className="flex-1">{campaign.data?.campaign || 'Campaign'}</SectionTitle>
          </div>
          <div>
            Sign up to recieve updates from {campaign.data?.chapter || 'Raise'}!
          </div>
          <div>
            Campaign Id is: {campaign.data?.id}
          </div>
          <SignUpForm<CampaignMemberCreation>
            title=""
            definition={{
              name: { label: 'Name', inputType: 'text' },
              email: { label: 'Email', inputType: 'text' },
              campaignId: { label: 'chapter', inputType: 'hidden' },
            }}
            initialValues={{
              name: '',
              email: '',
              campaignId: campaignid,
            }}
            showCurrent={false}
            subscribe
            onSubmit={async (data) => {
              if ((data.name === null)) {
                // eslint-disable-next-line no-param-reassign
                data.name = '';
              }
              if (data.email === null) {
                // eslint-disable-next-line no-param-reassign
                data.email = '';
              }
              await req('post /public/members/campaign', data);
            }}
          />
        </Section>
      </div>

      <Footer />
    </Page>
  );
};

export default CampaignPage;
