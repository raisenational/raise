import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { format } from '@raise/shared';
import { asResponseValues, useReq } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import Spinner from '../../components/Spinner';
import ErrorPage from '../../components/ErrorPage';

const EmailPage: React.FC<RouteComponentProps & { emailId: string, campaignId: string }> = ({ emailId, campaignId }) => {
  const [emails] = useReq('get /admin/campaigns/emails');
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

  const testEmail = emailContent.message;

  return (
    <Section>
      <SectionTitle> Subject: {emailContent.subject}</SectionTitle>
      <div className="bg-raise-blue-dark p-3 rounded-lg">
        Sent: {format.timestamp(emailContent.time)}
        <div className="pt-2">
          <iframe srcDoc={testEmail} id={`${emailId}-iframe-element`} title={`${emailId}-iframe-element`} className="w-full border-spacing-1 rounded-lg" height="700" />
        </div>
      </div>
    </Section>
  );
};

export default EmailPage;
