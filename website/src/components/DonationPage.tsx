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
            <IntroFundraiser
              title={title}
              tagline={tagline}
              fundraiser={fundraiser}
              openModal={() => setModalOpen(true)}
            />
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
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
          <p className="text-2xl"><span className="text-5xl md:text-7xl stat-animate">{format.amountDropPenceIfZero(fundraiser.data?.totalRaised)}</span><br /> raised by {fundraiser.data?.donationsCount} student{fundraiser.data?.donationsCount === 1 ? "" : "s"}{fundraiser.data ? ` of a ${format.amountDropPenceIfZero(fundraiser.data?.goal)} goal` : ""}</p>

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
          fundraiser.data ? (cardsOpen ? fundraiser.data.donations : fundraiser.data.donations.slice(0, 6)).map((d) => <DonationCard key={d.createdAt} className="bg-raise-red" {...d} />)
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
  overallPublic: boolean,
  namePublic: boolean,
  donationAmountPublic: boolean,
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
      overallPublic: true,
      namePublic: true,
      donationAmountPublic: true,
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
      <SectionTitle>Donate</SectionTitle>
      <div className="mb-4">
        {page === 0 && <DonationFormAmounts formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
        {page === 1 && <DonationFormDetails formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
        {page === 2 && <DonationFormMessage formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
        {page === 3 && <DonationFormPayment formMethods={formMethods} fundraiser={fundraiser} watches={watches} setPayButton={setPayButton} setPiResponse={setPiResponse} onPaymentSuccess={onPaymentSuccess} />}
        {page === 4 && <DonationFormComplete formMethods={formMethods} fundraiser={fundraiser} watches={watches} piResponse={piResponse} />}
      </div>
      <div className="float-right">
        {page !== 0 && page !== 4 && <Button variant="gray" onClick={() => setPage(page - 1)}>Back</Button>}
        {page !== 3 && page !== 4 && <Button variant="blue" onClick={async () => await formMethods.trigger() && setPage(page + 1)}>Next</Button>}
        {page === 3 && payButton}
        {page === 4 && <Button variant="gray" onClick={() => { setModalOpen(false); refetchFundraiser() }}>Close</Button>}
      </div>
      <div className="clear-both" />
    </FormProvider>
  )
}

const DonationFormAmounts: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({
  formMethods: {
    setValue, register, formState: { errors }, trigger, getValues,
  }, watches, fundraiser,
}) => (
  <>
    <h3 className="text-2xl">Your Donation</h3>
    {/* TODO: formatting */}
    <div className="mt-2 grid gap-2 md:grid-cols-3 md:gap-4">
      <button type="button" onClick={() => { setValue("donationAmount", (fundraiser.suggestedDonationAmountOneOff / 100).toString()); setValue("recurrenceFrequency", "ONE_OFF"); trigger() }} className="rounded border border-gray-700 p-4 cursor-pointer transition-all hover:bg-gray-100 hover:scale-105">
        {format.amountDropPenceIfZero(fundraiser.suggestedDonationAmountOneOff)} one-off
      </button>
      <button type="button" onClick={() => { setValue("donationAmount", (fundraiser.suggestedDonationAmountWeekly / 100).toString()); setValue("recurrenceFrequency", "WEEKLY"); trigger() }} className="rounded border border-gray-700 p-4 cursor-pointer transition-all hover:bg-gray-100 hover:scale-105">
        {format.amountDropPenceIfZero(fundraiser.suggestedDonationAmountWeekly)} weekly
      </button>
    </div>

    <div className="mt-2 grid md:grid-cols-2 md:gap-4">
      <LabelledInput
        id="donationAmount"
        label="Donation amount"
        type="number"
        prefix="£"
        error={errors.donationAmount?.message}
        {...register("donationAmount", {
          validate: (s) => {
            try {
              const donationAmount = parseMoney(s)
              if (donationAmount < 1_00) {
                return "The donation amount must be greater than £1 to avoid excessive card transaction fees"
              }

              const recurrenceFrequency = getValues("recurrenceFrequency")
              if (recurrenceFrequency === "ONE_OFF") {
                if (fundraiser.minimumDonationAmount && donationAmount < fundraiser.minimumDonationAmount) {
                  return `The donation amount must be greater than ${format.amountDropPenceIfZero(fundraiser.minimumDonationAmount)}`
                }
              }
            } catch {
              return "The donation amount must be a monetary value"
            }
            return true
          },
        })}
      />
      <LabelledInput
        id="recurrenceFrequency"
        label="Donation frequency"
        type="select"
        options={{
          ONE_OFF: "one-off",
          WEEKLY: "weekly",
        }}
        {...register("recurrenceFrequency")}
      />
    </div>

    <div className="mt-4">
      <p>At the end of the academic year, we come together as a community for a Summer Party to celebrate our collective impact. Given that 100% of your donation above will go directly to charity, we suggest an optional, separate contribution of {format.amountDropPenceIfZero(fundraiser.suggestedContributionAmount)} to cover the costs of the event (which are generously subsidised by our sponsors). Importantly, everyone will be very welcome to join, whether or not they feel able to make this contribution.</p>
      <LabelledInput
        id="contributionAmount"
        label={`Contribution amount${watches.recurrenceFrequency !== "ONE_OFF" ? " (one-off)" : ""}`}
        type="text"
        prefix="£"
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
    </div>

    <div className="mt-8">
      <p>Gift Aid can boost your donation by 25% at no cost to you if you are a UK taxpayer and will pay more Income Tax or Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all your donations. <a href="https://www.gov.uk/donating-to-charity/gift-aid" target="_blank" rel="noreferrer">More info</a>.</p>
      <LabelledInput id="giftAid" label="I meet the requirements for Gift Aid and want to Gift Aid my donation" className="mt-2" type="checkbox" {...register("giftAid")} />
    </div>
  </>
)

const DonationFormDetails: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({ formMethods: { register, formState: { errors } }, watches }) => (
  <><h3 className="text-2xl">Your Details</h3>
    <p>Let's get to know you a bit better!{watches.giftAid && " (We need your address for Gift Aid)"}</p>
    <div className="grid md:grid-cols-1 md:gap-2 mt-4">
      <LabelledInput id="donorName" label="Name" type="text" autoComplete="name" error={errors.donorName?.message} {...register("donorName", { validate: (s) => (s ? true : "We need your name to identify your donation if you contact us") })} />
      <div>
        <LabelledInput
          id="donorEmail"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.donorEmail?.message}
          className={errors.donorEmail?.message ? "mb-4" : undefined}
          {...register("donorEmail", {
            validate: (s) => {
              if (!s) return "We need your email to contact you in there are any problems with your donation"
              // Regex from https://html.spec.whatwg.org/multipage/forms.html#e-mail-state-(type=email)
              if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(s)) return "Please enter a valid email"
              return true
            },
          })}
        />
        <LabelledInput id="emailConsentInformational" label="Tell me exactly where my donation goes (recommended)" type="checkbox" {...register("emailConsentInformational")} />
        <LabelledInput id="emailConsentMarketing" label="Send me updates about Raise (recommended)" className="-mt-2" type="checkbox" {...register("emailConsentMarketing")} />
      </div>
      <LabelledInput id="addressLine1" label={`Address line 1 (${watches.giftAid ? "for gift-aid" : "optional"})`} type="text" autoComplete="address-line1" error={errors.addressLine1?.message} {...register("addressLine1", { validate: (s) => (!watches.giftAid || s ? true : "We need your address for gift-aid") })} />
      <LabelledInput id="addressLine2" label="Address line 2 (optional)" type="text" autoComplete="address-line2" {...register("addressLine2")} />
      <div className="grid md:grid-cols-2 md:gap-2">
        <LabelledInput id="addressLine3" label="Address line 3 (optional)" type="text" autoComplete="address-line3" {...register("addressLine3")} />
        <LabelledInput id="addressPostcode" label={`Address postcode (${watches.giftAid ? "for gift-aid" : "optional"})`} type="text" autoComplete="postal-code" error={errors.addressPostcode?.message} {...register("addressPostcode", { validate: (s) => (!watches.giftAid || s ? true : "We need your address for gift-aid") })} />
      </div>
    </div>
  </>
)

