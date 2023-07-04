import createHttpError from 'http-errors';
import { fixedGroups } from '@raise/shared';
import { middyfy } from '../../../../../../helpers/wrapper';
import {
  assertHasGroup, assertHasGroupForProperties, checkPrevious, get, inTransaction, plusT, update, updateT,
} from '../../../../../../helpers/db';
import { donationTable, fundraiserTable } from '../../../../../../helpers/tables';
import { $DonationEdits } from '../../../../../../schemas';

export const main = middyfy($DonationEdits, null, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }), fixedGroups.National);
  assertHasGroupForProperties(event, ['matchFundingAmount'], fixedGroups.National);
  assertHasGroupForProperties(event, ['donationAmount', 'contributionAmount', 'stripeCustomerId', 'stripePaymentMethodId'], fixedGroups.NationalTech);
  const current = await get(donationTable, { fundraiserId: event.pathParameters.fundraiserId, id: event.pathParameters.donationId });
  const after = { ...current, ...event.body };

  // Validate gift aid requirements
  if (event.body.giftAid
    || event.body.addressLine1 === null || event.body.addressLine1 === ''
    || event.body.addressPostcode === null || event.body.addressPostcode === ''
    || event.body.addressCountry === null || event.body.addressCountry === '') {
    if (after.giftAid && (!after.addressLine1 || !after.addressPostcode || !after.addressCountry)) {
      throw new createHttpError.BadRequest('Gift-aided donation must have an address line 1, postcode and country');
    }
  }

  // Update fundraiser total based on gift-aid, and donations count based on donationCounted
  const giftAidAdded = after.giftAid !== current.giftAid ? (after.giftAid ? 1 : -1) * Math.floor(after.donationAmount * 0.25) : 0;
  const donationsCountChange = after.donationCounted !== current.donationCounted ? (after.donationCounted ? 1 : -1) * 1 : 0;

  // Update the fundraiser if necessary
  if (giftAidAdded !== 0 || donationsCountChange !== 0) {
    await inTransaction([
      updateT(donationTable, { fundraiserId: event.pathParameters.fundraiserId, id: event.pathParameters.donationId }, ...checkPrevious({
        ...event.body,
        previous: {
          ...event.body.previous,
          giftAid: current.giftAid,
          addressLine1: current.addressLine1,
          addressPostcode: current.addressPostcode,
          addressCountry: current.addressCountry,
          donationCounted: current.donationCounted,
        },
      })),
      plusT(fundraiserTable, { id: event.pathParameters.fundraiserId }, { donationsCount: donationsCountChange, totalRaised: giftAidAdded }),
    ]);
    return;
  }

  await update(donationTable, { fundraiserId: event.pathParameters.fundraiserId, id: event.pathParameters.donationId }, ...checkPrevious({
    ...event.body,
    previous: {
      ...event.body.previous,
      giftAid: current.giftAid,
      addressLine1: current.addressLine1,
      addressPostcode: current.addressPostcode,
      addressCountry: current.addressCountry,
      donationCounted: current.donationCounted,
    },
  }));
});
