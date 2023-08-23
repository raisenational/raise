import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { navigate } from 'gatsby';
import {
  DownloadIcon, EyeIcon, EyeOffIcon, PlusSmIcon,
} from '@heroicons/react/outline';
import jsonexport from 'jsonexport/dist';
import { fixedGroups, format } from '@raise/shared';
import { useState } from 'react';
import { asResponseValues, useReq, useRawAxios } from '../../helpers/networking';
import Section, { SectionTitle } from '../../components/Section';
import Table from '../../components/Table';
import PropertyEditor from '../../components/PropertyEditor';
import Modal from '../../components/Modal';
import { Form } from '../../components/Form';
import Button from '../../components/Button';
import { RequireGroup } from '../../helpers/security';
import Link from '../../components/Link';
import { DonationEdits, Fundraiser } from '../../helpers/generated-api-client';

const FundraiserPage: React.FC<RouteComponentProps & { fundraiserId: string }> = ({ fundraiserId }) => {
  const [fundraisers, refetchFundraisers] = useReq('get /admin/fundraisers');
  const fundraiser = asResponseValues(fundraisers.data?.find((f) => f.id === fundraiserId), fundraisers);
  const [groups] = useReq('get /admin/groups');
  const groupMap = groups.data ? Object.fromEntries(groups.data.map((g) => [g.id, g.name])) : {};
  const axios = useRawAxios();

  return (
    <Section>
      <SectionTitle>{fundraiser.data?.internalName || 'Fundraiser'}</SectionTitle>
      <PropertyEditor<Fundraiser>
        definition={{
          internalName: { label: 'Internal name', inputType: 'text' },
          publicName: { label: 'Public name', inputType: 'text' },
          activeFrom: { label: 'From', formatter: format.timestamp, inputType: 'datetime-local' },
          activeTo: { label: 'To', formatter: format.timestamp, inputType: 'datetime-local' },
          recurringDonationsTo: { label: 'Recurring donations to', formatter: format.timestamp, inputType: 'datetime-local' },
          paused: { label: 'Paused', formatter: format.boolean, inputType: 'checkbox' },
          currency: {
            label: 'Currency', formatter: (s: string) => s.toUpperCase(), inputType: 'select', selectOptions: ['gbp', 'usd'],
          },
          goal: { label: 'Goal', formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), inputType: 'amount' },
          totalRaised: {
            label: 'Total', formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), inputType: 'amount', warning: 'Do not edit the total unless you know what you are doing. You probably want to add a manual donation instead.',
          },
          donationsCount: {
            label: 'Donation count', inputType: 'number', warning: 'Do not edit the donation count unless you know what you are doing. You probably want to add a manual donation instead.',
          },
          matchFundingRate: { label: 'Match funding rate', formatter: (v: number, i: Fundraiser) => format.matchFundingRate(i.currency, v), inputType: 'number' },
          matchFundingPerDonationLimit: { label: 'Match funding per donation limit', formatter: (v: number | null, i: Fundraiser) => format.amount(i.currency, v), inputType: 'amount' },
          matchFundingRemaining: {
            label: 'Match funding remaining', formatter: (v: number | null, i: Fundraiser) => format.amount(i.currency, v), inputType: 'amount', warning: 'Do not edit the match funding remaining unless you know what you are doing.',
          },
          minimumDonationAmount: { label: 'Minimum donation amount', formatter: (v: number | null, i: Fundraiser) => format.amount(i.currency, v), inputType: 'amount' },
          suggestedDonationAmountOneOff: { label: 'Suggested one off donation amount', formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), inputType: 'amount' },
          suggestedDonationAmountWeekly: { label: 'Suggested weekly donation amount', formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), inputType: 'amount' },
          suggestedContributionAmount: { label: 'Suggested contribution amount', formatter: (v: number | null, i: Fundraiser) => format.amount(i.currency, v), inputType: 'amount' },
          eventLink: { label: 'Event link', inputType: 'text' },
          moreInvolvedLink: { label: 'More involved link', inputType: 'text' },
          groupsWithAccess: {
            label: 'Groups with access', formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(', ') || '(none)', inputType: 'multiselect', selectOptions: groupMap,
          },
          archived: { label: 'Archived', formatter: format.boolean, inputType: 'checkbox' },
        }}
        item={fundraiser}
        onSave={async (data) => {
          await axios.patch(`/admin/fundraisers/${fundraiserId}`, {
            ...data,
            previous: {
              totalRaised: fundraiser.data?.totalRaised,
              donationsCount: fundraiser.data?.donationsCount,
            },
          });
          refetchFundraisers();
        }}
      />

      <RequireGroup group={[...(fundraiser.data?.groupsWithAccess ?? []), fixedGroups.National]}>
        <DonationsSummaryView fundraiserId={fundraiserId} fundraiser={fundraiser.data} />
      </RequireGroup>
    </Section>
  );
};

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

