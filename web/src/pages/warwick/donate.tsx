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
        dev: "01FTPS7SHMFVBPZP9Z5G2W82G9",
        prod: "01FTP6H9ZHB6BTS1J3G11VFRSY",
      }}
      title="Raise Warwick"
    />
  </>
)

export default Page
