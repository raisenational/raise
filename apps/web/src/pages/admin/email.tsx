import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { asResponseValues, useReq } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import Spinner from '../../components/Spinner';
import ErrorPage from '../../components/ErrorPage';

const EmailPage: React.FC<RouteComponentProps & { emailId: string, campaignId: string }> = ({ emailId, campaignId }) => {
  const [emails] = useReq('get /admin/emails');
  const email = asResponseValues(emails.data?.find((e) => e.id === emailId), emails);

  // Very Much a Work in Progress

  if ((emails.loading === true)) {
    return (
      <Section>
        <Spinner />
      </Section>
    );
  } if ((email.data === undefined)) {
    return (
      <ErrorPage notFound="Email" href={`/admin/campaigns/${campaignId}`} />
    );
  }
  const emailContent = email.data;
  return (
    <Section>
      <SectionTitle> {emailContent.subject}</SectionTitle>
    </Section>
  );
};

export default EmailPage;
