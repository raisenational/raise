import createHttpError from 'http-errors';
import { ulid } from 'ulid';
import { JSONSchema, $Ulid } from '../schemas';
import { call } from '../../local/testHelpers';
import { middyfy } from './wrapper';
import { AuditContext, auditContext } from './auditContext';

const greetRequestSchema: JSONSchema<{ greetingWord?: string, greetee: string }> = {
  type: 'object',
  properties: {
    greetingWord: { type: 'string' },
    greetee: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
  required: ['greetee'],
};

const greetResponseSchema: JSONSchema<{ greeting: string }> = {
  type: 'object',
  properties: {
    greeting: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
  required: ['greeting'],
};

const publicHandler = middyfy(greetRequestSchema, greetResponseSchema, false, async (event) => ({ greeting: `${event.body.greetingWord ?? 'Hello'} ${event.body.greetee}!` }));
const authReqHandler = middyfy(greetRequestSchema, greetResponseSchema, true, async (event) => ({ greeting: `${event.body.greetingWord ?? 'Hello'} ${event.body.greetee}!` }));

describe('public endpoint', () => {
  test('can be called without an auth token', async () => {
    const response = await call(publicHandler, { auth: false })({ greetee: 'world' });

    expect(response).toEqual({ greeting: 'Hello world!' });
  });
});

describe('auth required endpoint', () => {
  test('rejects missing auth token', async () => {
    const response = await call(authReqHandler, { auth: false, rawResponse: true })({ greetee: 'world' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain('No valid bearer token was set in the authorization header');
  });
});

describe.each([
  ['public', publicHandler],
  ['auth required', authReqHandler],
])('%s endpoint', (_description, handler) => {
  test('can be called with a valid auth token', async () => {
    const response = await call(handler)({ greetee: 'world' });

    expect(response).toEqual({ greeting: 'Hello world!' });
  });

  test('can be called with a valid auth token with no groups', async () => {
    const response = await call(handler, { auth: { groups: [] } })({ greetee: 'world' });

    expect(response).toEqual({ greeting: 'Hello world!' });
  });

  test('rejects an invalid auth header', async () => {
    const response = await call(handler, { headers: { authorization: 'an-invalid-header' }, rawResponse: true })({ greetee: 'world' });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).message).toContain('Format should be "Authorization: Bearer [token]"');
  });

  test('rejects an invalid auth token', async () => {
    const response = await call(handler, { auth: 'an-invalid-token', rawResponse: true })({ greetee: 'world' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain('Invalid token');
  });

  test('rejects an auth token with an invalid payload', async () => {
    const response = await call(handler, { auth: { groups: [1] } as never, rawResponse: true })({ greetee: 'world' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('Token payload malformed');
  });

  test('rejects expired token', async () => {
    const response = await call(handler, { auth: { iat: 1637971200, exp: 1637971800 }, rawResponse: true })({ greetee: 'world' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain('Token expired');
  });

  test('rejects token signed with wrong key', async () => {
    // spell-checker: disable-next-line
    const response = await call(handler, { authKey: '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEINMpp4m2FIteV9mG3mm+JQp+vNTlynGzHmexIGqU/odvoAoGCCqGSM49\nAwEHoUQDQgAEOzo72IF7TKxi10iaUFZZIDxEfNHwU+lQWbOaUiomowCV9sFTOmfV\nqI7WqFvIvW1oGHRI7bsExLNjf/KX2eJOew==\n-----END EC PRIVATE KEY-----', rawResponse: true })({ greetee: 'world' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain('Invalid token');
  });
});

describe('request body validation', () => {
  test('rejects missing body', async () => {
    const response = await call(publicHandler, { rawResponse: true })(null);

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('failed validation');
  });

  test.each([
    ['syntax error 1', '{greetee: world}'],
    ['syntax error 2', '{"greetee": world}'],
    ['syntax error 3', '{greetee: "world"}'],
    ['syntax error 4', '{'],
    ['syntax error 5', "'"],
    ['syntax error 6', '@'],
    ['plain text', 'greetee world'],
    ['XML', '<greetee>world</greetee>'],
  ])('rejects invalid JSON body: %s', async (description, body) => {
    const response = await call(publicHandler, { rawBody: true, rawResponse: true })(body);

    expect(response.statusCode).toBe(422);
    expect(response.body).toContain('invalid JSON');
  });

  describe.each([
    [undefined],
    ['text/plain'],
    ['application/xml'],
    ['text/html'],
    ['application/x-www-form-urlencoded'],
    ['multipart/form-data'],
  ])('rejects %s content-type', (contentType) => {
    test.each([
      ['JSON', '{"greetee": "world"}'],
      ['invalid JSON-like', '{"greetee": world}'],
      ['plain text', 'greetee world'],
      ['XML', '<greetee>world</greetee>'],
      ['invalid XML-like', '<greetee>world<greetee/>'],
      ['HTML', '<html><head></head><body><h1>world</h1></body></html>'],
      ['form data', 'greetee=world'],
    ])('with %s body', async (description, body) => {
      const response = await call(publicHandler, {
        rawBody: true,
        rawResponse: true,
        headers: {
          'content-type': contentType,
        },
      })(body);

      expect(response.statusCode).toBe(415);
      expect(response.body).toContain('Unsupported Media Type');
    });
  });

  test('rejects wrong body type', async () => {
    const response = await call(publicHandler, { rawResponse: true })(3);

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('failed validation');
    expect(response.body).toContain('must be object');
  });

  test('rejects body with missing properties', async () => {
    const response = await call(publicHandler, { rawResponse: true })({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('failed validation');
    expect(response.body).toContain('missingProperty');
    expect(response.body).toContain('greetee');
  });

  test('rejects body with additional properties', async () => {
    const response = await call(publicHandler, { rawResponse: true })({ greetee: 'world', someProp: 'surplus' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('failed validation');
    expect(response.body).toContain('additionalProperties');
    expect(response.body).toContain('someProp');
  });

  test('rejects body with incorrect property type', async () => {
    const response = await call(publicHandler, { rawResponse: true })({ greetee: 3 });

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('failed validation');
    expect(response.body).toContain('string');
    expect(response.body).toContain('greetee');
  });

  test('rejects body with property violating constraint', async () => {
    const response = await call(publicHandler, { rawResponse: true })({ greetee: '' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('failed validation');
    expect(response.body).toContain('minLength');
    expect(response.body).toContain('greetee');
  });

  test('can provide optional property', async () => {
    const response = await call(publicHandler)({ greetingWord: 'Hi', greetee: 'world' });

    expect(response).toEqual({ greeting: 'Hi world!' });
  });

  test.each([
    ['object', {
      type: 'object', properties: { greeting: { type: 'string' } }, additionalProperties: false, required: ['greeting'],
    }, { greeting: 'Hello world!' }],
    ['object without an optional property', {
      type: 'object', properties: { greeting: { type: 'string' }, greetee: { type: 'string' } }, additionalProperties: false, required: ['greeting'],
    }, { greeting: 'Hello world!' }],
    ['object with an optional property', {
      type: 'object', properties: { greeting: { type: 'string' }, greetee: { type: 'string' } }, additionalProperties: false, required: ['greeting'],
    }, { greeting: 'Hello world!', greetee: 'world' }],
    ['object with validation', {
      type: 'object', properties: { greeting: { type: 'string', minLength: 1 } }, additionalProperties: false, required: ['greeting'],
    }, { greeting: 'Hello world!' }],
    ['nested object', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 'Adam' } }],
    ['nested object without an optional property', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 'Adam' } }],
    ['nested object with an optional property', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 'Adam', lastName: 'Jones' } }],
    ['string', { type: 'string' }, 'Hello world!'],
    ['ulid', $Ulid, ulid()],
    ['boolean', { type: 'boolean' }, true],
    ['number', { type: 'number' }, 123],
    ['integer', { type: 'integer' }, 123],
  ])('can accept a %s', async (_description, schema, body) => {
    const handler = middyfy(schema, null, false, async () => undefined);

    const actualResponse = await call(handler, { rawResponse: true })(body);

    expect(actualResponse.statusCode).toBe(204);
  });

  test.each([
    ['is incorrectly missing', greetResponseSchema, null],
    // At the moment, this is enforced through types only
    // ["is incorrectly present", null, { greeting: "Hello world!" }],
    ['is the incorrect type', greetResponseSchema, 3],
    ['has a property with the wrong type', greetResponseSchema, { greeting: 3 }],
    ['has a property violating constraint', greetResponseSchema, { greeting: '' }], // minLength: 1
    ['has additional properties', greetResponseSchema, { greeting: 'Hello world!', extraProp: 'surplus' }],
    ['has nested missing properties', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: {} }],
    ['has nested additional properties', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 'Adam', extraProp: 'surplus' } }],
    ['has nested property with the wrong type', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 3 } }],
    ['has nested property violating constraint', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string', minLength: 1 } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: '' } }],
  ])('returns 400 if request %s', async (_description, schema, body) => {
    const handler = middyfy(schema, null, false, async () => undefined);

    const actualResponse = await call(handler, { rawResponse: true })(body);

    expect(actualResponse.statusCode).toBe(400);
    expect(actualResponse.body).toContain('failed validation');
  });
});

describe('path parameters', () => {
  const handler = middyfy(null, greetResponseSchema, false, async (event) => ({ greeting: `Hello ${event.pathParameters.greetee}!` }));

  test('can provide path parameters', async () => {
    const response = await call(handler, { routeKey: 'GET /greet/{greetee}', path: '/greet/world', pathParameters: { greetee: 'world' } })(null);

    expect(response).toEqual({ greeting: 'Hello world!' });
  });

  test('rejects empty path parameter', async () => {
    const response = await call(handler, {
      rawResponse: true, routeKey: 'GET /greet/{greetee}', path: '/greet/', pathParameters: { greetee: '' },
    })(null);

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('Missing path parameter greetee');
  });

  test('rejects missing path parameter', async () => {
    const response = await call(handler, { rawResponse: true, routeKey: 'GET /greet/{greetee}', path: '/greet/' })(null);

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('Missing path parameter greetee');
  });

  test('throws internal server error if trying to use non-existent path parameter', async () => {
    const badHandler = middyfy(null, greetResponseSchema, false, async (event) => ({ greeting: `Hello ${event.pathParameters.misspeltParam}!` }));
    const response = await call(badHandler, {
      rawResponse: true, routeKey: 'GET /greet/{misspelledParam}', path: '/greet/world', pathParameters: { misspelledParam: 'world' },
    })(null);

    expect(response.statusCode).toBe(500);
  });
});

describe('response body validation', () => {
  test.each([
    ['object', {
      type: 'object', properties: { greeting: { type: 'string' } }, additionalProperties: false, required: ['greeting'],
    }, { greeting: 'Hello world!' }],
    ['object without an optional property', {
      type: 'object', properties: { greeting: { type: 'string' }, greetee: { type: 'string' } }, additionalProperties: false, required: ['greeting'],
    }, { greeting: 'Hello world!' }],
    ['object with an optional property', {
      type: 'object', properties: { greeting: { type: 'string' }, greetee: { type: 'string' } }, additionalProperties: false, required: ['greeting'],
    }, { greeting: 'Hello world!', greetee: 'world' }],
    ['object with validation', {
      type: 'object', properties: { greeting: { type: 'string', minLength: 1 } }, additionalProperties: false, required: ['greeting'],
    }, { greeting: 'Hello world!' }],
    ['nested object', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 'Adam' } }],
    ['nested object without an optional property', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 'Adam' } }],
    ['nested object with an optional property', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 'Adam', lastName: 'Jones' } }],
    ['string', { type: 'string' }, 'Hello world!'],
    ['ulid', $Ulid, ulid()],
    ['boolean', { type: 'boolean' }, true],
    ['number', { type: 'number' }, 123],
    ['integer', { type: 'integer' }, 123],
  ])('can return a %s', async (_description, schema, body) => {
    const handler = middyfy(null, schema, false, async () => body as never);

    const actualResponse = await call(handler)(null);

    expect(actualResponse).toEqual(body);
  });

  test('can return a empty no-content response', async () => {
    const handler = middyfy(null, null, false, async () => undefined);

    const response = await call(handler, { rawResponse: true })(null);

    expect(response.statusCode).toEqual(204);
    expect(response.body).toEqual(undefined);
  });

  test.each([
    ['is incorrectly missing', greetResponseSchema, null],
    // At the moment, this is enforced through types only
    // ["is incorrectly present", null, { greeting: "Hello world!" }],
    ['is the incorrect type', greetResponseSchema, 3],
    ['has a property with the wrong type', greetResponseSchema, { greeting: 3 }],
    ['has a property violating constraint', greetResponseSchema, { greeting: '' }], // minLength: 1
    ['has additional properties', greetResponseSchema, { greeting: 'Hello world!', extraProp: 'surplus' }],
    ['has nested missing properties', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: {} }],
    ['has nested additional properties', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 'Adam', extraProp: 'surplus' } }],
    ['has nested property with the wrong type', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string' } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: 3 } }],
    ['has nested property violating constraint', {
      type: 'object',
      properties: {
        person: {
          type: 'object', properties: { firstName: { type: 'string', minLength: 1 } }, additionalProperties: false, required: ['firstName'],
        },
      },
      additionalProperties: false,
      required: ['person'],
    }, { person: { firstName: '' } }],
  ])('returns 500 if return %s', async (_description, schema, body) => {
    const handler = middyfy(null, schema, false, async () => body as never);

    const response = await call(handler, { rawResponse: true })(null);

    expect(response.statusCode).toBe(500);
    // given this shouldn't happen, it may not be safe to return to the user why something went wrong
    expect(response.body).toBe('{"message":"An internal error occurred"}');
  });
});

