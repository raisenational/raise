import * as React from "react"
import { navigate, RouteComponentProps } from "@reach/router"
import {
  DownloadIcon, EyeIcon, EyeOffIcon, PlusSmIcon,
} from "@heroicons/react/outline"
import jsonexport from "jsonexport/dist"
import {
  format, Fundraiser, Donation, DonationEdits, groups, g,
} from "@raise/shared"
import { asResponseValues, useAxios, useRawAxios } from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import Table from "../../components/Table"
import PropertyEditor from "../../components/PropertyEditor"
import Modal from "../../components/Modal"
import { Form } from "../../components/Form"
import Button from "../../components/Button"
import { RequireGroup } from "../../helpers/security"

const FundraiserPage: React.FC<RouteComponentProps & { fundraiserId?: string }> = ({ fundraiserId }) => {
  const [fundraisers, refetchFundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")
  const fundraiser = asResponseValues(fundraisers.data?.find((f) => f.id === fundraiserId), fundraisers)
  const axios = useRawAxios()

  return (
    <Section>
      <SectionTitle>{fundraiser.data?.internalName || "Fundraiser"}</SectionTitle>
      <PropertyEditor
        definition={{
          internalName: { label: "Internal name", inputType: "text" },
          publicName: { label: "Public name", inputType: "text" },
          activeFrom: { label: "From", formatter: format.timestamp, inputType: "datetime-local" },
          activeTo: { label: "To", formatter: format.timestamp, inputType: "datetime-local" },
          recurringDonationsTo: { label: "Recurring donations to", formatter: format.timestamp, inputType: "datetime-local" },
          paused: { label: "Paused", formatter: format.boolean, inputType: "checkbox" },
          currency: {
            label: "Currency", formatter: (s: string) => s.toUpperCase(), inputType: "select", selectOptions: ["gbp", "usd"],
          },
          goal: { label: "Goal", formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), inputType: "amount" },
          totalRaised: {
            label: "Total", formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), inputType: "amount", warning: "Do not edit the total unless you know what you are doing. You probably want to add a manual donation instead.",
          },
          donationsCount: {
            label: "Donation count", inputType: "number", warning: "Do not edit the donation count unless you know what you are doing. You probably want to add a manual donation instead.",
          },
          matchFundingRate: { label: "Match funding rate", formatter: (v: number, i: Fundraiser) => format.matchFundingRate(i.currency, v), inputType: "number" },
          matchFundingPerDonationLimit: { label: "Match funding per donation limit", formatter: (v: number | null, i: Fundraiser) => format.amount(i.currency, v), inputType: "amount" },
          matchFundingRemaining: {
            label: "Match funding remaining", formatter: (v: number | null, i: Fundraiser) => format.amount(i.currency, v), inputType: "amount", warning: "Do not edit the match funding remaining unless you know what you are doing.",
          },
          minimumDonationAmount: { label: "Minimum donation amount", formatter: (v: number | null, i: Fundraiser) => format.amount(i.currency, v), inputType: "amount" },
          suggestedDonationAmountOneOff: { label: "Suggested one off donation amount", formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), inputType: "amount" },
          suggestedDonationAmountWeekly: { label: "Suggested weekly donation amount", formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), inputType: "amount" },
          suggestedContributionAmount: { label: "Suggested contribution amount", formatter: (v: number | null, i: Fundraiser) => format.amount(i.currency, v), inputType: "amount" },
          eventLink: { label: "Event link", inputType: "text" },
          moreInvolvedLink: { label: "More involved link", inputType: "text" },
          groupsWithAccess: {
            label: "Groups with access", formatter: (gs: string[]) => gs.join(", ") || "(none selected)", inputType: "multiselect", selectOptions: groups,
          },
        }}
        item={fundraiser}
        onSave={async (data) => {
          await axios.patch(`/admin/fundraisers/${fundraiserId}`, {
            ...data,
            previous: {
              totalRaised: fundraiser.data?.totalRaised,
              donationsCount: fundraiser.data?.donationsCount,
            },
          })
          refetchFundraisers()
        }}
      />

      <RequireGroup group={fundraiser.data?.groupsWithAccess}>
        <DonationsSummaryView fundraiserId={fundraiserId} fundraiser={fundraiser.data} />
      </RequireGroup>
    </Section>
  )
}

