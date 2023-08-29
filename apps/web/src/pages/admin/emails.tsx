import { RouteComponentProps } from '@gatsbyjs/reach-router';
import {
  fixedGroups, format,
} from '@raise/shared';
import { useState } from 'react';
import { PlusSmIcon } from '@heroicons/react/outline';
import Section, { SectionTitle } from '../../components/Section';
import { Form } from '../../components/Form';
import { EmailCreation } from '../../helpers/generated-api-client';
import Modal from '../../components/Modal';
import { RequireGroup } from '../../helpers/security';
import Button from '../../components/Button';
import { asResponseValues, useRawReq, useReq } from '../../helpers/networking';
import Table from '../../components/Table';

const EmailPage: React.FC<RouteComponentProps> = () => {
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [emails, refetchEmails] = useReq('get /admin/emails');
  const req = useRawReq();

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">Emails</SectionTitle>
        <RequireGroup group={fixedGroups.National}>
          <Button onClick={() => setNewUserModalOpen(true)}>
            <PlusSmIcon className="h-6 mb-1" />
            {' '}
            New
            {' '}
            <span className="hidden lg:inline">Email</span>
          </Button>
        </RequireGroup>
      </div>
      <Modal open={newUserModalOpen} onClose={() => setNewUserModalOpen(false)}>
        <Form<EmailCreation>
          title="Email"
          definition={{
            recipient: { label: 'Recipients', inputType: 'text' },
            subject: { label: 'Subject', inputType: 'text' },
            message: { label: 'Message', inputType: 'text' }
          }}
          initialValues={{
            recipient: '',
            subject: '',
            message: ''
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            await req('post /admin/emails', data);
            await refetchEmails();
            setNewUserModalOpen(false);
          }}
        />
      </Modal>
      <Table
        className="mb-8"
        definition={{
          subject: { label: 'Subject', className: 'whitespace-nowrap' },
          time: { label: 'Sent', formatter: format.timestamp, className: 'whitespace-nowrap' }
        }}
          // eslint-disable-next-line no-nested-ternary
        items={asResponseValues(emails.data?.sort((a, b) => (b.time === a.time ? 0 : (b.time > a.time ? 1 : -1))), emails)}
        href={() => '/admin/emails'} // palceholer fix later
      />
    </Section>
  );
};

export default EmailPage;
