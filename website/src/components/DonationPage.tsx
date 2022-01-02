import * as React from "react"
import {
  FormProvider, SubmitHandler, useForm, UseFormReturn, useWatch,
} from "react-hook-form"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements,
} from "@stripe/react-stripe-js"
import {
  format, convert, calcMatchFunding, PublicDonationRequest, PublicFundraiser, PublicPaymentIntentResponse,
} from "@raise/shared"
import Helmet from "react-helmet"
import { ResponseValues } from "axios-hooks"
import confetti from "canvas-confetti"
import classNames from "classnames"
import { QuestionMarkCircleIcon } from "@heroicons/react/outline"
import logo from "../images/logo.png"
import Button from "./Button"
import DonationCard from "./DonationCard"
import { animateStatsIn } from "./IntroStats"
import { useAxios } from "../helpers/networking"
import Modal from "./Modal"
import Section, { SectionTitle } from "./Section"
import { LabelledInput } from "./Form"
import Alert from "./Alert"
import { parseMoney } from "../helpers/parse"
import env from "../env/env"
import Page from "./Page"
import Navigation from "./Navigation"
import FAQs, { FAQ } from "./FAQs"
import Footer from "./Footer"
import Link from "./Link"
import Tooltip from "./Tooltip"

interface Props {
  title: string,
  tagline: string,
  fundraiserId: string,
}

const DonationPage: React.FC<Props> = ({ title, tagline, fundraiserId }) => {
  const [fundraiser, refetchFundraiser] = useAxios<PublicFundraiser>(`/public/fundraisers/${fundraiserId}`)
  const [modalOpen, setModalOpen] = React.useState(false)

  return (
    <Page>
      <Helmet>
        <title>{title}: Donate</title>
        <meta property="og:title" content={`${title}: Donate`} />
      </Helmet>

      <Navigation
        left={[
          { text: "< back to main site", href: "../" },
        ]}
        right={[]}
      />

      <Section>
        {fundraiser.error && !fundraiser.loading ? <Alert>{fundraiser.error}</Alert> : (
          <>
            <noscript>
              <Alert variant="warning" className="-mt-8 mb-8">
                To use this page, and to make a donation, please <Link href="https://www.enable-javascript.com/" target="_blank">enable JavaScript in your browser</Link>.
              </Alert>
            </noscript>
            <IntroFundraiser
              title={title}
              tagline={tagline}
              fundraiser={fundraiser}
              openModal={() => setModalOpen(true)}
            />
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-2xl">
              {fundraiser.data && <DonationForm fundraiser={fundraiser.data} setModalOpen={setModalOpen} refetchFundraiser={refetchFundraiser} />}
            </Modal>
          </>
        )}
      </Section>

      <Section id="faq">
        <SectionTitle>FAQs</SectionTitle>
        <FAQs>
          <FAQ title="Are my details secure?">
            <p>Yes</p>
          </FAQ>

          <FAQ title="Is donating the same as buying a ticket?">
            <p>No</p>
          </FAQ>
        </FAQs>
      </Section>

      <Footer />
    </Page>
  )
}

