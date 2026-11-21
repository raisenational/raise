import {test, expect} from '@playwright/test';
import {
	adminApi, DEMO_FUNDRAISER_ID, editProperty, getPublicFundraiser, loginAs, propertyRow, propertyValue,
} from './helpers';

// The common Donations Admin processes from the 'Using the Raise platform' help doc.

const fundraiserPath = `/admin/?page=fundraiser&fundraiserId=${DEMO_FUNDRAISER_ID}`;

test('login: allowed users can log in, and expired security training is rejected', async ({page}) => {
	await loginAs(page, 'raisedemo@gmail.com');
	await expect(page.getByRole('heading', {name: 'Fundraisers'})).toBeVisible();
	await expect(page.getByRole('row', {name: /Raise Demo 2022/})).toBeVisible();
	await page.getByRole('button', {name: 'Logout'}).click();
	await expect(page.getByRole('button', {name: 'Impersonation Login'})).toBeVisible();

	page.once('dialog', async (dialog) => dialog.accept('raiseexpiredsecuritytraining@gmail.com'));
	await page.getByRole('button', {name: 'Impersonation Login'}).click();
	await expect(page.getByText(/Security training .* out of date/)).toBeVisible();
	await expect(page.getByRole('button', {name: 'Logout'})).toBeHidden();
});

test('editing your fundraiser', async ({page}) => {
	await loginAs(page, 'raisedemo@gmail.com', fundraiserPath);
	await expect(page.getByRole('heading', {name: 'Raise Demo 2022'})).toBeVisible();

	await editProperty(page, 'Goal', async (dialog) => {
		await dialog.getByRole('spinbutton', {name: 'Goal'}).fill('1234.56');
		await expect(dialog.getByText('New value: £1234.56')).toBeVisible();
	});
	await expect(propertyValue(page, 'Goal')).toHaveText('£1234.56');

	await editProperty(page, 'Suggested contribution amount', async (dialog) => {
		await dialog.getByRole('spinbutton').fill('7.00');
	});
	await expect(propertyValue(page, 'Suggested contribution amount')).toHaveText('£7.00');

	// Persisted, and reflected on the public donation page
	await page.reload();
	await expect(propertyValue(page, 'Goal')).toHaveText('£1234.56');
	await page.goto('/demo/donate/');
	await page.getByRole('button', {name: 'Donate', exact: true}).click();
	await page.getByRole('dialog').getByRole('button', {name: 'Next'}).click();
	await expect(page.getByRole('spinbutton', {name: 'Contribution amount'})).toHaveValue(/^7(\.00)?$/);
});

test('adding a manual donation and payment updates the fundraiser totals', async ({page}) => {
	const donorName = `E2E Manual ${Date.now()}`;
	const before = await getPublicFundraiser();

	await loginAs(page, 'raisedemo@gmail.com', fundraiserPath);
	await page.getByRole('button', {name: 'New donation'}).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', {name: 'New donation'})).toBeVisible();
	await dialog.getByRole('textbox', {name: 'Donor name'}).fill(donorName);
	await dialog.getByRole('textbox', {name: 'Donor email'}).fill('e2e-manual@example.com');
	await dialog.getByRole('checkbox', {name: 'Donation is public'}).check();
	await dialog.getByRole('checkbox', {name: 'Donor name is public'}).check();
	await dialog.getByRole('checkbox', {name: 'Donation amount is public'}).check();
	await dialog.getByRole('button', {name: 'Submit'}).click();

	// Taken to the new donation
	await expect(page.getByRole('heading', {name: `Donation from ${donorName}`})).toBeVisible();
	await expect(propertyValue(page, 'Donation amount')).toHaveText('£0.00');

	await page.getByRole('button', {name: 'New manual payment'}).click();
	await expect(dialog.getByRole('heading', {name: 'New payment'})).toBeVisible();
	await dialog.getByRole('spinbutton', {name: 'Donation amount'}).fill('40');
	await dialog.getByRole('spinbutton', {name: 'Contribution amount'}).fill('5');
	await dialog.getByRole('textbox', {name: 'Reference'}).fill('Cash at e2e test stall');
	await dialog.getByRole('button', {name: 'Submit'}).click();
	await expect(dialog).toBeHidden();

	// Donation amounts are derived from payments: £40 donated, matched 1:1
	await expect(page.getByRole('row', {name: /£40\.00 £5\.00 £40\.00 cash paid/})).toBeVisible();
	await page.reload();
	await expect(propertyValue(page, 'Donation amount')).toHaveText('£40.00');
	await expect(propertyValue(page, 'Match funding amount')).toHaveText('£40.00');
	await expect(propertyValue(page, 'Raise contribution amount')).toHaveText('£5.00');
	await expect(page.getByText(`${donorName} donated £40`)).toBeVisible();

	const after = await getPublicFundraiser();
	expect(after.totalRaised).toBe(before.totalRaised + 4000 + 4000);
	expect(after.donationsCount).toBe(before.donationsCount + 1);

	// Changing donation visibility for the donor wall
	await editProperty(page, 'Donation is public', async (d) => {
		await d.getByRole('checkbox').uncheck();
	});
	await expect(propertyValue(page, 'Donation is public')).toHaveText('No');
	expect((await getPublicFundraiser()).donations.some((d) => d.donorName === donorName)).toBe(false);
	// Still counts towards the total
	expect((await getPublicFundraiser()).totalRaised).toBe(after.totalRaised);
});