// Validates at a high level errors treated correctly, specifics in their own middleware test
describe('error handling', () => {
  describe.each([
    ['without error message', undefined],
    ['with error message', 'I am the error message'],
  ])('%s', (_description, errMessage) => {
    test.each([
      ['400', new createHttpError[400](errMessage), 400, errMessage ?? 'Bad Request'],
      ['401', new createHttpError[401](errMessage), 401, errMessage ?? 'Unauthorized'],
      ['403', new createHttpError[403](errMessage), 403, errMessage ?? 'Forbidden'],
      ['415', new createHttpError[415](errMessage), 415, errMessage ?? 'Unsupported Media Type'],
      ['422', new createHttpError[422](errMessage), 422, errMessage ?? 'Unprocessable Entity'],
      ['500', new createHttpError[500](errMessage), 500, 'An internal error occurred'],
      ['501', new createHttpError[501](errMessage), 501, 'An internal error occurred'],
      ['502', new createHttpError[502](errMessage), 502, 'An internal error occurred'],
      ['built-in JS', new Error(errMessage), 500, 'An internal error occurred'],
    ])('handles a %s error', async (description, err, expectedStatus, expectedMessage) => {
      const handler = middyfy(null, null, false, async () => { throw err; });

      const response = await call(handler, { rawResponse: true })(null);

      expect(response.statusCode).toBe(expectedStatus);
      expect(JSON.parse(response.body)).toEqual({ message: expectedMessage });
    });
  });
});

