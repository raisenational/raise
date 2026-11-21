import {test, expect} from '@playwright/test';
import {adminApi, editProperty, loginAs, propertyValue} from './helpers';

// Who can get into Donations Admin, and what they can see once there.

test('only authorised admins can see donor data', async ({page}) => {
	await test.step('Admins whose security training has expired cannot log in', async () => {
		const email = `e2e-expired-training-${Date.now()}@example.com`;
		const api = await adminApi('raisenational@gmail.com');
		await api('POST', '/admin/users', {
			name: 'E2E Expired Training',
			email,
			groups: [],
			securityTrainingCompletedAt: Math.floor(Date.now() / 1000) - (2 * 365 * 24 * 60 * 60),
			sendAccountCreationEmail: false,
		});

		await page.goto('/admin/');
		page.once('dialog', async (dialog) => dialog.accept(email));
		await page.getByRole('button', {name: 'Impersonation Login'}).click();
		await expect(page.getByText(`Security training for ${email} out of date`)).toBeVisible();
		await expect(page.getByRole('button', {name: 'Logout'})).toBeHidden();
	});

	await test.step('Unknown accounts cannot log in', async () => {
		page.once('dialog', async (dialog) => dialog.accept('not-an-admin@example.com'));
		await page.getByRole('button', {name: 'Impersonation Login'}).click();
		await expect(page.getByText(/not-an-admin@example.com, is not allowlisted/)).toBeVisible();
	});

	const fundraiserName = `E2E National Only ${Date.now()}`;
	let fundraiserUrl: string;
	await test.step('National team creates a fundraiser no chapter has access to', async () => {
		await loginAs(page, 'raisenational@gmail.com');
		await page.getByRole('button', {name: 'New fundraiser'}).click();
		await page.getByRole('dialog').getByRole('textbox', {name: 'Internal name'}).fill(fundraiserName);
		await page.getByRole('dialog').getByRole('button', {name: 'Submit'}).click();
		await expect(page.getByRole('heading', {name: fundraiserName})).toBeVisible();
		await expect(page.getByRole('heading', {name: 'Donations'})).toBeVisible();
		fundraiserUrl = page.url();
		await page.getByRole('button', {name: 'Logout'}).click();
	});

	await test.step('A chapter admin can see its settings, but not its donations, and cannot edit it', async () => {
		await loginAs(page, 'raisedemo@gmail.com', fundraiserUrl.replace(/^https?:\/\/[^/]+/, ''));
		await expect(propertyValue(page, 'Internal name')).toHaveText(fundraiserName);
		await expect(page.getByRole('heading', {name: 'Donations'})).toBeHidden();
		await expect(page.getByRole('button', {name: 'New donation'})).toBeHidden();
		await expect(editProperty(page, 'Goal', async (d) => {
			await d.getByRole('spinbutton', {name: 'Goal'}).fill('1');
		})).rejects.toThrow();
		await page.reload();
		await expect(propertyValue(page, 'Goal')).toHaveText('£1000.00');
	});
});
