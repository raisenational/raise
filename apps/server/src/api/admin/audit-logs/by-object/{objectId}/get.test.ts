import { ulid } from 'ulid';
import { fixedGroups } from '@raise/shared';
import { insert } from '../../../../../helpers/db';
import { auditLogTable } from '../../../../../helpers/tables';
import { call, makeAuditLog } from '../../../../../../local/testHelpers';
import { main } from './get';

test('retrieves audit logs', async () => {
  // given 2 relevant and 1 irrelevant audit log in the db
  const objectId = ulid();
  const logs = [makeAuditLog({ object: objectId }), makeAuditLog({ object: objectId }), makeAuditLog()];
  await Promise.all(logs.map((l) => insert(auditLogTable, l)));

  // when we call the endpoint
  const response = await call(main, { pathParameters: { objectId } })(null);

  // we get back the logs
  expect(response).toHaveLength(2);
  expect(response).toContainEqual(logs[0]);
  expect(response).toContainEqual(logs[1]);
});

test('rejects non-national team', async () => {
  // when we call the endpoint
  const response = await call(main, { rawResponse: true, auth: { groups: ['Test'] }, pathParameters: { objectId: ulid() } })(null);

  // we are rejected
  expect(response.statusCode).toBe(403);
  expect(response.body).toContain(`[National (${fixedGroups.National})]`);
});
