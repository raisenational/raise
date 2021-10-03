import "source-map-support/register"
import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { ulid } from "ulid"
import type { FromSchema } from "json-schema-to-ts"
import { middyfy } from "../../../helpers/wrapper"
import { fundraiserEditsSchema, fundraiserSchema, ulid as ulidSchema } from "../../../helpers/schemas"
import dynamoDBDocumentClient from "../../../helpers/documentClient"

export const main = middyfy(fundraiserEditsSchema, ulidSchema, true, async (event) => {
  const fundraiser: FromSchema<typeof fundraiserSchema> = {
    id: ulid(),
    name: event.body.name ?? "New Fundraiser",
    activeFrom: event.body.activeFrom ?? new Date().getTime() / 1000,
    activeTo: event.body.activeTo ?? null,
    paused: event.body.paused ?? false,
    goal: event.body.goal ?? 1_00,
    totalRaised: event.body.totalRaised ?? 0,
    donationsCount: event.body.donationsCount ?? 0,
    matchFundingRate: event.body.matchFundingRate ?? 0,
    matchFundingPerDonationLimit: event.body.matchFundingPerDonationLimit ?? null,
    matchFundingRemaining: event.body.matchFundingRemaining ?? null,
    minimumDonationAmount: event.body.minimumDonationAmount ?? null,
    groupsWithAccess: event.body.groupsWithAccess ?? ["National"], // TODO: use user's group
  }

  await dynamoDBDocumentClient.send(new PutCommand({
    TableName: process.env.TABLE_NAME_FUNDRAISER,
    Item: fundraiser,
    ConditionExpression: "attribute_not_exists(id)",
  }))

  return fundraiser.id
})
