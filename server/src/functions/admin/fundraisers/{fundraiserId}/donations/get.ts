import "source-map-support/register"
import createError from "http-errors"
import { QueryCommand } from "@aws-sdk/lib-dynamodb"
import type { FromSchema } from "json-schema-to-ts"
import { middyfy } from "../../../../../helpers/wrapper"
import { donationsSchema } from "../../../../../helpers/schemas"
import dynamoDBDocumentClient from "../../../../../helpers/documentClient"

export const main = middyfy(null, donationsSchema, true, async (event) => {
  if (!event.pathParameters || !(typeof event.pathParameters.fundraiserId === "string")) throw new createError.BadRequest("Missing fundraiserId")

  const r = await dynamoDBDocumentClient.send(new QueryCommand({
    TableName: process.env.TABLE_NAME_DONATION,
    KeyConditionExpression: "fundraiserId = :fundraiserId",
    ExpressionAttributeValues: {
      ":fundraiserId": event.pathParameters.fundraiserId,
    },
  }))

  return r.Items as FromSchema<typeof donationsSchema>
})
