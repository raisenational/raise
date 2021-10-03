import "source-map-support/register"
import createError from "http-errors"
import { middyfy } from "../../../../../helpers/wrapper"
import { donationsSchema } from "../../../../../helpers/schemas"

export const main = middyfy(null, donationsSchema, async (event) => {
  if (!event.pathParameters || !(typeof event.pathParameters.fundraiserId === "string")) throw new createError.BadRequest("Missing fundraiserId")

  // TODO: get from db

  if (event.pathParameters.fundraiserId !== "01FGNSHH6X6X878ZNBZKY44JQA") {
    return []
  }
  return [
    {
      id: "01FGPDQQ9RNX77QX5V62MA2X81",
      fundraiserId: "01FGNSHH6X6X878ZNBZKY44JQA",
      name: "John Doe",
      email: "johndoe@example.com",
      createdAt: 1632840179,
      address: null,
      giftAid: false,
      comment: null,
      donationAmount: 150_00,
      matchFundingAmount: 150_00,
      contributionAmount: 0_00,
      payments: [{ at: 1632840179, amount: 150_00 }],
      paymentMethod: "card" as const,
      paymentGatewayId: "pymt_12345",
      charity: "AMF",
      overallPublic: true,
      namePublic: true,
      commentPublic: false,
      donationAmountPublic: false,
    },
    {
      id: "01FGP6MMPGGVY0MH9GE9DRRNKG",
      fundraiserId: "01FGNSHH6X6X878ZNBZKY44JQA",
      name: "Jane Doe",
      email: "jane@example.com",
      createdAt: 1632832738,
      address: "123 Something Street, London, EC1A 1AA",
      giftAid: true,
      comment: "Pleased to be giving to such a great cause",
      donationAmount: 90_00,
      matchFundingAmount: 90_00,
      contributionAmount: 0_00,
      payments: [{ at: 1632832738, amount: 30_00 }, { at: 1633392000, amount: 30_00 }, { at: 1633996800, amount: 30_00 }],
      paymentMethod: "card" as const,
      paymentGatewayId: "pymt_67890",
      charity: "AMF",
      overallPublic: true,
      namePublic: true,
      commentPublic: true,
      donationAmountPublic: true,
    },
  ]
})
