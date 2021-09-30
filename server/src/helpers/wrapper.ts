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

export function middyfy(handler: Handler<Omit<APIGatewayProxyEvent, 'body'>, any>): Handler<APIGatewayProxyEvent, APIGatewayProxyResult>;
export function middyfy<T extends Joi.Schema>(schema: T, handler: Handler<Omit<APIGatewayProxyEvent, 'body'> & { body: Joi.extractType<T> }, any>): Handler<APIGatewayProxyEvent, APIGatewayProxyResult>;
export function middyfy<T extends Joi.Schema>(arg0: T | Handler<Omit<APIGatewayProxyEvent, 'body'>, any>, arg1?: Handler<Omit<APIGatewayProxyEvent, 'body'> & { body: Joi.extractType<T> }, any>): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> {
  const m = (arg0 && arg1 ? middy(arg1) : middy(arg0 as Handler<Omit<APIGatewayProxyEvent, 'body'>, any>)).use(middyJsonBodyParser());

  return (arg0 && arg1 ? m.use(middyJoiValidator({ schema: Joi.object({ body: arg0 }), options: { allowUnknown: true } })) : m)
    .after(middyJsonBodySerializer)
    .onError(middyErrorHandler)  
}