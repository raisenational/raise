import {test, expect} from 'vitest';
import {call, makeFundraiser, makeDonation} from '../../../../../../local/testHelpers';
import {insert} from '../../../../../helpers/db';
import {donationTable, fundraiserTable} from '../../../../../helpers/tables';
import {main} from './get';

test('can view donations if in correct group', async () => {
	// Given a fundraiser and donation in the db
	const fundraiser = makeFundraiser({groupsWithAccess: ['Test']});
	const donation = makeDonation({fundraiserId: fundraiser.id});
	await insert(fundraiserTable, fundraiser);
	await insert(donationTable, donation);

	// When we call the endpoint
	const response = await call(main, {auth: {groups: ['Test']}, pathParameters: {fundraiserId: fundraiser.id}})(null);

	// We get back the donation
	expect(response).toEqual([donation]);
});

test('can not view donations if not in correct group', async () => {
	// Given a fundraiser and donation in the db
	const fundraiser = makeFundraiser({groupsWithAccess: ['NotTest']});
	const donation = makeDonation({fundraiserId: fundraiser.id});
	await insert(fundraiserTable, fundraiser);
	await insert(donationTable, donation);

	// When we call the endpoint
	const response = await call(main, {rawResponse: true, auth: {groups: ['Test']}, pathParameters: {fundraiserId: fundraiser.id}})(null);

	// We get back a forbidden error response
	expect(response.statusCode).toEqual(403);
});
