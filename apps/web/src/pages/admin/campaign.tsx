import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { useState } from 'react';
import { DownloadIcon, PlusSmIcon } from '@heroicons/react/outline';
import { fixedGroups, format } from '@raise/shared';
import jsonexport from 'jsonexport/dist';
import { asResponseValues, useRawReq, useReq } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import Table from '../../components/Table';
import Spinner from '../../components/Spinner';
import { RequireGroup } from '../../helpers/security';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Form } from '../../components/Form';
import { EmailCreation } from '../../helpers/generated-api-client';
import ErrorPage from '../../components/ErrorPage';
import Link from '../../components/Link';

const CampaignPage: React.FC<RouteComponentProps & { campaignId: string }> = ({ campaignId }) => {
  const [campaigns] = useReq('get /admin/campaigns');
  const campaign = asResponseValues(campaigns.data?.find((f) => f.id === campaignId), campaigns); // for use later
  const [allMembers] = useReq('get /public/members/campaign');
  const campaignMembers = asResponseValues(allMembers.data?.filter((u) => u.campaignId === campaignId), allMembers);
  const [members] = useReq('get /public/members');

  const marketingEmailsMembers = asResponseValues(members.data?.filter((m) => campaignMembers.data?.find((cm) => (cm.memberId === m.id) && (cm.active === true) && (cm.emailConsent === true))), members); // members of this campaign that have given consent to recieving emails
  const allEmailMembers = asResponseValues(members.data?.filter((m) => campaignMembers.data?.find((cm) => (cm.memberId === m.id) && (cm.active === true))), members); // all members of this campaign, regardless of consent

  const [newEmailsModalOpen, setNewEmailsModalOpen] = useState(false);
  const [viewEmailModalOpen, setViewEmailModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [viewEmailSubject] = useState('');
  const [viewEmailMessage] = useState('');
  const [emails, refetchEmails] = useReq('get /admin/campaigns/emails');
  // const [campains, refetchCampaigns] = useReq('get /admin/emails/campaigns');
  const req = useRawReq();
  /* const campaignList: string[] = [];
  campains.data?.sort((a, b) => {
    if (b.chapter === a.chapter) {
      return 0;
    } if (b.chapter < a.chapter) {
      return 1;
    }
    return -1;
  }).forEach((c) => campaignList.push(`${c.chapter}: ${c.campaign}`)); */

  if ((campaign.loading === true) || (campaignMembers.loading === true)) {
    return (
      <Section>
        <Spinner />
      </Section>
    );
  } if (campaign.data === undefined) {
    return (
      <ErrorPage notFound="Campaign" href="/admin/campaigns" />
    );
  }

  const downloadFn = (data: object[] | undefined, name: string) => (data ? async () => {
    const csv = await jsonexport(data);
    if (csv) {
      const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csv}`);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${(`${name}_at_${new Date().toISOString().slice(0, 10)}`).replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
    }
  } : undefined);

  const downloadAllEmails = downloadFn(
    allEmailMembers.data
      ?.map((m) => ({
        name: m.name, email: m.email, 'NOTE some members may have NOT given consent to receive emails': '',
      })),
    `${campaign.data.chapter}_${campaign.data.campaign}_emails`,
  );

  const downloadMarketingEmails = downloadFn(
    marketingEmailsMembers.data
      ?.map((m) => ({
        name: m.name, email: m.email, 'Remember to use mail merge or BCC!': '',
      })),
    `${campaign.data.chapter}_${campaign.data.campaign}_marketing_emails`,
  );
  // to do list
  // create preview button
  // allow for users to see a copy of how the email looks
  // create a rich text editor

  return (
    <Section>
      <SectionTitle> {campaign.data?.chapter}: {campaign.data?.campaign}</SectionTitle>
      <div>
        <div className="flex">
          <SectionTitle className="flex-1">Emails</SectionTitle>
          <RequireGroup group={fixedGroups.National}>
            <Button onClick={() => setNewEmailsModalOpen(true)}>
              <PlusSmIcon className="h-6 mb-1" />
              {' '}
              New
              {' '}
              <span className="hidden lg:inline">Email</span>
            </Button>
          </RequireGroup>
        </div>
        <Modal open={newEmailsModalOpen} onClose={() => setNewEmailsModalOpen(false)}>
          <Form<EmailCreation>
            title="Email"
            definition={{
              recipient: { label: 'Recipients', inputType: 'hidden' },
              subject: { label: 'Subject', inputType: 'text' },
              message: { label: 'Message', inputType: 'text' },
              campaign: { label: 'Message', inputType: 'hidden' },
              chapter: { label: 'Message', inputType: 'hidden' },
            }}
            initialValues={{
              recipient: campaign.data.id,
              subject: '',
              message: '',
              campaign: campaign.data.campaign,
              chapter: campaign.data.chapter,
            }}
            showCurrent={false}
            onSubmit={async (data) => {
              await req('post /admin/campaigns/emails', data);
              await refetchEmails();
              setNewEmailsModalOpen(false);
            }}
          />
        </Modal>
        <Modal open={viewEmailModalOpen} onClose={() => setViewEmailModalOpen(false)}>
          <p> Subject: {viewEmailSubject}</p>
          <p> Message: {viewEmailMessage}</p>
        </Modal>
        <Table
          className="mb-8"
          definition={{
            subject: { label: 'Subject', className: 'whitespace-nowrap' },
            time: { label: 'Sent', formatter: format.timestamp, className: 'whitespace-nowrap' }
          }}
          // eslint-disable-next-line no-nested-ternary
          items={asResponseValues(emails.data?.filter((e) => (e.campaign === campaign.data?.campaign) && (e.chapter === campaign.data?.chapter)).sort((a, b) => (b.time === a.time ? 0 : (b.time > a.time ? 1 : -1))), emails)}
          href={(email) => `/admin/campaigns/${campaignId}/${email.id}`}
          /* onClick={(email) => {
            setViewEmailModalOpen(true);
            setViewEmailSubject(email.subject);
            setViewEmailMessage(email.message);
          }} */
        />
      </div>
      <div>
        <div className="flex">
          <SectionTitle className="flex-1"> Members </SectionTitle>
          <Button onClick={() => setExportModalOpen(true)}>
            <DownloadIcon className="h-6 mb-1" />
            {' '}
            Export
          </Button>
        </div>
        <Modal open={exportModalOpen} onClose={() => setExportModalOpen(false)}>
          <SectionTitle>Export Data</SectionTitle>
          <p className="my-4">By downloading this data you agree to use it only for the stated purpose, and will handle it securely and in line with the security policy. All exports will be in CSV format, which can be used in spreadsheeting tools such as Excel, LibreOffice Calc or Google Sheets.</p>

          <h2 className="mt-8 text-2xl">I want to send marketing emails to donors</h2>
          <p className="my-2">This contains donor names and emails who have agreed to receive marketing emails from Raise. You must not share this data with other organisations. Ideally use a mail merge tool or proper email software (such as Mailchimp) to send emails. If not, make sure you BCC recipients.</p>
          <Button onClick={downloadMarketingEmails} variant="blue">Download names and emails</Button>

          <h2 className="mt-8 text-2xl">I want to send non-marketing emails to donors</h2>
          <p className="my-2">
            This contains all donor names and emails. Some of these may not have agreed to receive marketing emails. Make sure any emails you send do not contain marketing messages, for example promoting a certain thing such as taking a pledge. It is generally okay to use this list to send summer party RSVP or feedback surveys. More guidance on what is and isn't marketing is available from
            <Link href="https://ico.org.uk/media/for-organisations/documents/1555/direct-marketing-guidance.pdf#page=17"> the ICO</Link>
            {' '}
            or the national team. You must not share this data with other organisations. Ideally use a mail merge tool or proper email software (such as Mailchimp) to send emails. If not, make sure you BCC recipients.
          </p>
          <Button onClick={downloadAllEmails} variant="blue">Download names and emails</Button>

          <p className="mt-8">Got another use case? Contact the national team with feedback on what data you'd like to get.</p>
        </Modal>
        <Table
          className="mb-8"
          definition={{
            name: { label: 'Name', className: 'whitespace-nowrap' },
            email: { label: 'Email', className: 'whitespace-nowrap' },
          }}
          items={asResponseValues(members.data?.filter((m) => campaignMembers.data?.find((cm) => (cm.memberId === m.id) && (cm.active === true))), members)}
        />
      </div>
    </Section>
  );
};

export default CampaignPage;
