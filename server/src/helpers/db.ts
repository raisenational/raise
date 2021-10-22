/* eslint-disable no-restricted-imports */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand,
} from "@aws-sdk/lib-dynamodb"
import Ajv from "ajv"
import createHttpError from "http-errors"
import type { NativeAttributeValue } from "@aws-sdk/util-dynamodb"
import type { Table } from "./tables"
import type { JSONSchema } from "./schemas"

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

export const assertMatchesSchema = <T>(schema: JSONSchema<T>, data: unknown): void => {
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

export const scan = async <S>(table: Table<S, unknown>): Promise<S[]> => {
  const result = await dbClient.send(new ScanCommand({ TableName: table.name }))
  assertMatchesSchema<S[]>({ type: "array", items: table.schema }, result.Items)
  return result.Items as S[]
}

export const query = async <S>(table: Table<S, unknown>, key: { [key: string]: NativeAttributeValue }): Promise<S[]> => {
  const entries = Object.entries(key)
  const result = await dbClient.send(new QueryCommand({
    TableName: table.name,
    KeyConditionExpression: `${entries.map(([k]) => `${k} = :${k}`).join(" AND ")}`,
    ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`:${k}`] = v
      return acc
    }, {}),
    ScanIndexForward: false, // generally we want newest items first
  }))
  assertMatchesSchema<S[]>({ type: "array", items: table.schema }, result.Items)
  return result.Items as S[]
}

export const get = async <S>(table: Table<S, unknown>, key: { [key: string]: NativeAttributeValue }): Promise<S> => {
  const result = await dbClient.send(new GetCommand({ TableName: table.name, Key: key }))
  if (!result.Item) throw new createHttpError.NotFound("Item not found")
  assertMatchesSchema<S>(table.schema, result.Item)
  return result.Item as S
}

export const insert = async <S>(table: Table<S, unknown>, data: S & { [key: string]: NativeAttributeValue }): Promise<S> => {
  assertMatchesSchema<S>(table.schema, data)
  await dbClient.send(new PutCommand({ TableName: table.name, Item: data, ConditionExpression: `attribute_not_exists(${table.pk})` }))
  return data
}

export const appendList = async <S, P extends keyof { [K in keyof S as S[K] extends unknown[] ? K : never]: S[K] } & keyof S, E extends (S[P] extends (infer _E)[] ? _E : never)>(table: Table<S, unknown>, key: { [key: string]: NativeAttributeValue }, listProperty: P, newElement: E): Promise<S> => {
  // TODO: fix type error on properties
  assertMatchesSchema<E>(table.editsSchema.properties[listProperty], newElement)

  const resultGet = await dbClient.send(new GetCommand({ TableName: table.name, Key: key }))
  if (!resultGet.Item) throw new createHttpError.NotFound("Item not found")
  assertMatchesSchema<S>(table.schema, resultGet.Item)
  const result = await dbClient.send(new UpdateCommand({
    TableName: table.name,
    Key: key,
    ConditionExpression: "id = :id", // this ensures it doesn't create a new item
    UpdateExpression: `SET ${listProperty} = list_append(${listProperty}, :newElement)`,
    ExpressionAttributeValues: {
      ":newElement": newElement,
    },
    ReturnValues: "ALL_NEW",
  }))
  return result.Attributes as S
}

export const update = async <S extends Required<E>, E>(table: Table<S, E>, key: { [key: string]: NativeAttributeValue }, edits: E & { [key: string]: NativeAttributeValue }): Promise<S> => {
  assertMatchesSchema<E>(table.editsSchema, edits)

  // type schema = S = { name: string, email: string, age: number }
  // edits: E { "name": "Adam", "email": "adam@joinraise.org" }

  // `SET ${entries.map(([k]) => `${k} = :${k}`).join(", ")}`

  // ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
  //   acc[`:${k}`] = v
  //   return acc
  // }, { ":id": key.id }),

  // "SET name = :abc, email = :def"
  // { ":abc": "Adam", ":def": "adam@joinraise.org" }

  const entries = Object.entries(edits)
  const result = await dbClient.send(new UpdateCommand({
    TableName: table.name,
    Key: key,
    ConditionExpression: "id = :id", // this ensures it doesn't create a new item
    UpdateExpression: `SET ${entries.map(([k]) => `${k} = :${k}`).join(", ")}`,
    ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`:${k}`] = v
      return acc
    }, { ":id": key.id }),
    ReturnValues: "ALL_NEW",
  }))
  assertMatchesSchema<S>(table.schema, result.Attributes)
  return result.Attributes as S
}
