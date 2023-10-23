import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { useState } from 'react';
import { PlusSmIcon } from '@heroicons/react/outline';
import { fixedGroups, format } from '@raise/shared';
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

const CampaignPage: React.FC<RouteComponentProps & { campaignId: string }> = ({ campaignId }) => {
  const [campaigns] = useReq('get /admin/emails/campaigns');
  const campaign = asResponseValues(campaigns.data?.find((f) => f.id === campaignId), campaigns); // for use later
  const [allMembers] = useReq('get /public/members/campaign');
  const campaignMembers = asResponseValues(allMembers.data?.filter((u) => u.campaignId === campaignId), allMembers);
  const [members] = useReq('get /public/members');

  const [newEmailsModalOpen, setNewEmailsModalOpen] = useState(false);
  const [viewEmailModalOpen, setViewEmailModalOpen] = useState(false);
  const [viewEmailSubject] = useState('');
  const [viewEmailMessage] = useState('');
  const [emails, refetchEmails] = useReq('get /admin/emails');
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
              await req('post /admin/emails', data);
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
        <SectionTitle> Members </SectionTitle>
        <Table // disabled look caused by outdated repo. Wait till Adam or someone else can help.
          className="mb-8"
          definition={{
            name: { label: 'Name', className: 'whitespace-nowrap' },
            email: { label: 'Email', className: 'whitespace-nowrap' },
          }}
          items={asResponseValues(members.data?.filter((m) => campaignMembers.data?.find((cm) => cm.memberId === m.id)), members)}
        />
      </div>
    </Section>
  );
};

export default CampaignPage;
