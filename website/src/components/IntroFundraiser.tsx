import * as React from "react"
import {
  FormProvider, SubmitHandler, useForm, UseFormReturn, useWatch,
} from "react-hook-form"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements,
} from "@stripe/react-stripe-js"
import logo from "../images/logo.png"
import Button from "./Button"
import DonationCard from "./DonationCard"
import { animateStatsIn } from "./IntroStats"
import { useAxios } from "../helpers/networking"
import { PublicDonationRequest, PublicFundraiser, PublicPaymentIntentResponse } from "../pages/admin/types.d"
import { amountDropPenceIfZeroFormatter } from "../helpers/format"
import Modal from "./Modal"
import { SectionTitle } from "./Section"
import { LabelledInput } from "./Form"
import Alert from "./Alert"
import { parseMoney } from "../helpers/parse"
import env from "../env/env"

interface Props {
  title: string,
  tagline: string,
  fundraiserId: string,
}

const IntroFundraiser: React.FC<Props> = ({ title, tagline, fundraiserId }) => {
  const [fundraiser, refetchFundraiser] = useAxios<PublicFundraiser>(`/public/fundraisers/${fundraiserId}`)

  const [modalOpen, setModalOpen] = React.useState(false)

  const ref = React.useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = React.useState(false)
  React.useLayoutEffect(() => {
    if (ref.current && fundraiser.data && !hasAnimated) {
      animateStatsIn(ref.current)
      setHasAnimated(true)
    }
  })

  // TODO:  loading and error states

  return (
    <div ref={ref}>
      <div className="grid gap-8 md:grid-cols-2 md:gap-16 lg:gap-32">
        <div className="md:text-left self-center">
          <img alt="" src={logo} height={60} width={95} className="mb-8" />
          <h1 className="text-5xl md:text-7xl font-raise-header font-black">{title}</h1>
          <p className="text-2xl md:text-3xl">{tagline}</p>
        </div>
        <div className="self-center">
          <p className="text-2xl"><span className="text-5xl md:text-7xl stat-animate">{amountDropPenceIfZeroFormatter(fundraiser.data?.totalRaised)}</span><br /> raised by {fundraiser.data?.donationsCount} student{fundraiser.data?.donationsCount === 1 ? "" : "s"} of a {amountDropPenceIfZeroFormatter(fundraiser.data?.goal)} goal</p>

          <div className="mx-2 -mt-4 mb-8">
            <div className="flex transform -skew-x-15 shadow-raise mt-8 rounded overflow-hidden">
              <div className="py-3 bg-raise-red transition-all ease-in-out duration-1000" style={{ width: `${fundraiser.data ? Math.min(Math.round((fundraiser.data.totalRaised / fundraiser.data.goal) * 100), 100) : 0}%` }} />
              <div className="flex-auto py-2 md:py-3 bg-raise-purple" />
            </div>
          </div>

          <Button variant="outline" className="block mx-2 md:inline-block md:mx-0" disabled={!fundraiser.data} onClick={() => setModalOpen(true)}>Donate</Button>
          <Modal open={modalOpen} onClose={() => { setModalOpen(false); refetchFundraiser() }}>
            {fundraiser.data && <DonationForm fundraiser={fundraiser.data} setModalOpen={setModalOpen} refetchFundraiser={refetchFundraiser} />}
          </Modal>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-8 text-left mt-16">
        {/* Show the first six donations */}
        {/* TODO: add a 'show all donations' button that toggles displaying all the donations */}
        {fundraiser.data?.donations.slice(0, 6).map((d) => <DonationCard key={d.createdAt} className="bg-raise-red" {...d} />)}
      </div>
    </div>
  )
}

