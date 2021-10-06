import "source-map-support/register"
import { GetCommand, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb"
import createHttpError from "http-errors"
import type { FromSchema } from "json-schema-to-ts"
import { middyfy } from "../../../../helpers/wrapper"
import { fundraiserEditsSchema, fundraiserSchema } from "../../../../helpers/schemas"
import dynamoDBDocumentClient from "../../../../helpers/documentClient"

export const main = middyfy(fundraiserEditsSchema, null, true, async (event) => {
  if (!event.pathParameters || !(typeof event.pathParameters.fundraiserId === "string")) {
    throw new createHttpError.BadRequest("Missing fundraiserId")
  }

  const current = (await dynamoDBDocumentClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME_FUNDRAISER,
    Key: {
      id: event.pathParameters.fundraiserId,
    },
  }))).Item as FromSchema<typeof fundraiserSchema> | undefined

  if (!current) {
    throw new createHttpError.NotFound(`Fundraiser with id ${event.pathParameters.fundraiserId} not found`)
  }

  if (!event.auth.payload.groups.some((g) => current.groupsWithAccess.includes(g))) {
    throw new createHttpError.Forbidden(`Fundraiser requires you to be in one of the groups [${current.groupsWithAccess.join(", ")}] but you are in [${event.auth.payload.groups.join(", ")}]`)
  }

  // TODO: consider restricting editing totalRaised and donationsCount to national team?
  // TODO: require the fundraiser to be paused when editing totalRaised and donationsCount? (or at least require checks on previous value?)

  const entries = Object.entries(event.body)
  await dynamoDBDocumentClient.send(new UpdateCommand({
    TableName: process.env.TABLE_NAME_FUNDRAISER,
    Key: {
      id: event.pathParameters.fundraiserId,
    },
    UpdateExpression: `SET ${entries.map(([k]) => `${k} = :${k}`).join(", ")}`,
    ExpressionAttributeValues: entries.reduce<NonNullable<UpdateCommandInput["ExpressionAttributeValues"]>>((acc, [k, v]) => {
      acc[`:${k}`] = v
      return acc
    }, {}),
  }))

  // TODO: add audit log?
})
