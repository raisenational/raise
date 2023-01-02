import * as React from "react"
import DonationPage from "../../components/DonationPage"
import Link from "../../components/Link"
import { MoneyBox, Party } from "../../images/Icons"
import config from "./_config"

const Page = () => (
  <>
    <DonationPage
      {...config}
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
