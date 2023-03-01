import * as format from './format';

describe('amount', () => {
  test.each([
    ['gbp', 0, true, '£0.00'],
    ['gbp', 1, true, '£0.01'],
    ['gbp', 10, true, '£0.10'],
    ['gbp', 1_00, true, '£1.00'],
    ['gbp', 10_00, true, '£10.00'],
    ['gbp', 100_00, true, '£100.00'],
    ['gbp', 12_34, true, '£12.34'],
    ['gbp', -56_78, true, '£-56.78'],
    ['gbp', undefined, true, '—'],
    ['gbp', null, true, '—'],
    ['usd', 0, true, '$0.00'],
    ['usd', 1, true, '$0.01'],
    ['usd', 10, true, '$0.10'],
    ['usd', 1_00, true, '$1.00'],
    ['usd', 10_00, true, '$10.00'],
    ['usd', 100_00, true, '$100.00'],
    ['usd', 12_34, true, '$12.34'],
    ['usd', -56_78, true, '$-56.78'],
    ['usd', undefined, true, '—'],
    ['usd', null, true, '—'],
    [undefined, 0, true, '—'],
    [undefined, 100, true, '—'],
    [null, 0, true, '—'],
    [null, 100, true, '—'],
    ['gbp', 4_50, false, '4.50'],
    ['usd', 4_50, false, '4.50'],
    ['gbp', 10_00, false, '10.00'],
    ['usd', 10_00, false, '10.00'],
    [null, 4_50, false, '—'],
  ] as const)('%s → %s', (currency, amountInMinorUnits, symbol, expected) => {
    expect(format.amount(currency, amountInMinorUnits, symbol)).toEqual(expected);
  });
});

describe('amountShort', () => {
  test.each([
    ['gbp', 0, true, '£0'],
    ['gbp', 1, true, '£0.01'],
    ['gbp', 10, true, '£0.10'],
    ['gbp', 1_00, true, '£1'],
    ['gbp', 10_00, true, '£10'],
    ['gbp', 100_00, true, '£100'],
    ['gbp', 12_34, true, '£12.34'],
    ['gbp', -56_78, true, '£-56.78'],
    ['gbp', undefined, true, '—'],
    ['gbp', null, true, '—'],
    ['usd', 0, true, '$0'],
    ['usd', 1, true, '$0.01'],
    ['usd', 10, true, '$0.10'],
    ['usd', 1_00, true, '$1'],
    ['usd', 10_00, true, '$10'],
    ['usd', 100_00, true, '$100'],
    ['usd', 12_34, true, '$12.34'],
    ['usd', -56_78, true, '$-56.78'],
    ['usd', undefined, true, '—'],
    ['usd', null, true, '—'],
    [undefined, 0, true, '—'],
    [undefined, 100, true, '—'],
    [null, 0, true, '—'],
    [null, 100, true, '—'],
    ['gbp', 4_50, false, '4.50'],
    ['gbp', 10_00, false, '10'],
    ['usd', 4_50, false, '4.50'],
    ['usd', 10_00, false, '10'],
  ] as const)('%s → %s', (currency, amountInMinorUnits, symbol, expected) => {
    expect(format.amountShort(currency, amountInMinorUnits, symbol)).toEqual(expected);
  });
});

describe('boolean', () => {
  test.each([
    [true, 'Yes'],
    [false, 'No'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (value, expected) => {
    expect(format.boolean(value)).toEqual(expected);
  });
});

describe('date', () => {
  test.each([
    [0, '01/01/1970'],
    [1632959999, '29/09/2021'],
    [1632960000, '30/09/2021'],
    [-86400, '31/12/1969'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (value, expected) => {
    expect(format.date(value)).toEqual(expected);
  });
});

describe('matchFundingRate', () => {
  test.each([
    ['gbp', 0, '0% (i.e. £1 donated, £0 matched, £1 total)'],
    ['gbp', 50, '50% (i.e. £1 donated, £0.50 matched, £1.50 total)'],
    ['gbp', 100, '100% (i.e. £1 donated, £1 matched, £2 total)'],
    ['gbp', 200, '200% (i.e. £1 donated, £2 matched, £3 total)'],
    ['gbp', 123, '123% (i.e. £1 donated, £1.23 matched, £2.23 total)'],
    ['gbp', undefined, '—'],
    ['gbp', null, '—'],
    ['usd', 0, '0% (i.e. $1 donated, $0 matched, $1 total)'],
    ['usd', 50, '50% (i.e. $1 donated, $0.50 matched, $1.50 total)'],
    ['usd', 100, '100% (i.e. $1 donated, $1 matched, $2 total)'],
    ['usd', 200, '200% (i.e. $1 donated, $2 matched, $3 total)'],
    ['usd', 123, '123% (i.e. $1 donated, $1.23 matched, $2.23 total)'],
    ['usd', undefined, '—'],
    ['usd', null, '—'],
    [undefined, 0, '0%'],
    [undefined, 100, '100%'],
    [null, 0, '0%'],
    [null, 100, '100%'],
  ] as const)('%s → %s', (currency, percentageInPoints, expected) => {
    expect(format.matchFundingRate(currency, percentageInPoints)).toEqual(expected);
  });
});

describe('percent', () => {
  test.each([
    [0, '0%'],
    [50, '50%'],
    [100, '100%'],
    [200, '200%'],
    [123, '123%'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (value, expected) => {
    expect(format.percent(value)).toEqual(expected);
  });
});

describe('timestamp', () => {
  test.each([
    [0, '01/01/1970, 00:00:00'],
    [123456, '02/01/1970, 10:17:36'],
    [1632959999, '29/09/2021, 23:59:59'],
    [1632960000, '30/09/2021, 00:00:00'],
    [-86400, '31/12/1969, 00:00:00'],
    [undefined, '—'],
    [null, '—'],
  ])('%s → %s', (value, expected) => {
    expect(format.timestamp(value)).toEqual(expected);
  });
});

describe('json', () => {
  test.each([
    [0, '0'],
    ['hello', '"hello"'],
    [true, 'true'],
    [{ p: 'v' }, '{"p":"v"}'],
    [undefined, 'undefined'],
    [null, 'null'],
  ])('%s → %s', (value, expected) => {
    expect(format.json(value)).toEqual(expected);
  });
});