const closeModal = (setModalOpen: (x: boolean) => void, refetchFundraiser: () => void) => {
  setModalOpen(false)
  refetchFundraiser()
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

// TODO: error handling
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

  return (
    <FormProvider {...formMethods}>
      <SectionTitle>Donate</SectionTitle>
      <div className="mb-4">
        {page === 0 && <DonationFormAmounts formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
        {page === 1 && <DonationFormDetails formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
        {page === 2 && <DonationFormMessage formMethods={formMethods} fundraiser={fundraiser} watches={watches} />}
        {page === 3 && <DonationFormPayment formMethods={formMethods} fundraiser={fundraiser} watches={watches} setPayButton={setPayButton} onPaymentSuccess={() => setPage(page + 1)} />}
        {page === 4 && <DonationFormComplete watches={watches} />}
      </div>
      <div className="float-right">
        {page !== 0 && page !== 4 && <Button variant="gray" onClick={() => setPage(page - 1)}>Back</Button>}
        {page !== 3 && page !== 4 && <Button variant="blue" onClick={async () => await formMethods.trigger() && setPage(page + 1)}>Next</Button>}
        {page === 3 && payButton}
        {page === 4 && <Button variant="gray" onClick={() => closeModal(setModalOpen, refetchFundraiser)}>Close</Button>}
      </div>
    </FormProvider>
  )
}

const DonationFormAmounts: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({
  formMethods: {
    setValue, register, formState: { errors }, trigger,
  }, watches, fundraiser,
}) => (
  <>
    <h3 className="text-2xl">Your Donation</h3>
    {/* TODO: formatting */}
    <div className="mt-2 grid gap-2 md:grid-cols-3 md:gap-4">
      <button type="button" onClick={() => { setValue("donationAmount", (fundraiser.suggestedDonationAmountOneOff / 100).toString()); setValue("recurrenceFrequency", "ONE_OFF"); trigger() }} className="rounded border border-gray-700 p-4 cursor-pointer transform transition-all hover:bg-gray-100 hover:scale-105">
        {amountDropPenceIfZeroFormatter(fundraiser.suggestedDonationAmountOneOff)} one-off
      </button>
      <button type="button" onClick={() => { setValue("donationAmount", (fundraiser.suggestedDonationAmountWeekly / 100).toString()); setValue("recurrenceFrequency", "WEEKLY"); trigger() }} className="rounded border border-gray-700 p-4 cursor-pointer transform transition-all hover:bg-gray-100 hover:scale-105">
        {amountDropPenceIfZeroFormatter(fundraiser.suggestedDonationAmountWeekly)} weekly
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
              parseMoney(s)
              // TODO: figure out how to check against minimum amount while accounting for recurring donations - even ignoring recurring donations we generally run into problems when using the recommended donation buttons despite fiddling with calls to trigger
            } catch {
              return "Donation amount must be a monetary value"
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
      <p>At the end of the academic year, we come together as a community for a Summer Party to celebrate our collective impact. Given that 100% of your donation above will go directly to charity, we suggest an optional, separate contribution of {amountDropPenceIfZeroFormatter(fundraiser.suggestedContributionAmount)} to cover the costs of the event (which are generously subsidised by our sponsors). Importantly, everyone will be very welcome to join, whether or not they feel able to make this contribution.</p>
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
              return "Contribution amount must be a monetary value"
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

// TODO: it'd be good to better explain why we need these details if the user hasn't entered them
const DonationFormDetails: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({ formMethods: { register, formState: { errors } }, watches }) => (
  <><h3 className="text-2xl">Your Details</h3>
    <p>Let's get to know you a bit better!{watches.giftAid && " (We need your address for Gift Aid)"}</p>
    <div className="grid md:grid-cols-1 md:gap-2 mt-4">
      <LabelledInput id="donorName" label="Name" type="text" autoComplete="name" error={errors.donorName?.message} {...register("donorName", { validate: (s) => (s ? true : "Please enter your name") })} />
      <div>
        <LabelledInput
          id="donorEmail"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.donorEmail?.message}
          {...register("donorEmail", {
            validate: (s) => {
              if (!s) return "Please enter your email"
              // Regex from https://html.spec.whatwg.org/multipage/forms.html#e-mail-state-(type=email)
              if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(s)) return "Please enter a valid email"
              return true
            },
          })}
        />
        <LabelledInput id="emailConsentInformational" label="Tell me exactly where my donation goes (recommended)" type="checkbox" {...register("emailConsentInformational")} />
        <LabelledInput id="emailConsentMarketing" label="Send me updates about Raise (recommended)" className="-mt-2" type="checkbox" {...register("emailConsentMarketing")} />
      </div>
      {watches.giftAid && (
        <>
          {/* TODO: make these fields required if giftaid enabled */}
          <LabelledInput id="addressLine1" label="Address line 1" type="text" autoComplete="address-line1" error={errors.addressLine1?.message} {...register("addressLine1", { validate: (s) => (s ? true : "Please enter the first line of your address") })} />
          <LabelledInput id="addressLine2" label="Address line 2 (optional)" type="text" autoComplete="address-line2" {...register("addressLine2")} />
          <div className="grid md:grid-cols-2 md:gap-2">
            <LabelledInput id="addressLine3" label="Address line 3 (optional)" type="text" autoComplete="address-line3" {...register("addressLine3")} />
            <LabelledInput id="addressPostcode" label="Address postcode" type="text" autoComplete="postal-code" error={errors.addressPostcode?.message} {...register("addressPostcode", { validate: (s) => (s ? true : "Please enter your postcode") })} />
          </div>
        </>
      )}
    </div>
  </>
)

const DonationFormMessage: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser }> = ({ formMethods: { setValue, register }, watches, fundraiser }) => (
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
          // TODO: calculate match funding amount (more) properly, and maybe add a warning about this
          matchFundingAmount={watches.donationAmountPublic ? parseMoney(watches.donationAmount) : undefined}
          recurringAmount={watches.donationAmountPublic && watches.recurrenceFrequency !== "ONE_OFF" ? parseMoney(watches.donationAmount) : null}
          recurrenceFrequency={watches.recurrenceFrequency !== "ONE_OFF" ? watches.recurrenceFrequency : null}
          className="bg-raise-red text-2xl text-white font-raise-content max-w-md mt-2"
        />
      </>
    )}
  </>
)

