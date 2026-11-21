import {expect, type Page} from '@playwright/test';
import Stripe from 'stripe';
import serverEnv from '../apps/server/src/env/local';
import devWebEnv from '../apps/web/src/env/dev';

export const IS_DEV = process.env.E2E_ENV === 'dev';
export const API_BASE_URL = IS_DEV ? devWebEnv.API_BASE_URL : 'http://localhost:8001';
export const DEMO_FUNDRAISER_ID = '01FGNSHH6X6X878ZNBZKY44JQA';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY);

/** Log in to /admin with the impersonation login (available on local and dev only). */
export const loginAs = async (page: Page, email: string, path = '/admin/') => {
	page.once('dialog', async (dialog) => dialog.accept(email));
	await page.goto(path);
	await page.getByRole('button', {name: 'Impersonation Login'}).click();
	await expect(page.getByRole('button', {name: 'Logout'})).toBeVisible();
};

/** The value cell of a property row in a PropertyEditor table, e.g. propertyValue(page, 'Goal') */
export const propertyRow = (page: Page, property: string) => page.getByRole('row').filter({has: page.getByRole('cell', {name: property, exact: true})});
export const propertyValue = (page: Page, property: string) => propertyRow(page, property).getByRole('cell').nth(1);

/** Edit a property on a PropertyEditor table */
export const editProperty = async (page: Page, property: string, fill: (dialog: ReturnType<Page['getByRole']>) => Promise<void>) => {
	await propertyRow(page, property).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', {name: `Editing ${property.toLowerCase()}`})).toBeVisible();
	await fill(dialog);
	await dialog.getByRole('button', {name: 'Submit'}).click();
	await expect(dialog).toBeHidden();
};

/** Parse a displayed GBP amount like '£1,020.50' into pence */
export const parsePence = (text: string | null): number => {
	const match = /-?£?(-?[\d,]+(?:\.\d+)?)/.exec(text ?? '');
	if (!match) {
		throw new Error(`Could not parse amount from '${text}'`);
	}

	return Math.round(Number(match[1].replaceAll(',', '')) * 100) * (text?.trim().startsWith('-') ? -1 : 1);
};

/** Fetch the public view of a fundraiser straight from the API */
export const getPublicFundraiser = async (fundraiserId = DEMO_FUNDRAISER_ID): Promise<{totalRaised: number; donationsCount: number; donations: {donorName?: string; donationAmount?: number; matchFundingAmount?: number}[]}> => {
	const res = await fetch(`${API_BASE_URL}/public/fundraisers/${fundraiserId}`);
	expect(res.status).toBe(200);
	return res.json() as never;
};

/**
 * Locally there's no Stripe webhook forwarding, so we play Stripe's role: fetch the
 * (real, test-mode) payment intent and send a correctly signed payment_intent.succeeded
 * event to our webhook endpoint, as Stripe would in dev/prod.
 */
export const sendPaymentSucceededWebhook = async (paymentIntentId: string) => {
	if (IS_DEV) {
		// On dev, Stripe sends the real webhook itself
		return;
	}

	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
	expect(paymentIntent.status).toBe('succeeded');

	const payload = JSON.stringify({
		id: `evt_e2e_${Date.now()}`,
		object: 'event',
		api_version: '2026-01-28.clover',
		type: 'payment_intent.succeeded',
		created: Math.floor(Date.now() / 1000),
		data: {object: paymentIntent},
	});
	const signature = stripe.webhooks.generateTestHeaderString({payload, secret: serverEnv.STRIPE_WEBHOOK_SECRET});

	const res = await fetch(`${API_BASE_URL}/stripe/webhook`, {
		method: 'POST',
		headers: {'content-type': 'application/json', 'stripe-signature': signature},
		body: payload,
	});
	expect(res.status, await res.clone().text()).toBeLessThan(300);
};

/**
 * Fill in the Stripe Payment Element with a test card and pay, returning the id of
 * the payment intent Stripe confirmed.
 */
export const payWithTestCard = async (page: Page, cardNumber = '4242424242424242'): Promise<string> => {
	const dialog = page.getByRole('dialog');
	const card = page.frameLocator('iframe[title*="payment" i]').first();
	await card.getByLabel('Card number').fill(cardNumber);
	await card.getByLabel(/Expiration/).fill('12 / 34');
	await card.getByLabel(/Security code/).fill('123');

	// The Pay now button is swapped out once Stripe has loaded, so a click can land on a
	// stale button. Keep clicking until Stripe actually receives a confirm request.
	let paymentIntentId: string | undefined;
	await expect(async () => {
		const confirm = page.waitForResponse((r) => /\/v1\/payment_intents\/pi_[^/]+\/confirm/.test(r.url()), {timeout: 5_000});
		await dialog.getByRole('button', {name: 'Pay now'}).click();
		const response = await confirm;
		paymentIntentId = /\/payment_intents\/(pi_[^/]+)\/confirm/.exec(response.url())![1];
	}).toPass({timeout: 45_000});

	return paymentIntentId!;
};

/** Call the admin API directly as an impersonated user, for test setup */
export const adminApi = async (email: string) => {
	const login = await fetch(`${API_BASE_URL}/admin/login/impersonation`, {
		method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({email}),
	});
	expect(login.status).toBe(200);
	const {accessToken} = await login.json() as {accessToken: {value: string}};
	return async (method: string, path: string, body?: unknown) => {
		const res = await fetch(`${API_BASE_URL}${path}`, {
			method,
			headers: {'content-type': 'application/json', authorization: `Bearer ${accessToken.value}`},
			body: body === undefined ? undefined : JSON.stringify(body),
		});
		expect(res.status, await res.clone().text()).toBeLessThan(300);
		return res.status === 204 ? undefined : res.json() as Promise<unknown>;
	};
};
