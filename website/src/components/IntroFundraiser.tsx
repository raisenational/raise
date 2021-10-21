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
      <div className="grid sm:grid-cols-2 gap-32">
        <div className="text-left self-center">
          <img alt="" src={logo} height={60} width={95} className="mb-8" />
          <h1 className="text-5xl sm:text-7xl font-raise-header font-black">{title}</h1>
          <p className="text-2xl sm:text-3xl">{tagline}</p>
        </div>
        <div className="self-center">
          <p className="text-2xl"><span className="text-5xl sm:text-7xl stat-animate">{amountDropPenceIfZeroFormatter(fundraiser.data?.totalRaised)}</span><br /> raised by {fundraiser.data?.donationsCount} student{fundraiser.data?.donationsCount === 1 ? "" : "s"} of a {amountDropPenceIfZeroFormatter(fundraiser.data?.goal)} goal</p>

          <div className="px-8 -mt-4 mb-8">
            <div className="grid grid-cols-2 sm:flex transform sm:-skew-x-15 shadow-raise mt-8 rounded overflow-hidden font-light">
              <div className="py-2 sm:py-3 bg-raise-red transition-all ease-in-out duration-1000" style={{ width: `${fundraiser.data ? Math.min(Math.round((fundraiser.data.totalRaised / fundraiser.data.goal) * 100), 100) : 0}%` }} />
              <div className="flex-auto py-2 sm:py-3 bg-raise-purple" />
            </div>
          </div>

          <Button variant="outline" onClick={() => alert("TODO: open donation flow")}>Donate</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-8 text-left mt-12">
        {/* Show the first six donations */}
        {/* TODO: add a 'show all donations' button that toggles displaying all the donations */}
        {fundraiser.data?.donations.slice(0, 6).map((d) => <DonationCard key={d.createdAt} className="bg-raise-red" {...d} />)}
        {/* <DonationCard {...{
          createdAt: 1634841833,
          comment: null,
          giftAid: true,
          donationAmount: 10_00,
          matchFundingAmount: 100_00,
          contributionAmount: 0,
        }}
        />
        <DonationCard {...{
          donorName: "Joe Bloggs",
          createdAt: 1634840833,
          comment: null,
        }}
        />
        <DonationCard {...{
          donorName: "Jane Doe",
          createdAt: 1634831833,
          comment: "Pleased to be giving to such a great cause",
          giftAid: false,
          donationAmount: 150_00,
          matchFundingAmount: 150_00,
          contributionAmount: 0,
        }}
        />
        <DonationCard {...{
          donorName: "Ben Bloggs",
          createdAt: 1634830833,
          comment: null,
          giftAid: true,
          donationAmount: 100_00,
          matchFundingAmount: 100_00,
          contributionAmount: 0,
        }}
        />
        <DonationCard {...{
          donorName: "John Doe",
          createdAt: 1634829833,
          comment: "Raise is an excellent movement and I'm pleased to be part of it!",
          giftAid: false,
          donationAmount: 50_00,
          matchFundingAmount: 50_00,
          contributionAmount: 0,
        }}
        />
        <DonationCard {...{
          donorName: "Teri Dactyl",
          createdAt: 1634828833,
          comment: null,
        }}
        /> */}
      </div>
    </div>
  )
}

export default IntroFundraiser
