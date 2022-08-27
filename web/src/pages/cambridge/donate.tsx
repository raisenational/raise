import * as React from "react"
import Helmet from "react-helmet"
import DonationPage from "../../components/DonationPage"

const Page = () => (
  <>
    <Helmet>
      <meta name="robots" content="noindex" />
    </Helmet>
    <DonationPage
      fundraiserIds={{
        local: "01FGNSHH6X6X878ZNBZKY44JQA", // Raise Demo
        dev: "01FTPR1THYQP39EBE1GG9HD41T",
        prod: "01FT9ZGNNEY9WZX01EEXCTP9H4",
      }}
      title="MWA"
    />
  </>
)

export default Page
