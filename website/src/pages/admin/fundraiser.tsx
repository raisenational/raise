import * as React from "react"
import { navigate, RouteComponentProps } from "@reach/router"

import { PlusSmIcon } from "@heroicons/react/outline"
import { asResponseValues, useAxios, useRawAxios } from "../../components/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser, Donation } from "./types.d"
import Table, {
  amountFormatter, booleanFormatter, matchFundingRateFormatter, timestampFormatter,
} from "../../components/Table"
import PropertyEditor from "../../components/PropertyEditor"
import Modal from "../../components/Modal"
import { Form } from "../../components/Form"
import Button from "../../components/Button"

// TODO: improve types so fundraiser is correctly typed as string, not string | undefined, while still being able to use it similarly to how we are in the router
const FundraiserPage: React.FC<RouteComponentProps & { fundraiserId?: string }> = ({ fundraiserId }) => {
  const [fundraisers, refetchFundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")
  const [donations, refetchDonations] = useAxios<Donation[]>(`/admin/fundraisers/${fundraiserId}/donations`)
  const [newDonationModalOpen, setNewDonationModalOpen] = React.useState(false)
  const axios = useRawAxios()

  const fundraiser = asResponseValues(fundraisers.data?.find((f) => f.id === fundraiserId), fundraisers)

  return (
    <Section>
      <SectionTitle>{fundraiser.data?.fundraiserName || "Fundraiser"}</SectionTitle>
      <PropertyEditor
        definition={{
          fundraiserName: { label: "Name", inputType: "text" },
          activeFrom: { label: "From", formatter: timestampFormatter, inputType: "datetime-local" },
          activeTo: { label: "To", formatter: timestampFormatter, inputType: "datetime-local" },
          paused: { label: "Paused", formatter: booleanFormatter, inputType: "checkbox" },
          goal: { label: "Goal", formatter: amountFormatter, inputType: "amount" },
          totalRaised: {
            label: "Total", formatter: amountFormatter, inputType: "amount", warning: "Do not edit the total raised unless you know what you are doing. You probably want to add a manual donation instead.",
          },
          donationsCount: {
            label: "Donation count", inputType: "number", warning: "Do not edit the donation count unless you know what you are doing. You probably want to add a manual donation instead.",
          },
          matchFundingRate: { label: "Match funding rate", formatter: matchFundingRateFormatter, inputType: "number" },
          matchFundingPerDonationLimit: { label: "Match funding per donation limit", formatter: amountFormatter, inputType: "amount" },
          matchFundingRemaining: {
            label: "Match funding remaining", formatter: amountFormatter, inputType: "amount", warning: "Do not edit the match funding remaining unless you know what you are doing.",
          },
          minimumDonationAmount: { label: "Minimum donation amount", formatter: amountFormatter, inputType: "amount" },
          groupsWithAccess: {
            label: "Groups with access", formatter: (groups: string[]) => groups.join(", "), // inputType: "multiselect", selectOptions: ["National"],
          },
        }}
        item={fundraiser}
        onSave={() => { refetchFundraisers() }}
        patchEndpoint={`/admin/fundraisers/${fundraiserId}`}
      />

      <div className="flex mt-12">
        <SectionTitle className="flex-1">Donations</SectionTitle>
        <Button onClick={() => setNewDonationModalOpen(true)}><PlusSmIcon className="h-6 mb-1" /> Record manual donation</Button>
      </div>
      <Modal open={newDonationModalOpen} onClose={() => setNewDonationModalOpen(false)}>
        <Form<Omit<Donation, "id">>
          title="New donation"
          definition={{
            fundraiserId: { inputType: "hidden" },
            donorName: { label: "Donor name", inputType: "text" },
            donorEmail: { label: "Donor email", inputType: "email" },
            createdAt: { label: "At", formatter: timestampFormatter, inputType: "datetime-local" },
            addressLine1: { label: "Address line 1", inputType: "text" },
            addressLine2: { label: "Address line 2", inputType: "text" },
            addressLine3: { label: "Address line 3", inputType: "text" },
            addressPostcode: { label: "Address postcode", inputType: "text" },
            addressCountry: { label: "Address country", inputType: "text" },
            donationAmount: {
              label: "Donation amount", formatter: amountFormatter, inputType: "amount",
            },
            matchFundingAmount: {
              label: "Match funding amount", formatter: amountFormatter, inputType: "amount",
            },
            contributionAmount: {
              label: "Raise contribution amount", formatter: amountFormatter, inputType: "amount",
            },
            giftAid: {
              label: "Gift-aided", formatter: booleanFormatter, inputType: "checkbox", warning: "We must hold accurate names and addresses for gift-aided donations as per the Income Tax Act 2007",
            },
            paymentMethod: { label: "Payment method", inputType: "select", selectOptions: ["card", "cash", "direct_to_charity"] },
            payments: { inputType: "hidden" },
            paymentGatewayId: { label: "Payment reference", inputType: "text" },
            charity: { label: "Designated charity", inputType: "text" },
            comment: { label: "Donor comment", inputType: "text" },
            overallPublic: { label: "Donation is public", formatter: booleanFormatter, inputType: "checkbox" },
            namePublic: { label: "Donor name is public", formatter: booleanFormatter, inputType: "checkbox" },
            commentPublic: { label: "Comment is public", formatter: booleanFormatter, inputType: "checkbox" },
            donationAmountPublic: { label: "Donation amount is public", formatter: booleanFormatter, inputType: "checkbox" },
          }}
          initialValues={{
            fundraiserId: fundraiserId!,
            donorName: "",
            donorEmail: "",
            createdAt: Math.floor(new Date().getTime() / 1000),
            addressLine1: null,
            addressLine2: null,
            addressLine3: null,
            addressPostcode: null,
            addressCountry: null,
            giftAid: false,
            comment: null,
            donationAmount: 0,
            matchFundingAmount: 0,
            contributionAmount: 0,
            payments: [],
            paymentMethod: "direct_to_charity",
            paymentGatewayId: null,
            charity: "AMF",
            overallPublic: false,
            namePublic: false,
            commentPublic: false,
            donationAmountPublic: false,
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            const donationId = (await axios.post<string>(`/admin/fundraisers/${fundraiserId}/donations`, data)).data
            // TODO: evaluate whether this is good
            //   pros: simple, obvious why it's necessary, does not clear the cache for extra routes unnecessarily
            //   cons: useAxios.clearCache() runs faster so the new page renders sooner, if this fails the form displays its error, which may lead people to incorrectly thinking their request was unsuccessful
            await refetchDonations()
            navigate(`/admin/${fundraiserId}/${donationId}`)
          }}
        />
      </Modal>
      <Table
        definition={{
          donorName: { label: "Name" },
          donorEmail: { label: "Email" },
          createdAt: { label: "At", formatter: timestampFormatter },
          donationAmount: { label: "Donated", formatter: amountFormatter },
          matchFundingAmount: { label: "Matched", formatter: amountFormatter },
        }}
        items={donations}
        onClick={(donation) => navigate(`/admin/${fundraiserId}/${donation.id}/`)}
      />
    </Section>
  )
}

export default FundraiserPage
