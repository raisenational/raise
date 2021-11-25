import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-sesv2"
import { NodeHttpHandler } from "@aws-sdk/node-http-handler"
import env from "../env/env"
import type { Donation, Payment } from "./schemaTypes"

const raiseEmailaddress = "raisenational@gmail.com"

const requestHandler = new NodeHttpHandler({
  connectionTimeout: 30_000,
  socketTimeout: 30_000,
})

const sesClient = env.STAGE === "local"
  ? new SESv2Client({
    region: "localhost",
    endpoint: "http://localhost:8006",
    credentials: { accessKeyId: "DEFAULT_ACCESS_KEY", secretAccessKey: "DEFAULT_SECRET" },
    requestHandler,
  })
  : new SESv2Client({
    requestHandler,
  })

export const sendEmail = async (params: SendEmailCommandInput): Promise<void> => {
  const command = new SendEmailCommand(params)
  const data = await sesClient.send(command)
}

export const confirmationEmail = (donation: Donation, payment: Payment): SendEmailCommandInput => {
  const emailText = `Dear ${donation.donorName},\n\nWe've receieved your payment.\n\nThanks,\nThe Raise Team`
  const params: SendEmailCommandInput = {
    Content: {
      // charset on these is 7-bit ASCII by default - can be changed on each of html, text and subject using the Charset property
      Simple: {
        Body: {
          // Html: {
          //   Data: "",
          // },
          Text: {
            Data: emailText,
          },
        },
        Subject: {
          Data: "Thank you for donating!",
        },
      },
    },
    Destination: {
      ToAddresses: [donation.donorEmail],
    },
    FromEmailAddress: raiseEmailaddress,
  }
  return params
}
