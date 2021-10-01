import 'source-map-support/register';
import * as Joi from '@hapi/joi'
import type JoiExtractType from 'joi-extract-type';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

import dynamoDBDocumentClient from '../../../helpers/documentClient';
import { fundraisersSchema } from '../../../helpers/schemas';
import { middyfy } from '../../../helpers/wrapper';

export const main = middyfy<undefined, typeof fundraisersSchema>(undefined, fundraisersSchema, async (event) => {
  const r = await dynamoDBDocumentClient.send(new ScanCommand({
    TableName: process.env.TABLE_NAME_FUNDRAISER,
  }))

  return Joi.attempt(r.Items, fundraisersSchema) as Joi.extractType<typeof fundraisersSchema>;
});
