import * as React from "react"
import TimeAgo from "react-timeago"
import classNames from "classnames"
import { amountDropPenceIfZeroFormatter } from "../helpers/format"

type Props = {
  donorName?: string,
  createdAt: number | string,
  giftAid?: boolean,
  comment?: string | null,
  donationAmount?: number,
  matchFundingAmount?: number,
  recurringAmount?: number | null,
  recurrenceFrequency?: ("WEEKLY" | "MONTHLY") | null,
  className?: string,
  loading?: boolean,
}

// TODO: refactor to make the logic clearer
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
  loading,
}) => (
  <div className={classNames("p-4 rounded flex flex-col shadow-raise", className)}>
    <p className="fade-in"><span className={classNames({ skeleton: loading })}>{donorName || "Someone"} donated{donationAmount !== undefined && ` ${amountDropPenceIfZeroFormatter(donationAmount)}`}</span></p>
    {(recurringAmount !== undefined && recurringAmount !== null && recurrenceFrequency !== undefined && recurrenceFrequency !== null) && <p className={classNames("fade-in", { skeleton: loading, "text-base opacity-80": !loading })}>giving {amountDropPenceIfZeroFormatter(recurringAmount)} {recurrenceFrequency.toLowerCase()}</p>}
    {(giftAid || (matchFundingAmount !== undefined && matchFundingAmount > 0)) && <p className="text-base fade-in"><span className={classNames({ skeleton: loading, "opacity-80": !loading })}> ({(matchFundingAmount !== undefined && matchFundingAmount > 0) && `+${amountDropPenceIfZeroFormatter(matchFundingAmount)} matched`}{giftAid && (matchFundingAmount !== undefined && matchFundingAmount > 0) && ", "}{giftAid && donationAmount !== undefined && `+${amountDropPenceIfZeroFormatter(donationAmount * 0.25)} gift-aided`})</span></p>}
    {comment && <p className="text-base mt-2 break-words fade-in"><span className={classNames({ skeleton: loading })}>{comment}</span></p>}
    <p className="text-base mt-auto pt-2 text-right fade-in"><span className={classNames({ skeleton: loading, "opacity-80": !loading })}>{typeof createdAt === "string" ? createdAt : <TimeAgo date={createdAt * 1000} />}</span></p>
  </div>
)

export default DonationCard
