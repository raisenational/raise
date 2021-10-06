import "source-map-support/register"
import createHttpError from "http-errors"
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"
import { ulid } from "ulid"
import type { FromSchema } from "json-schema-to-ts"
import { middyfy } from "../../../../../helpers/wrapper"
import dynamoDBDocumentClient from "../../../../../helpers/documentClient"
import {
  donationEditsSchema, donationSchema, fundraiserSchema, ulidSchema,
} from "../../../../../helpers/schemas"

export const main = middyfy(donationEditsSchema, ulidSchema, true, async (event) => {
  // TODO: these common checks (on path parameters and groups with access) should be bundled either as part of the wrapper, or at least a helper somewhere
  if (!event.pathParameters || !(typeof event.pathParameters.fundraiserId === "string")) throw new createHttpError.BadRequest("Missing fundraiserId")
  const fundraiser = (await dynamoDBDocumentClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME_FUNDRAISER,
    Key: {
      id: event.pathParameters.fundraiserId,
    },
  }))).Item as FromSchema<typeof fundraiserSchema> | undefined
  if (!fundraiser) {
    throw new createHttpError.NotFound(`Fundraiser with id ${event.pathParameters.fundraiserId} not found`)
  }
  if (!event.auth.payload.groups.some((g) => fundraiser.groupsWithAccess.includes(g))) {
    throw new createHttpError.Forbidden(`Fundraiser requires you to be in one of the groups [${fundraiser.groupsWithAccess.join(", ")}] but you are in [${event.auth.payload.groups.join(", ")}]`)
  }

  const donation: FromSchema<typeof donationSchema> = {
    id: ulid(),
    fundraiserId: event.pathParameters.fundraiserId,
    donorName: event.body.donorName ?? "Unknown",
    donorEmail: event.body.donorEmail ?? "Unknown",
    createdAt: event.body.createdAt ?? Math.floor(new Date().getTime() / 1000),
    addressLine1: event.body.addressLine1 ?? null,
    addressLine2: event.body.addressLine2 ?? null,
    addressLine3: event.body.addressLine3 ?? null,
    addressPostcode: event.body.addressPostcode ?? null,
    addressCountry: event.body.addressCountry ?? null,
    giftAid: event.body.giftAid ?? false,
    comment: event.body.comment ?? null,
    donationAmount: event.body.donationAmount ?? 0,
    matchFundingAmount: event.body.matchFundingAmount ?? 0,
    contributionAmount: event.body.contributionAmount ?? 0,
    payments: event.body.payments ?? [],
    paymentMethod: event.body.paymentMethod ?? "direct_to_charity",
    paymentGatewayId: event.body.paymentGatewayId ?? null,
    charity: event.body.charity ?? "AMF",
    overallPublic: event.body.overallPublic ?? false,
    namePublic: event.body.namePublic ?? false,
    commentPublic: event.body.commentPublic ?? false,
    donationAmountPublic: event.body.donationAmountPublic ?? false,
  }

  // TODO: validate match funding amount against limit? or not given this is a manual entry?
  // TODO: add amount to fundraiser totalRaised, subtract amount from fundraiser matchFundingRemaining
  // TODO: do this in a transaction

  await dynamoDBDocumentClient.send(new PutCommand({
    TableName: process.env.TABLE_NAME_DONATION,
    Item: donation,
    ConditionExpression: "attribute_not_exists(id)",
  }))

  return donation.id
})
