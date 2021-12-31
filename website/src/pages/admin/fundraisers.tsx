import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { navigate } from "gatsby"
import { PlusSmIcon } from "@heroicons/react/outline"
import { format, Fundraiser, FundraiserEdits } from "@raise/shared"
import { useAxios, useRawAxios } from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import Table from "../../components/Table"
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
        <Form<FundraiserEdits>
          title="New fundraiser"
          definition={{
            fundraiserName: { label: "Name", inputType: "text" },
            activeFrom: { label: "From", formatter: format.timestamp, inputType: "datetime-local" },
            activeTo: { label: "To", formatter: format.timestamp, inputType: "datetime-local" },
            recurringDonationsTo: { label: "Recurring donations to", formatter: format.timestamp, inputType: "datetime-local" },
            paused: { label: "Paused", formatter: format.boolean, inputType: "checkbox" },
            goal: { label: "Goal", formatter: (v?: number) => format.amount("gbp", v), inputType: "amount" },
            totalRaised: { inputType: "hidden" },
            donationsCount: { inputType: "hidden" },
            matchFundingRate: { label: "Match funding rate", formatter: (v?: number) => format.matchFundingRate(null, v), inputType: "number" },
            matchFundingPerDonationLimit: { label: "Match funding per donation limit", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
            matchFundingRemaining: { label: "Match funding available", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
            minimumDonationAmount: { label: "Minimum donation", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
            groupsWithAccess: {
              label: "Groups with access", formatter: format.json, inputType: "multiselect", selectOptions: ["National"],
            },
            suggestedDonationAmountOneOff: { label: "Suggested one off donation amount", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
            suggestedDonationAmountWeekly: { label: "Suggested weekly donation amount", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
            suggestedContributionAmount: { label: "Suggested contribution amount", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
          }}
          initialValues={{
            fundraiserName: "New Fundraiser",
            activeFrom: Math.floor(new Date().getTime() / 1000),
            activeTo: Math.floor(new Date().getTime() / 1000),
            recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
            paused: false,
            goal: 1_00,
            totalRaised: 0,
            donationsCount: 0,
            matchFundingRate: 0,
            matchFundingPerDonationLimit: null,
            matchFundingRemaining: null,
            minimumDonationAmount: null,
            groupsWithAccess: ["National"],
            suggestedDonationAmountOneOff: 150_00,
            suggestedDonationAmountWeekly: 9_00,
            suggestedContributionAmount: 10_00,
          }}
          showCurrent={false}
          onSubmit={async (data) => {
            const fundraiserId = (await axios.post<string>("/admin/fundraisers", data)).data
            await refetchFundraisers()
            navigate(`/admin/${fundraiserId}`)
          }}
        />
      </Modal>
      <Table
        definition={{
          fundraiserName: { label: "Name", className: "whitespace-nowrap" },
          activeFrom: { label: "From", formatter: format.date, className: "w-36" },
          activeTo: { label: "To", formatter: format.date, className: "w-36" },
          goal: { label: "Goal", formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), className: "w-36" },
          totalRaised: { label: "Raised", formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), className: "w-36" },
        }}
        items={fundraisers}
        onClick={(fundraiser) => navigate(`/admin/${fundraiser.id}/`)}
      />
    </Section>
  )
}

export default FundraisersPage
