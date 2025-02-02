import {fixedGroups} from '@raise/shared';
import {call, makeFundraiser} from '../../../../../local/testHelpers';
import {get, insert} from '../../../../helpers/db';
import {fundraiserTable} from '../../../../helpers/tables';
import {main} from './patch';

test('Cannot edit totalRaised as National', async () => {
	// Given a fundraiser in the db
	const fundraiser = makeFundraiser({groupsWithAccess: [fixedGroups.National], totalRaised: 0});
	await insert(fundraiserTable, fundraiser);

	// When we call the endpoint with National
	const response = await call(main, {auth: {groups: [fixedGroups.National]}, pathParameters: {fundraiserId: fundraiser.id}, rawResponse: true})({totalRaised: 1000});

	// We get back a forbidden error response
	expect(response.body).toContain(`[NationalTech (${fixedGroups.NationalTech})]`);
});

test('Can edit totalRaised as NationalTech', async () => {
	// Given a fundraiser in the db
	const fundraiser = makeFundraiser({groupsWithAccess: [fixedGroups.NationalTech], totalRaised: 0});
	await insert(fundraiserTable, fundraiser);

	// When we call the endpoint with NationalTech
	await call(main, {auth: {groups: [fixedGroups.NationalTech]}, pathParameters: {fundraiserId: fundraiser.id}, rawResponse: true})({totalRaised: 1000});

	// We have edited the total raised
	expect(await get(fundraiserTable, {id: fundraiser.id})).toMatchObject({totalRaised: 1000});
});
