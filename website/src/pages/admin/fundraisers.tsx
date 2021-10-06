import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { navigate } from "gatsby"

import { PlusSmIcon } from "@heroicons/react/outline"
import { SubmitHandler, useForm, useWatch } from "react-hook-form"
import { useAxios, useRawAxios } from "../../components/networking"
import Section, { SectionTitle } from "../../components/Section"
import { Fundraiser } from "./types.d"
import Table, { amountFormatter, dateFormatter } from "../../components/Table"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import { Form, LabelledInput } from "../../components/Form"
import Alert from "../../components/Alert"

const FundraisersPage: React.FC<RouteComponentProps> = () => {
  const [fundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")
  const [newModalOpen, setNewModalOpen] = React.useState(false)

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">Fundraisers</SectionTitle>
        <Button onClick={() => setNewModalOpen(true)}><PlusSmIcon className="h-6 mb-1" /> New</Button>
      </div>
      <Modal open={newModalOpen} onClose={() => setNewModalOpen(false)}>
        <Form<Omit<Fundraiser, "id">>
          title="New fundraiser"
          definition={{
            // TODO: formatters!
            fundraiserName: { label: "Name", inputType: "text" },
            activeFrom: { label: "From", inputType: "datetime-local" },
            activeTo: { label: "To", inputType: "datetime-local" },
            paused: { label: "Paused", inputType: "checkbox" },
            goal: { label: "Goal", inputType: "amount" },
            // TODO: hide totalRaised and donationsCount (and maybe other) fields - these should always initalise to 0
            totalRaised: { label: "Total raised", inputType: "amount" },
            donationsCount: { label: "Donations count", inputType: "number" },
            matchFundingRate: { label: "Match funding rate", inputType: "number" },
            matchFundingPerDonationLimit: { label: "Match funding per donation limit", inputType: "amount" },
            matchFundingRemaining: { label: "Match funding available", inputType: "amount" },
            minimumDonationAmount: { label: "Minimum donation", inputType: "amount" },
            groupsWithAccess: { label: "Groups with access", inputType: "multiselect", selectOptions: ["National"] },
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
            groupsWithAccess: [],
          }}
          showCurrent={false}
          onSubmit={() => { /* noop */ }}
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