const IntroFundraiser: React.FC<{ title: string, tagline: string, fundraiser: ResponseValues<PublicFundraiser, unknown, unknown>, openModal: () => void }> = ({
  title, tagline, fundraiser, openModal,
}) => {
  const [cardsOpen, setCardsOpen] = React.useState(false)

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
      <div className="grid gap-8 md:grid-cols-2 md:gap-16 lg:gap-32">
        <div className="md:text-left self-center">
          <img alt="" src={logo} height={60} width={95} className="mb-8" />
          <h1 className="text-5xl md:text-7xl font-raise-header font-black">{title}</h1>
          <p className="text-2xl md:text-3xl">{tagline}</p>
        </div>
        <div className="self-center">
          <p className="text-2xl"><span className="text-5xl md:text-7xl stat-animate">{format.amountShort(fundraiser.data?.currency, fundraiser.data?.totalRaised)}</span><br /> raised by {fundraiser.data?.donationsCount} student{fundraiser.data?.donationsCount === 1 ? "" : "s"}{fundraiser.data ? ` of a ${format.amountShort(fundraiser.data?.currency, fundraiser.data?.goal)} goal` : ""}</p>

          <div className="mx-2 -mt-4 mb-8">
            <div className="flex -skew-x-15 shadow-raise mt-8 rounded overflow-hidden">
              <div className="py-3 bg-raise-red transition-all ease-in-out duration-1000" style={{ width: `${fundraiser.data ? Math.min(Math.round((fundraiser.data.totalRaised / fundraiser.data.goal) * 100), 100) : 0}%` }} />
              <div className="flex-auto py-2 md:py-3 bg-raise-purple" />
            </div>
          </div>

          <Button variant="outline" className="block mx-2 md:inline-block md:mx-0" disabled={!fundraiser.data} onClick={openModal}>Donate</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-8 text-left mt-16">
        {/* Show the first six donations */}
        {/* eslint-disable-next-line no-nested-ternary */
          fundraiser.data ? (cardsOpen ? fundraiser.data.donations : fundraiser.data.donations.slice(0, 6)).map((d) => <DonationCard key={d.createdAt} className="bg-raise-red" currency={fundraiser.data?.currency} {...d} />)
            : [12, 10, 14].map((d) => <DonationCard key={d} loading createdAt="1 hour ago" className="bg-raise-red" donorName={"a".repeat(d)} matchFundingAmount={1234} comment={"a".repeat(d * 2)} />)
        }
      </div>
      {(fundraiser.data?.donations.length ?? 0) > 6
        && (
          <Button
            className="mt-8"
            onClick={() => setCardsOpen(!cardsOpen)}
          >
            {cardsOpen ? "Show less" : "Show all"}
          </Button>
        )}
    </div>
  )
}

const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY)

interface DonationFormResponses {
  donationAmount: string,
  recurrenceFrequency: "ONE_OFF" | "WEEKLY" | "MONTHLY",
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

const DonationForm: React.FC<{ fundraiser: PublicFundraiser, setModalOpen: (x: boolean) => void, refetchFundraiser: () => void }> = ({ fundraiser, setModalOpen, refetchFundraiser }) => {
  const formMethods = useForm<DonationFormResponses>({
    mode: "onTouched",
    defaultValues: {
      donationAmount: (fundraiser.suggestedDonationAmountOneOff / 100).toString(),
      recurrenceFrequency: "ONE_OFF",
      contributionAmount: ((fundraiser.suggestedContributionAmount ?? 0) / 100).toString(),
      giftAid: false,
      donorName: "",
      donorEmail: "",
      emailConsentInformational: true,
      emailConsentMarketing: true,
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      addressPostcode: "",
      nameHidden: false,
      donationAmountHidden: false,
      comment: "",
    },
  })
  const watches = useWatch({ control: formMethods.control }) as DonationFormResponses
  const [page, setPage] = React.useState(0)
  const [payButton, setPayButton] = React.useState(<Button variant="blue" className="mt-4" disabled>Pay now</Button>)
  const [piResponse, setPiResponse] = React.useState<PublicPaymentIntentResponse>()

  const onPaymentSuccess = () => {
    setPage(4)

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

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
              setPage(page - 1)
              const overlay = document.querySelector("[data-reach-dialog-overlay]")
              if (overlay) overlay.scrollTop = 0
            }}
          >
            Back
          </Button>
        )}
        {page !== 3 && page !== 4 && (
          <Button
            variant="blue"
            onClick={async () => {
              const okay = await formMethods.trigger()
              if (!okay) return
              setPage(page + 1)
              const overlay = document.querySelector("[data-reach-dialog-overlay]")
              if (overlay) overlay.scrollTop = 0
            }}
          >
            Next
          </Button>
        )}
        {page === 3 && payButton}
        {page === 4 && (
          <Button
            variant="gray"
            onClick={() => {
              setModalOpen(false)
              refetchFundraiser()
            }}
          >
            Close
          </Button>
        )}
      </div>
      <div className="clear-both" />
    </FormProvider>
  )
}

