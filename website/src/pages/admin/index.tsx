import * as React from "react"
import Helmet from "react-helmet"
import { Router } from "@reach/router"

import Page from "../../components/Page"
import FundraisersPage from "./fundraisers"
import ProfilePage from "./profile"
import Login from "./login"
import NotFoundPage from "../404"
import Navigation from "../../components/Navigation"
import FundraiserPage from "./fundraiser"
import { useAuthState } from "../../components/networking"
import Alert from "../../components/Alert"
import Section from "../../components/Section"
import DonationPage from "./donation"

const IndexPage = () => (
  <Page className="pb-8">
    <Helmet>
      <title>Raise Admin</title>
      <meta property="og:title" content="Raise Admin" />
      <meta name="robots" content="noindex" />
    </Helmet>
    <IndexLayout />
  </Page>
)

const IndexLayout = () => {
  const [auth, setAuth] = useAuthState()
  const [logoutWarning, setLogoutWarning] = React.useState<string | undefined>()
  // This logs out the user when their access token expires
  // TODO: for security, if the user is inactive for some time (e.g. doesn't click for 10 minutes) we should log them out too
  React.useEffect(() => {
    if (typeof auth?.expiresAt !== "number") return undefined

    const msUntilExpiration = (auth.expiresAt * 1000) - new Date().getTime()

    const warningTimeout = setTimeout(() => {
      setLogoutWarning("You will be logged out in the next minute")
    }, msUntilExpiration - 60_000)

    const logoutTimeout = setTimeout(() => {
      setLogoutWarning(undefined)
      setAuth()
    }, msUntilExpiration)

    return () => {
      clearTimeout(warningTimeout)
      clearTimeout(logoutTimeout)
    }
  }, [auth?.expiresAt])

  return (
    <>
      {auth && (
        <Navigation
          left={[
            { text: "Fundraisers", href: "/admin/" },
            { text: "Profile", href: "/admin/profile" },
          ]}
          right={[
            { text: "Logout", onClick: () => setAuth() },
          ]}
        />
      )}
      {logoutWarning && auth && (
        <Section>
          <Alert variant="warning">{logoutWarning}</Alert>
        </Section>
      )}
      <Router basepath="/admin" className="text-left">
        {auth && (
          <>
            <FundraisersPage path="/" />
            <FundraiserPage path="/:fundraiserId" />
            <DonationPage path="/:fundraiserId/:donationId" />
            <ProfilePage path="/profile" />
            <NotFoundPage default />
          </>
        )}

        {!auth && <Login default />}
      </Router>
    </>
  )
}

export default IndexPage
