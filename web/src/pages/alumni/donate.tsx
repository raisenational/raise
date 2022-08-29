import * as React from "react"
import Helmet from "react-helmet"
import DonationPage from "../../components/DonationPage"
import Link from "../../components/Link"
import { MoneyBox, Party } from "../../images/Icons"

const Page = () => (
  <>
    <Helmet>
      <meta name="robots" content="noindex" />
    </Helmet>
    <DonationPage
      fundraiserIds={{
        local: "01FGNSHH6X6X878ZNBZKY44JQA", // Raise Demo
        dev: "01FWF9B23419S5JFVV9A9XQG8E",
        prod: "01FVSAXB8YTDVPSGVGRTN61TQJ",
      }}
      title="Raise Alumni"
      aboutUsOverride={(
        <div>
          <p>Raise is a charitable movement encouraging people to adopt a positive approach towards deliberate, effective giving.</p>
          <div className="flex my-6 items-center">
            <MoneyBox className="h-16 mr-4" />
            <p className="flex-1">We invite you to donate an amount significant to you to the Against Malaria Foundation.</p>
          </div>
          <div className="flex my-6 items-center">
            <Party className="h-16 mr-4" />
            <p className="flex-1">Then we come together to celebrate our collective impact.</p>
          </div>
          <p>For more about our philosophy of celebrating deliberate, effective giving, see our <Link href="/">homepage</Link>.</p>
        </div>
      )}
    />
  </>
)

export default Page
