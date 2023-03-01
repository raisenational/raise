import { fixedGroups } from '@raise/shared';
import createHttpError from 'http-errors';
import { middyfy } from '../../../../helpers/wrapper';
import {
  assertHasGroup, assertHasGroupForProperties, checkPrevious, get, query, update,
} from '../../../../helpers/db';
import { donationTable, fundraiserTable } from '../../../../helpers/tables';
import { $FundraiserEdits } from '../../../../schemas';

export const main = middyfy($FundraiserEdits, null, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }), fixedGroups.National);
  assertHasGroupForProperties(event, ['currency', 'matchFundingRate', 'matchFundingPerDonationLimit', 'matchFundingRemaining', 'groupsWithAccess'], fixedGroups.National);
  assertHasGroupForProperties(event, ['totalRaised', 'donationsCount'], fixedGroups.NationalTech);

  if (event.body.currency) {
    const donations = await query(donationTable, { fundraiserId: event.pathParameters.fundraiserId });
    if (donations.length > 0) {
      throw new createHttpError.BadRequest('Cannot edit currency on fundraiser with donations');
    }
  }

  await update(fundraiserTable, { id: event.pathParameters.fundraiserId }, ...checkPrevious(event.body));
});
