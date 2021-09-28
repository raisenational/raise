import * as React from "react"
import { RouteComponentProps } from "@reach/router"

import Section, { SectionTitle } from "../../components/Section"
import { AuthContext } from "../../components/AuthProvider"

const Profile: React.FC<RouteComponentProps> = () => {
  const { auth } = React.useContext(AuthContext)

  return (
    <Section>
      <SectionTitle>Profile</SectionTitle>
      <table className="table-fixed w-full text-left">
        <thead>
          <tr>
            <th className="w-32">Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name</td>
            <td className="overflow-hidden overflow-ellipsis whitespace-nowrap">{auth.name}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td className="overflow-hidden overflow-ellipsis whitespace-nowrap">{auth.email}</td>
          </tr>
          <tr>
            <td>ID token</td>
            <td className="overflow-hidden overflow-ellipsis whitespace-nowrap">{auth.idToken}</td>
          </tr>
          <tr>
            <td>Access token</td>
            <td className="overflow-hidden overflow-ellipsis whitespace-nowrap">{auth.accessToken}</td>
          </tr>
        </tbody>
      </table>
    </Section>
  )
}

export default Profile
