import * as React from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import logo from "../images/logo.png"
import Button from "./Button"
import DonationCard from "./DonationCard"
import { animateStatsIn } from "./IntroStats"
import { useAxios } from "./networking"
import { PublicFundraiser } from "../pages/admin/types.d"
import { amountDropPenceIfZeroFormatter } from "./Table"
import Modal from "./Modal"
import { SectionTitle } from "./Section"
import { LabelledInput } from "./Form"
import Alert from "./Alert"

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
      <div className="grid gap-8 md:grid-cols-2 md:gap-32">
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
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            {fundraiser.data && <DonationForm fundraiser={fundraiser.data} />}
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

const DonationForm: React.FC<{ fundraiser: PublicFundraiser }> = ({ fundraiser }) => {
  const formMethods = useForm({
    defaultValues: {
      donationAmount: fundraiser.suggestedDonationAmountOneOff / 100,
      donationFrequency: "ONE_OFF",
      contributionAmount: (fundraiser.suggestedContributionAmount ?? 0) / 100,
      giftAid: false,
      donorName: "",
      donorEmail: "",
      emailConsentInformational: true,
      emailConsentMarketing: true,
      overallPublic: true,
      namePublic: true,
      donationAmountPublic: true,
      comment: "",
    },
  })
  const {
    register, handleSubmit, control, formState: { errors, isSubmitting }, setValue,
  } = formMethods
  const watches = useWatch({ control })

  return (
    <FormProvider {...formMethods}>
      <SectionTitle>Donate</SectionTitle>
      <h3 className="text-2xl">Your Donation</h3>
      {/* TODO: formatting */}
      <div className="mt-2 grid gap-2 md:grid-cols-3 md:gap-4">
        <button type="button" onClick={() => { setValue("donationAmount", fundraiser.suggestedDonationAmountOneOff / 100); setValue("donationFrequency", "ONE_OFF") }} className="rounded border border-gray-700 p-4 cursor-pointer transform transition-all hover:bg-gray-100 hover:scale-105">
          {amountDropPenceIfZeroFormatter(fundraiser.suggestedDonationAmountOneOff)} one-off
        </button>
        <button type="button" onClick={() => { setValue("donationAmount", fundraiser.suggestedDonationAmountWeekly / 100); setValue("donationFrequency", "WEEKLY") }} className="rounded border border-gray-700 p-4 cursor-pointer transform transition-all hover:bg-gray-100 hover:scale-105">
          {amountDropPenceIfZeroFormatter(fundraiser.suggestedDonationAmountWeekly)} weekly
        </button>
      </div>

      <div className="mt-2 grid md:grid-cols-2 md:gap-4">
        <LabelledInput id="donationAmount" label="Donation amount" type="number" prefix="£" {...register("donationAmount"/* , { valueAsNumber: true, validate: (a) => (a * 100) % 1 === 0 } */)} />
        <LabelledInput
          id="donationFrequency"
          label="Donation frequency"
          type="select"
          options={{
            ONE_OFF: "one-off",
            WEEKLY: "weekly",
          }}
          value="ONE_OFF"
          {...register("donationFrequency")}
        />
      </div>

      {/* TODO: extract this logic elsewhere and maybe display differently, e.g. live preview of donation? */}
      {/* TODO: handle recurring donation match funding calcs */}
      {fundraiser.matchFundingRate && (fundraiser.matchFundingRemaining === null || fundraiser.matchFundingRemaining > 0) && watches.donationAmount && <p className="mt-4">Your donation will have match funding of {amountDropPenceIfZeroFormatter(Math.min(...[(fundraiser.matchFundingRate / 100) * (watches.donationAmount * 100), fundraiser.matchFundingPerDonationLimit, fundraiser.matchFundingRemaining].filter((n) => !!n) as number[]))}</p>}

      <div className="mt-4">
        <p>At the end of the academic year, we come together as a community for a Summer Party to celebrate our collective impact. Given that 100% of your donation above will go directly to charity, we suggest an optional, separate contribution of {amountDropPenceIfZeroFormatter(fundraiser.suggestedContributionAmount)} to cover the costs of the event (which are generously subsidised by our sponsors). Importantly, everyone will be very welcome to join, whether or not they feel able to make this contribution.</p>
        <LabelledInput id="contributionAmount" label={`Contribution amount${watches.donationFrequency !== "ONE_OFF" ? " (one-off)" : ""}`} type="number" prefix="£" className="mt-2" {...register("contributionAmount")} />
      </div>

      <h3 className="text-2xl mt-16">Gift Aid</h3>
      <p>Gift Aid can boost your donation by 25% at no cost to you if you are a UK taxpayer and will pay more Income Tax or Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all your donations. <a href="https://www.gov.uk/donating-to-charity/gift-aid" target="_blank" rel="noreferrer">More info</a>.</p>
      <LabelledInput id="giftAid" label="I meet the requirements for Gift Aid and want to Gift Aid my donation" className="mt-4" type="checkbox" {...register("giftAid")} />

      <h3 className="text-2xl mt-16">Your Details</h3>
      <p>Let's get to know you a bit better!{watches.giftAid && " (We need your address for Gift Aid)"}</p>
      <div className="grid md:grid-cols-1 md:gap-2 mt-4">
        <LabelledInput id="donorName" label="Name" type="text" autoComplete="name" {...register("donorName")} />
        <div>
          <LabelledInput id="donorEmail" label="Email" type="email" autoComplete="email" {...register("donorEmail")} />
          <LabelledInput id="emailConsentInformational" label="Tell me exactly where my donation goes (recommended)" type="checkbox" {...register("emailConsentInformational")} />
          <LabelledInput id="emailConsentMarketing" label="Send me updates about Raise (recommended)" className="-mt-2" type="checkbox" {...register("emailConsentMarketing")} />
        </div>
        {watches.giftAid && (
          <>
            <LabelledInput id="addressLine1" label="Address line 1" type="text" autoComplete="address-line1" />
            <LabelledInput id="addressLine2" label="Address line 2" type="text" autoComplete="address-line2" />
            <div className="grid md:grid-cols-2 md:gap-2">
              <LabelledInput id="addressLine3" label="Address line 3" type="text" autoComplete="address-line3" />
              <LabelledInput id="addressPostcode" label="Address postcode" type="text" autoComplete="postal-code" />
            </div>
            <LabelledInput id="addressCountry" label="Address country" type="hidden" value="UK" autoComplete="country-name" />
          </>
        )}
      </div>

      <h3 className="text-2xl mt-16">Your Message</h3>
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
        {watches.overallPublic && <LabelledInput id="comment" label="Message" type="text" {...register("comment")} />}
      </div>
      {watches.overallPublic && (
        <>
          <p className="mt-4">Your donation will appear on the site like this:</p>
          <DonationCard
            donorName={watches.namePublic ? watches.donorName : undefined}
            createdAt="1 minute ago"
            giftAid={watches.donationAmountPublic ? watches.giftAid : undefined}
            comment={watches.comment || null}
            donationAmount={watches.donationAmountPublic ? watches.donationAmount! * 100 : undefined}
            // TODO: calculate properly
            matchFundingAmount={watches.donationAmountPublic ? watches.donationAmount! * 100 : undefined}
            contributionAmount={watches.donationAmountPublic ? watches.contributionAmount! * 100 : undefined}
            className="bg-raise-red text-2xl text-white font-raise-content max-w-md mt-2"
          />
        </>
      )}

      <h3 className="text-2xl mt-16">Payment</h3>
      <p>Amount due: {amountDropPenceIfZeroFormatter(100 * (watches.donationAmount! + watches.contributionAmount!))}{watches.donationFrequency !== "ONE_OFF" && ` now, then ${amountDropPenceIfZeroFormatter(100 * watches.donationAmount!)} ${watches.donationFrequency?.toLowerCase()} (you can cancel your ${watches.donationFrequency?.toLowerCase()} payments at any time)`}</p>
      <Alert className="mt-2" variant="warning">
        <p>This system is in development, and you should avoid using real card details. Use a <a href="https://stripe.com/docs/testing#cards" target="_blank" rel="noreferrer">Stripe test card</a>, for example:</p>
        <p>Card number: <code className="select-all">4242 4242 4242 4242</code></p>
        <p>Expiry date: <code className="select-all">01 / {(new Date().getFullYear() + 1).toFixed(0).slice(2)}</code> (or any future date)</p>
        <p>Security code: <code className="select-all">123</code> (or any 3 digits)</p>
      </Alert>
      <div className="grid md:grid-cols-1 md:gap-2 mt-4">
        <div>
          <LabelledInput id="cardNumber" label="Card number" type="text" autoComplete="cc-number" placeholder="1234 1234 1234 1234" />
          <div className="grid md:grid-cols-2 md:gap-2">
            <LabelledInput id="cardExpiry" label="Expiry date" type="text" autoComplete="cc-exp" placeholder={`01 / ${(new Date().getFullYear() + 1).toFixed(0).slice(2)}`} />
            <LabelledInput id="cardExpiry" label="Security code" type="text" autoComplete="cc-csc" placeholder="CVC" />
          </div>
        </div>
      </div>

      <Button variant="blue" className="mt-4" onClick={() => alert("TODO: make backend call + sort Stripe stuff")}>Pay now</Button>
    </FormProvider>
  )
}

export default IntroFundraiser
