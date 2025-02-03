/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {ulid} from 'ulid';
import {
	type AuditLog, type Donation, type Fundraiser, type Payment,
} from '../schemas';

export const makeFundraiser = <Override extends Partial<Fundraiser>>(override?: Override): Fundraiser & Override => ({
	id: ulid(),
	internalName: 'Raise Test 2022',
	publicName: 'Raise Test',
	activeFrom: Math.floor(new Date().getTime() / 1000),
	activeTo: Math.floor(new Date().getTime() / 1000) + 604800, // 1 week
	recurringDonationsTo: Math.floor(new Date().getTime() / 1000) + 2419200, // 4 weeks
	paused: false,
	currency: Math.random() < 0.5 ? 'gbp' : 'usd',
	goal: Math.ceil(Math.random() * 4) * 500_00,
	totalRaised: 0,
	donationsCount: 0,
	matchFundingRate: Math.floor(Math.random() * 6) * 50,
	matchFundingPerDonationLimit: null,
	matchFundingRemaining: null,
	minimumDonationAmount: null,
	groupsWithAccess: ['01GPYGNDBDHY9685YHRKWT6VE7'],
	suggestedDonationAmountOneOff: Math.ceil(Math.random() * 4) * 50_00,
	suggestedDonationAmountWeekly: Math.ceil(Math.random() * 4) * 5_00,
	suggestedContributionAmount: 10_00,
	eventLink: null,
	moreInvolvedLink: null,
	archived: false,
	...override,
} as Fundraiser & Override);

export const makeDonation = <Override extends Partial<Donation>>(override?: Override): Donation & Override => ({
	id: ulid(),
	fundraiserId: ulid(),
	donorName: 'Person McPersonface',
	donorEmail: 'person@example.com',
	emailConsentInformational: false,
	emailConsentMarketing: false,
	createdAt: Math.floor(new Date().getTime() / 1000),
	addressLine1: null,
	addressLine2: null,
	addressLine3: null,
	addressPostcode: null,
	addressCountry: null,
	giftAid: false,
	comment: 'Keeping up the energy!',
	donationAmount: 0,
	matchFundingAmount: 0,
	contributionAmount: 0,
	recurringAmount: null,
	recurrenceFrequency: null,
	stripeCustomerId: null,
	stripePaymentMethodId: null,
	charity: 'AMF',
	overallPublic: false,
	namePublic: false,
	donationAmountPublic: false,
	donationCounted: false,
	...override,
} as Donation & Override);

export const makePayment = <Override extends Partial<Payment>>(override?: Override): Payment & Override => ({
	id: ulid(),
	donationId: ulid(),
	fundraiserId: ulid(),
	at: Math.floor(new Date().getTime() / 1000),
	donationAmount: Math.ceil(Math.random() * 9) * 10_00,
	contributionAmount: Math.floor(Math.random() * 2) * 10_00,
	matchFundingAmount: Math.ceil(Math.random() * 9) * 10_00,
	method: 'cash',
	reference: 'Paid to treasurer at SP',
	status: 'paid',
	...override,
} as Payment & Override);

export const makeAuditLog = <Override extends Partial<AuditLog>>(override?: Override): AuditLog & Override => ({
	id: ulid(),
	object: ulid(),
	subject: 'raisenational@gmail.com',
	action: 'edit',
	at: Math.floor(new Date().getTime() / 1000),
	sourceIp: '1.1.1.1',
	userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/1.2 Chrome/1.2.3.4 Safari/1.2',
	routeRaw: 'GET /admin/somewhere',
	metadata: {
		extraDetailsLocation: 'here',
	},
	ttl: null,
	...override,
} as AuditLog & Override);
