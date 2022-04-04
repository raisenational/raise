import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import { format, Profile } from "@raise/shared"
import Section, { SectionTitle } from "../../components/Section"
import PropertyEditor from "../../components/PropertyEditor"
import { useAxios } from "../../helpers/networking"

const ProfilePage: React.FC<RouteComponentProps> = () => {
  const [profile] = useAxios<Profile>("/admin/login")

  return (
    <Section>
      <SectionTitle>Profile</SectionTitle>
      <PropertyEditor
        definition={{
          email: { label: "Email" },
          groups: { label: "Groups with access", formatter: (groups: string[]) => groups.join(", ") },
          issuedAt: { label: "Logged in at", formatter: format.timestamp },
          expiresAt: { label: "Login expires at", formatter: format.timestamp },
          sourceIp: { label: "IP address" },
        }}
        item={profile}
      />
    </Section>
  )
}

export default ProfilePage
