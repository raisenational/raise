import "source-map-support/register"
import createHttpError from "http-errors"
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import type { FromSchema } from "json-schema-to-ts"
import { middyfy } from "../../../../../helpers/wrapper"
import { donationsSchema, fundraiserSchema } from "../../../../../helpers/schemas"
import dynamoDBDocumentClient from "../../../../../helpers/documentClient"

export const main = middyfy(null, donationsSchema, true, async (event) => {
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

  const r = await dynamoDBDocumentClient.send(new QueryCommand({
    TableName: process.env.TABLE_NAME_DONATION,
    KeyConditionExpression: "fundraiserId = :fundraiserId",
    ExpressionAttributeValues: {
      ":fundraiserId": event.pathParameters.fundraiserId,
    },
  }))

  return r.Items as FromSchema<typeof donationsSchema>
})
