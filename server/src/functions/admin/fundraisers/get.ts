import 'source-map-support/register';
import { middyfy } from '../../../helpers/wrapper';

export const main = middyfy(async (event) => {
  return [
    {
      id: '01FGNSHH6X6X878ZNBZKY44JQA',
      name: 'Raise Demo',
      activeFrom: 1632780000,
      activeTo: undefined,
      paused: false,
      goal: 1234_56,
      totalRaised: 480_00,
      donationsCount: 2,
      matchFundingRate: 1_00,
      matchFundingPerDonationLimit: 150_00,
      matchFundingRemaining: undefined,
      minimumDonationAmount: undefined,
      groupsWithAccess: ['National'],
    },
  ]
});
