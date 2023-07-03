/* eslint-disable no-restricted-imports */
import { DynamoDBClient, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, TransactWriteCommand, TransactWriteCommandInput, TransactWriteCommandOutput, UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import Ajv from 'ajv';
import createHttpError from 'http-errors';
import type { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import type { JSONSchema7 } from 'json-schema';
import { ulid } from 'ulid';
import { fixedGroups } from '@raise/shared';
import { JSONSchema, AuditLog } from '../schemas';
import { auditLogTable, DBAttributeValue, Table } from './tables';
import { auditContext } from './auditContext';
import env from '../env/env';

const requestHandler = new NodeHttpHandler({
  connectionTimeout: 30_000,
  socketTimeout: 30_000,
});

const dynamoDBClient = env.STAGE === 'local'
  ? new DynamoDBClient({
    region: 'localhost',
    endpoint: 'http://0.0.0.0:8004',
    credentials: {
      accessKeyId: 'MockAccessKeyId',
      secretAccessKey: 'MockSecretAccessKey'
    },
    requestHandler,
  })
  : new DynamoDBClient({
    requestHandler,
  });

export const dbClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

const ajv = new Ajv({
  strict: true,
  allErrors: true,
  useDefaults: false,
  coerceTypes: false,
});

const handleDbError = <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table?: Table<Pa, Pr, S, K, E>) => async (err: unknown) => {
    if (err instanceof Error) {
      if (err.name === 'ConditionalCheckFailedException') {
        // eslint-disable-next-line no-console
        console.warn(`ConditionalCheckFailedException returned from DynamoDB${table ? ` for table ${table.entityName}` : ''}:`);
        // eslint-disable-next-line no-console
        console.warn(err);
        throw new createHttpError.Conflict(`Failed to make edits due to failed conditional expression${table ? ` on ${table.entityName}` : ''}. This is likely the result of an editing conflict. Usually, trying again or refreshing the page and trying again should work.`);
      }

      if (err.name === 'TransactionCanceledException' && (err as unknown as TransactionCanceledException).CancellationReasons?.filter((r) => r.Code !== 'None').every((r) => r.Code === 'ConditionalCheckFailed')) {
        // eslint-disable-next-line no-console
        console.warn(`TransactionCanceledException returned from DynamoDB${table ? ` for table ${table.entityName}` : ''}:`);
        // eslint-disable-next-line no-console
        console.warn(err);
        throw new createHttpError.Conflict(`Failed to make edits due to failed conditional expression${table ? ` on ${table.entityName}` : ''}. This is likely the result of an editing conflict. Usually, trying again or refreshing the page and trying again should work.`);
      }
    }

    // eslint-disable-next-line no-console
    console.error(`Database error${table ? ` for table ${table.entityName}` : ''}:`);
    // eslint-disable-next-line no-console
    console.error(err);
    throw err;
  };

export const assertMatchesSchema = <T>(schema: JSONSchema<T>, data: unknown): void => {
  const validate = ajv.compile(schema);
  if (validate(data)) return;
  const error = new createHttpError.InternalServerError('Database operations failed validation');
  error.details = validate.errors;
  throw error;
};

const normalizeGroup = (groupDefinition: string | string[] | { groupsWithAccess: string[] }): string[] => {
  if (typeof groupDefinition === 'string') return [groupDefinition];
  if (Array.isArray(groupDefinition)) return groupDefinition;
  return groupDefinition.groupsWithAccess;
};

export const normalizeGroups = (...groupDefinitions: (string | string[] | { groupsWithAccess: string[] })[]): string[] => [...new Set(groupDefinitions.map(normalizeGroup).flat())];

const overlap = (a: string[], b: string[]): boolean => a.some((v) => b.includes(v));

export const assertHasGroup = (event: { auth: { payload: { groups: string[] } } }, ...groupDefinitions: (string | string[] | { groupsWithAccess: string[] })[]): void => {
  const groups = normalizeGroups(...groupDefinitions);
  if (!overlap(event.auth.payload.groups, groups)) {
    throw new createHttpError.Forbidden(`To do this ${formatGroupError(groups, event.auth.payload.groups)}`);
  }
};

export const assertHasGroupForProperties = <B extends object>(event: { auth: { payload: { groups: string[] } }, body: B }, properties: (keyof B)[], ...groupDefinitions: (string | string[] | { groupsWithAccess: string[] })[]): void => {
  const groups = normalizeGroups(...groupDefinitions);
  if (!overlap(event.auth.payload.groups, groups)) {
    properties.forEach((p) => {
      if (p in event.body) throw new createHttpError.Forbidden(`To edit ${String(p)} ${formatGroupError(groups, event.auth.payload.groups)}`);
    });
  }
};

const formatGroupError = (required: string[], has: string[]) => {
  const fixedGroupsInverted = Object.fromEntries(Object.entries(fixedGroups).map(([name, id]) => [id, name]));
  const withFixedGroupsNames = (id: string): string => {
    const name: string | undefined = fixedGroupsInverted[id];
    return name ? `${name} (${id})` : id;
  };

  return `you need to be in one of the groups [${required.map(withFixedGroupsNames).join(', ')}], but you are in [${has.map(withFixedGroupsNames).join(', ')}]`;
};

export const checkPrevious = <I extends { [key: string]: NativeAttributeValue }>(item: I): [Partial<I>, string, { [key: string]: NativeAttributeValue }, { [key: string]: NativeAttributeValue }] => {
  const entries = Object.entries(item.previous || {}).filter(([k, v]) => item[k] && v !== undefined);

  const itemWithoutPrevious = { ...item };
  delete itemWithoutPrevious.previous;

  return [
    itemWithoutPrevious,
    entries.map(([k]) => `#${k} = :previous${k}`).join(' AND '),
    entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`:previous${k}`] = v;
      return acc;
    }, {}),
    entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k]) => {
      acc[`#${k}`] = k;
      return acc;
    }, {}),
  ];
};

