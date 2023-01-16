import * as React from "react"
import { RouteComponentProps } from "@gatsbyjs/reach-router"
import { format } from "@raise/shared"
import { asResponseValues, useReq, useRawReq } from "../../helpers/networking"
import Section, { SectionTitle } from "../../components/Section"
import PropertyEditor from "../../components/PropertyEditor"
import { User } from "../../helpers/generated-api-client"

const UserPage: React.FC<RouteComponentProps & { userId: string }> = ({ userId }) => {
  const [users, refetchUsers] = useReq("get /admin/users")
  const [groups] = useReq("get /admin/groups")
  const req = useRawReq()

  const user = asResponseValues(users.data?.find((u) => u.id === userId), users)

  return (
    <Section>
      <div className="flex">
        <SectionTitle className="flex-1">{user.data?.name ?? "User"}</SectionTitle>
      </div>
      <PropertyEditor<User>
        definition={{
          name: { label: "Name", inputType: "text" },
          email: { label: "Email", inputType: "text" },
          groups: { label: "Groups", inputType: "multiselect", selectOptions: (groups.data ?? []).map((g) => g.name) },
          securityTrainingCompletedAt: { label: "Security training completed at", formatter: format.timestamp, inputType: "datetime-local" },
        }}
        item={user}
        onSave={async (data) => {
          await req("patch /admin/users/{userId}", { userId }, data)
          refetchUsers()
        }}
      />
    </Section>
  )
}

export default UserPage
