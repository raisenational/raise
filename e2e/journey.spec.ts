import {test, expect, type Page} from '@playwright/test';
import {
	DEMO_FUNDRAISER_ID, editProperty, getPublicFundraiser, loginAs, payWithTestCard, propertyValue, sendPaymentSucceededWebhook,
} from './helpers';

// One long test following a chapter through a donations push, end to end, so a single
// video/trace shows the whole platform working together. Each test.step is named in the
// report and trace, so you can see exactly which part failed.
//
// Chapter donation pages are hard-coded to a fundraiser id in the website code (see
// apps/web/src/pages/<chapter>/_config.ts), so a brand new fundraiser has no public page.
// Instead, the new chapter group is given access to the existing Demo fundraiser, which
// is what /demo/donate uses.

const fundraiserPath = `/admin/?page=fundraiser&fundraiserId=${DEMO_FUNDRAISER_ID}`;
const pence = (pounds: number) => Math.round(pounds * 100);

const logout = async (page: Page) => {
	await page.getByRole('button', {name: 'Logout'}).click();
	await expect(page.getByRole('button', {name: 'Impersonation Login'})).toBeVisible();
};

/** Pick an option in one of the admin dropdowns (which aren't native <select>s) */
const pickOption = async (page: Page, currentValue: string | RegExp, option: string) => {
	await page.getByRole('dialog').getByRole('button', {name: currentValue}).click();
	await page.getByRole('option', {name: option, exact: true}).click();
};

const openDonation = async (page: Page, donorName: string) => {
	await page.goto(fundraiserPath);
	await page.getByRole('cell', {name: donorName, exact: true}).click();
	await expect(page.getByRole('heading', {name: `Donation from ${donorName}`})).toBeVisible();
};