const DonationFormDonate: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({
  formMethods: {
    setValue, register, formState: { errors }, trigger, getValues,
  }, watches, fundraiser,
}) => {
  let donationAmount: null | number = null
  try {
    donationAmount = parseMoney(watches.donationAmount)
  } catch { /* noop */ }
  const shouldShowLowAmountWarning = donationAmount !== null && ((watches.recurrenceFrequency === "ONE_OFF" && donationAmount < 20_00) || (watches.recurrenceFrequency === "WEEKLY" && donationAmount < 2_00))
  const matchFundingAmount = donationAmount === null ? null : calcMatchFunding({
    donationAmount,
    matchFundingRate: fundraiser.matchFundingRate,
    matchFundingRemaining: fundraiser.matchFundingRemaining,
    matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
  })
  const peopleProtected = donationAmount === null || matchFundingAmount === null ? null : convert.moneyToPeopleProtected(fundraiser.currency, donationAmount * (watches.giftAid ? 1.25 : 1) + matchFundingAmount)

  const randomRepeat = (charset: string[], count: number) => {
    let s = ""
    for (let i = 0; i < count; i++) {
      s += charset[Math.floor(Math.random() * charset.length)]
    }
    return s
  }

  return (
    <>
      <SectionTitle>Donate</SectionTitle>
      <p>
        We recommend giving an amount that feels <span className="font-bold">significant to you</span>.
        {" "}
        <Tooltip
          label={(
            <p>
              We hope that through joining Raise this year, you'll come to see how positive the experience of giving deliberately can be. To help you to engage in that way, we recommend that you donate an amount which requires you to think before you give and to reflect on the positive impact that your donation will have.
            </p>
          )}
        >
          How do I decide what that means for me?<QuestionMarkCircleIcon width={22} height={22} className="ml-1" />
        </Tooltip>
      </p>
      <p className="mt-2">I want to give<span className="inline sm:hidden"> a</span>...</p>

      <div className="mt-2 grid grid-cols-2 gap-4">
        <Button variant={watches.recurrenceFrequency === "ONE_OFF" ? "purple" : "gray"} onClick={() => { setValue("donationAmount", (fundraiser.suggestedDonationAmountOneOff / 100).toString()); setValue("recurrenceFrequency", "ONE_OFF"); trigger() }} skew={false} className={classNames("px-2 py-6 text-center leading-none flex flex-col justify-center", { "text-gray-200": watches.recurrenceFrequency !== "ONE_OFF" })}>
          <span className="hidden sm:inline">a </span>one-off donation
        </Button>
        <Button variant={watches.recurrenceFrequency === "WEEKLY" ? "purple" : "gray"} onClick={() => { setValue("donationAmount", (fundraiser.suggestedDonationAmountWeekly / 100).toString()); setValue("recurrenceFrequency", "WEEKLY"); trigger() }} skew={false} className={classNames("px-2 py-6 text-center leading-none ml-0", { "text-gray-200": watches.recurrenceFrequency !== "WEEKLY" })}>
          <span className="hidden sm:inline">a </span>weekly donation<span className="block text-xs sm:text-sm">(to {format.date(fundraiser.recurringDonationsTo)})</span>
        </Button>
      </div>

      <LabelledInput
        id="donationAmount"
        type="number"
        prefix={fundraiser.currency === "gbp" ? "£" : "$"}
        error={errors.donationAmount?.message}
        className="mt-4"
        inputClassName="text-2xl"
        {...register("donationAmount", {
          validate: (s) => {
            if (!s) return "Please enter an amount"

            try {
              const value = parseMoney(s)
              if (value < 1_00) {
                return `The amount must be greater than ${format.amountShort(fundraiser.currency, 100)} to avoid excessive card transaction fees`
              }

              // TODO: calculate for recurring donations
              const recurrenceFrequency = getValues("recurrenceFrequency")
              if (recurrenceFrequency === "ONE_OFF") {
                if (fundraiser.minimumDonationAmount && value < fundraiser.minimumDonationAmount) {
                  return `The amount must be greater than ${format.amountShort(fundraiser.currency, fundraiser.minimumDonationAmount)}`
                }
              }
            } catch {
              return "The amount must be a monetary value"
            }
            return true
          },
        })}
      />

      {/* TODO: determine wording for this */}
      {shouldShowLowAmountWarning && <p className="mt-1">[Text prompt that appears if someone tries to put in a donation of &lt;£20 one-off, or &lt;£2 weekly, and remains once it has appeared. Text explains the significant amount recommendation.]</p>}

      <LabelledInput id="giftAid" label={<span>Add 25% <span className="hidden md:inline">to my donation </span>through <Tooltip label={(<p>To claim Gift Aid, you must be a UK taxpayer and pay more Income Tax or Capital Gains Tax this tax year than the amount of Gift Aid claimed on all your donations.</p>)}><span className="">Gift Aid<QuestionMarkCircleIcon width={22} height={22} className="ml-1" /></span></Tooltip></span>} className="my-4" type="checkbox" {...register("giftAid")} />

      {peopleProtected && (
        <>
          <p>Amazing! {watches.recurrenceFrequency === "WEEKLY" ? "Every week, y" : "Y"}our donation will help protect {peopleProtected} people from malaria. We think that's something worth celebrating!</p>
          {peopleProtected > 600 ? <p className="mt-3">That's so many that we can't display them all here!</p> : (
            <p className={classNames("mt-3", {
              "text-xs": peopleProtected >= 500,
              "text-sm": peopleProtected < 500,
              "text-base": peopleProtected < 400,
              "text-lg": peopleProtected < 300,
              "text-2xl": peopleProtected < 200,
              "text-3xl": peopleProtected < 100,
            })}
            >{randomRepeat([
              "👶🏻", "🧒🏻", "👦🏻", "👧🏻", "🧑🏻", "👨🏻", "👩🏻", "🧓🏻", "🧔🏻",
              "👶🏼", "🧒🏼", "👦🏼", "👧🏼", "🧑🏼", "👨🏼", "👩🏼", "🧓🏼", "🧔🏼",
              "👶🏽", "🧒🏽", "👦🏽", "👧🏽", "🧑🏽", "👨🏽", "👩🏽", "🧓🏽", "🧔🏽",
              "👶🏾", "🧒🏾", "👦🏾", "👧🏾", "🧑🏾", "👨🏾", "👩🏾", "🧓🏾", "🧔🏾",
              "👶🏿", "🧒🏿", "👦🏿", "👧🏿", "🧑🏿", "👨🏿", "👩🏿", "🧓🏿", "🧔🏿",
            ], peopleProtected)}
            </p>
          )}
        </>
      )}
    </>
  )
}

