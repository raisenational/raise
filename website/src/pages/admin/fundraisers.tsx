import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { navigate } from "gatsby"

import { PlusSmIcon } from "@heroicons/react/outline"
import { useAxios, useRawAxios } from "../../components/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser } from "./types.d"
import Table, {
  amountFormatter, booleanFormatter, dateFormatter, jsonFormatter, matchFundingRateFormatter, timestampFormatter,
} from "../../components/Table"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import { Form } from "../../components/Form"

const FundraisersPage: React.FC<RouteComponentProps> = () => {
  const [fundraisers, refetchFundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")
  const [newFundraiserModalOpen, setNewFundraiserModalOpen] = React.useState(false)
  const axios = useRawAxios()

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">Fundraisers</SectionTitle>
        <Button onClick={() => setNewFundraiserModalOpen(true)}><PlusSmIcon className="h-6 mb-1" /> New fundraiser</Button>
      </div>
      <Modal open={newFundraiserModalOpen} onClose={() => setNewFundraiserModalOpen(false)}>
        <Form<Omit<Fundraiser, "id">>
          title="New fundraiser"
          definition={{
            fundraiserName: { label: "Name", inputType: "text" },
            activeFrom: { label: "From", formatter: timestampFormatter, inputType: "datetime-local" },
            activeTo: { label: "To", formatter: timestampFormatter, inputType: "datetime-local" },
            paused: { label: "Paused", formatter: booleanFormatter, inputType: "checkbox" },
            goal: { label: "Goal", formatter: amountFormatter, inputType: "amount" },
            totalRaised: { inputType: "hidden" },
            donationsCount: { inputType: "hidden" },
            matchFundingRate: { label: "Match funding rate", formatter: matchFundingRateFormatter, inputType: "number" },
            matchFundingPerDonationLimit: { label: "Match funding per donation limit", formatter: amountFormatter, inputType: "amount" },
            matchFundingRemaining: { label: "Match funding available", formatter: amountFormatter, inputType: "amount" },
            minimumDonationAmount: { label: "Minimum donation", formatter: amountFormatter, inputType: "amount" },
            groupsWithAccess: {
              label: "Groups with access", formatter: jsonFormatter, inputType: "multiselect", selectOptions: ["National"],
            },
          }}
          initialValues={{
            fundraiserName: "New Fundraiser",
            activeFrom: Math.floor(new Date().getTime() / 1000),
            activeTo: null,
            paused: false,
            goal: 1_00,
            totalRaised: 0,
            donationsCount: 0,
            matchFundingRate: 0,
            matchFundingPerDonationLimit: null,
            matchFundingRemaining: null,
            minimumDonationAmount: null,
            groupsWithAccess: ["National"],
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            const fundraiserId = (await axios.post<string>("/admin/fundraisers", data)).data
            // TODO: evaluate whether this is good
            //   pros: simple, obvious why it's necessary, does not clear the cache for extra routes unnecessarily
            //   cons: useAxios.clearCache() runs faster so the new page renders sooner, if this fails the form displays its error, which may lead people to incorrectly thinking their request was unsuccessful
            await refetchFundraisers()
            navigate(`/admin/${fundraiserId}`)
          }}
        />
      </Modal>
      <Table
        definition={{
          fundraiserName: { label: "Name", className: "whitespace-nowrap" },
          activeFrom: { label: "From", formatter: dateFormatter, className: "w-36" },
          activeTo: { label: "To", formatter: dateFormatter, className: "w-36" },
          goal: { label: "Goal", formatter: amountFormatter, className: "w-36" },
          totalRaised: { label: "Raised", formatter: amountFormatter, className: "w-36" },
        }}
        items={fundraisers}
        onClick={(fundraiser) => navigate(`/admin/${fundraiser.id}/`)}
      />
    </Section>
  )
}

export default FundraisersPage
