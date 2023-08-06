import {
  FormProvider, SubmitHandler, useForm, UseFormReturn, useWatch,
} from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements,
} from '@stripe/react-stripe-js';
import {
  format, convert, calcMatchFunding, calcPaymentSchedule,
} from '@raise/shared';
import Helmet from 'react-helmet';
import confetti from 'canvas-confetti';
import classNames from 'classnames';
import { QuestionMarkCircleIcon } from '@heroicons/react/outline';
import { UserIcon } from '@heroicons/react/solid';
import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import Button from './Button';
import DonationCard from './DonationCard';
import { animateStatsIn } from './IntroStats';
import { ResponseValues, useManualReq, useReq } from '../helpers/networking';
import Modal from './Modal';
import Section, { SectionTitle } from './Section';
import { LabelledInput } from './Form';
import Alert from './Alert';
import { parseMoney } from '../helpers/parse';
import env from '../env/env';
import { Env, Brand } from '../helpers/types';
import Page from './Page';
import Navigation from './Navigation';
import Footer from './Footer';
import Link from './Link';
import Tooltip from './Tooltip';
import { Doubled, MoneyBox, Party } from '../images/Icons';
import Logo from './Logo';
import { PublicDonationRequest, PublicFundraiser, PublicPaymentIntentResponse } from '../helpers/generated-api-client';

interface Props {
  title: string,
  fundraiserIds: Record<Env['STAGE'], string>,
  brand?: Brand,
}

const DonationPage: React.FC<Props> = ({
  title, fundraiserIds, brand,
}) => {
  const fundraiserId = fundraiserIds[env.STAGE];
  const [fundraiser, refetchFundraiser] = useReq('get /public/fundraisers/{fundraiserId}', { fundraiserId });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Page brand={brand}>
      <Helmet>
        <title>
          {fundraiser.data?.publicName ?? title}
          : Donate
        </title>
        <meta property="og:title" content={`${fundraiser.data?.publicName ?? title}: Donate`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navigation
        left={[
          { text: '< back to main site', href: '../' },
        ]}
        right={[]}
      />

      <Section>
        {fundraiser.error && !fundraiser.loading ? <Alert>{fundraiser.error}</Alert> : (
          <>
            <noscript>
              <Alert variant="warning" className="-mt-8 mb-8">
                To use this page please
                {' '}
                <Link href="https://www.enable-javascript.com/" target="_blank">enable JavaScript in your browser</Link>
                .
              </Alert>
            </noscript>
            <IntroFundraiser
              title={fundraiser.data?.publicName ?? title}
              fundraiser={fundraiser}
              openModal={() => setModalOpen(true)}
            />
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-2xl">
              {fundraiser.data && <DonationForm fundraiser={fundraiser.data} setModalOpen={setModalOpen} refetchFundraiser={refetchFundraiser} />}
            </Modal>
          </>
        )}
      </Section>

      <Footer />
    </Page>
  );
};

interface IntroFundraiserProps {
  title: string,
  fundraiser: ResponseValues<PublicFundraiser, unknown, unknown>,
  openModal: () => void,
}

