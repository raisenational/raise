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
        dev: "01FTPRP2F57S5A697E82XE4SA9",
        prod: "01FTP6H8B5AXXHR21HJY79EHWV",
      }}
      title="Raise Sheffield"
    />
  </>
)

export default Page
