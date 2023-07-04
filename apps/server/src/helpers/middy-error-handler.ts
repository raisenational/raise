import middy from '@middy/core';
import { auditContext } from './auditContext';
import { insertAudit } from './db';
import { sendMessageWithLogsLink } from './slack';

const mainMiddyErrorHandler: middy.MiddlewareFn<unknown, unknown> = async (request): Promise<void> => {
  const err = (request.error instanceof Error ? request.error : {}) as { statusCode?: number, details?: unknown } & Error;

  if (err.statusCode === 401 || err.statusCode === 403) {
    // eslint-disable-next-line no-console
    console.warn('Security error processing request:');
    // eslint-disable-next-line no-console
    console.warn(request.error);
    await insertAudit({
      action: 'security',
      metadata: { statusCode: err.statusCode, message: err.message },
    });
    await sendMessageWithLogsLink(`🔒 Security (${err.statusCode}${auditContext.value ? ` on ${auditContext.value.route} by ${auditContext.value.subject}` : ''}): ${err.message}.`);
  }

  // Log and hide details of unexpected errors
  if (typeof err.statusCode !== 'number' || typeof err.message !== 'string' || err.statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('Internal error processing request:');
    // eslint-disable-next-line no-console
    console.error(request.error);
    err.statusCode = typeof err.statusCode === 'number' && err.statusCode > 500 ? err.statusCode : 500;
    await sendMessageWithLogsLink(`💥 Internal error (${err.statusCode}${auditContext.value ? ` on ${auditContext.value.route} by ${auditContext.value.subject}` : ''}): ${err.message ?? 'See logs for more details'}.`);
    err.message = 'An internal error occurred';
    err.details = undefined;
  }

  // Strip unstringifyable details
  if (err.details !== undefined) {
    try {
      JSON.stringify(err.details);
    } catch {
      // eslint-disable-next-line no-console
      console.error('Failed to stringify details for following error:');
      // eslint-disable-next-line no-console
      console.error(request.error);
      err.details = undefined;
    }
  }

  request.response = {
    statusCode: err.statusCode,
    body: JSON.stringify({ message: err.message, details: err.details }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

// eslint-disable-next-line consistent-return
const middyErrorHandler: middy.MiddlewareFn<unknown, unknown> = async (request): Promise<void> => {
  try {
    return mainMiddyErrorHandler(request);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Fatal error: error handler threw error', err);
    request.response = {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal error handling error' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

export default middyErrorHandler;