const IntroFundraiser: React.FC<IntroFundraiserProps> = ({
  title, fundraiser, openModal,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  useLayoutEffect(() => {
    if (ref.current && fundraiser.data && !hasAnimated) {
      animateStatsIn(ref.current);
      setHasAnimated(true);
    }
  });

  const percentageToTarget = fundraiser.data ? Math.min(Math.round((fundraiser.data.totalRaised / fundraiser.data.goal) * 100), 100) : 0;

  return (
    <div ref={ref}>
      <h1 className="text-5xl md:text-7xl font-raise-header font-black">{title}</h1>

      <div className="mx-2 md:mx-0 md:flex my-4">
        <div className="flex-1">
          <div className="bg-raise-purple p-1 -skew-x-15 rounded shadow-raise flex">
            <div className={classNames('whitespace-nowrap py-1 transition-all ease-in-out duration-1000 bg-raise-yellow rounded-sm', { 'px-1': percentageToTarget !== 0 })} style={{ width: `${percentageToTarget}%` }}>
              {percentageToTarget >= 50 && (
                <p className="skew-x-15 md:text-4xl fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                  {format.amountShort(fundraiser.data?.currency, fundraiser.data?.totalRaised)}
                  {' '}
                  raised
                </p>
              )}
            </div>
            <div className={classNames('whitespace-nowrap py-1 flex-1', { 'px-1': percentageToTarget !== 100 })}>
              {percentageToTarget < 50 && (
                <p className="skew-x-15 md:text-4xl fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                  {format.amountShort(fundraiser.data?.currency, fundraiser.data?.totalRaised)}
                  {' '}
                  raised
                </p>
              )}
            </div>
          </div>
          <p className="font-bold">
            {fundraiser.data?.donationsCount}
            {' '}
            student
            {fundraiser.data?.donationsCount === 1 ? ' has' : 's have'}
            {' '}
            already raised
            {' '}
            {format.amountShort(fundraiser.data?.currency, fundraiser.data?.totalRaised)}
            {fundraiser.data ? ` of a ${format.amountShort(fundraiser.data?.currency, fundraiser.data?.goal)} target` : ''}
          </p>
        </div>
        <div className="inline-block mt-4 md:mt-0 md:w-64 md:mx-2">
          <div className="bg-raise-purple p-1 -skew-x-15 rounded shadow-raise">
            <p className="skew-x-15 md:text-4xl p-1">
              {fundraiser.data ? convert.moneyToPeopleProtected(fundraiser.data.currency, fundraiser.data.totalRaised) : '—'}
              {' '}
              people
            </p>
          </div>
          <p className="font-bold">protected from malaria</p>
        </div>
      </div>

      <div className="flex bg-white text-black p-4 md:p-6 mt-4 md:mt-8 items-center rounded shadow-raise">
        <Logo className="hidden sm:block mr-6 w-24" />
        <div className="flex-1 text-left">
          <p className="mb-4 leading-none">
            At
            {' '}
            {fundraiser.data?.publicName ?? title}
            , we believe that when we adopt a positive, deliberate approach towards giving, it can become a meaningful part of our lives.
          </p>
          <p className="leading-none">
            Join now and celebrate giving by making a personally significant donation today.
          </p>
        </div>
      </div>

      <Button variant="red" className="mt-4 mb-12" disabled={!fundraiser.data} onClick={openModal}>Donate</Button>

      <Tabs
        tabs={{
          Donors: (fundraiser.data?.donations.length === 0
            ? <p>There haven't been any donations yet. Donate now to be the first!</p>
            : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6 text-left text-white">
                {fundraiser.data
                  ? fundraiser.data.donations.map((d) => <DonationCard key={d.id} className="bg-raise-red" currency={fundraiser.data?.currency} {...d} />)
                  : [12, 10, 14].map((d) => <DonationCard key={d} loading createdAt="1 hour ago" className="bg-raise-red" donorName={'a'.repeat(d)} matchFundingAmount={1234} comment={'a'.repeat(d * 2)} />)}
              </div>
            )
          ),
          'About Us': (
            <div>
              <p>
                {fundraiser.data?.publicName ?? title}
                {' '}
                is a charitable movement encouraging people to adopt a positive approach towards deliberate, effective giving.
              </p>
              <div className="flex my-6 items-center">
                <MoneyBox className="h-16 mr-4" />
                <p className="flex-1">We invite people to donate an amount significant to them to charity.</p>
              </div>
              <div className="flex my-6 items-center">
                <Doubled className="h-16 mr-4" />
                <p className="flex-1">Thanks to our matched funding, every donation is doubled for twice the impact.</p>
              </div>
              <div className="flex my-6 items-center">
                <Party className="h-16 mr-4" />
                <p className="flex-1">Then we come together at the end of the academic year at our Summer Party to celebrate our collective impact.</p>
              </div>
              <p>
                For more about our philosophy of celebrating deliberate, effective giving, see
                {' '}
                {fundraiser.data?.publicName ?? title}
                's
                {' '}
                <Link href="../">homepage</Link>
                .
              </p>
            </div>
          ),
          'About AMF': (
            <div className="flex">
              {/* TODO: host this image ourselves */}
              <img alt="" src="https://upload.wikimedia.org/wikipedia/en/6/6b/Against_Malaria_Foundation.svg" height={160} width={95} className="hidden sm:block mr-6" />
              <div className="flex-1">
                <p className="mb-2">Our recommended charity is the Against Malaria Foundation, which distributes long-lasting insecticide-treated nets for protection against malaria in developing countries.</p>
                <p className="mb-2">
                  Every year, malaria kills about 400,000 people, with a further 200 million falling ill; this burden of disease falls disproportionately on young children and pregnant women. The most effective means of preventing malaria is sleeping under a mosquito net, specifically a long-lasting insecticide treated net (LLIN). AMF works with local partners in a number of countries, predominantly in sub-Saharan Africa, to distribute these nets which protect people as they sleep. For more information about the work they do,
                  {' '}
                  <a href="https://www.againstmalaria.com/" target="_blank" rel="noreferrer">see here</a>
                  .
                  {' '}
                </p>
                <p>
                  When you're making such significant donation, we want to make sure the money is doing as much good as it possibly can. To make our decision, we have taken the advice of independent charity evaluators GiveWell and Giving What We Can, which both rank AMF as one of the most effective charities in the world. We recommend AMF particularly because they are also independently rated as one of the most cost-effective charities in the world, by organisations such as GiveWell. For a thorough evaluation of the work that they do, check out
                  {' '}
                  <a href="https://www.givewell.org/charities/amf" target="_blank" rel="noreferrer">GiveWell's report on AMF</a>
                  .
                </p>
                <p>
                  If you'd like celebrate giving to a different charity that you've thought carefully about, do get in touch! We can add you to the donor wall, and keep you updated with information about plans for the Summer Party.
                </p>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
};

const Tabs: React.FC<{ tabs: Record<string, React.ReactChild> }> = ({ tabs }) => {
  const keys = Object.keys(tabs);
  const [open, setOpen] = useState<keyof typeof tabs>(keys[0]);

  return (
    <div className="bg-white text-black rounded shadow-raise overflow-hidden">
      <div className="flex">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        {keys.map((k, i) => <Link onClick={() => setOpen(k)} className={classNames('flex-1 border-gray-300 py-2', { 'border-l-2': i !== 0, 'border-b-2 bg-gray-200': k !== open })}>{k}</Link>)}
      </div>
      <div className="p-4 md:p-6 text-left">
        {tabs[open]}
      </div>
    </div>
  );
};

const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

interface DonationFormResponses {
  donationAmount: string,
  recurrenceFrequency: 'ONE_OFF' | 'WEEKLY' | 'MONTHLY',
  contributionAmount: string,
  giftAid: boolean,
  donorName: string,
  donorEmail: string,
  emailConsentInformational: boolean,
  emailConsentMarketing: boolean,
  addressLine1: string,
  addressLine2: string,
  addressLine3: string,
  addressPostcode: string,
  nameHidden: boolean,
  donationAmountHidden: boolean,
  comment: string,
}

const DonationForm: React.FC<{ fundraiser: PublicFundraiser, setModalOpen: (x: boolean) => void, refetchFundraiser: () => void }> = ({ fundraiser, refetchFundraiser }) => {
  const formMethods = useForm<DonationFormResponses>({
    mode: 'onTouched',
    defaultValues: {
      donationAmount: format.amountShort(fundraiser.currency, fundraiser.suggestedDonationAmountOneOff, false),
      recurrenceFrequency: 'ONE_OFF',
      contributionAmount: format.amountShort(fundraiser.currency, fundraiser.suggestedContributionAmount ?? 0, false),
      giftAid: false,
      donorName: '',
      donorEmail: '',
      emailConsentInformational: true,
      emailConsentMarketing: true,
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      addressPostcode: '',
      nameHidden: false,
      donationAmountHidden: false,
      comment: '',
    },
  });
  const watches = useWatch({ control: formMethods.control }) as DonationFormResponses;
  const [page, setPage] = useState(0);
  const [payButton, setPayButton] = useState(<Button variant="blue" className="mt-4" disabled>Pay now</Button>);
  const [piResponse, setPiResponse] = useState<PublicPaymentIntentResponse>();

  const onPaymentSuccess = () => {
    setPage(4);

    // It'll take a few seconds for the payment webhook to reach the server and register the donation
    // So we can see our new donation, try after 1 second. As a backup we also try after 15 seconds
    setTimeout(() => refetchFundraiser(), 1_000);
    setTimeout(() => refetchFundraiser(), 15_000);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

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
  if (new Date().getTime() / 1000 >= fundraiser.activeFrom) {
    return (
      <FormProvider {...formMethods}>
        <div className="mb-4 text-base sm:text-lg">
          {page === 0 && <DonationFormDonate formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
          {page === 1 && <DonationFormCelebrate formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
          {page === 2 && <DonationFormDisplay formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
          {page === 3 && <DonationFormPayment formMethods={formMethods} fundraiser={fundraiser} watches={watches} setPayButton={setPayButton} setPiResponse={setPiResponse} onPaymentSuccess={onPaymentSuccess} />}
          {page === 4 && piResponse && <DonationFormComplete formMethods={formMethods} fundraiser={fundraiser} watches={watches} piResponse={piResponse} />}
        </div>
        <div className="float-right">
          {page !== 0 && page !== 4 && (
            <Button
              variant="gray"
              onClick={() => {
                setPage(page - 1);
                const overlay = document.querySelector('[data-reach-dialog-overlay]');
                if (overlay) overlay.scrollTop = 0;
              }}
            >
              Back
            </Button>
          )}
          {page !== 3 && page !== 4 && (
            <Button
              variant="blue"
              onClick={async () => {
                const okay = await formMethods.trigger();
                if (!okay) return;
                setPage(page + 1);
                const overlay = document.querySelector('[data-reach-dialog-overlay]');
                if (overlay) overlay.scrollTop = 0;
              }}
            >
              Next
            </Button>
          )}
          {page === 3 && payButton}
        </div>
        <div className="clear-both" />
      </FormProvider>
    );
  }

  return (
    <>
      <SectionTitle>Fundraiser not open!</SectionTitle>
      <p>
        Thank you for wanting to donate but this fundraiser is not open yet. We'll start taking donations on
        {format.date(fundraiser.activeFrom)}
        .
      </p>
      <p className="mt-4">
        To donate to AMF now, you can donate on
        <a href="https://www.againstmalaria.com/Donation.aspx"> AMF's website</a>
        .
      </p>
    </>
  );
};

const DonationFormDonate: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({
  formMethods: {
    setValue, register, formState: { errors, touchedFields }, trigger, getValues,
  }, watches, fundraiser,
}) => {
  let donationAmount: null | number = null;
  try {
    donationAmount = parseMoney(watches.donationAmount);
  } catch { /* noop */ }
  const shouldShowLowAmountWarning = donationAmount !== null && ((watches.recurrenceFrequency === 'ONE_OFF' && donationAmount <= 15_00) || (watches.recurrenceFrequency === 'WEEKLY' && donationAmount < 2_00));
  const shouldShowHighAmountWarning = donationAmount !== null && ((watches.recurrenceFrequency === 'ONE_OFF' && donationAmount >= 2000_00) || (watches.recurrenceFrequency === 'WEEKLY' && donationAmount > 200_00));
  const schedule = donationAmount === null ? null : calcPaymentSchedule(donationAmount, 0, watches.recurrenceFrequency === 'ONE_OFF' ? null : watches.recurrenceFrequency, fundraiser.recurringDonationsTo);
  const totalDonationAmount = schedule === null ? null : schedule.now.donationAmount + schedule.future.reduce((acc, cur) => acc + cur.donationAmount, 0);
  const matchFundingAmount = totalDonationAmount === null ? null : calcMatchFunding({
    donationAmount: totalDonationAmount,
    matchFundingRate: fundraiser.matchFundingRate,
    matchFundingRemaining: fundraiser.matchFundingRemaining,
    matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
  });
  const peopleProtected = totalDonationAmount === null || matchFundingAmount === null ? null : convert.moneyToPeopleProtected(fundraiser.currency, totalDonationAmount * (watches.giftAid ? 1.25 : 1) + matchFundingAmount);
  return (
    <>
      <SectionTitle>Donate</SectionTitle>
      <p>
        We recommend giving an amount that feels
        {' '}
        <span className="font-bold">significant to you</span>
        .
        {' '}
        <Tooltip
          label={(
            <p>
              We hope that through joining
              {' '}
              {fundraiser.publicName}
              {' '}
              this year, you'll come to see how positive the experience of giving deliberately can be. To help you to engage in that way, we recommend that you donate an amount which requires you to think before you give and to reflect on the positive impact that your donation will have.
            </p>
          )}
        >
          How do I decide what that means for me?
          <QuestionMarkCircleIcon width={22} height={22} className="ml-1" />
        </Tooltip>
      </p>
      <p className="mt-2">I want to give...</p>

      <div className="mt-2 grid grid-cols-2 gap-4">
        <Button variant={watches.recurrenceFrequency === 'ONE_OFF' ? 'purple' : 'gray'} onClick={() => { setValue('donationAmount', format.amountShort(fundraiser.currency, fundraiser.suggestedDonationAmountOneOff, false)); setValue('recurrenceFrequency', 'ONE_OFF'); trigger(); }} skew={false} className={classNames('p-2 text-center flex justify-center items-center', { 'text-gray-200': watches.recurrenceFrequency !== 'ONE_OFF' })}>
          a one-off donation
          <span className="block text-sm -mt-1">
            (
            {format.amountShort(fundraiser.currency, fundraiser.suggestedDonationAmountOneOff)}
            {' '}
            recommended)
          </span>
        </Button>
        <Button variant={watches.recurrenceFrequency === 'WEEKLY' ? 'purple' : 'gray'} onClick={() => { setValue('donationAmount', format.amountShort(fundraiser.currency, fundraiser.suggestedDonationAmountWeekly, false)); setValue('recurrenceFrequency', 'WEEKLY'); trigger(); }} skew={false} className={classNames('p-2 text-center ml-0 flex justify-center items-center', { 'text-gray-200': watches.recurrenceFrequency !== 'WEEKLY' })}>
          in weekly installments
          <span className="block text-sm -mt-1">
            (
            {format.amountShort(fundraiser.currency, fundraiser.suggestedDonationAmountWeekly)}
            {' '}
            weekly recommended)
          </span>
        </Button>
      </div>

      <LabelledInput
        id="donationAmount"
        type="number"
        prefix={fundraiser.currency === 'gbp' ? '£' : '$'}
        // suffix={watches.recurrenceFrequency === "WEEKLY" ? "weekly" : ""}
        error={errors.donationAmount?.message}
        className="mt-4"
        inputClassName="text-2xl"
        {...register('donationAmount', {
          validate: (s) => {
            if (!s) return 'Please enter an amount.';

            try {
              const value = parseMoney(s);

              if (value < 1_00) {
                return `The amount must be at least ${format.amountShort(fundraiser.currency, 100)} to avoid excessive card transaction fees.`;
              }

              if (fundraiser.minimumDonationAmount) {
                const recurrenceFrequency = getValues('recurrenceFrequency');
                const localSchedule = calcPaymentSchedule(value, 0, recurrenceFrequency === 'ONE_OFF' ? null : recurrenceFrequency, fundraiser.recurringDonationsTo);
                const localTotalDonationAmount = localSchedule.now.donationAmount + localSchedule.future.reduce((acc, cur) => acc + cur.donationAmount, 0);
                if (localTotalDonationAmount < fundraiser.minimumDonationAmount) {
                  return `The total donated amount must be at least ${format.amountShort(fundraiser.currency, fundraiser.minimumDonationAmount)}${recurrenceFrequency === 'ONE_OFF' ? '' : `, but your donation works out to a total of ${format.amountShort(fundraiser.currency, localTotalDonationAmount)}`}.`;
                }
              }
            } catch {
              return 'The amount must be a monetary value.';
            }
            return true;
          },
        })}
      />

      {touchedFields.donationAmount && shouldShowLowAmountWarning && <p className="my-3 py-2 px-3 font-normal animate-shake  text-yellow-900 border border-yellow-400 border-1 rounded-lg bg-yellow-100">We encourage all students to donate an amount that's personally significant to them - and we know this is different for everyone! A good way of thinking about is to donate an amount that really makes you think about where and why you are donating. We can't wait to celebrate with you soon!</p>}
      {touchedFields.donationAmount && shouldShowHighAmountWarning && <p className="my-3 py-2 px-3 font-normal animate-shake text-yellow-900 border border-yellow-400 border-1 rounded-lg bg-yellow-100">Wow, thank you! For high donations, it may be worth paying us by bank transfer to reduce card fees involved in processing your donation. If you are happy to do this, please contact us via the details on <a href="../" className="text-yellow-900 font-medium"> our homepage</a>. If this is not feasible or practical, feel free to go ahead and make the payment by card.</p>}

      {fundraiser.matchFundingRate !== 0 && fundraiser.matchFundingPerDonationLimit !== null && fundraiser.matchFundingRemaining !== 0 && (
      <p className="mt-1">
        All donations will be matched up to
        {' '}
        {format.amountShort(fundraiser.currency, fundraiser.matchFundingPerDonationLimit)}
        {' '}
        per donor.
      </p>
      )}

      <LabelledInput
        id="giftAid"
        label={(
          <span>
            Add 25%
            {' '}
            <span className="hidden md:inline">to my donation </span>
            through
            {' '}
            <Tooltip label={(<p>To claim Gift Aid, you must be a UK taxpayer and pay more Income Tax or Capital Gains Tax this tax year than the amount of Gift Aid claimed on all your donations.</p>)}>
              <span className="">
                Gift Aid
                <QuestionMarkCircleIcon width={22} height={22} className="ml-1" />
              </span>
            </Tooltip>
          </span>
        )}
        type="checkbox"
        {...register('giftAid')}
      />

      {watches.recurrenceFrequency === 'WEEKLY' && donationAmount && totalDonationAmount && (
        <p className="mb-4">
          {format.amountShort(fundraiser.currency, donationAmount)}
          {' '}
          each week from now until
          {format.date(fundraiser.recurringDonationsTo)}
          {' '}
          comes to
          {format.amountShort(fundraiser.currency, totalDonationAmount)}
          .
        </p>
      )}

      {peopleProtected ? (
        <>
          <p>
            Amazing! Your donation
            {' '}
            {matchFundingAmount !== null && matchFundingAmount > 0 ? 'plus match funding ' : ''}
            will help protect
            {' '}
            {peopleProtected}
            {' '}
            people from malaria through AMF. We think that's something worth celebrating!
          </p>
          <ImpactRepresentation peopleProtected={peopleProtected} />
        </>
      ) : null}
    </>
  );
};

const DonationFormCelebrate: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({
  formMethods: {
    setValue, register, formState: { errors, touchedFields }, trigger,
  }, watches, fundraiser,
}) => {
  let contributionAmount = 0;
  try {
    contributionAmount = parseMoney(watches.contributionAmount);
  } catch {
    contributionAmount = 1; // so if they have entered something invalid the button doesn't change to 'I don't want to contribute'
  }

  return (
    <>
      <SectionTitle>Celebrate</SectionTitle>
      <p>
        At the end of this year, we'll invite everyone who's joined
        {' '}
        {fundraiser.publicName}
        {' '}
        to our Summer Party to celebrate our collective impact. We'd love to send you an invitation!
      </p>

      <LabelledInput className="mt-2" id="donorName" label="Name" type="text" autoComplete="name" error={errors.donorName?.message} {...register('donorName', { validate: (s) => (s ? true : 'We need your name to send you an invite, and to identify your donation if you contact us.') })} />

      <div>
        <LabelledInput
          id="donorEmail"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.donorEmail?.message}
          className={errors.donorEmail?.message ? 'mt-4 mb-4' : 'mt-4'}
          {...register('donorEmail', {
            validate: (s) => {
              if (!s) return 'We need your email to send you an invite, and to identify your donation if you contact us.';
              // Regex from https://html.spec.whatwg.org/multipage/forms.html#e-mail-state-(type=email)
              if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(s)) return 'Please enter a valid email.';
              return true;
            },
          })}
        />
        <LabelledInput id="emailConsentInformational" label="Have AMF send me one email on where my donation goes" type="checkbox" {...register('emailConsentInformational')} />
        <LabelledInput id="emailConsentMarketing" label={`Send me updates about ${fundraiser.publicName}`} type="checkbox" {...register('emailConsentMarketing')} />
      </div>

      {fundraiser.suggestedContributionAmount !== null && (
        <>
          <h3 className="text-2xl mt-8">Contribution</h3>
          <p className="mt-1">As 100% of your donation goes to charity, we suggest an optional contribution to cover the costs of the Summer Party (which are generously subsidised by our sponsors). Everyone is welcome to join, whether or not they make this contribution.</p>

          <div className="mt-2 grid grid-cols-2 gap-4">
            <Button variant={contributionAmount > 0 ? 'purple' : 'gray'} onClick={() => { setValue('contributionAmount', format.amountShort(fundraiser.currency, fundraiser.suggestedContributionAmount ?? 10_00, false)); trigger('contributionAmount'); }} skew={false} className={classNames('p-2 text-center  flex justify-center items-center', { 'text-gray-200': contributionAmount <= 0 })}>
              I want to contribute
            </Button>
            <Button variant={contributionAmount <= 0 ? 'purple' : 'gray'} onClick={() => { setValue('contributionAmount', '0'); trigger('contributionAmount'); }} skew={false} className={classNames('p-2 text-center ml-0 flex justify-center items-center', { 'text-gray-200': contributionAmount > 0 })}>
              I don't want to contribute
            </Button>
          </div>

          <LabelledInput
            id="contributionAmount"
            label={`Contribution amount${watches.recurrenceFrequency !== 'ONE_OFF' ? ' (one-off)' : ''}`}
            type="number"
            prefix={fundraiser.currency === 'gbp' ? '£' : '$'}
            className="mt-2"
            error={errors.contributionAmount?.message}
            {...register('contributionAmount', {
              validate: (s) => {
                if (!s) return true;
                try {
                  parseMoney(s);
                } catch {
                  return 'The contribution amount must be a monetary value';
                }
                return true;
              },
            })}
          />

          {touchedFields.contributionAmount && contributionAmount > 20_00 && <p className="my-3 py-2 px-3 font-normal animate-shake text-yellow-900 border border-yellow-400 border-1 rounded-lg bg-yellow-100">While you're welcome to contribute as much as you want, we don't expect to spend more than £20 per head on the Summer Party.</p>}
        </>
      )}

      {watches.giftAid && (
        <>
          <h3 className="text-2xl mt-8">Gift Aid</h3>
          <p className="mt-1">To claim Gift Aid on your donation we need your address.</p>
          <LabelledInput id="addressLine1" label="Address" type="text" autoComplete="address-line1" error={errors.addressLine1?.message} className="mt-2" {...register('addressLine1', { validate: (s) => (!watches.giftAid || s ? true : 'We need your address for Gift Aid') })} />
          <LabelledInput id="addressLine2" type="text" autoComplete="address-line2" {...register('addressLine2')} />
          {watches.addressLine2 && <LabelledInput id="addressLine3" type="text" autoComplete="address-line3" {...register('addressLine3')} />}
          <LabelledInput id="addressPostcode" label="Postcode" type="text" autoComplete="postal-code" error={errors.addressPostcode?.message} {...register('addressPostcode', { validate: (s) => (!watches.giftAid || s ? true : 'We need your postcode for Gift Aid') })} />
        </>
      )}
    </>
  );
};

const DonationFormDisplay: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({ formMethods: { register }, watches, fundraiser }) => (
  <>
    <SectionTitle>Display</SectionTitle>
    <p>Choose how your donation appears on our website:</p>
    <DonationCard
      donorName={watches.nameHidden ? undefined : watches.donorName}
      createdAt="1 minute ago"
      giftAid={watches.donationAmountHidden ? undefined : watches.giftAid}
      comment={watches.comment || null}
      currency={fundraiser.currency}
      donationAmount={watches.donationAmountHidden ? undefined : parseMoney(watches.donationAmount)}
      matchFundingAmount={watches.donationAmountHidden ? undefined : calcMatchFunding({
        donationAmount: parseMoney(watches.donationAmount),
        matchFundingRate: fundraiser.matchFundingRate,
        matchFundingRemaining: fundraiser.matchFundingRemaining,
        matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
      })}
      recurringAmount={!watches.donationAmountHidden && watches.recurrenceFrequency !== 'ONE_OFF' ? parseMoney(watches.donationAmount) : null}
      recurrenceFrequency={watches.recurrenceFrequency !== 'ONE_OFF' ? watches.recurrenceFrequency : null}
      className="bg-raise-red text-2xl text-white font-raise-content md:max-w-sm mt-2"
    />
    <div className="grid md:grid-cols-1 md:gap-2 mt-4">
      <div>
        <LabelledInput id="nameHidden" label="Hide my name" className="mt-0" type="checkbox" {...register('nameHidden')} />
        <LabelledInput id="donationAmountHidden" label="Hide the donation amount" type="checkbox" {...register('donationAmountHidden')} />
      </div>
      <LabelledInput id="comment" label="Message (optional)" type="text" {...register('comment')} />
    </div>
  </>
);

const DonationFormPayment: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser, setPayButton: (e: JSX.Element) => void, setPiResponse: (piResponse: PublicPaymentIntentResponse) => void, onPaymentSuccess: () => void }> = ({
  formMethods, watches, fundraiser, setPayButton, setPiResponse, onPaymentSuccess,
}) => {
  const [piResponse, fetchPiResponse] = useManualReq('post /public/fundraisers/{fundraiserId}/donation');

  useEffect(() => {
    let contributionAmount = 0;
    try {
      contributionAmount = parseMoney(watches.contributionAmount);
    } catch { /* noop */ }

    const data: PublicDonationRequest = {
      donationAmount: parseMoney(watches.donationAmount),
      recurrenceFrequency: watches.recurrenceFrequency !== 'ONE_OFF' ? watches.recurrenceFrequency : null,
      contributionAmount,
      giftAid: watches.giftAid,
      donorName: watches.donorName,
      donorEmail: watches.donorEmail,
      emailConsentInformational: watches.emailConsentInformational,
      emailConsentMarketing: watches.emailConsentMarketing,
      addressLine1: watches.addressLine1 || null,
      addressLine2: watches.addressLine2 || null,
      addressLine3: watches.addressLine3 || null,
      addressPostcode: watches.addressPostcode || null,
      addressCountry: watches.addressPostcode ? 'United Kingdom' : null,
      overallPublic: true,
      namePublic: !watches.nameHidden,
      donationAmountPublic: !watches.donationAmountHidden,
      comment: watches.comment,
    };
    fetchPiResponse({ fundraiserId: fundraiser.id }, data).then((r) => setPiResponse(r.data)).catch(() => { /* noop, handled by useReq hook */ });
  }, [watches.donationAmount, watches.recurrenceFrequency, watches.contributionAmount, watches.giftAid, watches.donorEmail, watches.emailConsentInformational, watches.emailConsentMarketing, watches.addressLine1, watches.addressLine2, watches.addressLine3, watches.addressPostcode, watches.nameHidden, watches.donationAmountHidden, watches.comment]);

  if (piResponse.error) {
    return (
      <>
        <SectionTitle>Payment</SectionTitle>
        <Alert>{piResponse.error}</Alert>
      </>
    );
  }

  if (piResponse.loading || !piResponse.data) {
    return (
      <>
        <SectionTitle>Payment</SectionTitle>
        <p className="animate-pulse">Loading...</p>
      </>
    );
  }

  return (
    <>
      <SectionTitle>Payment</SectionTitle>
      {env.STAGE !== 'prod' && (
        <Alert className="mb-4" variant="warning">
          This is a non-prod environment. Use a
          {' '}
          <a href="https://stripe.com/docs/testing#cards" target="_blank" rel="noreferrer">Stripe test card</a>
          {' '}
          instead of a real card, e.g.:
          <br />
          Card number:
          {' '}
          <code className="select-all">4242 4242 4242 4242</code>
          <br />
          Expiry date (any future date):
          {' '}
          <code className="select-all">12 / 34</code>
          <br />
          Security code (any 3 digits):
          {' '}
          <code className="select-all">123</code>
        </Alert>
      )}
      <DonationFormPaymentAmount watches={watches} piResponse={piResponse.data} />
      <Elements
        options={{ clientSecret: piResponse.data.stripeClientSecret }}
        stripe={stripePromise}
      >
        <DonationFormPaymentInner formMethods={formMethods} watches={watches} stripeClientSecret={piResponse.data.stripeClientSecret} setPayButton={setPayButton} onPaymentSuccess={onPaymentSuccess} />
      </Elements>
    </>
  );
};

const DonationFormPaymentAmount: React.FC<{ watches: DonationFormResponses, piResponse: PublicPaymentIntentResponse }> = ({ watches, piResponse }) => {
  let contributionAmount = 0;
  try {
    contributionAmount = parseMoney(watches.contributionAmount);
  } catch { /* noop */ }

  const [showDetails, setShowDetails] = useState(false);

  if (piResponse.futurePayments.length === 0) {
    if (contributionAmount > 0) {
      return (
        <p>
          Amount due:
          {' '}
          {format.amountShort(piResponse.currency, piResponse.amount)}
          {' '}
          (
          {format.amountShort(piResponse.currency, parseMoney(watches.donationAmount))}
          {' '}
          donation +
          {' '}
          {format.amountShort(piResponse.currency, contributionAmount)}
          {' '}
          contribution)
        </p>
      );
    }
    return (
      <p>
        Amount due:
        {' '}
        {format.amountShort(piResponse.currency, piResponse.amount)}
      </p>
    );
  }

  return (
    <>
      <p>
        Amount due:
        {' '}
        {format.amountShort(piResponse.currency, piResponse.amount)}
        {contributionAmount > 0 ? ` (${format.amountShort(piResponse.currency, parseMoney(watches.donationAmount))} donation + ${format.amountShort(piResponse.currency, contributionAmount)} contribution)` : ''}
        {' '}
        now, then
        {contributionAmount > 0 ? ' a' : ''}
        {' '}
        {format.amountShort(piResponse.currency, parseMoney(watches.donationAmount))}
        {' '}
        {contributionAmount > 0 ? 'donation every' : 'a'}
        {' '}
        week until
        {' '}
        {format.date(piResponse.futurePayments[piResponse.futurePayments.length - 1].at)}
        .
        {' '}
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide' : 'View'}
          {' '}
          schedule
        </Link>
        .
      </p>

      {showDetails && (
        <ul className="list-disc pl-8 my-1">
          {piResponse.futurePayments.map((p) => (
            <li key={p.at}>
              {format.amountShort(piResponse.currency, p.amount)}
              {' '}
              on
              {' '}
              {format.date(p.at)}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2">
        You can cancel your future payments at any time by contacting us.
      </p>
    </>
  );
};

const DonationFormPaymentInner: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, stripeClientSecret: string, setPayButton: (e: JSX.Element) => void, onPaymentSuccess: () => void }> = ({
  formMethods: {
    handleSubmit, formState: { isSubmitting },
  }, watches, stripeClientSecret, setPayButton, onPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<Error | string | undefined>();

  // Confirm the payment with Stripe
  const onSubmit: SubmitHandler<DonationFormResponses> = async () => {
    if (!stripe || !elements) {
      throw new Error('The payment system is still loading, please try again in a minute.');
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      throw new Error('The payment fields are still loading, please try again in a minute.');
    }

    const response = await stripe.confirmCardPayment(
      stripeClientSecret,
      {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: watches.donorName,
            email: watches.donorEmail,
          },
        },
      },
    );

    if (response.error) {
      if (response.error.type === 'card_error' || response.error.type === 'validation_error' || response.error.code === 'payment_intent_authentication_failure') {
        setError(response.error.message);
      } else {
        // eslint-disable-next-line no-console
        console.error(response.error);
        setError('An unexpected error occurred with your payment');
        if (response.error.code === 'resource_missing') {
          // eslint-disable-next-line no-console
          console.error('This error might occur because your Stripe credientials on the frontend do not match the ones on the backend. Check out the env.ts file to fix this.');
        }
      }
    } else if (response.paymentIntent.status === 'succeeded') {
      onPaymentSuccess();
    } else {
      setError('An unexpected error occurred with your payment');
    }
  };

  const buttonDisabled = !stripe || !elements || isSubmitting;

  useEffect(() => {
    setPayButton(<Button variant="blue" className="mt-4" onClick={handleSubmit(onSubmit)} disabled={buttonDisabled}>Pay now</Button>);
  }, [stripeClientSecret, buttonDisabled]);

  return (
    <>
      <div className="grid md:grid-cols-1 md:gap-2 mt-4">
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="cardNumber" className="text-gray-700 font-bold block pb-1">Card number</label>
          <CardNumberElement
            id="cardNumber"
            options={{
              classes: {
                base: 'w-full flex-1 py-2 px-3 appearance-none block border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none rounded',
                focus: 'border-gray-800 bg-white-important', // needs to be important to override bg-gray-200 style. can't use focus(-within):bg-white as not really focused
                invalid: 'bg-red-100 border-red-100 hover:bg-red-50 hover:border-red-400 focus:border-red-800 focus:bg-red-50',
              },
              style: {
                base: {
                  fontSize: '16px',
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                },
              },
              disabled: isSubmitting,
              showIcon: true,
            }}
          />
        </div>
        <div className="grid md:grid-cols-2 md:gap-2">
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="cardExpiry" className="text-gray-700 font-bold block pb-1">Expiry date</label>
            <CardExpiryElement
              id="cardExpiry"
              options={{
                classes: {
                  base: 'w-full flex-1 py-2 px-3 appearance-none block border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none rounded',
                  focus: 'border-gray-800 bg-white-important', // needs to be important to override bg-gray-200 style. can't use focus(-within):bg-white as not really focused
                  invalid: 'bg-red-100 border-red-100 hover:bg-red-50 hover:border-red-400 focus:border-red-800 focus:bg-red-50',
                },
                style: {
                  base: {
                    fontSize: '16px',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                  },
                },
                disabled: isSubmitting,
              }}
            />
          </div>

          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="cardCvc" className="text-gray-700 font-bold block pb-1">Security code</label>
            <CardCvcElement
              id="cardCvc"
              options={{
                classes: {
                  base: 'w-full flex-1 py-2 px-3 appearance-none block border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none rounded',
                  focus: 'border-gray-800 bg-white-important', // needs to be important to override bg-gray-200 style. can't use focus(-within):bg-white as not really focused
                  invalid: 'bg-red-100 border-red-100 hover:bg-red-50 hover:border-red-400 focus:border-red-800 focus:bg-red-50',
                },
                style: {
                  base: {
                    fontSize: '16px',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                  },
                },
                disabled: isSubmitting,
              }}
            />
          </div>
        </div>
      </div>
      {error && <Alert variant="error" className="mt-4">{error}</Alert>}
    </>
  );
};

// (for consistency of form page props)
// eslint-disable-next-line react/no-unused-prop-types
const DonationFormComplete: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser, piResponse: PublicPaymentIntentResponse }> = ({
  watches, fundraiser, piResponse,
}) => {
  const matchFundingAmount = calcMatchFunding({
    donationAmount: piResponse.totalDonationAmount,
    matchFundingRate: fundraiser.matchFundingRate,
    matchFundingRemaining: fundraiser.matchFundingRemaining,
    matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
  });
  const peopleProtected = convert.moneyToPeopleProtected(piResponse.currency, piResponse.totalDonationAmount * (watches.giftAid ? 1.25 : 1) + matchFundingAmount);

  return (
    <>
      <SectionTitle>Thank you!</SectionTitle>
      <p>
        Your donation will protect
        {' '}
        {peopleProtected}
        {' '}
        people from malaria!
      </p>
      <ImpactRepresentation peopleProtected={peopleProtected} />
      <p className="my-2">That's amazing! We can't wait to celebrate that impact with you at our Summer Party!</p>

      {fundraiser.eventLink && (
        <>
          <p className="mt-4">To stay updated about our Summer Party, RSVP to our event. Plus, why not invite your friends to join you in celebrating giving this year?</p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <Button variant="red" target="_blank" href={fundraiser.eventLink} skew={false} className="p-2 text-center flex justify-center items-center">RSVP to our event</Button>
            {fundraiser.moreInvolvedLink && (
            <Button variant="red" target="_blank" href={fundraiser.moreInvolvedLink} skew={false} className="p-2 text-center ml-0 flex justify-center items-center">
              Get more involved in
              {' '}
              {fundraiser.publicName}
            </Button>
            )}
          </div>
        </>
      )}
    </>
  );
};

const ImpactRepresentation: React.FC<{ peopleProtected: number }> = ({ peopleProtected }) => (
  peopleProtected > 600
    ? <p className="my-1">That's so many that we can't display them all here!</p>
    : (
      <p className={classNames('my-1', {
        'text-xs': peopleProtected >= 500,
        'text-sm': peopleProtected < 500,
        'text-base': peopleProtected < 400,
        'text-lg': peopleProtected < 300,
        'text-2xl': peopleProtected < 200,
        'text-3xl': peopleProtected < 100,
      })}
      >
        {new Array(peopleProtected).fill(0).map(() => <UserIcon height="1em" width="1em" />)}
      </p>
    )
);

export default DonationPage;
