import 'source-map-support/register';
import * as Joi from '@hapi/joi'
import type JoiExtractType from 'joi-extract-type';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

import dynamoDBDocumentClient from '../../../helpers/documentClient';
import { fundraisersSchema } from '../../../helpers/schemas';
import { middyfy } from '../../../helpers/wrapper';

export const main = middyfy<undefined, typeof fundraisersSchema>(undefined, fundraisersSchema, async (event) => {
  const r = await dynamoDBDocumentClient.send(new ScanCommand({
    TableName: process.env.TABLE_NAME_DONATION,
  }))

  return Joi.attempt([], fundraisersSchema) as Joi.extractType<typeof fundraisersSchema>;

  // return [
  //   {
  //     id: '01FGNSHH6X6X878ZNBZKY44JQA',
  //     name: 'Raise Demo',
  //     activeFrom: 1632780000,
  //     activeTo: undefined,
  //     paused: false,
  //     goal: 1234_56,
  //     totalRaised: 480_00,
  //     donationsCount: 2,
  //     matchFundingRate: 1_00,
  //     matchFundingPerDonationLimit: 150_00,
  //     matchFundingRemaining: undefined,
  //     minimumDonationAmount: undefined,
  //     groupsWithAccess: ['National'],
  //   },
  // ]
});
