import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { sendEmail } from './email';
import renderHtml from './email/renderHtml';

jest.unmock('./email');

const send = jest.fn();
jest.mock('@aws-sdk/client-sesv2', () => ({
  SESv2Client: jest.fn().mockImplementation(() => ({ get send() { return send; } })),
  SendEmailCommand: jest.fn(),
}));

beforeEach(() => {
  (SendEmailCommand as unknown as jest.Mock).mockImplementation((input) => ({ _input: input }));
});

test('sendEmail calls SES correctly', async () => {
  // given no calls to the send endpoint
  expect(send).not.toHaveBeenCalled();

  // when we send an email
  await sendEmail(
    'This is the subject',
    renderHtml`<!doctype html><html><body>Hello</body></html>`,
    'adam@joinraise.org',
  );

  // then the command is built and sent
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
      FromEmailAddress: '"Raise" <raisenational@gmail.com>',
    },
  });
});
