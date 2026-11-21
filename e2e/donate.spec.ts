import {test, expect, type Page} from '@playwright/test';
import {
	adminApi, DEMO_FUNDRAISER_ID, getPublicFundraiser, loginAs, payWithTestCard, propertyValue, sendPaymentSucceededWebhook,
} from './helpers';

// The public donation flow, as a supporter would use it at /<chapter>/donate:
// fill in the form, pay with a Stripe test card, then Stripe tells our API the payment succeeded.

const startDonation = async (page: Page) => {
	await page.goto('/demo/donate/');
	await page.getByRole('button', {name: 'Donate', exact: true}).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', {name: 'Donate'})).toBeVisible();
	return dialog;
};

const fillDonorDetails = async (page: Page, name: string, email: string) => {
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', {name: 'Celebrate'})).toBeVisible();
	await dialog.getByRole('textbox', {name: 'Name'}).fill(name);
	await dialog.getByRole('textbox', {name: 'Email'}).fill(email);
};

test('one-off card donation is recorded, match funded and shown on the donor wall', async ({page}) => {
	const donorName = `E2E One-off ${Date.now()}`;
	const before = await getPublicFundraiser();

	// Step 1: amount (£150 suggested, matched 1:1 up to £150)
	const dialog = await startDonation(page);
	await dialog.getByRole('button', {name: /one-off donation/}).click();
	await dialog.getByRole('spinbutton').fill('150');
	await dialog.getByRole('button', {name: 'Next'}).click();

	// Step 2: donor details, with a £5.50 contribution
	await fillDonorDetails(page, donorName, 'e2e-oneoff@example.com');
	await dialog.getByRole('button', {name: 'I want to contribute'}).click();
	await dialog.getByRole('spinbutton', {name: 'Contribution amount'}).fill('5.50');
	await dialog.getByRole('button', {name: 'Next'}).click();

	// Step 3: display options
	await expect(dialog.getByRole('heading', {name: 'Display'})).toBeVisible();
	await dialog.getByRole('textbox', {name: 'Message (optional)'}).fill('Sent by the e2e tests');
	await dialog.getByRole('button', {name: 'Next'}).click();

	// Step 4: payment
	await expect(dialog.getByText('Amount due: £155.50 (£150 donation + £5.50 contribution)')).toBeVisible();
	const paymentIntentId = await payWithTestCard(page);
	await expect(dialog.getByRole('heading', {name: 'Thank you!'})).toBeVisible();

	// Nothing is counted until Stripe confirms the payment via webhook
	await sendPaymentSucceededWebhook(paymentIntentId);

	await expect.poll(async () => (await getPublicFundraiser()).totalRaised).toBe(before.totalRaised + 15000 + 15000);
	const after = await getPublicFundraiser();
	expect(after.donationsCount).toBe(before.donationsCount + 1);
	expect(after.donations.find((d) => d.donorName === donorName)).toMatchObject({donationAmount: 15000, matchFundingAmount: 15000});

	// Donor wall shows the new donation
	await page.goto('/demo/donate/');
	await expect(page.getByText(`${donorName} donated £150`)).toBeVisible();

	// Admins see the paid card payment on the donation
	await loginAs(page, 'raisenational@gmail.com', `/admin/?page=fundraiser&fundraiserId=${DEMO_FUNDRAISER_ID}`);
	await page.getByRole('cell', {name: donorName, exact: true}).click();
	await expect(page.getByRole('heading', {name: `Donation from ${donorName}`})).toBeVisible();
	await expect(propertyValue(page, 'Donation amount')).toHaveText('£150.00');
	await expect(propertyValue(page, 'Match funding amount')).toHaveText('£150.00');
	await expect(propertyValue(page, 'Raise contribution amount')).toHaveText('£5.50');
	await expect(page.getByRole('row', {name: /£150\.00 £5\.50 £150\.00 card paid/})).toBeVisible();
});

test('weekly card donation takes the first payment and schedules the rest', async ({page}) => {
	const donorName = `E2E Weekly ${Date.now()}`;
	// Recurring payments are scheduled weekly until this date (the seed data's is in the past)
	const api = await adminApi('raisenational@gmail.com');
	await api('PATCH', `/admin/fundraisers/${DEMO_FUNDRAISER_ID}`, {recurringDonationsTo: Math.floor(Date.now() / 1000) + (4 * 7 * 24 * 60 * 60)});
	const before = await getPublicFundraiser();

	const dialog = await startDonation(page);
	await dialog.getByRole('button', {name: /weekly installments/}).click();
	await dialog.getByRole('spinbutton').fill('5');
	await dialog.getByRole('button', {name: 'Next'}).click();

	await fillDonorDetails(page, donorName, 'e2e-weekly@example.com');
	await dialog.getByRole('button', {name: 'I don\'t want to contribute'}).click();
	await dialog.getByRole('button', {name: 'Next'}).click();
	await expect(dialog.getByRole('heading', {name: 'Display'})).toBeVisible();
	await dialog.getByRole('button', {name: 'Next'}).click();

	await expect(dialog.getByRole('heading', {name: 'Payment'})).toBeVisible();
	await expect(dialog.getByText(/Amount due: £5/)).toBeVisible();
	const paymentIntentId = await payWithTestCard(page);
	await expect(dialog.getByRole('heading', {name: 'Thank you!'})).toBeVisible();
	await sendPaymentSucceededWebhook(paymentIntentId);

	// The first £5 is taken and matched now
	await expect.poll(async () => (await getPublicFundraiser()).totalRaised).toBe(before.totalRaised + 500 + 500);

	// The card is saved for the future scheduled payments
	await loginAs(page, 'raisenational@gmail.com', `/admin/?page=fundraiser&fundraiserId=${DEMO_FUNDRAISER_ID}`);
	await page.getByRole('cell', {name: donorName, exact: true}).click();
	await expect(propertyValue(page, 'Frequency of recurrence')).toHaveText('WEEKLY');
	await expect(propertyValue(page, 'Stripe customer ID')).toHaveText(/^cus_/);
	await expect(propertyValue(page, 'Stripe payment method')).toHaveText(/^pm_/);
	await expect(page.getByRole('row', {name: /£5\.00 £0\.00 £5\.00 card paid/})).toHaveCount(1);
	// Future payments are scheduled, with match funding allocated up front
	await expect(page.getByRole('row', {name: /£5\.00 £0\.00 £5\.00 card scheduled/})).toHaveCount(4);
});

test('donation form validates required details', async ({page}) => {
	const dialog = await startDonation(page);
	await dialog.getByRole('button', {name: 'Next'}).click();
	await expect(dialog.getByRole('heading', {name: 'Celebrate'})).toBeVisible();
	await dialog.getByRole('button', {name: 'Next'}).click();
	await expect(dialog.getByText('We need your name to send you an invite')).toBeVisible();
	await expect(dialog.getByRole('heading', {name: 'Celebrate'})).toBeVisible();
});
