import type middy from '@middy/core';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { APIGatewayEvent } from './types';

export type AuditContext = {
  value: undefined | {
    subject: string,
    sourceIp: string,
    userAgent: string,
    route: string,
    routeRaw: string,
    logGroupName: string,
    logStreamName: string,
    awsRegion: string,
  },
};

// Ugly global variable to use for auditContext
// Will be present provided the middleware has run e.g. in a function wrapped by middyfy
// May be funky in reused environments e.g. serverless-offline or lambdas not wrapped by middyfy e.g. scheduler
export const auditContext: AuditContext = { value: undefined };

const extractSubject = (event: APIGatewayEvent | APIGatewayProxyEventV2): string => {
  if ('auth' in event && event.auth?.payload.subject) return event.auth?.payload.subject;
  return 'public'; // NB: covers both /public requests and unauthenticated (and therefore could be the public) requests to the /admin endpoints e.g. for login
};

export const middyAuditContextManagerBefore = ({ event, context }: middy.Request<APIGatewayEvent>): void => {
  auditContext.value = {
    subject: extractSubject(event),
    sourceIp: event.requestContext.http.sourceIp,
    userAgent: event.requestContext.http.userAgent,
    route: event.requestContext.routeKey,
    routeRaw: `${event.requestContext.http.method} ${event.requestContext.http.path}`,
    logGroupName: context.logGroupName,
    logStreamName: context.logStreamName,
    awsRegion: process.env.AWS_REGION ?? 'unknown',
  };
};

export const middyAuditContextManagerAfter = (): void => {
  auditContext.value = undefined;
};