export const scan = async <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>): Promise<S[]> => {
  const batches: Record<string, unknown>[][] = [];
  let key: { [key: string]: NativeAttributeValue } | undefined;
  let calls = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const result = await dbClient.send(new ScanCommand({
      TableName: table.name,
      ExclusiveStartKey: key,
    })).catch(handleDbError(table));
    batches.push(result.Items ?? []);

    if (!result.LastEvaluatedKey || Object.keys(result.LastEvaluatedKey).length === 0) break;
    key = result.LastEvaluatedKey;

    calls += 1;
    if (calls > 10) throw new createHttpError.InternalServerError(`Scan of ${table.entityName} exceeded call limit`);
  }
  const items = batches.flat(1);
  assertMatchesSchema<S[]>({ type: 'array', items: table.schema, definitions: 'definitions' in table.schema ? table.schema.definitions : undefined }, items);
  return items as S[];
};

export const query = async <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: Record<Pa, string>): Promise<S[]> => {
  const entries = Object.entries(key).filter(([, v]) => v !== undefined);
  const result = await dbClient.send(new QueryCommand({
    TableName: table.name,
    KeyConditionExpression: `${entries.map(([k]) => `#${k} = :${k}`).join(' AND ')}`,
    ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`:${k}`] = v;
      return acc;
    }, {}),
    ExpressionAttributeNames: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k]) => {
      acc[`#${k}`] = k;
      return acc;
    }, {}),
    ScanIndexForward: false, // generally we want newest items first
  })).catch(handleDbError(table));
  assertMatchesSchema<S[]>({ type: 'array', items: table.schema, definitions: 'definitions' in table.schema ? table.schema.definitions : undefined }, result.Items);
  return result.Items as S[];
};

export const get = async <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: K): Promise<S> => {
  const result = await dbClient.send(new GetCommand({ TableName: table.name, Key: key })).catch(handleDbError(table));
  if (!result.Item) throw new createHttpError.NotFound(`${table.entityName} not found`);
  assertMatchesSchema<S>(table.schema, result.Item);
  return result.Item as S;
};

export type AuditDefinition = { action: AuditLog['action'], object?: AuditLog['object'], metadata?: AuditLog['metadata'] };

