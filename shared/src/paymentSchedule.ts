const addRecurrencePeriod = (date: Date, frequency: 'WEEKLY' | 'MONTHLY') => {
  if (frequency === 'WEEKLY') {
    date.setUTCDate(date.getUTCDate() + 7);
  } else if (frequency === 'MONTHLY') {
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
};

export const calcPaymentSchedule = (
  donationAmount: number,
  contributionAmount: number,
  recurrenceFrequency: null | 'WEEKLY' | 'MONTHLY',
  endTimestamp: number,
): {
  now: { donationAmount: number, contributionAmount: number },
  future: { at: number, donationAmount: number, contributionAmount: number }[],
} => {
  const future: { at: number, donationAmount: number, contributionAmount: number }[] = [];

  // For recurring donations, insert future payments
  if (recurrenceFrequency) {
    const date = new Date(Date.now());
    date.setUTCHours(0, 0, 0, 0);
    addRecurrencePeriod(date, recurrenceFrequency);
    while (Math.floor(date.getTime() / 1000) < endTimestamp) {
      future.push({ at: Math.floor(date.getTime() / 1000), donationAmount, contributionAmount: 0 });
      addRecurrencePeriod(date, recurrenceFrequency);
    }
  }

  return {
    now: { donationAmount, contributionAmount },
    future,
  };
};
