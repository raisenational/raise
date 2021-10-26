/* eslint-disable no-restricted-imports */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, TransactWriteCommand, TransactWriteCommandInput, TransactWriteCommandOutput, UpdateCommand,
} from "@aws-sdk/lib-dynamodb"
import Ajv from "ajv"
import createHttpError from "http-errors"
import type { NativeAttributeValue } from "@aws-sdk/util-dynamodb"
import type { JSONSchema7 } from "json-schema"
import type { DBAttributeValue, Table } from "./tables"
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

export const scan = async <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>): Promise<S[]> => {
  const result = await dbClient.send(new ScanCommand({ TableName: table.name }))
  assertMatchesSchema<S[]>({ type: "array", items: table.schema }, result.Items)
  return result.Items as S[]
}

export const query = async <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: Record<Pa, string>): Promise<S[]> => {
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

export const get = async <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: K): Promise<S> => {
  const result = await dbClient.send(new GetCommand({ TableName: table.name, Key: key }))
  if (!result.Item) throw new createHttpError.NotFound(`${table.entityName} not found`)
  assertMatchesSchema<S>(table.schema, result.Item)
  return result.Item as S
}

export const insert = async <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, data: S, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): Promise<S> => {
  assertMatchesSchema<S>(table.schema, data)
  await dbClient.send(new PutCommand({
    TableName: table.name,
    Item: data,
    ConditionExpression: `attribute_not_exists(#${table.primaryKey})${extraConditionExpression ? ` AND ${extraConditionExpression}` : ""}`,
    ExpressionAttributeValues: extraAttributeValues,
    ExpressionAttributeNames: {
      [`#${table.primaryKey}`]: table.primaryKey,
      ...extraAttributeNames,
    },
  }))
  return data
}

type AWSTransactionDefinition = NonNullable<TransactWriteCommandInput["TransactItems"]>[number]

export const insertT = <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, data: S, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): AWSTransactionDefinition => {
  const tdef: AWSTransactionDefinition = {
    Put: {
      TableName: table.name,
      Item: data,
      ConditionExpression: `attribute_not_exists(#${table.primaryKey})${extraConditionExpression ? ` AND ${extraConditionExpression}` : ""}`,
      ExpressionAttributeValues: extraAttributeValues,
      ExpressionAttributeNames: {
        [`#${table.primaryKey}`]: table.primaryKey,
        ...extraAttributeNames,
      },
    },
  }
  return tdef
}

export const plusT = <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: K, data: E, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): AWSTransactionDefinition => {
  const entries = Object.entries(data)
  const tdef: AWSTransactionDefinition = {
    Update: {
      TableName: table.name,
      Key: key,
      ConditionExpression: `#${table.primaryKey} = :${table.primaryKey}${extraConditionExpression ? ` AND ${extraConditionExpression}` : ""}`, // primaryKey check ensures we don't create a new item
      UpdateExpression: `SET ${entries.map(([k]) => `#${k} = #${k} + :${k}`).join(", ")}`,
      ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
        acc[`:${k}`] = v
        return acc
      }, {
        [`:${table.primaryKey}`]: key[table.primaryKey],
        ...extraAttributeValues,
      }),
      ExpressionAttributeNames: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
        acc[`#${k}`] = k
        return acc
      }, {
        [`#${table.primaryKey}`]: table.primaryKey,
        ...extraAttributeNames,
      }),
    },
  }
  return tdef
}

export const updateT = <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: K, data: E, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): AWSTransactionDefinition => {
  const entries = Object.entries(data)
  const tdef: AWSTransactionDefinition = {
    Update: {
      TableName: table.name,
      Key: key,
      ConditionExpression: `#${table.primaryKey} = :${table.primaryKey}${extraConditionExpression ? ` AND ${extraConditionExpression}` : ""}`, // primaryKey check ensures we don't create a new item
      UpdateExpression: `SET ${entries.map(([k]) => `#${k} = :${k}`).join(", ")}`,
      ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
        acc[`:${k}`] = v
        return acc
      }, {
        [`:${table.primaryKey}`]: key[table.primaryKey],
        ...extraAttributeValues,
      }),
      ExpressionAttributeNames: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
        acc[`#${k}`] = k
        return acc
      }, {
        [`#${table.primaryKey}`]: table.primaryKey,
        ...extraAttributeNames,
      }),
    },
  }
  return tdef
}

export const inTransaction = async (args: AWSTransactionDefinition[]): Promise<TransactWriteCommandOutput> => {
  const input = { TransactItems: args }
  const result = await dbClient.send(new TransactWriteCommand(input))
  return result
}

export const appendList = async <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  P extends keyof { [_K in keyof S as S[_K] extends unknown[] ? _K : never]: S[_K] } & keyof S,
  I extends (S[P] extends (infer _I)[] ? _I : never)
>(table: Table<Pa, Pr, S, K, E>, key: K, listProperty: P, newItem: I, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): Promise<S> => {
  assertMatchesSchema<E>((table.schema as Required<Pick<JSONSchema7, "properties">>).properties[listProperty], [newItem])

  // TODO: do we actually need to check the item exists? we'll probably get an error or lack of Attributes back if it doesn't, maybe check that instead to reduce db accesses.
  const resultGet = await dbClient.send(new GetCommand({ TableName: table.name, Key: key }))
  if (!resultGet.Item) throw new createHttpError.NotFound(`${table.entityName} not found`)

  assertMatchesSchema<S>(table.schema, resultGet.Item)
  const result = await dbClient.send(new UpdateCommand({
    TableName: table.name,
    Key: key,
    ConditionExpression: `#${table.primaryKey} = :${table.primaryKey}${extraConditionExpression ? ` AND ${extraConditionExpression}` : ""}`, // primaryKey check ensures we don't create a new item
    UpdateExpression: `SET #${listProperty} = list_append(#${listProperty}, :newItems)`,
    ExpressionAttributeValues: {
      ":newItems": [newItem],
      [`:${table.primaryKey}`]: key[table.primaryKey],
      ...extraAttributeValues,
    },
    ExpressionAttributeNames: {
      [`#${table.primaryKey}`]: table.primaryKey,
      [`#${listProperty}`]: listProperty,
      ...extraAttributeNames,
    },
    ReturnValues: "ALL_NEW",
  }))
  // TODO: assert matches schema here
  return result.Attributes as S
}

export const update = async <
  Pa extends string,
  Pr extends string,
  S extends Record<keyof S, DBAttributeValue> & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: K, edits: E, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): Promise<S> => {
  assertMatchesSchema<E>({ ...table.schema as Record<string, unknown>, required: [] }, edits)

  const entries = Object.entries(edits)
  const result = await dbClient.send(new UpdateCommand({
    TableName: table.name,
    Key: key,
    ConditionExpression: `#${table.primaryKey} = :${table.primaryKey}${extraConditionExpression ? ` AND ${extraConditionExpression}` : ""}`, // primaryKey check ensures we don't create a new item
    UpdateExpression: `SET ${entries.map(([k]) => `#${k} = :${k}`).join(", ")}`,
    ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`:${k}`] = v
      return acc
    }, {
      [`:${table.primaryKey}`]: key[table.primaryKey],
      ...extraAttributeValues,
    }),
    ExpressionAttributeNames: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`#${k}`] = k
      return acc
    }, {
      [`#${table.primaryKey}`]: table.primaryKey,
      ...extraAttributeNames,
    }),
    ReturnValues: "ALL_NEW",
  }))
  assertMatchesSchema<S>(table.schema, result.Attributes)
  return result.Attributes as S
}
