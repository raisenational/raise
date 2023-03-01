// Assumptions:
// AMF spends all money donated on bed nets
// A bed net (+distribution) costs $2
// A bed net protects 1.8 people
// Exchange rate to GBP taken on 2022-06-29
export const moneyToPeopleProtected = (currency: 'gbp' | 'usd', amountInMinorUnits: number): number => Math.floor((currency === 'gbp' ? 0.0119988 : 0.009) * amountInMinorUnits);
