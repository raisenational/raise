import {
  JSONSchema, donationSchema, fundraiserSchema, paymentSchema,
} from "./schemas"
import type {
  DonationSchema, FundraiserSchema, PaymentSchema,
} from "./schemaTypes"

export type DBAttributeValue = null | boolean | number | string | DBAttributeValue[] | { [key: string]: DBAttributeValue }

export interface Table<
  PartitionKey extends string,
  PrimaryKey extends string,
  Schema extends Record<keyof Schema, DBAttributeValue> & Key,
  Key extends Record<PartitionKey | PrimaryKey, string> = Record<PartitionKey | PrimaryKey, string>,
  _Edits extends { [K in keyof Schema]?: K extends keyof Key ? never : Schema[K] } = { [K in keyof Schema]?: K extends keyof Key ? never : Schema[K] }
  > {
  name: string,
  partitionKey: PartitionKey,
  primaryKey: PrimaryKey,
  schema: JSONSchema<Schema>,
}

export const fundraiserTable: Table<"id", "id", FundraiserSchema> = {
  name: `raise-server-${process.env.STAGE}-fundraiser`,
  partitionKey: "id",
  primaryKey: "id",
  schema: fundraiserSchema,
}

export const donationTable: Table<"fundraiserId", "id", DonationSchema> = {
  name: `raise-server-${process.env.STAGE}-donation`,
  partitionKey: "fundraiserId",
  primaryKey: "id",
  schema: donationSchema,
}

export const paymentTable: Table<"donationId", "id", PaymentSchema> = {
  name: `raise-server-${process.env.STAGE}-payment`,
  partitionKey: "donationId",
  primaryKey: "id",
  schema: paymentSchema,
}

export const tables = {
  fundraiser: fundraiserTable,
  donation: donationTable,
  payment: paymentTable,
}