const DonationFormMessage: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({ formMethods: { register }, watches, fundraiser }) => (
  <>
    <h3 className="text-2xl">Your Message</h3>
    <p>Add a message to your donation to be displayed on the website</p>
    <div className="grid md:grid-cols-1 md:gap-2 mt-4">
      <div>
        <LabelledInput id="overallPublic" label="Show my donation publicly (recommended)" type="checkbox" {...register("overallPublic")} />
        {watches.overallPublic && (
          <>
            <LabelledInput id="namePublic" label="Show my name" className="-mt-2" type="checkbox" {...register("namePublic")} />
            <LabelledInput id="donationAmountPublic" label="Show the donation amount" className="-mt-2" type="checkbox" {...register("donationAmountPublic")} />
          </>
        )}
      </div>
      {watches.overallPublic && <LabelledInput id="comment" label="Message (optional)" type="text" {...register("comment")} />}
    </div>
    {watches.overallPublic && (
      <>
        <p className="mt-4">Your donation will appear on the site like this:</p>
        <DonationCard
          donorName={watches.namePublic ? watches.donorName : undefined}
          createdAt="1 minute ago"
          giftAid={watches.donationAmountPublic ? watches.giftAid : undefined}
          comment={watches.comment || null}
          donationAmount={watches.donationAmountPublic ? parseMoney(watches.donationAmount) : undefined}
          matchFundingAmount={watches.donationAmountPublic ? calcMatchFunding({
            donationAmount: parseMoney(watches.donationAmount),
            matchFundingRate: fundraiser.matchFundingRate,
            matchFundingRemaining: fundraiser.matchFundingRemaining,
            matchFundingPerDonationLimit: fundraiser.matchFundingPerDonationLimit,
          }) : undefined}
          recurringAmount={watches.donationAmountPublic && watches.recurrenceFrequency !== "ONE_OFF" ? parseMoney(watches.donationAmount) : null}
          recurrenceFrequency={watches.recurrenceFrequency !== "ONE_OFF" ? watches.recurrenceFrequency : null}
          className="bg-raise-red text-2xl text-white font-raise-content md:max-w-md mt-2"
        />
      </>
    )}
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
    const data: PublicDonationRequest = {
      donationAmount: parseMoney(watches.donationAmount),
      recurrenceFrequency: watches.recurrenceFrequency !== "ONE_OFF" ? watches.recurrenceFrequency : null,
      contributionAmount: watches.contributionAmount ? parseMoney(watches.contributionAmount) : 0,
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
      overallPublic: watches.overallPublic,
      namePublic: watches.namePublic,
      donationAmountPublic: watches.donationAmountPublic,
      comment: watches.comment,
    }
    fetchPiResponse({ data }).then((r) => setPiResponse(r.data))
  }, [watches.donationAmount, watches.recurrenceFrequency, watches.contributionAmount, watches.giftAid, watches.donorEmail, watches.emailConsentInformational, watches.emailConsentMarketing, watches.addressLine1, watches.addressLine2, watches.addressLine3, watches.addressPostcode, watches.overallPublic, watches.namePublic, watches.donationAmountPublic, watches.comment])

  if (piResponse.error) {
    return (
      <>
        <h3 className="text-2xl">Payment</h3>
        <Alert>{piResponse.error}</Alert>
      </>
    )
  }

  if (piResponse.loading || !piResponse.data) {
    return (
      <>
        <h3 className="text-2xl">Payment</h3>
        <p className="animate-pulse">Loading...</p>
      </>
    )
  }

  return (
    <>
      <Alert className="mb-4" variant="warning">
        This system is in development. Avoid using real cards and instead use a <a href="https://stripe.com/docs/testing#cards" target="_blank" rel="noreferrer">Stripe test card</a>, e.g.:<br />
        Card number: <code className="select-all">4242 4242 4242 4242</code><br />
        Expiry date (any future date): <code className="select-all">01 / {(new Date().getFullYear() + 1).toFixed(0).slice(2)}</code><br />
        Security code (any 3 digits): <code className="select-all">123</code>
      </Alert>
      <h3 className="text-2xl">Payment</h3>
      <DonationFormPaymentAmount piResponse={piResponse.data} />
      <Elements
        options={{ clientSecret: piResponse.data.stripeClientSecret }}
        stripe={stripePromise}
      >
        <DonationFormPaymentInner formMethods={formMethods} watches={watches} stripeClientSecret={piResponse.data.stripeClientSecret} setPayButton={setPayButton} onPaymentSuccess={onPaymentSuccess} />
      </Elements>
    </>
  )
}

