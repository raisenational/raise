import * as React from "react"
import {
  StarIcon, CakeIcon, AcademicCapIcon, CurrencyPoundIcon, EyeOffIcon, HeartIcon,
} from "@heroicons/react/outline"
import classNames from "classnames"
import confetti from "canvas-confetti"
import AOS from "aos"
import "aos/dist/aos.css"
import oliLane from "../images/oli-lane.png"

const launchConfetti = () => {
  // Use simpler confetti for mobile to reduce lag
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())
  if (isMobile) {
    confetti({
      particleCount: 100,
      angle: 90,
      spread: 40,
      origin: { x: 0.5, y: 1.2 },
      startVelocity: 0.087 * window.innerHeight,
      gravity: 1,
      ticks: 300,
    })
    return
  }

  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 50,
        spread: 70,
        origin: { x: -0.1, y: 1 },
        startVelocity: 0.087 * window.innerHeight,
        gravity: 1.5,
        ticks: 250,
      })
      confetti({
        particleCount: 40,
        angle: 130,
        spread: 70,
        origin: { x: 1.1, y: 1 },
        startVelocity: 0.087 * window.innerHeight,
        gravity: 1.5,
        ticks: 250,
      })
    }, i * 50)
  }
}

const Philosophy: React.FC = () => {
  React.useEffect(() => {
    AOS.init()
  })

  return (
    <div className="max-w-2xl mx-auto text-left">
      <p>Can you remember the last time you gave to charity? Perhaps you bought something at a bake sale? Or sponsored a friend running a marathon?</p>
      <p className="my-4">These days, opportunities for us to do good through donations are everywhere.</p>
      <CakeIcon width={60} height={60} className="block mx-auto my-4 hover:scale-105 active:scale-0 transition-all" />
      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">But it's much rarer that we stop and think about our donation. Most of these opportunities either hide the act of giving from view - so we don't even notice it's happening -  or push us to give only when we're directly asked.</p>
      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">At Raise, we think that's a <span className="font-bold">real missed opportunity</span>.</p>
      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">We believe that when we pause to think about our giving, the experience can be incredibly rewarding.</p>
      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">When we properly consider why we are giving and the impact our money will have - in short, when we give deliberately - we can really appreciate how positive donating to charity can be.</p>
      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">This way, giving becomes more <Scroller values={["meaningful", "enjoyable", "sustainable"]} /> and ultimately more <span className="animate-breathe inline-block cursor-pointer" onClick={launchConfetti} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { launchConfetti(); e.preventDefault() } }} role="button" tabIndex={0}>impactful</span>.
      </p>
      <div data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200"><HeartIcon width={60} height={60} className="block mx-auto my-4 hover:scale-105 transition-all cursor-pointer" onClick={launchConfetti} /></div>
      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">So, how does Raise work?</p>
      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">We invite students to join us and celebrate the end of the academic year by making a personally significant donation to charity - an amount that will <span className="font-bold">make you think about what and why you are giving</span>.</p>

      <div className="flex my-12" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
        <div className="mr-12 ml-8 relative">
          <p className="text-left before:content-['“'] before:absolute before:text-[20rem] before:leading-none before:font-black before:-left-12 before:-top-12 before:opacity-20">
            It took me a long time to decide to join Raise - I'd never given that much before - but when I finally donated, I saw our incredible impact and it really made donating an amazing positive experience.
          </p>
          <p className="text-right font-bold mt-2">
            Clara Tuffrey, Donor
          </p>
        </div>
        <div className="hidden sm:block w-40 flex-shrink-0">
          {/* TODO: get an image of Clara */}
          <img src={oliLane} alt="Headshot of Clara Tuffrey" className="shadow-raise rounded-full hover:rotate-6 transition-all duration-500 ease-out" />
        </div>
      </div>

      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">Then, at the end of the academic year, we come together as a community for our Summer Party. It's a time when we can reflect on and celebrate the impact of our donations, while enjoying the end of the year with a wonderful group of people.</p>

      <div className="flex my-12" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
        <div className="hidden sm:block w-40 flex-shrink-0">
          {/* TODO: get an image of Rahul */}
          <img src={oliLane} alt="Headshot of Rahul Shah" className="shadow-raise rounded-full hover:-rotate-6 transition-all duration-500 ease-out" />
        </div>
        <div className="ml-12 mr-8 relative">
          <p className="text-left before:content-['“'] before:absolute before:text-[20rem] before:leading-none before:font-black before:-left-12 before:-top-12 before:opacity-20">
            It was at the Summer Party that I really appreciated just how powerful the idea of giving positively and deliberately can be. Everyone was having a great time, energised by the collective knowledge that together we'd done something incredible.
          </p>
          <p className="text-right font-bold mt-2">
            Rahul Shah, Donor
          </p>
        </div>
      </div>

      {/* Get Summer Party images */}
      <div className="relative h-[34rem] -mt-10">
        <div className="absolute" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
          <img src={oliLane} alt="Summer Party" className="shadow-raise rounded border-white border-8 w-96 h-60 -rotate-6 hover:-rotate-3 transition-all duration-500 ease-out" />
        </div>
        <div className="absolute right-0 top-32" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="300">
          <img src={oliLane} alt="Summer Party" className="shadow-raise rounded border-white border-8 w-96 h-60 rotate-6 hover:rotate-3 transition-all duration-500 ease-out" />
        </div>
        <div className=" absolute top-64" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="400">
          <img src={oliLane} alt="Summer Party" className="shadow-raise rounded border-white border-8 w-96 h-60 -rotate-12 hover:-rotate-3 transition-all duration-500 ease-out" />
        </div>
      </div>

      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">Our hope is that through making a <span className="font-bold">personally significant donation</span> and then coming together to celebrate that, you'll be able to see the <span className="font-bold">huge impact</span> giving effectively can have and come to feel as positive about it as we do.</p>
      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">Ultimately, <span className="font-bold">we want to change the culture around giving to charity</span>. We want giving to be something that is actively embraced and enjoyed, and a meaningful part of all of our lives.</p>

      <div className="flex my-12" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
        <div className="mr-12 ml-8 relative">
          <p className="text-left before:content-['“'] before:absolute before:text-[20rem] before:leading-none before:font-black before:-left-12 before:-top-12 before:opacity-20">
            Raise really changed the way I approach giving. It's made me want to make deliberate giving a permanent part of my life even now I've graduated so, after joining Raise, I decided to donate 10% of my income to effective charities every year.

            <br /><br />I never really used to think about giving to charity, but I loved joining Raise and I now can't wait to donate again in the future.
          </p>
          <p className="text-right font-bold mt-2">
            George Rosenfeld, Donor
          </p>
        </div>
        <div className="hidden sm:block w-40 flex-shrink-0">
          {/* TODO: get an image of George */}
          <img src={oliLane} alt="Headshot of George Rosenfeld" className="shadow-raise rounded-full hover:rotate-6 transition-all duration-500 ease-out" />
        </div>
      </div>

      <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">So, however you've chosen to give before, why not join Raise this year and see how <span className="font-bold">charity can become a meaningful and positive part of all of our lives</span>.</p>

      <p className="mt-16 mb-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">P.S. Want to get to know us more? Check out our founder's TEDx Talk, 'Rethinking Celebration: The Positive Case for Giving', which talks all about our feel-good philosophy!</p>
      <iframe className="w-full rounded shadow-raise" title="YouTube: Rethinking Celebration: The Positive Case for Giving" width="672" height="378" src="https://www.youtube-nocookie.com/embed/fvjeG7xE-wE" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200" />
    </div>
  )
}

const Scroller: React.FC<{ values: string[] }> = ({ values }) => (
  <div className="Scroller">
    <ul>
      {values.map((v) => <li key={v}>{v}</li>)}
      {values.map((v) => <li key={v} aria-hidden="true" className="select-none">{v}</li>)}
    </ul>
  </div>
)

export default Philosophy
