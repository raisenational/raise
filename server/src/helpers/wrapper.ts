import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import middyJoiValidator from "middy-sparks-joi"
import * as Joi from '@hapi/joi'
import type JoiExtractType from 'joi-extract-type';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"

const middyJsonBodySerializer: middy.MiddlewareFunction<any, any> = async (request) => {
  request.response = {
    statusCode: request.response === undefined ? 204 : 200,
    body: request.response === undefined ? undefined : JSON.stringify(request.response),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

const middyErrorHandler: middy.MiddlewareFunction<any, any> = async (request) => {
  const err = (request.error instanceof Error ? request.error : new Error('An unknown error occurred')) as { statusCode?: number, details?: any } & Error;

  // Log and hide details of unexpected errors
  if (typeof err.statusCode !== "number" || typeof err.message !== "string" || err.statusCode >= 500) {
    console.error('Internal error processing request:')
    console.error(request.error);
    err.statusCode = err.statusCode > 500 ? err.statusCode : 500;
    err.message = "An internal error occured";
    err.details = undefined;
  }

  // Strip unstringifyable details
  if (err.details !== undefined) {
    try {
      JSON.stringify(err.details);
    } catch {
      console.error('Failed to stringify details for following error:')
      console.error(request.error);
      err.details = undefined;
    }
  }

  request.response = {
    statusCode: err.statusCode,
    body: JSON.stringify({ message: err.message, details: err.details }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

export function middyfy<RequestSchema extends Joi.Schema, ResponseSchema extends Joi.Schema>(requestSchema: RequestSchema, responseSchema: ResponseSchema, handler: Handler<Omit<APIGatewayProxyEvent, 'body'> & { body: Joi.extractType<RequestSchema> }, Joi.extractType<ResponseSchema>>): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> {
  return middy(handler)
    .use(middyJsonBodyParser())
    // TODO: check body against schema and don't allow unknown properties
    // TODO: check after against responseSchema
    // TODO: improve error messagings of middyJoiValidator / use AJV + middy validator?
    .use(middyJoiValidator({ schema: Joi.object({ body: requestSchema === undefined ? Joi.any() : requestSchema.required() }), options: { allowUnknown: true } }))
    .after(middyJsonBodySerializer)
    .onError(middyErrorHandler)  
}