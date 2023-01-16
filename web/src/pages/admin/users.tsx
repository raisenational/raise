import * as React from "react"
import { RouteComponentProps } from "@gatsbyjs/reach-router"
import { navigate } from "gatsby"
import { PlusSmIcon } from "@heroicons/react/outline"
import { fixedGroups, format, g } from "@raise/shared"
import {
  asResponseValues, useReq, useRawReq,
} from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import Table from "../../components/Table"
import Button from "../../components/Button"
import Modal from "../../components/Modal"
import { Form } from "../../components/Form"
import { RequireGroup } from "../../helpers/security"
import {
  GroupCreation, UserCreation,
} from "../../helpers/generated-api-client"

const UsersPage: React.FC<RouteComponentProps> = () => {
  const [users, refetchUsers] = useReq("get /admin/users")
  const [groups] = useReq("get /admin/groups")
  const groupMap = groups.data ? Object.fromEntries(groups.data.map((group) => [group.id, group.name])) : {}
  const [newUserModalOpen, setNewUserModalOpen] = React.useState(false)
  const [newGroupModalOpen, setNewGroupModalOpen] = React.useState(false)
  const req = useRawReq()

  return (
    <>
      <Section>
        <div className="flex">
          <SectionTitle className="flex-1">Users</SectionTitle>
          <RequireGroup group={[g.National, fixedGroups.National]}>
            <Button onClick={() => setNewUserModalOpen(true)}><PlusSmIcon className="h-6 mb-1" /> New <span className="hidden lg:inline">user</span></Button>
          </RequireGroup>
        </div>
        <Modal open={newUserModalOpen} onClose={() => setNewUserModalOpen(false)}>
          <Form<UserCreation>
            title="New user"
            definition={{
              name: { label: "Name", inputType: "text" },
              email: { label: "Email", inputType: "text" },
              groups: {
                label: "Groups", formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(", ") || "(none)", inputType: "multiselect", selectOptions: groupMap,
              },
              securityTrainingCompletedAt: { label: "Security training completed at", formatter: format.timestamp, inputType: "datetime-local" },
            }}
            initialValues={{
              name: "",
              email: "",
              groups: [],
              securityTrainingCompletedAt: Math.floor(new Date().getTime() / 1000),
            }}
            showCurrent={false}
            onSubmit={async (data) => {
              const userId = (await req("post /admin/users", data)).data
              await refetchUsers()
              navigate(`/admin/users/${userId}/`)
            }}
          />
        </Modal>
        <Table
          className="mb-8"
          definition={{
            name: { label: "Name", className: "whitespace-nowrap" },
            email: { label: "Email", className: "whitespace-nowrap" },
            groups: { label: "Groups", formatter: (ids?: string[]) => ids?.map((id) => groupMap[id]).join(", ") || "(none)" },
          }}
          // eslint-disable-next-line no-nested-ternary
          items={asResponseValues(users.data?.sort((a, b) => (a.name === b.name ? 0 : (a.name > b.name ? 1 : -1))), users)}
          onClick={(user) => navigate(`/admin/users/${user.id}/`)}
        />
      </Section>
      <Section>
        <div className="flex">
          <SectionTitle className="flex-1">Groups</SectionTitle>
          <RequireGroup group={[g.National, fixedGroups.National]}>
            <Button onClick={() => setNewGroupModalOpen(true)}><PlusSmIcon className="h-6 mb-1" /> New <span className="hidden lg:inline">group</span></Button>
          </RequireGroup>
        </div>
        <Modal open={newGroupModalOpen} onClose={() => setNewGroupModalOpen(false)}>
          <Form<GroupCreation>
            title="New group"
            definition={{
              name: { label: "Name", inputType: "text" },
            }}
            initialValues={{
              name: "",
            }}
            showCurrent={false}
            onSubmit={async (data) => {
              const groupId = (await req("post /admin/groups", data)).data
              await refetchUsers()
              navigate(`/admin/groups/${groupId}/`)
            }}
          />
        </Modal>
        <Table
          className="mb-8"
          definition={{
            name: { label: "Name", className: "whitespace-nowrap" },
          }}
          // eslint-disable-next-line no-nested-ternary
          items={asResponseValues(groups.data?.sort((a, b) => (b.name === a.name ? 0 : (b.name > a.name ? 1 : -1))), groups)}
          onClick={(group) => navigate(`/admin/groups/${group.id}/`)}
        />
      </Section>
    </>
  )
}

export default UsersPage
