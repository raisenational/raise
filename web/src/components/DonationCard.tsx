import TimeAgo from 'react-timeago';
import classNames from 'classnames';
import { format } from '@raise/shared';

type Props = {
  donorName?: string,
  createdAt: number | string,
  giftAid?: boolean,
  comment?: string | null,
  currency?: 'gbp' | 'usd',
  donationAmount?: number,
  matchFundingAmount?: number,
  recurringAmount?: number | null,
  recurrenceFrequency?: ('WEEKLY' | 'MONTHLY') | null,
  className?: string,
  loading?: boolean,
};

const DonationCard: React.FC<Props> = ({
  donorName,
  createdAt,
  giftAid,
  comment,
  currency,
  donationAmount,
  matchFundingAmount,
  recurringAmount,
  recurrenceFrequency,
  className,
  loading,
}) => {
  const title = `${donorName || 'Someone'} donated${donationAmount !== undefined ? ` ${format.amountShort(currency, donationAmount)}` : ''}`;
  const isRecurring = recurringAmount !== undefined && recurringAmount !== null && recurrenceFrequency !== undefined && recurrenceFrequency !== null;
  const recurringText = isRecurring ? `giving ${format.amountShort(currency, recurringAmount)} ${recurrenceFrequency.toLowerCase()}` : undefined;
  const matchFundingText = (matchFundingAmount !== undefined && matchFundingAmount > 0) ? `+${format.amountShort(currency, matchFundingAmount)} matched` : undefined;
  const giftAidText = (giftAid && donationAmount !== undefined) ? `+${format.amountShort(currency, Math.floor(donationAmount * 0.25))} gift-aided` : undefined;
  const extraAmountText = (matchFundingText || giftAidText) ? `(${[matchFundingText, giftAidText].filter((x) => x).join(', ')})` : undefined;

  return (
    <div className={classNames('p-4 rounded flex flex-col shadow-raise', className)}>
      <p className="fade-in word-wrap"><span className={classNames({ skeleton: loading })}>{title}</span></p>
      {recurringText && <p className={classNames('fade-in', { skeleton: loading, 'text-base opacity-80': !loading })}>{recurringText}</p>}
      {extraAmountText && <p className="text-base fade-in"><span className={classNames({ skeleton: loading, 'opacity-80': !loading })}>{extraAmountText}</span></p>}
      {comment && <p className="text-base mt-2 word-wrap fade-in"><span className={classNames({ skeleton: loading })}>{comment}</span></p>}
      <p className="text-base mt-auto pt-2 text-right fade-in"><span className={classNames({ skeleton: loading, 'opacity-80': !loading })}>{typeof createdAt === 'string' ? createdAt : <TimeAgo date={createdAt * 1000} />}</span></p>
    </div>
  );
};

export default DonationCard;
