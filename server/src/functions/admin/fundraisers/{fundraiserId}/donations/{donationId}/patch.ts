import "source-map-support/register"
import { GetCommand, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb"
import createHttpError from "http-errors"
import type { FromSchema } from "json-schema-to-ts"
import { middyfy } from "../../../../../../helpers/wrapper"
import { donationEditsSchema, donationSchema, fundraiserSchema } from "../../../../../../helpers/schemas"
import dynamoDBDocumentClient from "../../../../../../helpers/documentClient"

export const main = middyfy(donationEditsSchema, null, true, async (event) => {
  if (!event.pathParameters || !(typeof event.pathParameters.fundraiserId === "string")) {
    throw new createHttpError.BadRequest("Missing fundraiserId")
  }

  if (!event.pathParameters || !(typeof event.pathParameters.donationId === "string")) {
    throw new createHttpError.BadRequest("Missing donationId")
  }

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

  const current = (await dynamoDBDocumentClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME_DONATION,
    Key: {
      fundraiserId: event.pathParameters.fundraiserId,
      id: event.pathParameters.donationId,
    },
  }))).Item as FromSchema<typeof donationSchema> | undefined

  if (!current) {
    throw new createHttpError.NotFound(`Donation with id ${event.pathParameters.fundraiserId}/${event.pathParameters.donationId} not found`)
  }

  // TODO: consider restricting editing gift-aided, amounts, at, payment method, payments, payment ref to national team?
  // TODO: validate match funding amount against limit? or not given this is a manual entry?
  // TODO: validate gift-aid requirements

  const entries = Object.entries(event.body)
  await dynamoDBDocumentClient.send(new UpdateCommand({
    TableName: process.env.TABLE_NAME_DONATION,
    Key: {
      fundraiserId: event.pathParameters.fundraiserId,
      id: event.pathParameters.donationId,
    },
    UpdateExpression: `SET ${entries.map(([k]) => `${k} = :${k}`).join(", ")}`,
    ExpressionAttributeValues: entries.reduce<NonNullable<UpdateCommandInput["ExpressionAttributeValues"]>>((acc, [k, v]) => {
      acc[`:${k}`] = v
      return acc
    }, {}),
  }))

  // TODO: add audit log?
})
