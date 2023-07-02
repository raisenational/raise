import middy from '@middy/core';
import { fixedGroups } from '@raise/shared';
import {
  auditContext,
  middyAuditContextManagerAfter,
  middyAuditContextManagerBefore,
} from './auditContext';

beforeAll(() => { process.env.AWS_REGION = 'eu-test-1'; });
afterAll(() => { process.env.AWS_REGION = undefined; });

test('before sets up the auditContext for an event without auth', () => {
  // Given we're not in an auditContext
  auditContext.value = undefined;

  // When we run the before hook
  middyAuditContextManagerBefore({
    event: {
      requestContext: {
        http: {
          sourceIp: '123.123.123.123',
          userAgent: 'some browser',
          method: 'POST',
          path: '/a/path/with/ABCD123',
          protocol: 'https',
        },
        routeKey: 'POST /a/path/with/{param}',
      },
    },
    context: {
      logGroupName: 'aws/lambda/raise-server-stage-myFunc',
      logStreamName: '2022/01/01/[$LATEST]123456789',
    },
  } as middy.Request);

  // Then the audit context is set up as expected
  expect(auditContext.value).toEqual({
    route: 'POST /a/path/with/{param}',
    routeRaw: 'POST /a/path/with/ABCD123',
    sourceIp: '123.123.123.123',
    subject: 'public',
    userAgent: 'some browser',
    logGroupName: 'aws/lambda/raise-server-stage-myFunc',
    logStreamName: '2022/01/01/[$LATEST]123456789',
    awsRegion: 'eu-test-1',
  });
});

test('before sets up the auditContext for an event with auth', () => {
  // Given we're not in an auditContext
  auditContext.value = undefined;

  // When we run the before hook
  middyAuditContextManagerBefore({
    event: {
      requestContext: {
        http: {
          sourceIp: '123.123.123.123',
          userAgent: 'some browser',
          method: 'POST',
          path: '/a/path/with/ABCD123',
          protocol: 'https',
        },
        routeKey: 'POST /a/path/with/{param}',
      },
      auth: {
        payload: {
          subject: 'ajones@joinraise.org',
          groups: [fixedGroups.National],
          iat: Math.floor(new Date().getTime() / 1000),
          exp: Math.floor(new Date().getTime() / 1000) + 1000,
        },
        token: 'ey1.2.3',
      },
    },
    context: {
      logGroupName: 'aws/lambda/raise-server-stage-myFunc',
      logStreamName: '2022/01/01/[$LATEST]123456789',
    },
  } as middy.Request);

  // Then the audit context is set up as expected
  expect(auditContext.value).toEqual({
    route: 'POST /a/path/with/{param}',
    routeRaw: 'POST /a/path/with/ABCD123',
    sourceIp: '123.123.123.123',
    subject: 'ajones@joinraise.org',
    userAgent: 'some browser',
    logGroupName: 'aws/lambda/raise-server-stage-myFunc',
    logStreamName: '2022/01/01/[$LATEST]123456789',
    awsRegion: 'eu-test-1',
  });
});

test('after clears the auditContext', () => {
  // Given we're in an auditContext
  auditContext.value = {
    route: 'POST /a/path/with/{param}',
    routeRaw: 'POST /a/path/with/ABCD123',
    sourceIp: '123.123.123.123',
    subject: 'public',
    userAgent: 'some browser',
    logGroupName: 'aws/lambda/raise-server-stage-myFunc',
    logStreamName: '2022/01/01/[$LATEST]123456789',
    awsRegion: 'eu-test-1',
  };

  // When we run the after hook
  middyAuditContextManagerAfter();

  // Then the auditContext is clearer
  expect(auditContext.value).toBeUndefined();
});
