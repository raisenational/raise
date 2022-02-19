import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { navigate } from "gatsby"
import { PlusSmIcon } from "@heroicons/react/outline"
import {
  convert,
  format, Fundraiser, FundraiserEdits, groups,
} from "@raise/shared"
import {
  asResponseValues, useAuthState, useAxios, useRawAxios,
} from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import Table from "../../components/Table"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import { Form } from "../../components/Form"
import PropertyEditor from "../../components/PropertyEditor"

const FundraisersPage: React.FC<RouteComponentProps> = () => {
  const [fundraisers, refetchFundraisers] = useAxios<Fundraiser[]>("/admin/fundraisers")
  const [newFundraiserModalOpen, setNewFundraiserModalOpen] = React.useState(false)
  const axios = useRawAxios()
  const [auth] = useAuthState()

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
            internalName: { label: "Internal name", inputType: "text" },
            publicName: { label: "Public name", inputType: "text" },
            activeFrom: { label: "From", formatter: format.timestamp, inputType: "datetime-local" },
            activeTo: { label: "To", formatter: format.timestamp, inputType: "datetime-local" },
            recurringDonationsTo: { label: "Recurring donations to", formatter: format.timestamp, inputType: "datetime-local" },
            currency: { label: "Currency", inputType: "select", selectOptions: ["gbp", "usd"] },
            goal: { label: "Goal", formatter: (v?: number) => format.amount("gbp", v), inputType: "amount" },
            groupsWithAccess: {
              label: "Groups with access", formatter: format.json, inputType: "multiselect", selectOptions: groups,
            },
            suggestedDonationAmountOneOff: { label: "Suggested one off donation amount", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
            suggestedDonationAmountWeekly: { label: "Suggested weekly donation amount", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
            suggestedContributionAmount: { label: "Suggested contribution amount", formatter: (v?: number | null) => format.amount("gbp", v), inputType: "amount" },
          }}
          initialValues={{
            internalName: "New Fundraiser",
            publicName: "New Fundraiser",
            activeFrom: Math.floor(new Date().getTime() / 1000),
            activeTo: Math.floor(new Date().getTime() / 1000),
            recurringDonationsTo: Math.floor(new Date().getTime() / 1000),
            currency: "gbp",
            goal: 1000_00,
            groupsWithAccess: auth?.groups,
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
        className="mb-8"
        definition={{
          internalName: { label: "Name", className: "whitespace-nowrap" },
          activeFrom: { label: "From", formatter: format.date, className: "w-36" },
          activeTo: { label: "To", formatter: format.date, className: "w-36" },
          goal: { label: "Goal", formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), className: "w-36" },
          totalRaised: { label: "Raised", formatter: (v: number, i: Fundraiser) => format.amount(i.currency, v), className: "w-36" },
        }}
        items={asResponseValues(fundraisers.data?.sort((a, b) => b.activeFrom - a.activeFrom), fundraisers)}
        onClick={(fundraiser) => navigate(`/admin/${fundraiser.id}/`)}
      />
      <PropertyEditor
        definition={{
          totalGbpRaised: { label: "Total £ raised", formatter: (v: number | undefined) => format.amountShort("gbp", v) },
          totalPeopleProtected: { label: "Total people protected" },
        }}
        item={asResponseValues({
          totalGbpRaised: fundraisers.data?.reduce((acc, cur) => acc + (cur.currency === "gbp" ? cur.totalRaised : 0), 0),
          totalPeopleProtected: fundraisers.data?.reduce((acc, cur) => acc + convert.moneyToPeopleProtected(cur.currency, cur.totalRaised), 0),
        }, fundraisers)}
      />
    </Section>
  )
}

export default FundraisersPage
