import { calcPaymentSchedule } from './paymentSchedule';

test.each([
  ['donation-only', 100_00, 0],
  ['contribution-only', 0, 10_00],
  ['donation with contribution', 100_00, 10_00],
])('one-off %s', (description, donationAmount, contributionAmount) => {
  const schedule = calcPaymentSchedule(donationAmount, contributionAmount, null, 1643889600);

  expect(schedule.now).toEqual({
    donationAmount,
    contributionAmount,
  });
  expect(schedule.future).toHaveLength(0);
});

test.each([
  ['donation-only', 100_00, 0],
  ['contribution-only', 0, 10_00],
  ['donation with contribution', 100_00, 10_00],
])('weekly %s', (description, donationAmount, contributionAmount) => {
  Date.now = jest.fn(() => 1641220724000);

  const schedule = calcPaymentSchedule(donationAmount, contributionAmount, 'WEEKLY', 1643889600);

  expect(schedule).toEqual({
    now: {
      donationAmount,
      contributionAmount,
    },
    future: [{
      at: 1641772800,
      donationAmount,
      contributionAmount: 0,
    }, {
      at: 1642377600,
      donationAmount,
      contributionAmount: 0,
    }, {
      at: 1642982400,
      donationAmount,
      contributionAmount: 0,
    }, {
      at: 1643587200,
      donationAmount,
      contributionAmount: 0,
    }],
  });
});

test.each(new Array(48).fill(0).map((_, i) => [i / 2]))('when offset from UTC midnight is %s hours', (offsetHours) => {
  Date.now = jest.fn(() => 1641168000000 + offsetHours * 3.6e+6);
  const donationAmount = 100_00;
  const contributionAmount = 10_00;

  const schedule = calcPaymentSchedule(donationAmount, contributionAmount, 'WEEKLY', 1643889600);

  expect(schedule).toEqual({
    now: {
      donationAmount,
      contributionAmount,
    },
    future: [{
      at: 1641772800,
      donationAmount,
      contributionAmount: 0,
    }, {
      at: 1642377600,
      donationAmount,
      contributionAmount: 0,
    }, {
      at: 1642982400,
      donationAmount,
      contributionAmount: 0,
    }, {
      at: 1643587200,
      donationAmount,
      contributionAmount: 0,
    }],
  });
});
