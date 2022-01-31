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
        dev: "01FTPS1RQAPN17MF1XANMGJX4V",
        prod: "01FTP6N6G1Y412AQX0B7A0BGG7",
      }}
      title="Raise Imperial"
    />
  </>
)

export default Page
