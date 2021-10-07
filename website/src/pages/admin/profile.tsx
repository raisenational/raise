import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import Section, { SectionTitle } from "../../components/Section"
import { timestampFormatter } from "../../components/Table"
import PropertyEditor from "../../components/PropertyEditor"
import { useAxios } from "../../components/networking"
import { Profile } from "./types.d"

const ProfilePage: React.FC<RouteComponentProps> = () => {
  const [profile] = useAxios<Profile>("/admin/login")

  return (
    <Section>
      <SectionTitle>Profile</SectionTitle>
      <PropertyEditor
        definition={{
          email: { label: "Email" },
          groups: { label: "Groups with access", formatter: (groups: string[]) => groups.join(", ") },
          issuedAt: { label: "Logged in at", formatter: timestampFormatter },
          expiresAt: { label: "Login expires at", formatter: timestampFormatter },
          sourceIp: { label: "IP address" },
        }}
        item={profile}
      />
    </Section>
  )
}

export default ProfilePage