export const insertAudit = async (auditDefinition: AuditDefinition): Promise<void> => {
  const id = ulid();
  try {
    if (auditContext.value === undefined) throw new Error('auditContext is undefined');

    const Item: AuditLog = {
      id,
      object: auditDefinition.object ?? id,
      subject: auditContext.value.subject,
      action: auditDefinition.action,
      at: Math.floor(new Date().getTime() / 1000),
      sourceIp: auditContext.value.sourceIp,
      userAgent: auditContext.value.userAgent,
      routeRaw: auditContext.value.routeRaw,
      metadata: auditDefinition.metadata ?? {},
      ttl: null,
    };

    await dbClient.send(new PutCommand({
      TableName: auditLogTable.name,
      Item,
      ConditionExpression: `attribute_not_exists(#${auditLogTable.primaryKey})`,
      ExpressionAttributeNames: {
        [`#${auditLogTable.primaryKey}`]: auditLogTable.primaryKey,
      },
    })).catch(handleDbError(auditLogTable));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to store audit log:', auditDefinition);
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

export const insert = async <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, data: S, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): Promise<S> => {
  assertMatchesSchema<S>(table.schema, data);
  await dbClient.send(new PutCommand({
    TableName: table.name,
    Item: data,
    ConditionExpression: `attribute_not_exists(#${table.primaryKey})${extraConditionExpression ? ` AND ${extraConditionExpression}` : ''}`,
    ExpressionAttributeValues: extraAttributeValues,
    ExpressionAttributeNames: {
      [`#${table.primaryKey}`]: table.primaryKey,
      ...extraAttributeNames,
    },
  })).catch(handleDbError(table));

  await insertAudit({
    object: data[table.primaryKey],
    action: 'create',
    metadata: {
      tableName: table.entityName,
      data,
    },
  });
  return data;
};

export type AWSTransactionDefinition = NonNullable<TransactWriteCommandInput['TransactItems']>[number];

export const insertT = <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, data: S, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): { tDef: AWSTransactionDefinition, auditDef: AuditDefinition } => {
  const tDef: AWSTransactionDefinition = {
    Put: {
      TableName: table.name,
      Item: data,
      ConditionExpression: `attribute_not_exists(#${table.primaryKey})${extraConditionExpression ? ` AND ${extraConditionExpression}` : ''}`,
      ExpressionAttributeValues: extraAttributeValues,
      ExpressionAttributeNames: {
        [`#${table.primaryKey}`]: table.primaryKey,
        ...extraAttributeNames,
      },
    },
  };
  const auditDef: AuditDefinition = {
    action: 'create',
    object: data[table.primaryKey],
    metadata: { tableName: table.entityName, data: data as AuditLog['metadata'] },
  };
  return { tDef, auditDef };
};

export const plusT = <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: K, data: E, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): { tDef: AWSTransactionDefinition, auditDef: AuditDefinition } => {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  const tDef: AWSTransactionDefinition = {
    Update: {
      TableName: table.name,
      Key: key,
      ConditionExpression: `#${table.primaryKey} = :${table.primaryKey}${extraConditionExpression ? ` AND ${extraConditionExpression}` : ''}`, // primaryKey check ensures we don't create a new item
      UpdateExpression: `SET ${entries.map(([k, v]) => (typeof v === 'number' ? `#${k} = #${k} + :${k}` : `#${k} = :${k}`)).join(', ')}`,
      ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
        acc[`:${k}`] = v;
        return acc;
      }, {
        [`:${table.primaryKey}`]: key[table.primaryKey],
        ...extraAttributeValues,
      }),
      ExpressionAttributeNames: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k]) => {
        acc[`#${k}`] = k;
        return acc;
      }, {
        [`#${table.primaryKey}`]: table.primaryKey,
        ...extraAttributeNames,
      }),
    },
  };
  const auditDef: AuditDefinition = {
    action: 'plus',
    object: key[table.primaryKey],
    metadata: { tableName: table.entityName, data: data as AuditLog['metadata'] },
  };

  return { tDef, auditDef };
};

export const updateT = <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: K, data: E, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): { tDef: AWSTransactionDefinition, auditDef: AuditDefinition } => {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  const tDef: AWSTransactionDefinition = {
    Update: {
      TableName: table.name,
      Key: key,
      ConditionExpression: `#${table.primaryKey} = :${table.primaryKey}${extraConditionExpression ? ` AND ${extraConditionExpression}` : ''}`, // primaryKey check ensures we don't create a new item
      UpdateExpression: `SET ${entries.map(([k]) => `#${k} = :${k}`).join(', ')}`,
      ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
        acc[`:${k}`] = v;
        return acc;
      }, {
        [`:${table.primaryKey}`]: key[table.primaryKey],
        ...extraAttributeValues,
      }),
      ExpressionAttributeNames: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k]) => {
        acc[`#${k}`] = k;
        return acc;
      }, {
        [`#${table.primaryKey}`]: table.primaryKey,
        ...extraAttributeNames,
      }),
    },
  };
  const auditDef: AuditDefinition = {
    action: 'edit',
    object: key[table.primaryKey],
    metadata: { tableName: table.entityName, data: data as AuditLog['metadata'] },
  };

  return { tDef, auditDef };
};