const DonationFormCelebrate: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({
  formMethods: {
    setValue, register, formState: { errors }, trigger,
  }, watches, fundraiser,
}) => {
  let contributionAmount = 0
  try {
    contributionAmount = parseMoney(watches.contributionAmount)
  } catch {
    contributionAmount = 1 // so if they have entered something invalid the button doesn't change to 'I don't want to contribute'
  }

  return (
    <>
      <SectionTitle>Celebrate</SectionTitle>
      <p>At the end of this year, we'll invite everyone who's joined {fundraiser.publicName} to our Summer Party to celebrate our collective impact. We'd love to send you an invitation!</p>

      <LabelledInput className="mt-2" id="donorName" label="Name" type="text" autoComplete="name" error={errors.donorName?.message} {...register("donorName", { validate: (s) => (s ? true : "We need your name to send you an invite, and to identify your donation if you contact us") })} />

      <div>
        <LabelledInput
          id="donorEmail"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.donorEmail?.message}
          className={errors.donorEmail?.message ? "mt-4 mb-4" : "mt-4"}
          {...register("donorEmail", {
            validate: (s) => {
              if (!s) return "We need your email to send you an invite, and to contact you in there are any problems with your donation"
              // Regex from https://html.spec.whatwg.org/multipage/forms.html#e-mail-state-(type=email)
              if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(s)) return "Please enter a valid email"
              return true
            },
          })}
        />
        <LabelledInput id="emailConsentInformational" label="Tell me exactly where my donation goes" type="checkbox" {...register("emailConsentInformational")} />
        <LabelledInput id="emailConsentMarketing" label="Send me updates about Raise" className="-mt-2" type="checkbox" {...register("emailConsentMarketing")} />
      </div>

      {fundraiser.suggestedContributionAmount !== null && (
        <>
          <h3 className="text-2xl mt-8">Contribution</h3>
          <p className="mt-1">As 100% of your donation goes to charity, we suggest an optional contribution to cover the costs of the Summer Party (which are generously subsidised by our sponsors). Everyone is welcome to join, whether or not they make this contribution.</p>

          <div className="mt-2 grid grid-cols-2 gap-4">
            <Button variant={contributionAmount > 0 ? "purple" : "gray"} onClick={() => { setValue("contributionAmount", ((fundraiser.suggestedContributionAmount ?? 10_00) / 100).toString()); trigger("contributionAmount") }} skew={false} className={classNames("p-4 text-center", { "text-gray-200": contributionAmount <= 0 })}>
              I want to contribute
            </Button>
            <Button variant={contributionAmount <= 0 ? "purple" : "gray"} onClick={() => { setValue("contributionAmount", "0"); trigger("contributionAmount") }} skew={false} className={classNames("p-4 text-center ml-0", { "text-gray-200": contributionAmount > 0 })}>
              I don't want to contribute
            </Button>
          </div>

          <LabelledInput
            id="contributionAmount"
            label={`Contribution amount${watches.recurrenceFrequency !== "ONE_OFF" ? " (one-off)" : ""}`}
            type="text"
            prefix={fundraiser.currency === "gbp" ? "£" : "$"}
            className="mt-2"
            error={errors.contributionAmount?.message}
            {...register("contributionAmount", {
              validate: (s) => {
                if (!s) return true
                try {
                  parseMoney(s)
                } catch {
                  return "The contribution amount must be a monetary value"
                }
                return true
              },
            })}
          />
        </>
      )}

      {watches.giftAid && (
        <>
          <h3 className="text-2xl mt-8">Gift Aid</h3>
          <p className="mt-1">To claim Gift Aid on your donation we need your address.</p>
          <LabelledInput id="addressLine1" label="Address" type="text" autoComplete="address-line1" error={errors.addressLine1?.message} className="mt-2" {...register("addressLine1", { validate: (s) => (!watches.giftAid || s ? true : "We need your address for Gift Aid") })} />
          <LabelledInput id="addressLine2" type="text" autoComplete="address-line2" {...register("addressLine2")} />
          {watches.addressLine2 && <LabelledInput id="addressLine3" type="text" autoComplete="address-line3" {...register("addressLine3")} />}
          <LabelledInput id="addressPostcode" label="Postcode" type="text" autoComplete="postal-code" error={errors.addressPostcode?.message} {...register("addressPostcode", { validate: (s) => (!watches.giftAid || s ? true : "We need your postcode for Gift Aid") })} />
        </>
      )}
    </>
  )
}

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
      recurringAmount={!watches.donationAmountHidden && watches.recurrenceFrequency !== "ONE_OFF" ? parseMoney(watches.donationAmount) : null}
      recurrenceFrequency={watches.recurrenceFrequency !== "ONE_OFF" ? watches.recurrenceFrequency : null}
      className="bg-raise-red text-2xl text-white font-raise-content md:max-w-sm mt-2"
    />
    <div className="grid md:grid-cols-1 md:gap-2 mt-4">
      <div>
        <LabelledInput id="nameHidden" label="Hide my name" className="-mt-2" type="checkbox" {...register("nameHidden")} />
        <LabelledInput id="donationAmountHidden" label="Hide the donation amount" className="-mt-2" type="checkbox" {...register("donationAmountHidden")} />
      </div>
      <LabelledInput id="comment" label="Message (optional)" type="text" {...register("comment")} />
    </div>
  </>
)

