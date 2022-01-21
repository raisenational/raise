import * as React from "react"
import Helmet from "react-helmet"
import DonationPage from "../../components/DonationPage"

const Page = () => (
  <>
    <Helmet>
      <meta name="robots" content="noindex" />
    </Helmet>
    <DonationPage
      fundraiserId="01FGNSHH6X6X878ZNBZKY44JQA"
      title="Raise Demo"
    />
  </>
)

export default Page
