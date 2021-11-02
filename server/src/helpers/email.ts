import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-sesv2"
import type { Donation, Payment } from "./schemaTypes"

const raiseEmailaddress = "contact@join.raise.org"

export const sendEmail = async (params: SendEmailCommandInput): Promise<void> => {
  const client = new SESv2Client({ region: "eu-west-1" })
  const command = new SendEmailCommand(params)
  try {
    const data = await client.send(command)
    // process data.
  } catch (error) {
    // error handling.
  }
}

export const confirmationEmail = (donation: Donation, payment: Payment): SendEmailCommandInput => {
  const emailText = `Dear ${donation.donorName}, \n `
  const params: SendEmailCommandInput = {
    ConfigurationSetName: "string",
    Content: {
      // charset on these is 7-bit ASCII by default - can be changed on each of html, text and subject using the Charset property
      Simple: {
        Body: {
          Html: {
            Data: "",
          },
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
    FeedbackForwardingEmailAddress: raiseEmailaddress,
    // TODO: add verificiation from AWS
    FeedbackForwardingEmailAddressIdentityArn: "string",
    FromEmailAddress: raiseEmailaddress,
    // TODO: add verificiation from AWS
    FromEmailAddressIdentityArn: "string",
    ReplyToAddresses: [raiseEmailaddress],
  }
  return params
}
