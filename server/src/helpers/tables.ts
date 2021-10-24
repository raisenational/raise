import type { NativeAttributeValue } from "@aws-sdk/util-dynamodb"
import {
  JSONSchema, donationSchema, fundraiserSchema, fundraiserEditsSchema, donationEditsSchema, paymentSchema, paymentEditsSchema,
} from "./schemas"
import {
  DonationEditsSchema, DonationSchema, FundraiserEditsSchema, FundraiserSchema, PaymentEditsSchema, PaymentSchema,
} from "./schemaTypes"

export interface Table<Schema extends Required<EditsSchema>, EditsSchema extends { [key: string]: NativeAttributeValue }> {
  name: string,
  pk: string,
  sk?: string,
  schema: JSONSchema<Schema>,
  editsSchema: JSONSchema<EditsSchema>,
}

export const fundraiserTable: Table<FundraiserSchema, FundraiserEditsSchema> = {
  name: `raise-server-${process.env.STAGE}-fundraiser`,
  pk: "id",
  schema: fundraiserSchema,
  editsSchema: fundraiserEditsSchema,
}

export const donationTable: Table<DonationSchema, DonationEditsSchema> = {
  name: `raise-server-${process.env.STAGE}-donation`,
  pk: "fundraiserId",
  sk: "id",
  schema: donationSchema,
  editsSchema: donationEditsSchema,
}

export const paymentTable: Table<PaymentSchema, PaymentEditsSchema> = {
  name: `raise-server-${process.env.STAGE}-payment`,
  pk: "donationId",
  sk: "id",
  schema: paymentSchema,
  editsSchema: paymentEditsSchema,
}

export const tables = {
  fundraiser: fundraiserTable,
  donation: donationTable,
  payment: paymentTable,
}
