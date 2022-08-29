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
        dev: "01FTPRWC19XK0MY82RWWS9V48H",
        prod: "01FTP655EDDFB6PT72S7VDNVVC",
      }}
      title="Raise Glasgow"
    />
  </>
)

export default Page
