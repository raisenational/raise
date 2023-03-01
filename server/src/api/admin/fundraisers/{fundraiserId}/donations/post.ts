import { ulid } from 'ulid';
import createHttpError from 'http-errors';
import { fixedGroups } from '@raise/shared';
import { middyfy } from '../../../../../helpers/wrapper';
import {
  assertHasGroup, assertHasGroupForProperties, get, insert, insertT, inTransaction, plusT,
} from '../../../../../helpers/db';
import { donationTable, fundraiserTable } from '../../../../../helpers/tables';
import { $DonationCreation, $Ulid, Donation } from '../../../../../schemas';

export const main = middyfy($DonationCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, await get(fundraiserTable, { id: event.pathParameters.fundraiserId }), fixedGroups.National);
  assertHasGroupForProperties(event, ['stripeCustomerId', 'stripePaymentMethodId'], fixedGroups.NationalTech);

  const donationId = ulid();

  // Validate gift-aid requirements
  if (event.body.giftAid) {
    if (!event.body.addressLine1) throw new createHttpError.BadRequest('Gift-aided donation must provide address line 1');
    if (!event.body.addressPostcode) throw new createHttpError.BadRequest('Gift-aided donation must provide address postcode');
    if (!event.body.addressCountry) throw new createHttpError.BadRequest('Gift-aided donation must provide address country');
  }

  const donation: Donation = {
    id: donationId,
    fundraiserId: event.pathParameters.fundraiserId,
    donorName: event.body.donorName ?? 'Unknown',
    donorEmail: event.body.donorEmail ?? 'Unknown',
    emailConsentInformational: event.body.emailConsentInformational ?? false,
    emailConsentMarketing: event.body.emailConsentMarketing ?? false,
    createdAt: event.body.createdAt ?? Math.floor(new Date().getTime() / 1000),
    addressLine1: event.body.addressLine1 ?? null,
    addressLine2: event.body.addressLine2 ?? null,
    addressLine3: event.body.addressLine3 ?? null,
    addressPostcode: event.body.addressPostcode ?? null,
    addressCountry: event.body.addressCountry ?? null,
    giftAid: event.body.giftAid ?? false,
    comment: event.body.comment ?? null,
    donationAmount: 0,
    matchFundingAmount: 0,
    contributionAmount: 0,
    recurringAmount: event.body.recurringAmount ?? null,
    recurrenceFrequency: event.body.recurrenceFrequency ?? null,
    stripeCustomerId: event.body.stripeCustomerId ?? null,
    stripePaymentMethodId: event.body.stripePaymentMethodId ?? null,
    charity: event.body.charity ?? 'Unknown',
    overallPublic: event.body.overallPublic ?? false,
    namePublic: event.body.namePublic ?? false,
    donationAmountPublic: event.body.donationAmountPublic ?? false,
    donationCounted: event.body.donationCounted ?? true,
  };

  if (donation.donationCounted) {
    await inTransaction([
      insertT(donationTable, donation),
      plusT(fundraiserTable, { id: event.pathParameters.fundraiserId }, { donationsCount: 1 }),
    ]);
  } else {
    await insert(donationTable, donation);
  }

  return donationId;
});
