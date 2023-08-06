import { CakeIcon, HeartIcon } from '@heroicons/react/outline';
import confetti from 'canvas-confetti';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import chloeShieh from '../images/chloe-shieh.jpg';
import elenaCaspall from '../images/elena-caspall.jpg';
import jakeMendel from '../images/jake-mendel.jpg';
import sp1 from '../images/summer-party-1.jpg';
import sp2 from '../images/summer-party-2.jpg';
import sp3 from '../images/summer-party-3.jpg';
import Section, { SectionTitle } from './Section';
import Quote from './Quote';
import Link from './Link';

const launchConfetti = () => {
  // Use simpler confetti for mobile to reduce lag
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
  if (isMobile) {
    confetti({
      particleCount: 100,
      angle: 90,
      spread: 40,
      origin: { x: 0.5, y: 1.2 },
      startVelocity: 0.087 * window.innerHeight,
      gravity: 1,
      ticks: 300,
    });
    return;
  }

  const showConfetti = () => {
    confetti({
      particleCount: 40,
      angle: 50,
      spread: 70,
      origin: { x: -0.1, y: 1 },
      startVelocity: 0.087 * window.innerHeight,
      gravity: 1.5,
      ticks: 250,
    });
    confetti({
      particleCount: 40,
      angle: 130,
      spread: 70,
      origin: { x: 1.1, y: 1 },
      startVelocity: 0.087 * window.innerHeight,
      gravity: 1.5,
      ticks: 250,
    });
  };
  for (let i = 0; i < 5; i++) {
    setTimeout(showConfetti, i * 50);
  }
};

interface PhilosophyProps {
  brand?: string,
}

