import * as React from "react"
import Helmet from "react-helmet"
import confetti from "canvas-confetti"

import { convert, format } from "@raise/shared"
import Page from "../../components/Page"
import { useAxios } from "../../helpers/networking"
import Alert from "../../components/Alert"

const LivePage = () => {
  const [soGiveResponse, refetchSoGiveData] = useAxios<{
    cargo: {
      donationCount: number,
      donated: {
        value100p: number,
      },
      userTarget: {
        value100p: number,
      },
    },
  }>("https://app.sogive.org/fundraiser/raiseglasgow.jdqz3kp2.52af2e.json")

  // const donationCount = soGiveResponse.data?.cargo.donationCount ?? 0
  const totalDonated = (soGiveResponse.data?.cargo.donated.value100p ?? 0) / 100
  const target = (soGiveResponse.data?.cargo.userTarget.value100p ?? 1) / 100

  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  React.useEffect(() => {
    if (!prefersReducedMotion) {
      const i = setInterval(() => {
        confetti({
          particleCount: 10,
          angle: 290,
          spread: 70,
          origin: { x: 0, y: -0.4 },
          startVelocity: 0.06 * window.innerHeight,
          gravity: 1,
          ticks: 400,
        })
        confetti({
          particleCount: 10,
          angle: 250,
          spread: 70,
          origin: { x: 1, y: -0.4 },
          startVelocity: 0.06 * window.innerHeight,
          gravity: 1,
          ticks: 400,
        })
      }, 250)

      return () => clearInterval(i)
    }
    return () => { /* noop */ }
  }, [prefersReducedMotion])

  React.useEffect(() => {
    const i = setInterval(() => {
      refetchSoGiveData()
    }, 15_000)

    const t = setTimeout(() => {
      clearInterval(i)
      // eslint-disable-next-line no-alert
      alert("This page has stopped updating as it's been over 24 hours since you opened it, and we want to avoid unnecessary load on SoGive. Please refresh this page if you want to continue seeing live data.")
    }, 86400_000) // 24 hours

    return () => {
      clearTimeout(t)
      clearInterval(i)
    }
  })

  return (
    <Page>
      <Helmet>
        <title>Raise Glasgow: Live</title>
        <meta property="og:title" content="Raise Glasgow: Live" />
      </Helmet>

      {soGiveResponse.error && <Alert className="m-16">{soGiveResponse.error}</Alert>}
      {soGiveResponse.data && (
        <div className="text-5xl flex flex-col h-screen overflow-hidden">
          <div className="transition-all duration-1000" style={{ height: `${100 - Math.min(100, 100 * (totalDonated / target))}vh` }}>
            <p className="py-4">Goal: {format.amountShort("gbp", target)}</p>
          </div>
          <div className="bg-raise-purple flex-1">
            <p className="py-4">
              {totalDonated === 0
                ? "We haven't receieved a donation yet - be the first to donate!"
                : `Together we've raised ${format.amountShort("gbp", totalDonated)}, protecting ${convert.moneyToPeopleProtected("gbp", totalDonated)} people from malaria!`}
            </p>
          </div>
        </div>
      )}
    </Page>
  )
}

export default LivePage