describe('attaches audit context', () => {
  const auditContextSchema: JSONSchema<NonNullable<AuditContext['value']>> = {
    type: 'object',
    properties: {
      subject: { type: 'string' },
      sourceIp: { type: 'string' },
      userAgent: { type: 'string' },
      route: { type: 'string' },
      routeRaw: { type: 'string' },
    },
  };
  const handler = middyfy(null, auditContextSchema, false, async () => {
    if (!auditContext.value) throw new createHttpError.InternalServerError('Not in an auditContext');
    return auditContext.value;
  });

  test('with auth', async () => {
    const response = await call(handler)(null);

    expect(response).toEqual({
      routeRaw: 'UNKNOWN /unknown',
      sourceIp: '123.123.123.123',
      subject: 'tests',
      userAgent: 'some browser',
      logGroupName: 'aws/lambda/raise-server-stage-myFunc',
      logStreamName: '2022/01/01/[$LATEST]123456789',
      awsRegion: 'eu-test-1',
    });
  });

  test('without auth', async () => {
    const response = await call(handler, { auth: false })(null);

    expect(response).toEqual({
      routeRaw: 'UNKNOWN /unknown',
      sourceIp: '123.123.123.123',
      subject: 'public',
      userAgent: 'some browser',
      logGroupName: 'aws/lambda/raise-server-stage-myFunc',
      logStreamName: '2022/01/01/[$LATEST]123456789',
      awsRegion: 'eu-test-1',
    });
  });
});
