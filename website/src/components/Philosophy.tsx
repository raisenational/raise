import * as React from "react"
import { ArrowRightIcon } from "@heroicons/react/outline"

import moneyBox from "../images/moneyBox.svg"
import party from "../images/party.svg"

const Philosophy: React.FC<{}> = () => (
  <div className="max-w-2xl mx-auto text-left">
    <div className="flex">
      <img alt="" src={moneyBox} width={60} />
      <p className="ml-8">
        We believe that choosing to give deliberately, rather than engaging with charity passively or out of obligation, can be a positive and rewarding experience. As such, we invite students to make a personally significant donation as a way of celebrating the end of the academic year.
      </p>
    </div>
    <div className="flex mt-6">
      <img alt="" style={{ filter: "invert(1)" }} src={party} width={60} />
      <p className="ml-8">
        We aim to show that by putting giving at the heart of celebration, we can have a huge impact and a wonderful time in the process. Our Summer Party embodies this philosophy, as students come together to celebrate the collective impact of their donations.
      </p>
    </div>
    <div className="flex mt-6">
      <div><ArrowRightIcon width={60} /></div>
      <p className="ml-8">
        We encourage students to take this positive, meaningful approach to giving forwards into their future lives, ultimately creating a culture whereby deliberate, effective giving is normalised at university and beyond.
      </p>
    </div>
    <iframe className="w-full mt-12" title="YouTube: Rethinking Celebration: The Positive Case for Giving" width="560" height="315" src="https://www.youtube-nocookie.com/embed/fvjeG7xE-wE" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    <p className="text-center text-xl mt-2">Check out our founder's TEDx Talk, 'Rethinking Celebration: The Positive Case for Giving', which talks all about our feel-good philosophy!</p>
  </div>
)

export default Philosophy
