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
  const err = (request.error instanceof Error ? request.error : new Error('An unknown error occurred')) as { statusCode?: number } & Error;
  if (typeof err.statusCode !== "number") err.statusCode = 500;
  if (typeof err.message !== "string") err.message = "An unknown error occured";

  if (err.statusCode >= 500) console.error(request.error);

  request.response = {
    statusCode: err.statusCode,
    body: JSON.stringify({ message: err.message }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

export function middyfy(handler: Handler<Omit<APIGatewayProxyEvent, 'body'>, any>): Handler<APIGatewayProxyEvent, APIGatewayProxyResult>;
export function middyfy<T extends Joi.Schema>(schema: T, handler: Handler<Omit<APIGatewayProxyEvent, 'body'> & { body: Joi.extractType<T> }, any>): Handler<APIGatewayProxyEvent, APIGatewayProxyResult>;
export function middyfy<T extends Joi.Schema>(arg0: T | Handler<Omit<APIGatewayProxyEvent, 'body'>, any>, arg1?: Handler<Omit<APIGatewayProxyEvent, 'body'> & { body: Joi.extractType<T> }, any>): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> {
  return (arg0 && arg1 ? middy(arg1).use(middyJoiValidator({ schema: Joi.object({ body: arg0 }), options: { allowUnknown: true } })) : middy(arg0 as Handler<Omit<APIGatewayProxyEvent, 'body'>, any>))
    .use(middyJsonBodyParser())
    .after(middyJsonBodySerializer)
    .onError(middyErrorHandler)  
}