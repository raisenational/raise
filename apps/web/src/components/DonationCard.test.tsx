import { render } from '@testing-library/react';
import DonationCard from './DonationCard';

beforeAll(() => {
  Date.now = jest.fn(() => 1635699600000);
});

test.each([
  ['a date', <DonationCard createdAt={1635683696} />],
  ['a date string', <DonationCard createdAt="5 minutes ago" />],
  ['a name and date', <DonationCard donorName="Namey McNameface" createdAt={1635683696} />],
  ['amounts (match funding and gift-aid) and a date', <DonationCard currency="gbp" donationAmount={1234} matchFundingAmount={1234} giftAid createdAt={1635683696} />],
  ['amounts (match funding and no gift-aid) and a date', <DonationCard currency="gbp" donationAmount={1234} matchFundingAmount={1234} giftAid={false} createdAt={1635683696} />],
  ['amounts (no match funding and gift-aid) and a date', <DonationCard currency="gbp" donationAmount={1234} matchFundingAmount={0} giftAid createdAt={1635683696} />],
  ['amounts (no match funding and no gift-aid) and a date', <DonationCard currency="gbp" donationAmount={1234} matchFundingAmount={0} giftAid={false} createdAt={1635683696} />],
  ['amounts (whole numbers) and a date', <DonationCard currency="gbp" donationAmount={200_00} matchFundingAmount={200_00} giftAid createdAt={1635683696} />],
  ['a recurring amount and a date', <DonationCard currency="gbp" donationAmount={45_00} matchFundingAmount={45_00} giftAid recurringAmount={15_00} recurrenceFrequency="WEEKLY" createdAt={1635683696} />],
  ['a name and date', <DonationCard donorName="Namey McNameface" createdAt={1635683696} />],
  ['a custom class name', <DonationCard className="bg-raise-red" createdAt={1635683696} />],
  ['a loading state', <DonationCard className="bg-raise-red" donorName="Namey McNameface" currency="gbp" donationAmount={45_00} matchFundingAmount={45_00} giftAid recurringAmount={15_00} recurrenceFrequency="WEEKLY" createdAt={1635683696} />],
  ['a usd donation', <DonationCard className="bg-raise-red" donorName="Namey McNameface" currency="usd" donationAmount={45_00} matchFundingAmount={45_00} recurringAmount={15_00} recurrenceFrequency="WEEKLY" createdAt={1635683696} />],
])('renders with %s', (_, element) => {
  const { container } = render(element);
  expect(container).toMatchSnapshot();
});
