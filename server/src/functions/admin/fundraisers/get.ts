import "source-map-support/register"
import { ScanCommand } from "@aws-sdk/lib-dynamodb"
import type { FromSchema } from "json-schema-to-ts"

import dynamoDBDocumentClient from "../../../helpers/documentClient"
import { fundraisersSchema } from "../../../helpers/schemas"
import { middyfy } from "../../../helpers/wrapper"

export const main = middyfy(null, fundraisersSchema, true, async () => {
  const r = await dynamoDBDocumentClient.send(new ScanCommand({
    TableName: process.env.TABLE_NAME_FUNDRAISER,
  }))

  return r.Items as FromSchema<typeof fundraisersSchema>
})
