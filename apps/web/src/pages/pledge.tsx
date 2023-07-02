import Helmet from 'react-helmet';

import {
  CakeIcon, CashIcon, GlobeIcon, HeartIcon, PresentationChartLineIcon, RefreshIcon, UserGroupIcon,
} from '@heroicons/react/outline';
import classNames from 'classnames';
import Page from '../components/Page';
import Section, { SectionTitle } from '../components/Section';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import FAQs, { FAQ } from '../components/FAQs';
import Button from '../components/Button';
import Link from '../components/Link';

const IndexPage = () => (
  <Page>
    <Helmet>
      <title>Raise: Taking Raise Forwards</title>
      <meta property="og:title" content="Raise: Taking Raise Forwards" />
    </Helmet>
    <Navigation
      left={[
        { text: '< back to main site', href: '../' },
      ]}
      right={[]}
    />

    <Section className="px-8">
      <Logo className="mb-8 w-24" />
      <h1 className="text-5xl sm:text-7xl font-raise-header font-black">Raise: A Celebration of Giving</h1>
      <p className="text-3xl sm:text-5xl">Taking our philosophy forward</p>

      <Point className="bg-raise-purple text-white mt-8" icon={HeartIcon}>
        Raise is all about showing that when we take a positive, deliberate approach to effective giving, it can become a meaningful and rewarding part of our lives.
      </Point>

      <Point className="bg-raise-red text-white" icon={CashIcon}>
        That's why we encourage students to donate an amount which feels personally significant and which makes you consider your positive reasons for giving.
      </Point>

      <Point className="bg-raise-orange text-white" icon={CakeIcon}>
        The Summer Party at the end of the year is our way of embodying that philosophy. But there's no reason why your engagement with positive giving has to end there!
      </Point>

      <Point className="bg-raise-yellow text-black" icon={UserGroupIcon}>
        If you've enjoyed being a part of Raise this year, we'd love you to think about how you can make deliberate giving a part of your life going forwards.
      </Point>

      <div className="mt-16 p-6 rounded shadow-raise text-left bg-white text-black">
        <p>
          One particularly impactful way to do this is by taking a
          {' '}
          <span className="font-bold">future giving pledge</span>
          {' '}
          - a sustainable and meaningful commitment to give a portion of your future salary to helping others.
        </p>

        <div className="mt-4 border border-gray-300">
          <FAQs>
            <FAQ title="What is a giving pledge?">
              <div className="text-2xl font-normal">
                <p>
                  A giving pledge is a commitment to donate a percentage of your future earnings to high-impact charities.
                </p>
                <p>
                  At Raise, we've partnered with Giving What We Can - an organisation and global community of over 8,000 people who've taken a giving pledge - to help you make your own. Giving What We Can offer two types of pledges:
                </p>
                <ul className="list-disc ml-6">
                  <li className="mt-4 mb-2">
                    <span className="font-bold">The GWWC Pledge:</span>
                    {' '}
                    If you would like to make deliberate giving a part of your future life, Giving What We Can recommend pledging to donate around 10% of your future income towards high-impact causes (though this is flexible, see below).
                  </li>
                  <li className="mb-4">
                    <span className="font-bold">Trial Pledge:</span>
                    {' '}
                    If you want to test how a pledge fits into your life before committing, Giving What We Can also run a Trial Pledge, where you can try giving a smaller % for a limited time before deciding whether you want to continue with a long-term pledge.
                  </li>
                </ul>
                <p>
                  All pledges are self-administered and not legally binding - you make donations each year and self-report them. Giving What We Can also recommend certain charities based on independent evaluations of their impact. You can update your pledge amount or withdraw from the pledge at any time if your personal circumstances change.
                </p>
              </div>
            </FAQ>

            <FAQ title="Why take a pledge?">
              <div className="text-2xl font-normal">
                <p>
                  At Raise, we aim to show that deliberate, effective giving can be very personally rewarding, as well as having a huge impact. Taking a pledge can solidify this commitment as a meaningful part of your life for years to come. Here are three reasons we think pledging is a great option:
                </p>

                <InlinePoint icon={PresentationChartLineIcon}>
                  <span className="font-bold">Impact:</span>
                  {' '}
                  By pledging to give regularly and effectively, you'll have an extended impact over a long period of time - likely saving dozens of healthy lives over the course of your career. We think that this is a hugely valuable outcome, and the most important reason to pledge.
                </InlinePoint>

                <InlinePoint icon={RefreshIcon}>
                  <span className="font-bold">Sustainability:</span>
                  {' '}
                  Giving pledges are a great way to give in a way which fits with the rest of your life, making this huge impact much more manageable. The amount you donate scales with the amount that you earn, so your donations will always be affordable and proportionate. If you're not earning, there's no pressure to give, and when your salary increases, your impact increases too.
                </InlinePoint>

                <InlinePoint icon={GlobeIcon}>
                  <span className="font-bold">Commitment:</span>
                  {' '}
                  Many people find that the pledge is a useful form of commitment - a psychological strategy for helping us live up to values and goals we currently hold but may be tempted to drop in the future. With Giving What We Can, you are also supported by a global community of wonderful people, contributing to a broader culture of meaningful, effective giving in line with the Raise philosophy.
                </InlinePoint>
              </div>
            </FAQ>

            <FAQ title="How much should I pledge?">
              <div className="text-2xl font-normal">
                <p>
                  The right pledge amount varies from person to person, and the exact amount that you choose to pledge will depend on your personal circumstances and motivations for pledging. When thinking about how much to pledge, we recommend selecting an amount which is:
                </p>

                <InlinePoint icon={HeartIcon}>
                  <span className="font-bold">Meaningful:</span>
                  {' '}
                  Consider pledging an amount that will encourage you to consciously engage with the process of giving; at Raise we believe that giving deliberately can be a really positive experience and we hope that you'll continue to experience that through your pledge!
                </InlinePoint>

                <InlinePoint icon={RefreshIcon}>
                  <span className="font-bold">Sustainable:</span>
                  {' '}
                  Make sure to choose a percentage that will be sustainable for you in the long term. Remember, you want to follow through on the pledge, so choose something you can stick to whilst balancing other important things in your life.
                </InlinePoint>

                <InlinePoint icon={PresentationChartLineIcon}>
                  <span className="font-bold">Impactful:</span>
                  {' '}
                  Pledging a higher percentage will mean helping more people and doing more good!
                </InlinePoint>

                <p>Based on these factors, Giving What We Can suggest pledging 10% or more on their main pledge. If you're not yet certain, you can start off by pledging 1% or more through their Trial Pledge for a limited time, and see how that feels. In either case, you can customise your pledge on their page or update it at any time - allowing flexibility in case you're uncertain about your future situation.</p>
              </div>
            </FAQ>
          </FAQs>
        </div>

        <p className="my-4">We've partnered with Giving What We Can to administer our pledges. To pledge, you'll be taken to their website where you can make an account and create your own customised pledge.</p>
        <div className="text-center">
          <Button variant="red" size="large" href="https://www.givingwhatwecan.org/pledge/?utm_campaign=raise">I'd like to pledge</Button>
        </div>
      </div>
    </Section>

    <Section id="faq">
      <SectionTitle>FAQs</SectionTitle>
      <FAQs>
        <FAQ title="I'm uncertain about my future income or plans. Should I still pledge?">
          <p>
            All pledges are
            {' '}
            <span className="font-bold">self-administered</span>
            {' '}
            and
            {' '}
            <span className="font-bold">not legally binding</span>
            {' '}
            - you make donations each year and self-report them. You can update your pledge amount or withdraw from the pledge at any time if your personal circumstances change.
          </p>
          <p>
            This flexibility is helpful, as you don't need to be 100% certain that you will be able to follow through on the pledge before joining! That said, we encourage you to take your pledge seriously and recommend pledging something which you believe will be sustainable now and in the future, then changing it later if your circumstances or priorities change.
          </p>
        </FAQ>
        <FAQ title="I'm confident that I'll continue to give regardless. Why should I pledge now?">
          <p>
            It's great you want to give! Even if you are relatively confident that you'll continue to give in the future, taking a pledge can still be useful, as you'll have a huge impact locked in with the support, commitment mechanism and community of
            {' '}
            <Link href="https://www.givingwhatwecan.org/">Giving What We Can</Link>
            .
          </p>
          <p>
            <span className="font-bold">Commitment:</span>
            {' '}
            Taking a pledge can be a useful 'pre-commitment mechanism' to help you stick to your goal of giving. Evidence shows that this sort of commitment can be an effective psychological mechanism to help our future selves live up to our values.
          </p>
          <p>
            <span className="font-bold">Community:</span>
            {' '}
            Joining Giving What We Can makes you part of a global community of wonderful givers, all passionate about making an impact, just like you. Donating alongside others can make the experience more personally rewarding, and can also positively reinforce positive behavioural change.
          </p>
          <p>
            <span className="font-bold">Culture:</span>
            {' '}
            Psychological research suggests that we are more likely to act altruistically if we know that others are doing so; taking a pledge can therefore help to normalise deliberate giving for those around us. In this way, your donations not only have a significant direct impact, but also contribute towards a wider culture of giving.
          </p>
          <p>
            All pledges are self-administered and not legally binding - you make donations each year and self-report them. You can update your pledge amount or withdraw from the pledge at any time if your personal circumstances change.
          </p>
        </FAQ>
      </FAQs>
    </Section>
    <Footer />
  </Page>
);

const Point: React.FC<React.PropsWithChildren<{ className?: string, icon: React.FC<{ width?: number, height?: number }> }>> = ({ className, icon: Icon, children }) => (
  <div className={classNames('sm:flex mt-4 p-6 rounded shadow-raise text-left', className)}>
    <div className="mb-2 sm:mb-0 text-center sm:mr-6"><Icon width={60} height={60} /></div>
    <p>
      {children}
    </p>
  </div>
);

const InlinePoint: React.FC<React.PropsWithChildren<{ className?: string, icon: React.FC<{ width?: number, height?: number }> }>> = ({ className, icon: Icon, children }) => (
  <div className={classNames('sm:flex my-8 items-center', className)}>
    <div className="mb-2 sm:mb-0 text-center sm:mr-4"><Icon width={60} height={60} /></div>
    <p>
      {children}
    </p>
  </div>
);

export default IndexPage;
