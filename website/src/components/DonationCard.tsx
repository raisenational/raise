import * as React from "react"
import TimeAgo from "react-timeago"
import classNames from "classnames"
import { amountDropPenceIfZeroFormatter } from "./Table"

type Props = {
  donorName?: string,
  createdAt: number | string,
  giftAid?: boolean,
  comment: string | null,
  donationAmount?: number,
  matchFundingAmount?: number,
  recurringAmount?: number | null,
  recurrenceFrequency?: ("WEEKLY" | "MONTHLY") | null,
  className?: string,
}

// TODO: refactor to make the logic clearer, and add some unit tests around it
// TODO: handle overflow with really long words
const DonationCard: React.FC<Props> = ({
  donorName,
  createdAt,
  giftAid,
  comment,
  donationAmount,
  matchFundingAmount,
  recurringAmount,
  recurrenceFrequency,
  className,
}) => (
  <div className={classNames("p-4 rounded flex flex-col shadow-raise", className)}>
    <p>{donorName || "Someone"} donated {donationAmount !== undefined && amountDropPenceIfZeroFormatter(donationAmount)}</p>
    {(recurringAmount !== undefined && recurringAmount !== null && recurrenceFrequency !== undefined && recurrenceFrequency !== null) && <p className="text-base opacity-80">giving {amountDropPenceIfZeroFormatter(recurringAmount)} {recurrenceFrequency.toLowerCase()}</p>}
    {(giftAid || (matchFundingAmount !== undefined && matchFundingAmount > 0)) && <p className="text-base opacity-80"> ({(matchFundingAmount !== undefined && matchFundingAmount > 0) && `+${amountDropPenceIfZeroFormatter(matchFundingAmount)} matched`}{giftAid && (matchFundingAmount !== undefined && matchFundingAmount > 0) && ", "}{giftAid && donationAmount !== undefined && `+${amountDropPenceIfZeroFormatter(donationAmount * 0.25)} gift-aided`})</p>}
    {comment && <p className="text-base mt-2">{comment}</p>}
    <p className="text-base opacity-80 mt-auto pt-2 text-right">{typeof createdAt === "string" ? createdAt : <TimeAgo date={createdAt * 1000} />}</p>
  </div>
)

export default DonationCard
