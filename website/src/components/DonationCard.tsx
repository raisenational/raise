import * as React from "react"
import classNames from "classnames"
import { PublicFundraiser } from "../pages/admin/types.d"
import { amountDropPenceIfZeroFormatter } from "./Table"

type Props = PublicFundraiser["donations"][number] & {
  className?: string,
}

// TODO: this is a bit of a mess, but should be fairly simple. Maybe refactor to make the logic a bit clearer, or at least add some unit tests around it.
const DonationCard: React.FC<Props> = ({
  donorName,
  createdAt,
  giftAid,
  comment,
  donationAmount,
  matchFundingAmount,
  contributionAmount,
  className,
}) => (
  <div className={classNames("p-4 rounded flex flex-col shadow-raise", className)}>
    <p className={classNames({ "flex-1": !comment && !giftAid && !matchFundingAmount })}>{donorName ?? "Someone"} donated {donationAmount && amountDropPenceIfZeroFormatter(donationAmount)}</p>
    {(giftAid || matchFundingAmount) && <p className={classNames("text-base opacity-80", { "flex-1": !comment })}> ({matchFundingAmount && `+${amountDropPenceIfZeroFormatter(matchFundingAmount)} matched`}{giftAid && matchFundingAmount && ", "}{giftAid && donationAmount && `+${amountDropPenceIfZeroFormatter(donationAmount * 0.25)} gift-aided`})</p>}
    {comment && <p className="text-base flex-1 mt-2">{comment}</p>}
    {/* TODO: need a proper time since now formatter here, e.g. "just now" / "3 minutes ago" / "1 week ago" */}
    <p className="text-base opacity-80 mt-2 text-right">{Math.floor(((new Date().getTime() / 1000) - createdAt) / 60)} minutes ago</p>
  </div>
)

export default DonationCard
