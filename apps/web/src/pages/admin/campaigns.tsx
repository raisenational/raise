import { RouteComponentProps } from '@gatsbyjs/reach-router';
import {
  fixedGroups, format,
} from '@raise/shared';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon, PlusSmIcon } from '@heroicons/react/outline';
import Section, { SectionTitle } from '../../components/Section';
import { Form } from '../../components/Form';
import { CampaignCreation } from '../../helpers/generated-api-client';
import Modal from '../../components/Modal';
import { RequireGroup } from '../../helpers/security';
import Button from '../../components/Button';
import { asResponseValues, useRawReq, useReq } from '../../helpers/networking';
import Table from '../../components/Table';

const CampaignsPage: React.FC<RouteComponentProps> = () => {
  const [newCampaignsModalOpen, setNewCampaignsModalOpen] = useState(false);
  const [campains, refetchCampaigns] = useReq('get /admin/campaigns');
  const [showArchived, setShowArchived] = useState(true);
  const req = useRawReq();

  // ask Adam about what groups there are on the real system. Do chapter Leaders (The ones incharge of sending emails) apart of a chapter group?
  // then using that idea, maybe filter the campaigns by the chapter which the user is in.

  return (
    <Section>
      <div>
        <div className="flex">
          <SectionTitle className="flex-1">Campaigns</SectionTitle>
          {!showArchived && (
          <Button onClick={() => setShowArchived(true)}>
            <EyeIcon className="h-6 mb-1" />
            {' '}
            <span className="hidden lg:inline">Show archived</span>
            <span className="lg:hidden">More</span>
          </Button>
          )}
          {showArchived && (
          <Button onClick={() => setShowArchived(false)}>
            <EyeOffIcon className="h-6 mb-1" />
            {' '}
            <span className="hidden lg:inline">Hide archived</span>
            <span className="lg:hidden">Less</span>
          </Button>
          )}
          <RequireGroup group={fixedGroups.National}>
            <Button onClick={() => setNewCampaignsModalOpen(true)}>
              <PlusSmIcon className="h-6 mb-1" />
              {' '}
              New
              {' '}
              <span className="hidden lg:inline">Campaign</span>
            </Button>
          </RequireGroup>
        </div>
        <Modal open={newCampaignsModalOpen} onClose={() => setNewCampaignsModalOpen(false)}>
          <Form<CampaignCreation>
            title="Campaign" // Potentially allow for photos for the campaign
            definition={{
              campaign: { label: 'Campain', inputType: 'text' },
              chapter: { label: 'Chapter', inputType: 'text' }, // make this a drop down menu. No actually, since each user can only create a campaign for their own chapter (Unless National Team)
            }}
            initialValues={{
              campaign: '',
              chapter: '',
            }}
            showCurrent={false}
            onSubmit={async (data) => {
              await req('post /admin/campaigns', data);
              await refetchCampaigns();
              setNewCampaignsModalOpen(false);
            }}
          />
        </Modal>
        <Table
          className="mb-8"
          definition={{
            campaign: { label: 'Campaign', className: 'whitespace-nowrap' },
            chapter: { label: 'Chapter', className: 'whitespace-nowrap' },
            id: { label: 'ID', className: 'whitespace-nowrap' },
            archived: { label: 'Archived', formatter: format.boolean, }
          }}
          // eslint-disable-next-line no-nested-ternary
          items={asResponseValues(campains.data?.filter((d) => showArchived || !(d.archived ?? true)).sort((a, b) => (b.chapter === a.chapter ? 0 : (b.chapter < a.chapter ? 1 : -1))), campains)}
          href={(campaign) => `/admin/campaigns/${campaign.id}`}
        />
      </div>
    </Section>

  );
};

export default CampaignsPage;
