import {
  JSONSchema,
  $Donation, Donation,
  $Fundraiser, Fundraiser,
  $Payment, Payment,
  $AuditLog, AuditLog,
  $Group, Group,
  $User, User,
} from '../schemas';
import env from '../env/env';

export type DBAttributeValue = null | boolean | number | string | DBAttributeValue[] | { [key: string]: DBAttributeValue };

export interface Table<
  PartitionKey extends string,
  PrimaryKey extends string,
  Schema extends { [K in keyof Schema]: DBAttributeValue } & Key,
  Key extends Record<PartitionKey | PrimaryKey, string> = Record<PartitionKey | PrimaryKey, string>,
  // TODO: consider moving this logic to the db types, rather than table type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Edits extends { [K in keyof Schema]?: K extends keyof Key ? never : Schema[K] } = { [K in keyof Schema]?: K extends keyof Key ? never : Schema[K] },
  > {
  name: string,
  entityName: string,
  partitionKey: PartitionKey,
  primaryKey: PrimaryKey,
  schema: JSONSchema<Schema>,
}

export const fundraiserTable: Table<'id', 'id', Fundraiser> = {
  name: `raise-server-${env.STAGE}-fundraiser`,
  entityName: 'fundraiser',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Fundraiser,
};

export const donationTable: Table<'fundraiserId', 'id', Donation> = {
  name: `raise-server-${env.STAGE}-donation`,
  entityName: 'donation',
  partitionKey: 'fundraiserId',
  primaryKey: 'id',
  schema: $Donation,
};

export const paymentTable: Table<'donationId', 'id', Payment> = {
  name: `raise-server-${env.STAGE}-payment`,
  entityName: 'payment',
  partitionKey: 'donationId',
  primaryKey: 'id',
  schema: $Payment,
};

export const auditLogTable: Table<'object', 'id', AuditLog> = {
  name: `raise-server-${env.STAGE}-audit-log`,
  entityName: 'auditLog',
  partitionKey: 'object',
  primaryKey: 'id',
  schema: $AuditLog,
};

export const groupTable: Table<'id', 'id', Group> = {
  name: `raise-server-${env.STAGE}-group`,
  entityName: 'group',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Group,
};

export const userTable: Table<'id', 'id', User> = {
  name: `raise-server-${env.STAGE}-user`,
  entityName: 'user',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $User,
};

export const tables = {
  fundraiser: fundraiserTable,
  donation: donationTable,
  payment: paymentTable,
  auditLog: auditLogTable,
  group: groupTable,
  user: userTable,
};
