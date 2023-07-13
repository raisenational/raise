import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import env from '../env/env';
import { RenderedHtml } from './email/renderHtml';

const raiseEmailAddress = 'raisenational@gmail.com';

const requestHandler = new NodeHttpHandler({
  connectionTimeout: 30_000,
  socketTimeout: 30_000,
});

const sesClient = env.STAGE === 'local'
  ? new SESv2Client({
    region: 'localhost',
    endpoint: 'http://localhost:8006',
    credentials: {
      accessKeyId: 'MockAccessKeyId',
      secretAccessKey: 'MockSecretAccessKey'
    },
    requestHandler,
  })
  : new SESv2Client({
    requestHandler,
  });

export const sendEmail = async (subject: string, html: RenderedHtml, to: string, fromName = 'Raise'): Promise<void> => {
  await sesClient.send(new SendEmailCommand({
    Content: {
      Simple: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html.string,
          },
        },
        Subject: {
          Data: subject,
        },
      },
    },
    Destination: {
      ToAddresses: [to],
    },
    FromEmailAddress: `"${fromName.replace(/[^a-z0-9 ]+/ig, ' ').trim()}" <${raiseEmailAddress}>`,
  }));
};