const DonationFormPayment: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser, setPayButton: (e: JSX.Element) => void, onPaymentSuccess: () => void }> = ({
  formMethods, watches, fundraiser, setPayButton, onPaymentSuccess,
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
      addressLine1: watches.giftAid ? (watches.addressLine1 || null) : null,
      addressLine2: watches.giftAid ? (watches.addressLine2 || null) : null,
      addressLine3: watches.giftAid ? (watches.addressLine3 || null) : null,
      addressPostcode: watches.giftAid ? (watches.addressPostcode || null) : null,
      addressCountry: watches.giftAid ? "United Kingdom" : null,
      overallPublic: watches.overallPublic,
      namePublic: watches.namePublic,
      donationAmountPublic: watches.donationAmountPublic,
      comment: watches.comment,
    }
    fetchPiResponse({ data })
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

  // TODO: display piResponse.data.futurePayments properly
  return (
    <>
      <h3 className="text-2xl">Payment</h3>
      <p>Amount due: {amountDropPenceIfZeroFormatter(piResponse.data.amount)}{watches.recurrenceFrequency !== "ONE_OFF" && ` now, then £${watches.donationAmount} ${watches.recurrenceFrequency?.toLowerCase()} (you can cancel your ${watches.recurrenceFrequency?.toLowerCase()} payments at any time)`}</p>
      <Alert className="mt-2" variant="warning">
        This system is in development. Avoid using real cards and instead use a <a href="https://stripe.com/docs/testing#cards" target="_blank" rel="noreferrer">Stripe test card</a>, e.g.:<br />
        Card number: <code className="select-all">4242 4242 4242 4242</code><br />
        Expiry date (any future date): <code className="select-all">01 / {(new Date().getFullYear() + 1).toFixed(0).slice(2)}</code><br />
        Security code (any 3 digits): <code className="select-all">123</code>
      </Alert>
      <Elements
        options={{ clientSecret: piResponse.data.stripeClientSecret }}
        stripe={stripePromise}
      >
        <DonationFormPaymentInner formMethods={formMethods} fundraiser={fundraiser} watches={watches} stripeClientSecret={piResponse.data.stripeClientSecret} setPayButton={setPayButton} onPaymentSuccess={onPaymentSuccess} />
      </Elements>
    </>
  )
}

const DonationFormPaymentInner: React.FC<{ formMethods: UseFormReturn<DonationFormResponses>, watches: DonationFormResponses, fundraiser: PublicFundraiser, stripeClientSecret: string, setPayButton: (e: JSX.Element) => void, onPaymentSuccess: () => void }> = ({
  formMethods: {
    handleSubmit, formState: { isSubmitting },
  }, watches, fundraiser, stripeClientSecret, setPayButton, onPaymentSuccess,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = React.useState<Error | string | undefined>()

  // Confirm the payment with Stripe
  const onSubmit: SubmitHandler<DonationFormResponses> = async (data) => {
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
        // eslint-disable-next-line @typescript-eslint/camelcase
        payment_method: {
          card: cardNumberElement,
          // eslint-disable-next-line @typescript-eslint/camelcase
          billing_details: {
            name: watches.donorName,
            email: watches.donorEmail,
            // TODO: provide address if we have it
          },
        },
      },
    )

    if (response.error) {
      if (response.error.type === "card_error" || response.error.type === "validation_error" || response.error.code === "payment_intent_authentication_failure") {
        setError(response.error.message)
      } else {
        console.error(response.error)
        setError("An unexpected error occured with your payment")
      }
    } else if (response.paymentIntent.status === "succeeded") {
      // alert("Success!")
      console.log(response.paymentIntent)
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
// TODO: do social sharing button
const DonationFormComplete: React.FC<{ watches: DonationFormResponses }> = ({ watches }) => (
  <>
    <h3 className="text-2xl">Payment Succesful! </h3>
    <div> Thank you for donating, we received your payment!</div>
  </>
)

export default IntroFundraiser
