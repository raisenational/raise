export const amount = (currency?: 'gbp' | 'usd' | null, amountInMinorUnits?: number | null, symbol = true): string => (currency === undefined || currency === null || amountInMinorUnits === undefined || amountInMinorUnits === null ? '—' : `${symbol ? currencySymbol(currency) : ''}${(amountInMinorUnits / 100).toFixed(2)}`);
export const amountShort = (currency?: 'gbp' | 'usd' | null, amountInMinorUnits?: number | null, symbol = true): string => (currency === undefined || currency === null || amountInMinorUnits === undefined || amountInMinorUnits === null ? '—' : `${symbol ? currencySymbol(currency) : ''}${(amountInMinorUnits / 100).toFixed(amountInMinorUnits % 100 === 0 ? 0 : 2)}`);
export const boolean = (b?: boolean | null): string => (b === undefined || b === null ? '—' : (b && 'Yes') || 'No');
export const date = (unixTimestamp?: number | null): string => (unixTimestamp === undefined || unixTimestamp === null ? '—' : new Date(unixTimestamp * 1000).toLocaleDateString('en-GB'));
export const matchFundingRate = (currency?: 'gbp' | 'usd' | null, percentageInPoints?: number | null): string => (percentageInPoints === undefined || percentageInPoints === null ? '—' : `${percentageInPoints}%${currency !== undefined && currency !== null ? ` (i.e. ${amountShort(currency, 100)} donated, ${amountShort(currency, percentageInPoints)} matched, ${amountShort(currency, 100 + percentageInPoints)} total)` : ''}`);
export const percent = (percentageInPoints?: number | null): string => (percentageInPoints === undefined || percentageInPoints === null ? '—' : `${percentageInPoints}%`);
export const timestamp = (unixTimestamp?: number | null): string => (unixTimestamp === undefined || unixTimestamp === null ? '—' : new Date(unixTimestamp * 1000).toLocaleString('en-GB'));
export const json = (any: unknown): string => String(JSON.stringify(any));
export const currencySymbol = (currency: 'gbp' | 'usd') => {
  let result = '';
  if (currency === 'gbp') {
    result = '£';
  } else if (currency === 'usd') {
    result = '$';
  }
  return result;
};
