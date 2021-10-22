import * as React from "react"
import logo from "../images/logo.png"
import Button from "./Button"
import DonationCard from "./DonationCard"
import { animateStatsIn } from "./IntroStats"
import { useAxios } from "./networking"
import { PublicFundraiser } from "../pages/admin/types.d"
import { amountDropPenceIfZeroFormatter } from "./Table"

interface Props {
  title: string,
  tagline: string,
  fundraiserId: string,
}

const IntroFundraiser: React.FC<Props> = ({ title, tagline, fundraiserId }) => {
  const [fundraiser, refetchFundraiser] = useAxios<PublicFundraiser>(`/public/fundraisers/${fundraiserId}`)

  const ref = React.useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = React.useState(false)
  React.useLayoutEffect(() => {
    if (ref.current && fundraiser.data && !hasAnimated) {
      animateStatsIn(ref.current)
      setHasAnimated(true)
    }
  })

  return (
    <div ref={ref}>
      <div className="grid gap-8 md:grid-cols-2 md:gap-32">
        <div className="md:text-left self-center">
          <img alt="" src={logo} height={60} width={95} className="mb-8" />
          <h1 className="text-5xl md:text-7xl font-raise-header font-black">{title}</h1>
          <p className="text-2xl md:text-3xl">{tagline}</p>
        </div>
        <div className="self-center">
          <p className="text-2xl"><span className="text-5xl md:text-7xl stat-animate">{amountDropPenceIfZeroFormatter(fundraiser.data?.totalRaised)}</span><br /> raised by {fundraiser.data?.donationsCount} student{fundraiser.data?.donationsCount === 1 ? "" : "s"} of a {amountDropPenceIfZeroFormatter(fundraiser.data?.goal)} goal</p>

          <div className="mx-2 -mt-4 mb-8">
            <div className="flex transform -skew-x-15 shadow-raise mt-8 rounded overflow-hidden">
              <div className="py-3 bg-raise-red transition-all ease-in-out duration-1000" style={{ width: `${fundraiser.data ? Math.min(Math.round((fundraiser.data.totalRaised / fundraiser.data.goal) * 100), 100) : 0}%` }} />
              <div className="flex-auto py-2 md:py-3 bg-raise-purple" />
            </div>
          </div>

          <Button variant="outline" className="block mx-2 md:inline-block md:mx-0" onClick={() => alert("TODO: open donation flow")}>Donate</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-8 text-left mt-12">
        {/* Show the first six donations */}
        {/* TODO: add a 'show all donations' button that toggles displaying all the donations */}
        {fundraiser.data?.donations.slice(0, 6).map((d) => <DonationCard key={d.createdAt} className="bg-raise-red" {...d} />)}
      </div>
    </div>
  )
}

export default IntroFundraiser
