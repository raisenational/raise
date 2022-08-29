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
        dev: "01FTPR9Y3Z7MXAXHJ145E7R2BK",
        prod: "01FTP624JCR246QSWW2TBJ6YS4",
      }}
      title="Raise Durham"
    />
  </>
)

export default Page
