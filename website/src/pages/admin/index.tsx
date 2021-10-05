import * as React from "react"
import Helmet from "react-helmet"
import { Router } from "@reach/router"

import Page from "../../components/Page"
import Fundraisers from "./fundraisers"
import Profile from "./profile"
import Login from "./login"
import NotFoundPage from "../404"
import Navigation from "../../components/Navigation"
import Fundraiser from "./fundraiser"
import { useAuthState } from "../../components/networking"
import Alert from "../../components/Alert"
import Section from "../../components/Section"

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
  React.useEffect(() => {
    if (typeof auth?.expiresAt !== "number") return undefined

    const msUntilExpiration = (auth.expiresAt * 1000) - new Date().getTime()

    const timeout = setTimeout(() => {
      setLogoutWarning("You will be logged out in the next minute")
    }, msUntilExpiration - 60_000)

    return () => clearTimeout(timeout)
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
      {logoutWarning && (
        <Section>
          <Alert variant="warning">{logoutWarning}</Alert>
        </Section>
      )}
      <Router basepath="/admin" className="text-left">
        {auth && (
          <>
            <Fundraisers path="/" />
            <Fundraiser path="/:fundraiserId" />
            <Profile path="/profile" />
            <NotFoundPage default />
          </>
        )}

        {!auth && <Login default />}
      </Router>
    </>
  )
}

export default IndexPage
