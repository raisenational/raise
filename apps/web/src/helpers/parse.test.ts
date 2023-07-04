import * as parse from './parse';

describe('parseMoney', () => {
  test.each([
    // £
    ['£0.00', 0],
    ['£0.01', 1],
    ['£0.10', 10],
    ['£1.00', 1_00],
    ['£10.00', 10_00],
    ['£100.00', 100_00],
    ['£12.34', 12_34],
    // $
    ['$0.00', 0],
    ['$0.01', 1],
    ['$0.10', 10],
    ['$1.00', 1_00],
    ['$10.00', 10_00],
    ['$100.00', 100_00],
    ['$12.34', 12_34],
    // raw
    ['0.00', 0],
    ['0.01', 1],
    ['0.10', 10],
    ['1.00', 1_00],
    ['10.00', 10_00],
    ['100.00', 100_00],
    ['12.34', 12_34],
  ])('%s → %s', (value, expected) => {
    expect(parse.parseMoney(value)).toEqual(expected);
  });

  test.each([
    'undefined',
    'null',
    '££1.23',
    '£$1.23',
    '$£1.23',
    '$$1.23',
    '—',
    'not money',
    '£.23',
    '$.23',
    '',
  ])('%s is recognized as invalid', (value) => {
    expect(() => parse.parseMoney(value)).toThrow('Not a monetary value');
  });
});
