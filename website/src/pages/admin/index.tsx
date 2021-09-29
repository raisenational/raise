import * as React from "react"
import Helmet from "react-helmet"
import { Router } from "@reach/router"

import Page from "../../components/Page"
import Fundraisers from "./fundraisers"
import Profile from "./profile"
import Login from "./login"
import NotFoundPage from "../404"
import Navigation from "../../components/Navigation"
import { AuthContext, AuthProvider } from "../../components/AuthProvider"
import Fundraiser from "./fundraiser"

const IndexPage = () => (
  <Page className="pb-8">
    <Helmet>
      <title>Raise Admin</title>
      <meta property="og:title" content="Raise Admin" />
      <meta name="robots" content="noindex" />
    </Helmet>
    <AuthProvider>
      <IndexLayout />
    </AuthProvider>
  </Page>
)

const IndexLayout = () => {
  const { auth, setAuth } = React.useContext(AuthContext)

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