const DonationFormPayment: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser, setPayButton: (e: JSX.Element) => void, setPiResponse: (piResponse: PublicPaymentIntentResponse) => void, onPaymentSuccess: () => void }> = ({
  formMethods, watches, fundraiser, setPayButton, setPiResponse, onPaymentSuccess,
}) => {
  const [piResponse, fetchPiResponse] = useAxios<PublicPaymentIntentResponse>({
    url: `/public/fundraisers/${fundraiser.id}/donation`,
    method: "POST",
  }, { manual: true })

  React.useEffect(() => {
    let contributionAmount = 0
    try {
      contributionAmount = parseMoney(watches.contributionAmount)
    } catch { /* noop */ }

    const data: PublicDonationRequest = {
      donationAmount: parseMoney(watches.donationAmount),
      recurrenceFrequency: watches.recurrenceFrequency !== "ONE_OFF" ? watches.recurrenceFrequency : null,
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
      addressCountry: watches.addressPostcode ? "United Kingdom" : null,
      overallPublic: true,
      namePublic: !watches.nameHidden,
      donationAmountPublic: !watches.donationAmountHidden,
      comment: watches.comment,
    }
    fetchPiResponse({ data }).then((r) => setPiResponse(r.data))
  }, [watches.donationAmount, watches.recurrenceFrequency, watches.contributionAmount, watches.giftAid, watches.donorEmail, watches.emailConsentInformational, watches.emailConsentMarketing, watches.addressLine1, watches.addressLine2, watches.addressLine3, watches.addressPostcode, watches.nameHidden, watches.donationAmountHidden, watches.comment])

  if (piResponse.error) {
    return (
      <>
        <SectionTitle>Payment</SectionTitle>
        <Alert>{piResponse.error}</Alert>
      </>
    )
  }

  if (piResponse.loading || !piResponse.data) {
    return (
      <>
        <SectionTitle>Payment</SectionTitle>
        <p className="animate-pulse">Loading...</p>
      </>
    )
  }

  return (
    <>
      <SectionTitle>Payment</SectionTitle>
      {env.STAGE !== "prod" && (
        <Alert className="mb-4" variant="warning">
          This is a non-prod environment. Use a <a href="https://stripe.com/docs/testing#cards" target="_blank" rel="noreferrer">Stripe test card</a> instead of a real card, e.g.:<br />
          Card number: <code className="select-all">4242 4242 4242 4242</code><br />
          Expiry date (any future date): <code className="select-all">12 / 34</code><br />
          Security code (any 3 digits): <code className="select-all">123</code>
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
  )
}

const DonationFormPaymentAmount: React.FC<{ watches: DonationFormResponses, piResponse: PublicPaymentIntentResponse }> = ({ watches, piResponse }) => {
  let contributionAmount = 0
  try {
    contributionAmount = parseMoney(watches.contributionAmount)
  } catch { /* noop */ }

  const [showDetails, setShowDetails] = React.useState(false)

  if (piResponse.futurePayments.length === 0) {
    if (contributionAmount > 0) {
      return <p>Amount due: {format.amountShort(piResponse.currency, piResponse.amount)} ({format.amountShort(piResponse.currency, parseMoney(watches.donationAmount))} donation + {format.amountShort(piResponse.currency, contributionAmount)} contribution)</p>
    }
    return <p>Amount due: {format.amountShort(piResponse.currency, piResponse.amount)}</p>
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <p>Amount due: {format.amountShort(piResponse.currency, piResponse.amount)}{contributionAmount > 0 ? ` (${format.amountShort(piResponse.currency, parseMoney(watches.donationAmount))} donation + ${format.amountShort(piResponse.currency, contributionAmount)} contribution)` : ""} now, then{contributionAmount > 0 ? " a" : ""} {format.amountShort(piResponse.currency, parseMoney(watches.donationAmount))} {contributionAmount > 0 ? "donation every" : "a"} week until {format.date(piResponse.futurePayments[piResponse.futurePayments.length - 1].at)}. <Link onClick={() => setShowDetails(!showDetails)}>{showDetails ? "Hide" : "View"} schedule</Link>.</p>

      {showDetails && (
        <ul className="list-disc pl-8 my-1">
          {piResponse.futurePayments.map((p) => <li key={p.at}>{format.amountShort(piResponse.currency, p.amount)} on {format.date(p.at)}</li>)}
        </ul>
      )}

      <p className="mt-2">
        You can cancel your future payments at any time by contacting us.
      </p>
    </>
  )
}

const DonationFormPaymentInner: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, stripeClientSecret: string, setPayButton: (e: JSX.Element) => void, onPaymentSuccess: () => void }> = ({
  formMethods: {
    handleSubmit, formState: { isSubmitting },
  }, watches, stripeClientSecret, setPayButton, onPaymentSuccess,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = React.useState<Error | string | undefined>()

  // Confirm the payment with Stripe
  const onSubmit: SubmitHandler<DonationFormResponses> = async () => {
    if (!stripe || !elements) {
      throw new Error("The payment system is still loading, please try again in a minute.")
    }

    const cardNumberElement = elements.getElement(CardNumberElement)
    if (!cardNumberElement) {
      throw new Error("The payment fields are still loading, please try again in a minute.")
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
    )

    if (response.error) {
      if (response.error.type === "card_error" || response.error.type === "validation_error" || response.error.code === "payment_intent_authentication_failure") {
        setError(response.error.message)
      } else {
        // eslint-disable-next-line no-console
        console.error(response.error)
        setError("An unexpected error occured with your payment")
        if (response.error.code === "resource_missing") {
          // eslint-disable-next-line no-console
          console.error("This error might occur because your Stripe credientials on the frontend do not match the ones on the backend. Check out the env.ts file to fix this.")
        }
      }
    } else if (response.paymentIntent.status === "succeeded") {
      onPaymentSuccess()
    } else {
      setError("An unexpected error occured with your payment")
    }
  }

  const buttonDisabled = !stripe || !elements || isSubmitting

  React.useEffect(() => {
    setPayButton(<Button variant="blue" className="mt-4" onClick={handleSubmit(onSubmit)} disabled={buttonDisabled}>Pay now</Button>)
  }, [stripeClientSecret, buttonDisabled])

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
                base: "w-full flex-1 py-2 px-3 appearance-none block border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none rounded",
                focus: "border-gray-800 bg-white-important", // needs to be important to override bg-gray-200 style. can't use focus(-within):bg-white as not really focused
                invalid: "bg-red-100 border-red-100 hover:bg-red-50 hover:border-red-400 focus:border-red-800 focus:bg-red-50",
              },
              style: {
                base: {
                  fontSize: "16px",
                  fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",
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
                  base: "w-full flex-1 py-2 px-3 appearance-none block border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none rounded",
                  focus: "border-gray-800 bg-white-important", // needs to be important to override bg-gray-200 style. can't use focus(-within):bg-white as not really focused
                  invalid: "bg-red-100 border-red-100 hover:bg-red-50 hover:border-red-400 focus:border-red-800 focus:bg-red-50",
                },
                style: {
                  base: {
                    fontSize: "16px",
                    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",
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
                  base: "w-full flex-1 py-2 px-3 appearance-none block border cursor-text transition-all text-gray-700 bg-gray-200 border-gray-200 hover:bg-gray-100 hover:border-gray-400 outline-none rounded",
                  focus: "border-gray-800 bg-white-important", // needs to be important to override bg-gray-200 style. can't use focus(-within):bg-white as not really focused
                  invalid: "bg-red-100 border-red-100 hover:bg-red-50 hover:border-red-400 focus:border-red-800 focus:bg-red-50",
                },
                style: {
                  base: {
                    fontSize: "16px",
                    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",
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
  )
}

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
  })
  const peopleProtected = convert.moneyToPeopleProtected(piResponse.currency, piResponse.totalDonationAmount * (watches.giftAid ? 1.25 : 1) + matchFundingAmount)

  const fundraiserLink = window.location.host.replace(/^www./, "") + window.location.pathname.replace(/(\/donate)?\/?$/, "")
  const sharingText = `I just donated to Raise, protecting ${peopleProtected} people from malaria! Raise is a movement encouraging people to adopt a positive approach towards deliberate effective giving - you can #joinraise at ${fundraiserLink} or ask me about it.`
  const shareData = { text: sharingText }

  return (
    <>
      <SectionTitle>Thank you!</SectionTitle>
      <h3 className="text-2xl">We've got your donation</h3>
      <p>You've done a great thing today: your donation will protect {peopleProtected} people from malaria!</p>

      <h3 className="text-2xl mt-4">Multiply your impact</h3>
      <p className="mb-2">Sharing your donation on social media can massively increase your impact.</p>
      {window.navigator.canShare && window.navigator.canShare(shareData) ? <Button variant="blue" onClick={() => window.navigator.share(shareData)}>Share</Button> : (
        <div className="flex flex-wrap gap-y-2">
          <Button variant="blue" target="_blank" href={`https://www.facebook.com/dialog/send?app_id=329829260786620&link=${encodeURIComponent(fundraiserLink)}&redirect_uri=${encodeURIComponent(fundraiserLink)}`}>Messenger</Button>
          <Button variant="blue" target="_blank" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(sharingText)}`}>WhatsApp</Button>
          <Button variant="blue" target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fundraiserLink)}`}>Facebook</Button>
          <Button className="hidden md:inline-block" variant="blue" target="_blank" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(sharingText)}`}>Twitter</Button>
          <Button className="hidden md:inline-block" variant="blue" target="_blank" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fundraiserLink)}`}>LinkedIn</Button>
          <p className="mt-2">Sharing in other places is great too! Just direct them to <span className="select-all">{fundraiserLink}</span></p>
        </div>
      )}

      {fundraiser.eventLink && (
        <>
          <h3 className="text-2xl mt-4">Join us at the summer party</h3>
          <p className="mb-2">RSVP to our summer party on <Link href={fundraiser.eventLink} target="_blank">our event page</Link>.</p>
        </>
      )}
    </>
  )
}

export default DonationPage
