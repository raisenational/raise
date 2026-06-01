import {
	test, expect, vi,
} from 'vitest';
import {sendEmail} from './email';
import renderHtml from './email/renderHtml';

vi.unmock('./email');

const {send} = vi.hoisted(() => ({send: vi.fn()}));
vi.mock('@aws-sdk/client-sesv2', () => ({
	// eslint-disable-next-line prefer-arrow-callback -- vitest 4 requires a non-arrow implementation to be constructed with `new`
	SESv2Client: vi.fn().mockImplementation(function () {
		return {
			get send() {
				return send;
			},
		};
	}),
	// eslint-disable-next-line prefer-arrow-callback -- vitest 4 requires a non-arrow implementation to be constructed with `new`
	SendEmailCommand: vi.fn().mockImplementation(function (input: unknown) {
		return {_input: input};
	}),
}));

test('sendEmail calls SES correctly', async () => {
	// Given no calls to the send endpoint
	expect(send).not.toHaveBeenCalled();

	// When we send an email
	await sendEmail(
		'This is the subject',
		renderHtml`<!doctype html><html><body>Hello</body></html>`,
		'adam@joinraise.org',
	);

	// Then the command is built and sent
	expect(send).toHaveBeenCalledWith({
		_input: {
			Content: {
				Simple: {
					Body: {
						Html: {
							Charset: 'UTF-8',
							Data: '<!doctype html><html><body>Hello</body></html>',
						},
					},
					Subject: {
						Data: 'This is the subject',
					},
				},
			},
			Destination: {
				ToAddresses: ['adam@joinraise.org'],
			},
			FromEmailAddress: '"Raise" <national@joinraise.org>',
		},
	});
});