const DonationsSummaryView: React.FC<{ fundraiserId: string, fundraiser?: Fundraiser }> = ({ fundraiserId, fundraiser }) => {
  const [donations, refetchDonations] = useReq('get /admin/fundraisers/{fundraiserId}/donations', { fundraiserId });
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [newDonationModalOpen, setNewDonationModalOpen] = useState(false);
  const [showUncounted, setShowUncounted] = useState(false);
  const axios = useRawAxios();

  const downloadMarketingEmails = downloadFn(
    donations.data
      ?.filter((d) => d.emailConsentMarketing && d.donationCounted)
      .map((d) => ({
        name: d.donorName, email: d.donorEmail, consentedToMarketing: d.emailConsentMarketing, 'Remember to use mail merge or BCC!': '',
      })),
    `${fundraiser?.publicName}_marketing_emails`,
  );

  const downloadAllEmails = downloadFn(
    donations.data
      ?.filter((d) => d.donationCounted).map((d) => ({
        name: d.donorName, email: d.donorEmail, consentedToMarketing: d.emailConsentMarketing, 'Remember to use mail merge or BCC!': '',
      })),
    `${fundraiser?.publicName}_emails`,
  );

  const downloadForAMF = downloadFn(
    donations.data
      ?.filter((d) => d.donationCounted && d.charity === 'AMF').map((d) => ({
        'First Name': d.donorName.split(' ')[0],
        'Last Name': d.donorName.split(' ').filter((_, i) => i > 0).join(' '),
        // NB: this does not include match funding
        Amount: format.amountShort(fundraiser?.currency, d.donationAmount),
        Email: d.donorEmail,
        Chapter: fundraiser?.internalName,
        'Gift Aid': d.giftAid ? 'Yes' : 'No',
        'Address 1': d.addressLine1,
        'Address 2': d.addressLine2,
        'Address 3': d.addressLine3,
        Town: '',
        County: '',
        Postcode: d.addressPostcode,
        Country: d.addressCountry,
        'Date of Donation': new Date(d.createdAt * 1000).toISOString(),
        'Consent: Update on nets funded by donation': d.emailConsentInformational ? 'Yes' : 'No',
        'Consent: General updates from AMF': 'No',
      })),
    `${fundraiser?.publicName}_amf_export`,
  );

  const downloadForAnalysisPseudonymous = downloadFn(
    donations.data
      ?.map((d) => ({
        createdAt: d.createdAt,
        createdAtFormatted: format.timestamp(d.createdAt),
        giftAid: d.giftAid,
        recurringAmount: d.recurringAmount,
        recurrenceFrequency: d.recurrenceFrequency,
        charity: d.charity,
        overallPublic: d.overallPublic,
        namePublic: d.namePublic,
        donationAmountPublic: d.donationAmountPublic,
        donationCounted: d.donationCounted,
        id: d.id,
        fundraiserId: d.fundraiserId,
        donationAmount: d.donationAmount,
        matchFundingAmount: d.matchFundingAmount,
        contributionAmount: d.contributionAmount,
        giftAidAmount: Math.floor(d.donationAmount * (d.giftAid ? 0.25 : 0)),
      })),
    `${fundraiser?.publicName}_pseudonymous_analysis_export`,
  );

  const downloadForAnalysisIdentifiable = downloadFn(
    donations.data
      ?.map((d) => ({
        ...d,
        createdAtFormatted: format.timestamp(d.createdAt),
        giftAidAmount: Math.floor(d.donationAmount * (d.giftAid ? 0.25 : 0)),
      })),
    `${fundraiser?.internalName}_analysis_export`,
  );

  return (
    <>
      <div className="flex mt-12">
        <SectionTitle className="flex-1">Donations</SectionTitle>
        {!showUncounted && (
        <Button onClick={() => setShowUncounted(true)}>
          <EyeIcon className="h-6 mb-1" />
          {' '}
          <span className="hidden lg:inline">Show uncounted</span>
          <span className="lg:hidden">More</span>
        </Button>
        )}
        {showUncounted && (
        <Button onClick={() => setShowUncounted(false)}>
          <EyeOffIcon className="h-6 mb-1" />
          {' '}
          <span className="hidden lg:inline">Hide uncounted</span>
          <span className="lg:hidden">Less</span>
        </Button>
        )}
        <Button onClick={() => setExportModalOpen(true)}>
          <DownloadIcon className="h-6 mb-1" />
          {' '}
          Export
        </Button>
        <Button onClick={() => setNewDonationModalOpen(true)}>
          <PlusSmIcon className="h-6 mb-1" />
          {' '}
          New
          <span className="hidden lg:inline"> donation</span>
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
          <Link href="https://ico.org.uk/media/for-organisations/documents/1555/direct-marketing-guidance.pdf#page=17">the ICO</Link>
          {' '}
          or the national team. You must not share this data with other organisations. Ideally use a mail merge tool or proper email software (such as Mailchimp) to send emails. If not, make sure you BCC recipients.
        </p>
        <Button onClick={downloadAllEmails} variant="blue">Download names and emails</Button>

        <RequireGroup group={fixedGroups.National} otherwise={<p className="my-4 -mb-2">To export data for AMF or for analysis, please contact the national team.</p>}>
          <h2 className="mt-8 text-2xl">I want to export the data for AMF</h2>
          <p className="my-2">This contains donor data in the format Rob Mather from AMF has told us would be ideal for them.</p>
          <Button onClick={downloadForAMF} variant="blue">Download data</Button>

          <h2 className="mt-8 text-2xl">I want to analyse donor data</h2>
          <p className="my-2">This contains all donor data, either with or without direct identifiers such as names, emails and addresses. Even without direct identifiers, there is a possiblity of re-identification from the pseudonymous data (e.g. through cross-checking amounts) so it is still considered personal data and as such must be handled with care.</p>
          <Button onClick={downloadForAnalysisPseudonymous} variant="blue">Download without identifiers</Button>
          <Button onClick={downloadForAnalysisIdentifiable} variant="blue">Download with identifiers</Button>
        </RequireGroup>

        <p className="mt-8">Got another use case? Contact the national team with feedback on what data you'd like to get.</p>
      </Modal>
      <Modal open={newDonationModalOpen} onClose={() => setNewDonationModalOpen(false)}>
        <Form<DonationEdits>
          title="New donation"
          definition={{
            donorName: { label: 'Donor name', inputType: 'text' },
            donorEmail: { label: 'Donor email', inputType: 'email' },
            emailConsentInformational: { label: 'Email consent: informational', formatter: format.boolean, inputType: 'checkbox' },
            emailConsentMarketing: { label: 'Email consent: marketing', formatter: format.boolean, inputType: 'checkbox' },
            addressLine1: { label: 'Address line 1', inputType: 'text' },
            addressLine2: { label: 'Address line 2', inputType: 'text' },
            addressLine3: { label: 'Address line 3', inputType: 'text' },
            addressPostcode: { label: 'Address postcode', inputType: 'text' },
            addressCountry: { label: 'Address country', inputType: 'text' },
            giftAid: {
              label: 'Gift-aided', formatter: format.boolean, inputType: 'checkbox', warning: 'We must hold accurate names and addresses for gift-aided donations as per the Income Tax Act 2007',
            },
            charity: { label: 'Designated charity', inputType: 'text' },
            comment: { label: 'Donor comment', inputType: 'text' },
            overallPublic: { label: 'Donation is public', formatter: format.boolean, inputType: 'checkbox' },
            namePublic: { label: 'Donor name is public', formatter: format.boolean, inputType: 'checkbox' },
            donationAmountPublic: { label: 'Donation amount is public', formatter: format.boolean, inputType: 'checkbox' },
          }}
          initialValues={{
            donorName: '',
            donorEmail: '',
            emailConsentInformational: false,
            emailConsentMarketing: false,
            addressLine1: null,
            addressLine2: null,
            addressLine3: null,
            addressPostcode: null,
            addressCountry: null,
            giftAid: false,
            comment: null,
            charity: 'Unknown',
            overallPublic: false,
            namePublic: false,
            donationAmountPublic: false,
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            const donationId = (await axios.post<string>(`/admin/fundraisers/${fundraiserId}/donations`, data)).data;
            await refetchDonations();
            navigate(`/admin/${fundraiserId}/${donationId}`);
          }}
        />
      </Modal>
      <Table
        className="mb-8"
        definition={{
          donorName: { label: 'Name' },
          donorEmail: { label: 'Email' },
          createdAt: { label: 'At', formatter: format.timestamp },
          donationAmount: { label: 'Donated', formatter: (v: number) => format.amount(fundraiser?.currency, v) },
          matchFundingAmount: { label: 'Matched', formatter: (v: number) => format.amount(fundraiser?.currency, v) },
        }}
        items={asResponseValues(donations.data?.filter((d) => showUncounted || d.donationCounted).sort((a, b) => b.createdAt - a.createdAt), donations)}
        href={(donation) => `/admin/${fundraiserId}/${donation.id}/`}
      />
      <PropertyEditor
        definition={{
          totalDonations: { label: 'Total donations', formatter: (v: number | undefined) => format.amount(fundraiser?.currency, v) },
          totalMatching: { label: 'Total matching', formatter: (v: number | undefined) => format.amount(fundraiser?.currency, v) },
          totalGiftAid: { label: 'Total gift-aid', formatter: (v: number | undefined) => format.amount(fundraiser?.currency, v) },
          totalContributions: { label: 'Total contributions', formatter: (v: number | undefined) => format.amount(fundraiser?.currency, v) },
        }}
        item={asResponseValues({
          totalDonations: donations.data?.reduce((acc, cur) => acc + cur.donationAmount, 0),
          totalMatching: donations.data?.reduce((acc, cur) => acc + cur.matchFundingAmount, 0),
          // NB: Adam spoke with HMRC and confirmed gift-aid is applied to the total sum of what you're claiming
          // We actually calculate it per donation so that we can more easily reconcile between this and the total raised on the fundraiser
          // but the actual amount may be slightly different (by a matter of a few pence)
          totalGiftAid: donations.data?.filter((d) => d.giftAid).reduce((acc, cur) => acc + Math.floor(cur.donationAmount * 0.25), 0),
          totalContributions: donations.data?.reduce((acc, cur) => acc + cur.contributionAmount, 0),
        }, donations)}
      />
    </>
  );
};

export default FundraiserPage;
