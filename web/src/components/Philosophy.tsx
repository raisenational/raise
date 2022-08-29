import * as React from "react"
import {
  StarIcon, CakeIcon, AcademicCapIcon, CurrencyPoundIcon,
} from "@heroicons/react/outline"
import classNames from "classnames"

const Philosophy: React.FC = () => (
  <div className="max-w-2xl mx-auto text-left">
    <Point className="bg-raise-purple" icon={StarIcon}>
      We believe in the power of giving positively and deliberately, rather than engaging with charity passively or out of obligation. In our view, giving in this way is more meaningful, more sustainable, and ultimately more impactful.
    </Point>
    <Point className="bg-raise-red" icon={CurrencyPoundIcon}>
      That’s why, once a year, we invite students to make a donation that feels personally significant - an amount that makes you think about the reasons for your donation. Ultimately, we want giving to become a considered and meaningful action.
    </Point>
    <Point className="bg-raise-orange" icon={CakeIcon}>
      Our Summer Party embodies this attitude towards our giving. It’s a time when we come together to celebrate our collective impact, while enjoying the end of the year with a wonderful community.
    </Point>
    <Point className="bg-raise-yellow text-black" icon={AcademicCapIcon}>
      We want to create a culture where deliberate, positive giving is normalised at university and beyond. And so, we encourage students to take this philosophy forward into their future lives, for example by pursuing an impactful career or taking a long-term giving pledge.
    </Point>

    <iframe className="w-full mt-12 rounded shadow-raise" title="YouTube: Rethinking Celebration: The Positive Case for Giving" width="672" height="378" src="https://www.youtube-nocookie.com/embed/fvjeG7xE-wE?rel=0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    <p className="text-center text-xl mt-2">Check out our founder's TEDx Talk, 'Rethinking Celebration: The Positive Case for Giving', which talks all about our feel-good philosophy!</p>
  </div>
)

const Point: React.FC<{ className?: string, icon: React.FC<{ width?: number, height?: number }> }> = ({ className, icon: Icon, children }) => (
  <div className={classNames("flex mt-4 p-4 rounded shadow-raise", className)}>
    <div><Icon width={60} height={60} /></div>
    <p className="ml-8">
      {children}
    </p>
  </div>
)

export default Philosophy