test('marking a payment refunded creates a reversing payment', async ({page}) => {
	// Set up a donation with a £50 cash payment (matched 1:1)
	const donorName = `E2E Refund ${Date.now()}`;
	const api = await adminApi('raisenational@gmail.com');
	const donationId = await api('POST', `/admin/fundraisers/${DEMO_FUNDRAISER_ID}/donations`, {donorName, donorEmail: 'e2e-refund@example.com'}) as string;
	await api('POST', `/admin/fundraisers/${DEMO_FUNDRAISER_ID}/donations/${donationId}/payments`, {
		donationAmount: 5000, contributionAmount: 0, matchFundingAmount: null, method: 'cash', reference: 'e2e',
	});
	const before = await getPublicFundraiser();

	await loginAs(page, 'raisenational@gmail.com', `/admin/?page=donation&fundraiserId=${DEMO_FUNDRAISER_ID}&donationId=${donationId}`);
	await expect(propertyValue(page, 'Donation amount')).toHaveText('£50.00');
	await expect(propertyValue(page, 'Match funding amount')).toHaveText('£50.00');

	await page.getByRole('row', {name: /£50\.00 £0\.00 £50\.00 cash paid/}).click();
	await expect(page.getByRole('heading', {name: `Payment from ${donorName}`})).toBeVisible();
	await page.getByRole('button', {name: 'Mark refunded'}).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', {name: /as refunded/})).toBeVisible();
	await dialog.getByRole('spinbutton', {name: 'Refunded donation amount'}).fill('20');
	await dialog.getByRole('spinbutton', {name: 'Refunded match funding amount'}).fill('20');
	await dialog.getByRole('button', {name: 'Submit'}).click();
	await expect(dialog).toBeHidden();

	await page.goto(`/admin/?page=donation&fundraiserId=${DEMO_FUNDRAISER_ID}&donationId=${donationId}`);
	await expect(page.getByRole('row', {name: /£-20\.00 £0\.00 £-20\.00 cash paid/})).toBeVisible();
	await expect(propertyValue(page, 'Donation amount')).toHaveText('£30.00');
	await expect(propertyValue(page, 'Match funding amount')).toHaveText('£30.00');
	expect((await getPublicFundraiser()).totalRaised).toBe(before.totalRaised - 2000 - 2000);
});