const Philosophy: React.FC<PhilosophyProps> = ({ brand = 'Raise' }) => {
  useEffect(() => {
    AOS.init({
      disable: (
        /bot|crawler|spider|crawling/i.test(navigator.userAgent)
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ),
    });

    // Sometimes AOS will initialise before some animations that change the page height run
    // (such as the minimization of FAQs). This causes a bug where elements aren't triggered
    // at the right scroll offsets, so users can't see the content. We force a refresh 3s
    // after first initalising AOS so it recalculates these heights, to cover for this.
    const t = setTimeout(() => {
      AOS.refresh();
    }, 3000);

    return () => clearTimeout(t);
  });

  return (
    <>
      {/* fix so AOS styles don't hide the content when there's no JavaScript */}
      <noscript>
        <style>{'[data-aos] { opacity: 1 !important; transform: none !important; }'}</style>
      </noscript>
      <div className="bg-raise-purple -skew-y-6 pb-8 pt-16 mt-20">
        <Section id="our-philosophy" className="skew-y-6">
          <SectionTitle>Our Philosophy</SectionTitle>

          <div className="max-w-2xl mx-auto text-left">
            <p>Can you remember the last time you gave to charity? Perhaps you bought something at a bake sale? Or sponsored a friend running a marathon?</p>
            <p className="my-4">These days, opportunities for us to do good through giving are everywhere.</p>
            <CakeIcon width={60} height={60} className="block mx-auto my-4 hover:scale-105 active:scale-0 transition-all" />
            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">But it's much rarer that we stop and think about giving. Most of these opportunities either hide the act of giving from view - so we don't even notice it's happening -  or push us to give only when we're directly asked.</p>
            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              At {brand}, we think that's a <span className="font-bold">real missed opportunity</span>.
            </p>
            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">We believe that when we pause to think about our giving, the experience can be incredibly rewarding.</p>
            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">When we properly consider why we are giving and the impact our money will have - in short, when we give deliberately - we can really appreciate how positive donating to charity can be.</p>
            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              This way, giving becomes more meaningful, enjoyable, sustainable and ultimately more <span className="whitespace-nowrap"><span className="animate-breathe inline-block cursor-pointer" onClick={launchConfetti} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { launchConfetti(); e.preventDefault(); } }} role="button" tabIndex={0}>impactful</span>.</span>
            </p>
            <div data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200"><HeartIcon width={60} height={60} className="block mx-auto my-4 hover:scale-125 active:scale-95 transition-all cursor-pointer" onClick={launchConfetti} /></div>
          </div>
        </Section>
      </div>

      <div className="bg-raise-red -skew-y-6">
        <Section className="skew-y-6 -mt-1">
          <div className="max-w-2xl mx-auto text-left -mt-8">
            <h2 className="mt-20 mb-4 text-2xl text-center sm:text-4xl font-raise-header font-black" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              How does {brand} work?
            </h2>
            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              We invite students to join us and celebrate the end of the academic year by making a personally significant donation to charity - an amount that will <span className="font-bold">make you think about what and why you are giving</span>.
            </p>

            <Quote className="my-12" by="Chloe Shieh, Donor" headshotSrc={chloeShieh} imagePlacement="right" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              It took me a long time to decide to join {brand} - I'd never given that much before - but when I finally donated, I saw our incredible impact and it really made donating an amazing positive experience.
            </Quote>

            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">Then, at the end of the academic year, we come together as a community for our Summer Party. It's a time when we can reflect on and celebrate our impact, while enjoying the end of the year with a wonderful group of people.</p>

            <Quote className="my-12" by="Elena Caspall, Donor" headshotSrc={elenaCaspall} imagePlacement="left" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              It was at the Summer Party that I really appreciated just how powerful the idea of giving positively and deliberately can be. Everyone was having a great time, energised by the collective knowledge that together we'd done something incredible.
            </Quote>

            <div className="relative h-[34rem] md:-mt-10">
              <div className="absolute" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="100">
                <img src={sp1} alt="Summer Party" className="shadow-raise rounded border-white border-8 w-96 h-60 -rotate-6 hover:-rotate-3 transition-all duration-500 ease-out" />
              </div>
              <div className="absolute right-0 top-32" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="250">
                <img src={sp2} alt="Summer Party" className="shadow-raise rounded border-white border-8 w-96 h-60 rotate-6 hover:rotate-3 transition-all duration-500 ease-out" />
              </div>
              <div className=" absolute top-64" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="400">
                <img src={sp3} alt="Summer Party" className="shadow-raise rounded border-white border-8 w-96 h-60 -rotate-12 hover:-rotate-3 transition-all duration-500 ease-out" />
              </div>
            </div>
          </div>
        </Section>
      </div>

      <div className="bg-raise-purple -skew-y-6 pb-20 mb-8">
        <Section className="skew-y-6 -mt-1">
          <div className="max-w-2xl mx-auto text-left -mt-8">
            <h2 className="mt-20 mb-4 text-2xl text-center sm:text-4xl font-raise-header font-black" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">Our vision</h2>
            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              Our hope is that through making a <span className="font-bold">personally significant donation</span> and then coming together to celebrate that, you'll be able to see the <span className="font-bold">huge impact</span> giving effectively can have and come to feel as positive about it as we do.
            </p>
            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              Ultimately, <span className="font-bold">we want to change the culture around charity</span>. We want charity to be something that is actively embraced and enjoyed, and a meaningful part of all of our lives.
            </p>

            <Quote className="my-12" by="Jake Mendel, Donor" headshotSrc={jakeMendel} imagePlacement="right" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              {brand} really changed the way I approach giving. It's made me want to make deliberate giving a permanent part of my life even now I've graduated so, after joining {brand}, I decided to donate 10% of my income to effective charities every year.
              <br />
              <br />
              I never really used to think about giving to charity, but I loved joining {brand} and I now can't wait to donate again in the future.
            </Quote>

            <p className="my-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              So, however you've chosen to give before, why not join {brand} this year and see how <span className="font-bold">charity can become a meaningful and positive part of all of our lives</span>.
            </p>

            <p className="mt-16 mb-4" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200">
              P.S. Want to get to know us more? Check out testimonies from <Link href="/yearbook" className="text-blue-300 hover:text-blue-400">our community yearbook</Link> or watch our founder's TEDx Talk, 'Rethinking Celebration: The Positive Case for Giving', which talks all about our feel-good philosophy!
            </p>
            <iframe className="w-full rounded shadow-raise" title="YouTube: Rethinking Celebration: The Positive Case for Giving" width="672" height="378" src="https://www.youtube-nocookie.com/embed/fvjeG7xE-wE?rel=0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-offset="200" />
          </div>
        </Section>
      </div>
    </>
  );
};

export default Philosophy;
