/* eslint-disable no-restricted-imports */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand,
} from "@aws-sdk/lib-dynamodb"
import Ajv from "ajv"
import createHttpError from "http-errors"
import type { NativeAttributeValue } from "@aws-sdk/util-dynamodb"
import type { FromSchema, JSONSchema } from "json-schema-to-ts"

const dynamoDBClient = process.env.IS_OFFLINE
  ? new DynamoDBClient({ region: "localhost", endpoint: "http://localhost:8004", credentials: { accessKeyId: "DEFAULT_ACCESS_KEY", secretAccessKey: "DEFAULT_SECRET" } })
  : new DynamoDBClient({})

export const dbClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
})

const ajv = new Ajv({
  strict: true,
  allErrors: true,
  useDefaults: false,
  coerceTypes: false,
})

export const assertMatchesSchema = (schema: JSONSchema, data: unknown): void => {
  const validate = ajv.compile(schema)
  if (validate(data)) return
  const error = new createHttpError.InternalServerError("Database operations failed validation")
  error.details = validate.errors
  throw error
}

export const assertHasGroup = (event: { auth: { payload: { groups: string[] } } }, subject: { groupsWithAccess: string[] }): void => {
  if (!event.auth.payload.groups.some((g) => subject.groupsWithAccess.includes(g))) {
    throw new createHttpError.Forbidden(`This endpoint requires you to be in one of the groups [${subject.groupsWithAccess.join(", ")}] but you are in [${event.auth.payload.groups.join(", ")}]`)
  }
}

// TODO: I think it'd be really nice if we built information about tables into the TS source, rather than environment variables. This could also allow us to do clever stuff e.g. passing in an object representing a table, and not having to provide potentially incorrect schema - and validating keys are correct for the table, improving error messaging etc. It would also mean we wouldn't have to make non-checked assumptions e.g. that there the PK is always 'id'

export const scan = async <T extends JSONSchema>(tableName: string, schema: T): Promise<FromSchema<T>> => {
  const result = await dbClient.send(new ScanCommand({ TableName: tableName }))
  assertMatchesSchema(schema, result.Items)
  return result.Items as FromSchema<T>
}

export const query = async <T extends JSONSchema>(tableName: string, schema: T, key: { [key: string]: NativeAttributeValue }): Promise<FromSchema<T>> => {
  const entries = Object.entries(key)
  const result = await dbClient.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: `${entries.map(([k]) => `${k} = :${k}`).join(" AND ")}`,
    ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`:${k}`] = v
      return acc
    }, {}),
  }))
  assertMatchesSchema(schema, result.Items)
  return result.Items as FromSchema<T>
}

export const get = async <T extends JSONSchema>(tableName: string, schema: T, key: { [key: string]: NativeAttributeValue }): Promise<FromSchema<T>> => {
  const result = await dbClient.send(new GetCommand({ TableName: tableName, Key: key }))
  if (!result.Item) throw new createHttpError.NotFound("Item not found")
  assertMatchesSchema(schema, result.Item)
  return result.Item as FromSchema<T>
}

export const insert = async <T extends JSONSchema>(tableName: string, schema: T, data: FromSchema<T> & { [key: string]: NativeAttributeValue }): Promise<FromSchema<T>> => {
  assertMatchesSchema(schema, data)
  await dbClient.send(new PutCommand({ TableName: tableName, Item: data, ConditionExpression: "attribute_not_exists(id)" }))
  return data
}

export const update = async <T extends JSONSchema>(tableName: string, schema: T, key: { [key: string]: NativeAttributeValue }, data: FromSchema<T> & { [key: string]: NativeAttributeValue }): Promise<FromSchema<T>> => {
  assertMatchesSchema(schema, data)

  const entries = Object.entries(data)
  await dbClient.send(new UpdateCommand({
    TableName: tableName,
    Key: key,
    ConditionExpression: "id = :id", // this ensures it doesn't create a new item
    UpdateExpression: `SET ${entries.map(([k]) => `${k} = :${k}`).join(", ")}`,
    ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`:${k}`] = v
      return acc
    }, { ":id": key.id }),
  }))

  return data
}