const DonationsSummaryView: React.FC<{ fundraiserId?: string, fundraiser?: Fundraiser }> = ({ fundraiserId, fundraiser }) => {
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)
  const [newDonationModalOpen, setNewDonationModalOpen] = React.useState(false)
  const [showUncounted, setShowUncounted] = React.useState(false)
  const axios = useRawAxios()

  const downloadDonationsCSV = donations.data ? async () => {
    const csv = donations.data && await jsonexport(donations.data)
    if (csv) {
      const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csv}`)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `${fundraiserId}-donations.csv`)
      document.body.appendChild(link)
      link.click()
    }
  } : undefined

  return (
    <>
      <div className="flex mt-12">
        <SectionTitle className="flex-1">Donations</SectionTitle>
        {!showUncounted && <Button onClick={() => setShowUncounted(true)}><EyeIcon className="h-6 mb-1" /> <span className="hidden lg:inline">Show uncounted</span><span className="lg:hidden">More</span></Button>}
        {showUncounted && <Button onClick={() => setShowUncounted(false)}><EyeOffIcon className="h-6 mb-1" /> <span className="hidden lg:inline">Hide uncounted</span><span className="lg:hidden">Less</span></Button>}
        <RequireGroup group={g.National}><Button onClick={downloadDonationsCSV}><DownloadIcon className="h-6 mb-1" /> CSV</Button></RequireGroup>
        <Button onClick={() => setNewDonationModalOpen(true)}><PlusSmIcon className="h-6 mb-1" /> New<span className="hidden lg:inline"> manual donation</span></Button>
      </div>
      <Modal open={newDonationModalOpen} onClose={() => setNewDonationModalOpen(false)}>
        <Form<DonationEdits>
          title="New donation"
          definition={{
            donorName: { label: "Donor name", inputType: "text" },
            donorEmail: { label: "Donor email", inputType: "email" },
            emailConsentInformational: { label: "Email consent: informational", formatter: format.boolean, inputType: "checkbox" },
            emailConsentMarketing: { label: "Email consent: marketing", formatter: format.boolean, inputType: "checkbox" },
            addressLine1: { label: "Address line 1", inputType: "text" },
            addressLine2: { label: "Address line 2", inputType: "text" },
            addressLine3: { label: "Address line 3", inputType: "text" },
            addressPostcode: { label: "Address postcode", inputType: "text" },
            addressCountry: { label: "Address country", inputType: "text" },
            giftAid: {
              label: "Gift-aided", formatter: format.boolean, inputType: "checkbox", warning: "We must hold accurate names and addresses for gift-aided donations as per the Income Tax Act 2007",
            },
            charity: { label: "Designated charity", inputType: "text" },
            comment: { label: "Donor comment", inputType: "text" },
            overallPublic: { label: "Donation is public", formatter: format.boolean, inputType: "checkbox" },
            namePublic: { label: "Donor name is public", formatter: format.boolean, inputType: "checkbox" },
            donationAmountPublic: { label: "Donation amount is public", formatter: format.boolean, inputType: "checkbox" },
          }}
          initialValues={{
            donorName: "",
            donorEmail: "",
            emailConsentInformational: false,
            emailConsentMarketing: false,
            addressLine1: null,
            addressLine2: null,
            addressLine3: null,
            addressPostcode: null,
            addressCountry: null,
            giftAid: false,
            comment: null,
            charity: "AMF",
            overallPublic: false,
            namePublic: false,
            donationAmountPublic: false,
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            const donationId = (await axios.post<string>(`/admin/fundraisers/${fundraiserId}/donations`, data)).data
            await refetchDonations()
            navigate(`/admin/${fundraiserId}/${donationId}`)
          }}
        />
      </Modal>
      <Table
        className="mb-8"
        definition={{
          donorName: { label: "Name" },
          donorEmail: { label: "Email" },
          createdAt: { label: "At", formatter: format.timestamp },
          donationAmount: { label: "Donated", formatter: (v: number) => format.amount(fundraiser?.currency, v) },
          matchFundingAmount: { label: "Matched", formatter: (v: number) => format.amount(fundraiser?.currency, v) },
        }}
        items={asResponseValues(donations.data?.filter((d) => showUncounted || d.donationCounted).sort((a, b) => b.createdAt - a.createdAt), donations)}
        onClick={(donation) => navigate(`/admin/${fundraiserId}/${donation.id}/`)}
      />
      <PropertyEditor
        definition={{
          totalDonations: { label: "Total donations", formatter: (v: number | undefined) => format.amount(fundraiser?.currency, v) },
          totalMatching: { label: "Total matching", formatter: (v: number | undefined) => format.amount(fundraiser?.currency, v) },
          totalContributions: { label: "Total contributions", formatter: (v: number | undefined) => format.amount(fundraiser?.currency, v) },
        }}
        item={asResponseValues({
          totalDonations: donations.data?.reduce((acc, cur) => acc + cur.donationAmount, 0),
          totalMatching: donations.data?.reduce((acc, cur) => acc + cur.matchFundingAmount, 0),
          totalContributions: donations.data?.reduce((acc, cur) => acc + cur.contributionAmount, 0),
        }, donations)}
      />
    </>
  )
}

export default FundraiserPage