test('creating fundraisers, groups and users (national team)', async ({page}) => {
	const suffix = Date.now();
	const groupName = `E2E Chapter ${suffix}`;
	const fundraiserName = `E2E Chapter ${suffix} 2026`;
	const userEmail = `e2e-user-${suffix}@example.com`;
	const dialog = page.getByRole('dialog');

	await loginAs(page, 'raisenational@gmail.com', '/admin/?page=users');

	// New group
	await page.getByRole('button', {name: 'New group'}).click();
	await dialog.getByRole('textbox', {name: 'Name'}).fill(groupName);
	await dialog.getByRole('button', {name: 'Submit'}).click();
	await expect(dialog).toBeHidden();
	await page.goto('/admin/?page=users');
	await expect(page.getByRole('cell', {name: groupName, exact: true})).toBeVisible();

	// New user in that group
	await page.getByRole('button', {name: 'New user'}).click();
	await dialog.getByRole('textbox', {name: 'Name'}).fill('E2E User');
	await dialog.getByRole('textbox', {name: 'Email'}).fill(userEmail);
	await dialog.getByRole('button', {name: '(none)'}).click();
	await page.getByRole('option', {name: groupName}).click();
	await expect(dialog.getByRole('button', {name: groupName})).toBeVisible();
	await dialog.getByRole('checkbox', {name: 'Send user email'}).uncheck();
	await dialog.getByRole('button', {name: 'Submit'}).click();
	await expect(dialog).toBeHidden();
	await page.goto('/admin/?page=users');
	await expect(page.getByRole('row', {name: new RegExp(`E2E User ${userEmail} ${groupName}`)})).toBeVisible();

	// New fundraiser that group can access
	await page.getByRole('link', {name: 'Fundraisers'}).click();
	await page.getByRole('button', {name: 'New fundraiser'}).click();
	await dialog.getByRole('textbox', {name: 'Internal name'}).fill(fundraiserName);
	await dialog.getByRole('textbox', {name: 'Public name'}).fill(`E2E Chapter ${suffix}`);
	await dialog.getByRole('button', {name: '(none)'}).click();
	await page.getByRole('option', {name: groupName}).click();
	await expect(dialog.getByRole('button', {name: groupName})).toBeVisible();
	await dialog.getByRole('button', {name: 'Submit'}).click();
	await expect(dialog).toBeHidden();
	await expect(page.getByRole('heading', {name: fundraiserName})).toBeVisible();
	await expect(propertyValue(page, 'Groups with access')).toHaveText(groupName);

	// The new user can log in and edit it
	await page.getByRole('button', {name: 'Logout'}).click();
	await loginAs(page, userEmail);
	await page.getByRole('cell', {name: fundraiserName, exact: true}).click();
	await editProperty(page, 'Goal', async (d) => {
		await d.getByRole('spinbutton', {name: 'Goal'}).fill('2000');
	});
	await expect(propertyValue(page, 'Goal')).toHaveText('£2000.00');
	await expect(propertyRow(page, 'Groups with access')).toBeVisible();
});

test('chapter users cannot see donations on fundraisers they do not have access to', async ({page}) => {
	// A fundraiser only the National group can access
	await loginAs(page, 'raisenational@gmail.com');
	await page.getByRole('button', {name: 'New fundraiser'}).click();
	const dialog = page.getByRole('dialog');
	const fundraiserName = `E2E National Only ${Date.now()}`;
	await dialog.getByRole('textbox', {name: 'Internal name'}).fill(fundraiserName);
	await dialog.getByRole('button', {name: 'Submit'}).click();
	await expect(page.getByRole('heading', {name: fundraiserName})).toBeVisible();
	const url = page.url();
	await page.getByRole('button', {name: 'Logout'}).click();

	await loginAs(page, 'raisedemo@gmail.com', new URL(url).pathname + new URL(url).search);
	await expect(page.getByRole('heading', {name: fundraiserName})).toBeVisible();
	// Fundraiser config is visible to all admins, but not its donations
	await expect(propertyValue(page, 'Internal name')).toHaveText(fundraiserName);
	await expect(page.getByRole('heading', {name: 'Donations'})).toBeHidden();
	await expect(page.getByRole('button', {name: 'New donation'})).toBeHidden();
	await editProperty(page, 'Goal', async (d) => {
		await d.getByRole('spinbutton', {name: 'Goal'}).fill('1');
	}).then(() => {
		throw new Error('Expected editing to fail');
	}, () => undefined);
});
