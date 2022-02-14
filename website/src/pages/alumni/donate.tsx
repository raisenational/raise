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
        dev: "01FTPR1THYQP39EBE1GG9HD41T", // this is mwa atm, change in future
        prod: "01FVSAXB8YTDVPSGVGRTN61TQJ",
      }}
      title="Raise Alumni"
    />
  </>
)

export default Page