test('a chapter runs a donations push, from setup to audit', async ({page}) => {
	const id = Date.now();
	const groupName = `Raise E2E ${id}`;
	const president = {name: 'E2E President', email: `e2e-president-${id}@example.com`};
	const oneOffDonor = `E2E One-off ${id}`;
	const weeklyDonor = `E2E Weekly ${id}`;
	const cashDonor = `E2E Cash ${id}`;
	const dialog = page.getByRole('dialog');
	const totalAtStart = (await getPublicFundraiser()).totalRaised;

	await test.step('National team sets up the chapter: group, president and fundraiser access', async () => {
		await loginAs(page, 'raisenational@gmail.com', '/admin/?page=users');

		await page.getByRole('button', {name: 'New group'}).click();
		await dialog.getByRole('textbox', {name: 'Name'}).fill(groupName);
		await dialog.getByRole('button', {name: 'Submit'}).click();
		await expect(dialog).toBeHidden();

		await page.goto('/admin/?page=users');
		await page.getByRole('button', {name: 'New user'}).click();
		await dialog.getByRole('textbox', {name: 'Name'}).fill(president.name);
		await dialog.getByRole('textbox', {name: 'Email'}).fill(president.email);
		await pickOption(page, '(none)', groupName);
		await dialog.getByRole('checkbox', {name: 'Send user email'}).uncheck();
		await dialog.getByRole('button', {name: 'Submit'}).click();
		await expect(dialog).toBeHidden();
		await page.goto('/admin/?page=users');
		await expect(page.getByRole('row', {name: `${president.name} ${president.email} ${groupName}`})).toBeVisible();

		// Next year's fundraiser for the chapter
		await page.getByRole('link', {name: 'Fundraisers'}).click();
		await page.getByRole('button', {name: 'New fundraiser'}).click();
		await dialog.getByRole('textbox', {name: 'Internal name'}).fill(`${groupName} next year`);
		await dialog.getByRole('textbox', {name: 'Public name'}).fill(groupName);
		await pickOption(page, '(none)', groupName);
		await dialog.getByRole('button', {name: 'Submit'}).click();
		await expect(page.getByRole('heading', {name: `${groupName} next year`})).toBeVisible();
		await expect(propertyValue(page, 'Groups with access')).toHaveText(groupName);

		// This year's fundraiser (the one with a public donation page)
		await page.goto(fundraiserPath);
		await editProperty(page, 'Groups with access', async () => {
			await pickOption(page, /Demo/, groupName);
		});
		await expect(propertyValue(page, 'Groups with access')).toHaveText(new RegExp(groupName));
		// Match funding: £1 matched for every £1 donated, up to £150 per donor, with no overall cap
		await editProperty(page, 'Match funding rate', async (d) => {
			await d.getByRole('spinbutton').fill('100');
		});
		await editProperty(page, 'Match funding per donation limit', async (d) => {
			await d.getByRole('spinbutton').fill('150');
		});
		await editProperty(page, 'Match funding remaining', async (d) => {
			await d.getByRole('spinbutton').fill('');
		});
		await editProperty(page, 'Minimum donation amount', async (d) => {
			await d.getByRole('spinbutton').fill('');
		});
		await expect(propertyValue(page, 'Match funding rate')).toHaveText(/^100%/);
		await expect(propertyValue(page, 'Match funding remaining')).toHaveText('—');
		// Weekly donations are scheduled until this date (the seed data's is in the past)
		const fourWeeksTime = new Date(Date.now() + (4 * 7 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000));
		await editProperty(page, 'Recurring donations to', async (d) => {
			await d.getByRole('textbox').fill(fourWeeksTime.toISOString().slice(0, 16));
		});
		await logout(page);
	});

	let oneOffPaymentIntent: string;
	await test.step('A supporter makes a one-off donation with a contribution', async () => {
		await page.goto('/demo/donate/');
		await page.getByRole('button', {name: 'Donate', exact: true}).click();
		await dialog.getByRole('button', {name: /one-off donation/}).click();
		await dialog.getByRole('spinbutton').fill('150');
		await dialog.getByRole('button', {name: 'Next'}).click();

		// The form checks for required details
		await dialog.getByRole('button', {name: 'Next'}).click();
		await expect(dialog.getByText('We need your name to send you an invite')).toBeVisible();
		await dialog.getByRole('textbox', {name: 'Name'}).fill(oneOffDonor);
		await dialog.getByRole('textbox', {name: 'Email'}).fill('e2e-oneoff@example.com');
		await dialog.getByRole('button', {name: 'I want to contribute'}).click();
		await dialog.getByRole('spinbutton', {name: 'Contribution amount'}).fill('5.50');
		await dialog.getByRole('button', {name: 'Next'}).click();

		await expect(dialog.getByRole('heading', {name: 'Display'})).toBeVisible();
		await dialog.getByRole('textbox', {name: 'Message (optional)'}).fill('Good luck with the push!');
		await dialog.getByRole('button', {name: 'Next'}).click();

		await expect(dialog.getByText('Amount due: £155.50 (£150 donation + £5.50 contribution)')).toBeVisible();
		oneOffPaymentIntent = await payWithTestCard(page);
		await expect(dialog.getByRole('heading', {name: 'Thank you!'})).toBeVisible();
		// Nothing is counted until Stripe confirms the payment
		await sendPaymentSucceededWebhook(oneOffPaymentIntent);
	});

	await test.step('Another supporter signs up to donate weekly', async () => {
		await page.goto('/demo/donate/');
		await page.getByRole('button', {name: 'Donate', exact: true}).click();
		await dialog.getByRole('button', {name: /weekly installments/}).click();
		await dialog.getByRole('spinbutton').fill('5');
		await dialog.getByRole('button', {name: 'Next'}).click();
		await dialog.getByRole('textbox', {name: 'Name'}).fill(weeklyDonor);
		await dialog.getByRole('textbox', {name: 'Email'}).fill('e2e-weekly@example.com');
		await dialog.getByRole('button', {name: 'I don\'t want to contribute'}).click();
		await dialog.getByRole('button', {name: 'Next'}).click();
		await expect(dialog.getByRole('heading', {name: 'Display'})).toBeVisible();
		await dialog.getByRole('button', {name: 'Next'}).click();

		await expect(dialog.getByText(/Amount due: £5/)).toBeVisible();
		const paymentIntent = await payWithTestCard(page);
		await expect(dialog.getByRole('heading', {name: 'Thank you!'})).toBeVisible();
		await sendPaymentSucceededWebhook(paymentIntent);
	});

	await test.step('Both donations are match funded and on the donor wall', async () => {
		// £150 + £150 matched, and £5 + £5 matched for the first weekly payment
		await expect.poll(async () => (await getPublicFundraiser()).totalRaised).toBe(totalAtStart + pence(310));
		await page.goto('/demo/donate/');
		await expect(page.getByText(`${oneOffDonor} donated £150`)).toBeVisible();
		await expect(page.getByText(`${weeklyDonor} donated £5`)).toBeVisible();
	});

	await test.step('The president reviews the donations, and hides the weekly donor\'s name', async () => {
		await loginAs(page, president.email, fundraiserPath);
		await expect(page.getByRole('heading', {name: 'Donations'})).toBeVisible();

		await openDonation(page, oneOffDonor);
		await expect(propertyValue(page, 'Donation amount')).toHaveText('£150.00');
		await expect(propertyValue(page, 'Match funding amount')).toHaveText('£150.00');
		await expect(propertyValue(page, 'Raise contribution amount')).toHaveText('£5.50');

		await openDonation(page, weeklyDonor);
		await expect(propertyValue(page, 'Frequency of recurrence')).toHaveText('WEEKLY');
		await expect(propertyValue(page, 'Stripe customer ID')).toHaveText(/^cus_/);
		const scheduled = page.getByRole('row', {name: /£5\.00 £0\.00 £5\.00 card scheduled/});
		await expect(page.getByRole('row', {name: /£5\.00 £0\.00 £5\.00 card paid/})).toHaveCount(1);
		await expect(scheduled).toHaveCount(4);

		// The donor would rather their name wasn't on the donor wall
		await editProperty(page, 'Donor name is public', async (d) => {
			await d.getByRole('checkbox').uncheck();
		});
		await expect(propertyValue(page, 'Donor name is public')).toHaveText('No');
	});

	await test.step('The president records a cash donation', async () => {
		await page.goto(fundraiserPath);
		await page.getByRole('button', {name: 'New donation'}).click();
		await dialog.getByRole('textbox', {name: 'Donor name'}).fill(cashDonor);
		await dialog.getByRole('textbox', {name: 'Donor email'}).fill('e2e-cash@example.com');
		await dialog.getByRole('checkbox', {name: 'Donation is public'}).check();
		await dialog.getByRole('checkbox', {name: 'Donor name is public'}).check();
		await dialog.getByRole('checkbox', {name: 'Donation amount is public'}).check();
		await dialog.getByRole('button', {name: 'Submit'}).click();
		await expect(page.getByRole('heading', {name: `Donation from ${cashDonor}`})).toBeVisible();

		await page.getByRole('button', {name: 'New manual payment'}).click();
		await dialog.getByRole('spinbutton', {name: 'Donation amount'}).fill('20');
		await dialog.getByRole('textbox', {name: 'Reference'}).fill('Cash at the bake sale');
		await dialog.getByRole('button', {name: 'Submit'}).click();
		await expect(page.getByRole('row', {name: /£20\.00 £0\.00 £20\.00 cash paid/})).toBeVisible();
	});

	await test.step('The donor wall reflects the president\'s changes', async () => {
		await expect.poll(async () => (await getPublicFundraiser()).totalRaised).toBe(totalAtStart + pence(310 + 40));
		const {donations} = await getPublicFundraiser();
		expect(donations.map((d) => d.donorName)).toContain(cashDonor);
		expect(donations.map((d) => d.donorName)).not.toContain(weeklyDonor);
		await page.goto('/demo/donate/');
		await expect(page.getByText(`${cashDonor} donated £20`)).toBeVisible();
		await expect(page.getByText(weeklyDonor)).toBeHidden();
		await page.goto('/admin/');
		await logout(page);
	});

	await test.step('National team cancels a scheduled weekly payment and refunds part of the one-off donation', async () => {
		await loginAs(page, 'raisenational@gmail.com', fundraiserPath);
		// The weekly donor asked to stop early, so (as only National can) cancel their final payment
		await openDonation(page, weeklyDonor);
		const scheduled = page.getByRole('row', {name: /£5\.00 £0\.00 £5\.00 card scheduled/});
		await expect(scheduled).toHaveCount(4);
		await scheduled.last().click();
		await expect(page.getByRole('heading', {name: `Payment from ${weeklyDonor}`})).toBeVisible();
		await editProperty(page, 'Status', async () => {
			await pickOption(page, /scheduled|\(none\)/, 'cancelled');
		});
		await expect(propertyValue(page, 'Status')).toHaveText('cancelled');
		await openDonation(page, weeklyDonor);
		await expect(scheduled).toHaveCount(3);
		await expect(page.getByRole('row', {name: /card cancelled/})).toHaveCount(1);

		await openDonation(page, oneOffDonor);
		await page.getByRole('row', {name: /£150\.00 £5\.50 £150\.00 card paid/}).click();
		await page.getByRole('button', {name: 'Mark refunded'}).click();
		await expect(dialog.getByRole('heading', {name: /as refunded/})).toBeVisible();
		await dialog.getByRole('spinbutton', {name: 'Refunded donation amount'}).fill('50');
		await dialog.getByRole('spinbutton', {name: 'Refunded contribution amount'}).fill('0');
		await dialog.getByRole('spinbutton', {name: 'Refunded match funding amount'}).fill('50');
		await dialog.getByRole('button', {name: 'Submit'}).click();
		await expect(dialog).toBeHidden();

		await openDonation(page, oneOffDonor);
		await expect(page.getByRole('row', {name: /£-50\.00 £0\.00 £-50\.00 card paid/})).toBeVisible();
		await expect(propertyValue(page, 'Donation amount')).toHaveText('£100.00');
		await expect.poll(async () => (await getPublicFundraiser()).totalRaised).toBe(totalAtStart + pence(310 + 40 - 100));
	});

	await test.step('National team checks the audit log of what the president did', async () => {
		await page.getByRole('link', {name: 'Audit'}).click();
		await page.getByRole('button', {name: 'object'}).click();
		await page.getByRole('option', {name: 'subject', exact: true}).click();
		const query = page.getByRole('textbox', {name: 'Query (hit enter to search)'});
		await query.fill(president.email);
		await query.press('Enter');

		const rows = page.getByRole('row').filter({has: page.getByRole('cell', {name: president.email, exact: true})});
		const withAction = (action: string) => rows.filter({has: page.getByRole('cell', {name: action, exact: true})});
		// Hiding the weekly donor's name
		await expect(withAction('edit')).toHaveCount(1);
		await expect(withAction('edit')).toContainText('"namePublic":false');
		// Creating the cash donation and its payment, which also updated the totals
		await expect(withAction('create')).toHaveCount(2);
		await expect(withAction('create').filter({hasText: 'Cash at the bake sale'})).toHaveCount(1);
		await expect(withAction('plus').first()).toBeVisible();
	});
});
