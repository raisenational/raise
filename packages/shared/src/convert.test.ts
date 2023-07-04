import { moneyToPeopleProtected } from './convert';

describe('gbpToPeopleProtected', () => {
  test.each([
    // Regular amounts (GBP)
    ['gbp', 0, 0],
    ['gbp', 100, 1],
    ['gbp', 500, 5],
    ['gbp', 1000, 11],
    ['gbp', 2000, 23],
    ['gbp', 2500, 29],
    ['gbp', 5000, 59],
    ['gbp', 7500, 89],
    ['gbp', 10000, 119],
    // Regular amounts (USD)
    ['usd', 0, 0],
    ['usd', 100, 0],
    ['usd', 500, 4],
    ['usd', 1000, 9],
    ['usd', 2000, 18],
    ['usd', 2500, 22],
    ['usd', 5000, 45],
    ['usd', 7500, 67],
    ['usd', 10000, 90],
    // Irregular amounts (GBP)
    ['gbp', 123, 1],
    ['gbp', 4567, 54],
    ['gbp', 89, 1],
    // Irregular amounts (USD)
    ['usd', 123, 1],
    ['usd', 4567, 41],
    ['usd', 89, 0],
  ] as const)('%s %s → %s', (currency, amount, expected) => {
    expect(moneyToPeopleProtected(currency, amount)).toEqual(expected);
  });
});
