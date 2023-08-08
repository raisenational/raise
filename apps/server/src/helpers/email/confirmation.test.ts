import { makeDonation, makeFundraiser, makePayment } from '../../../local/testHelpers';
import confirmation from './confirmation';
import footer from './footer';

test('renders email correctly with one payment', () => {
  // given fundraiser, donation and payments
  const fundraiser = makeFundraiser({ currency: 'gbp', publicName: 'Raise Test' });
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 100_00,
    contributionAmount: 10_00,
    matchFundingAmount: 100_00,
    donorName: 'Greg McGregFace',
  });
  const payments = [
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 100_00,
      contributionAmount: 10_00,
      matchFundingAmount: 100_00,
    }),
  ];

  // when we render the email
  const email = confirmation(fundraiser, donation, payments).string.replace(/\s+/g, ' ');

  // then we have expected data filled in
  expect(email).toContain('Dear Greg,');
  expect(email).toContain('Your donation will help protect 239 people from malaria.');
  expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>£100<\/td>/);
  expect(email).toMatch(/<td[^>]*>Your Summer Party contribution<\/td>\s*<td[^>]*>£10<\/td>/);
  expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>£110<\/td>/);
  expect(email).not.toContain('You also set up future donations:');
  expect(email).toContain(fundraiser.id);
  expect(email).toContain(donation.id);
  expect(email).toContain(payments[0].id);
});

test('renders email correctly for payments with no contribution or match funding', () => {
  // given fundraiser, donation and payments
  const fundraiser = makeFundraiser({ currency: 'gbp', publicName: 'Raise Test' });
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 100_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    donorName: 'Greg McGregFace',
  });
  const payments = [
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 100_00,
      contributionAmount: 0,
      matchFundingAmount: 0,
    }),
  ];

  // when we render the email
  const email = confirmation(fundraiser, donation, payments).string.replace(/\s+/g, ' ');

  // then we have expected data filled in
  expect(email).toContain('Dear Greg,');
  expect(email).toContain('Your donation will help protect 119 people from malaria.');
  expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>£100<\/td>/);
  expect(email).not.toContain('Your Summer Party contribution');
  expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>£100<\/td>/);
  expect(email).not.toContain('You also set up future donations to AMF:');
  expect(email).toContain(fundraiser.id);
  expect(email).toContain(donation.id);
  expect(email).toContain(payments[0].id);
});

test('renders email correctly for payments with inferred match funding', () => {
  // given fundraiser, donation and payments
  const fundraiser = makeFundraiser({
    currency: 'gbp', publicName: 'Raise Test', matchFundingRate: 200,
  });
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 100_00,
    contributionAmount: 0,
    matchFundingAmount: 0,
    donorName: 'Greg McGregFace',
  });
  const payments = [
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 100_00,
      contributionAmount: 0,
      matchFundingAmount: null,
    }),
  ];

  // when we render the email
  const email = confirmation(fundraiser, donation, payments).string.replace(/\s+/g, ' ');

  // then we have expected data filled in
  expect(email).toContain('Dear Greg,');
  expect(email).toContain('Your donation will help protect 359 people from malaria.');
  expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>£100<\/td>/);
  expect(email).not.toContain('Your Summer Party contribution');
  expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>£100<\/td>/);
  expect(email).not.toContain('You also set up future donations to AMF:');
  expect(email).toContain(fundraiser.id);
  expect(email).toContain(donation.id);
  expect(email).toContain(payments[0].id);
});

test.each([
  ['gbp'], ['usd'],
] as const)('renders email correctly with %s scheduled payment', (currency) => {
  // given fundraiser, donation and payments
  const fundraiser = makeFundraiser({ currency, publicName: 'Raise Test' });
  const donation = makeDonation({
    fundraiserId: fundraiser.id,
    donationAmount: 9_00,
    contributionAmount: 10_00,
    matchFundingAmount: 9_00,
    donorName: 'Greg McGregFace',
  });
  const payments = [
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 9_00,
      contributionAmount: 10_00,
      matchFundingAmount: 9_00,
      status: 'paid',
      at: 1639267200,
    }),
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 9_00,
      contributionAmount: 0,
      matchFundingAmount: 9_00,
      status: 'scheduled',
      at: 1639872000,
    }),
    makePayment({
      fundraiserId: fundraiser.id,
      donationId: donation.id,
      donationAmount: 9_00,
      contributionAmount: 0,
      matchFundingAmount: 9_00,
      status: 'scheduled',
      at: 1640476800,
    }),
  ];

  // when we render the email
  const email = confirmation(fundraiser, donation, payments).string.replace(/\s+/g, ' ');

  // then we have expected data filled in
  expect(email).toContain('Dear Greg,');
  if (currency === 'gbp') {
    expect(email).toContain('Your donation will help protect 64 people from malaria.');
    expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>£9<\/td>/);
    expect(email).toMatch(/<td[^>]*>Your Summer Party contribution<\/td>\s*<td[^>]*>£10<\/td>/);
    expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>£19<\/td>/);
  } else {
    expect(email).toContain('Your donation will help protect 48 people from malaria.');
    expect(email).toMatch(/<td[^>]*>Your donation to AMF<\/td>\s*<td[^>]*>\$9<\/td>/);
    expect(email).toMatch(/<td[^>]*>Your Summer Party contribution<\/td>\s*<td[^>]*>\$10<\/td>/);
    expect(email).toMatch(/<td[^>]*>Total paid<\/td>\s*<td[^>]*>\$19<\/td>/);
  }
  expect(email).toContain('You also set up future donations:');
  if (currency === 'gbp') {
    expect(email).toMatch(/<td[^>]*>19\/12\/2021<\/td>\s*<td[^>]*>£9<\/td>/);
    expect(email).toMatch(/<td[^>]*>26\/12\/2021<\/td>\s*<td[^>]*>£9<\/td>/);
    expect(email).toMatch(/<td[^>]*>Total future donations<\/td>\s*<td[^>]*>£18<\/td>/);
  } else {
    expect(email).toMatch(/<td[^>]*>19\/12\/2021<\/td>\s*<td[^>]*>\$9<\/td>/);
    expect(email).toMatch(/<td[^>]*>26\/12\/2021<\/td>\s*<td[^>]*>\$9<\/td>/);
    expect(email).toMatch(/<td[^>]*>Total future donations<\/td>\s*<td[^>]*>\$18<\/td>/);
  }
  expect(email).toContain(fundraiser.id);
  expect(email).toContain(donation.id);
  expect(email).toContain(payments[0].id);
});

test('does not confuse MWA and Raise branding', () => {
  // given MWA fundraiser, donation and payments
  const fundraiser = makeFundraiser({ currency: 'gbp', publicName: 'MWA' });
  const donation = makeDonation();
  const payments = [makePayment()];

  // when we render the email
  const email = confirmation(fundraiser, donation, payments).string.replace(/\s+/g, ' ');

  // renders footer so we can avoid it from the checks
  const pageEnd = footer().string.replace(/\s+/g, ' ');

  // then we expect the email not to mention raise except for the image assets
  expect(email
    .replace(/fundraiserId/g, '')
    .replace(/src="https:\/\/www.joinraise.org/g, '')
    .replace(pageEnd, ''))
    .not.toMatch(/raise/i);
});
