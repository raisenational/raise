import {
  JSONSchema,
  $Donation, Donation,
  $Fundraiser, Fundraiser,
  $Payment, Payment,
  $AuditLog, AuditLog,
} from "../schemas"
import env from "../env/env"

export type DBAttributeValue = null | boolean | number | string | DBAttributeValue[] | { [key: string]: DBAttributeValue }

export interface Table<
  PartitionKey extends string,
  PrimaryKey extends string,
  Schema extends { [K in keyof Schema]: DBAttributeValue } & Key,
  Key extends Record<PartitionKey | PrimaryKey, string> = Record<PartitionKey | PrimaryKey, string>,
  _Edits extends { [K in keyof Schema]?: K extends keyof Key ? never : Schema[K] } = { [K in keyof Schema]?: K extends keyof Key ? never : Schema[K] }
  > {
  name: string,
  entityName: string,
  partitionKey: PartitionKey,
  primaryKey: PrimaryKey,
  schema: JSONSchema<Schema>,
}

export const fundraiserTable: Table<"id", "id", Fundraiser> = {
  name: `raise-server-${env.STAGE}-fundraiser`,
  entityName: "fundraiser",
  partitionKey: "id",
  primaryKey: "id",
  schema: $Fundraiser,
}

export const donationTable: Table<"fundraiserId", "id", Donation> = {
  name: `raise-server-${env.STAGE}-donation`,
  entityName: "donation",
  partitionKey: "fundraiserId",
  primaryKey: "id",
  schema: $Donation,
}

export const paymentTable: Table<"donationId", "id", Payment> = {
  name: `raise-server-${env.STAGE}-payment`,
  entityName: "payment",
  partitionKey: "donationId",
  primaryKey: "id",
  schema: $Payment,
}

export const auditLogTable: Table<"object", "id", AuditLog> = {
  name: `raise-server-${env.STAGE}-audit-log`,
  entityName: "auditLog",
  partitionKey: "object",
  primaryKey: "id",
  schema: $AuditLog,
}

export const tables = {
  fundraiser: fundraiserTable,
  donation: donationTable,
  payment: paymentTable,
  auditLog: auditLogTable,
}