export const inTransaction = async (args: { tDef: AWSTransactionDefinition, auditDef: AuditDefinition }[]): Promise<TransactWriteCommandOutput> => {
  const input = { TransactItems: args.map((a) => a.tDef) };
  const result = await dbClient.send(new TransactWriteCommand(input)).catch(handleDbError());
  await Promise.all(args.map((a) => insertAudit(a.auditDef)));
  return result;
};

export const appendList = async <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  P extends keyof { [_K in keyof S as S[_K] extends unknown[] ? _K : never]: S[_K] } & keyof S & string,
  I extends (S[P] extends (infer _I)[] ? _I : never),
>(table: Table<Pa, Pr, S, K, E>, key: K, listProperty: P, newItem: I, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): Promise<S> => {
  assertMatchesSchema<E>((table.schema as Required<Pick<JSONSchema7, 'properties'>>).properties[listProperty], [newItem]);
  const result = await dbClient.send(new UpdateCommand({
    TableName: table.name,
    Key: key,
    ConditionExpression: `#${table.primaryKey} = :${table.primaryKey}${extraConditionExpression ? ` AND ${extraConditionExpression}` : ''}`, // primaryKey check ensures we don't create a new item
    UpdateExpression: `SET #${listProperty} = list_append(#${listProperty}, :newItems)`,
    ExpressionAttributeValues: {
      ':newItems': [newItem],
      [`:${table.primaryKey}`]: key[table.primaryKey],
      ...extraAttributeValues,
    },
    ExpressionAttributeNames: {
      [`#${table.primaryKey}`]: table.primaryKey,
      [`#${listProperty}`]: listProperty,
      ...extraAttributeNames,
    },
    ReturnValues: 'ALL_NEW',
  })).catch(handleDbError(table));
  await insertAudit({
    object: key[table.primaryKey],
    action: 'plus',
    metadata: {
      tableName: table.entityName,
      property: listProperty,
      data: newItem as AuditLog['metadata'],
    },
  });
  return result.Attributes as S;
};

export const update = async <
  Pa extends string,
  Pr extends string,
  S extends { [K in keyof S]: DBAttributeValue } & K,
  K extends Record<Pa | Pr, string>,
  E extends { [_K in keyof S]?: _K extends keyof K ? never : S[_K] },
  >(table: Table<Pa, Pr, S, K, E>, key: K, edits: E, extraConditionExpression?: string, extraAttributeValues?: { [key: string]: NativeAttributeValue }, extraAttributeNames?: { [key: string]: NativeAttributeValue }): Promise<S> => {
  assertMatchesSchema<E>({ ...table.schema as Record<string, unknown>, required: [] }, edits);

  const entries = Object.entries(edits).filter(([, v]) => v !== undefined);
  const result = await dbClient.send(new UpdateCommand({
    TableName: table.name,
    Key: key,
    ConditionExpression: `#${table.primaryKey} = :${table.primaryKey}${extraConditionExpression ? ` AND ${extraConditionExpression}` : ''}`, // primaryKey check ensures we don't create a new item
    UpdateExpression: `SET ${entries.map(([k]) => `#${k} = :${k}`).join(', ')}`,
    ExpressionAttributeValues: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k, v]) => {
      acc[`:${k}`] = v;
      return acc;
    }, {
      [`:${table.primaryKey}`]: key[table.primaryKey],
      ...extraAttributeValues,
    }),
    ExpressionAttributeNames: entries.reduce<{ [key: string]: NativeAttributeValue }>((acc, [k]) => {
      acc[`#${k}`] = k;
      return acc;
    }, {
      [`#${table.primaryKey}`]: table.primaryKey,
      ...extraAttributeNames,
    }),
    ReturnValues: 'ALL_NEW',
  })).catch(handleDbError(table));
  await insertAudit({
    action: 'edit',
    object: key[table.primaryKey],
    metadata: { tableName: table.entityName, data: edits as AuditLog['metadata'] },
  });
  assertMatchesSchema<S>(table.schema, result.Attributes);
  return result.Attributes as S;
};