const DonationFormPaymentAmount: React.FC<{ piResponse: PublicPaymentIntentResponse }> = ({ piResponse }) => {
  if (piResponse.futurePayments.length === 0) {
    return <p>Amount due: {format.amountDropPenceIfZero(piResponse.amount)}</p>
  }

  return (
    <>
      <p>Amount due: {format.amountDropPenceIfZero(piResponse.amount)} now, then:</p>
      <ul className="list-disc pl-8 mb-1">
        {piResponse.futurePayments.map((p) => <li key={p.at}>{format.amountDropPenceIfZero(p.amount)} on {format.date(p.at)}</li>)}
      </ul>
      <p>(you can cancel your future payments at any time by contacting us)</p>
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
const DonationFormComplete: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser, piResponse?: PublicPaymentIntentResponse }> = ({
  piResponse,
}) => {
  const peopleProtected = convert.gbpToPeopleProtected(piResponse?.totalDonationAmount ?? 0)

  const fundraiserLink = window.location.host.replace(/^www./, "") + window.location.pathname.replace(/(\/donate)?\/?$/, "")
  const sharingText = `I just donated to Raise, protecting ${peopleProtected} people from malaria! Raise is a movement encouraging people to adopt a positive approach towards deliberate effective giving - you can #joinraise at ${fundraiserLink} or ask me about it.`
  const shareData = { text: sharingText }

  // TODO: add event link
  // const eventLink = fundraiser.links.find((l) => l.key === "event")

  return (
    <>
      <h3 className="text-2xl">We've got your donation!</h3>
      <p>You've done a great thing today: your donation will protect {peopleProtected} people from malaria!</p>
      {/* TODO: a visual? also maybe a visual should be earlier in the flow? */}

      <h3 className="text-2xl mt-4">Multiply your impact</h3>
      <p className="mb-2">Sharing your donation on social media can massively increase your impact.</p>
      {window.navigator.canShare && window.navigator.canShare(shareData) ? <Button variant="blue" onClick={() => window.navigator.share(shareData)}>Share</Button> : (
        <div className="flex flex-wrap gap-y-2">
          <Button variant="blue" target="_blank" href={`https://www.facebook.com/dialog/send?app_id=329829260786620&link=${encodeURIComponent(fundraiserLink)}&redirect_uri=${encodeURIComponent(fundraiserLink)}`}>Messenger</Button>
          <Button variant="blue" target="_blank" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(sharingText)}`}>WhatsApp</Button>
          <Button variant="blue" target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fundraiserLink)}`}>Facebook</Button>
          <Button className="hidden md:inline-block" variant="blue" target="_blank" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(sharingText)}`}>Twitter</Button>
          <Button className="hidden md:inline-block" variant="blue" target="_blank" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fundraiserLink)}`}>LinkedIn</Button>
          <Button className="hidden md:inline-block" variant="blue" target="_blank" href={`mailto:?body=${encodeURIComponent(sharingText)}&subject=${encodeURIComponent("Donating money to Raise")}`}>Email</Button>
          <p className="mt-2">Sharing in other places is great too! Just direct them to <span className="select-all">{fundraiserLink}</span></p>
        </div>
      )}
    </>
  )
}

export default DonationPage
