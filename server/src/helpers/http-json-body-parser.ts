// TODO: use @middy/http-json-body-parser once PR merged: https://github.com/middyjs/middy/pull/741

import middy from "@middy/core"

const mimePattern = /^application\/(.+\+)?json(;.*)?$/

const defaults = {
  reviver: undefined,
}

interface Options {
  reviver?: (key: string, value: any) => any,
}

export default (opts: Options = {}): middy.MiddlewareObj => {
  const options = { ...defaults, ...opts }
  const httpJsonBodyParserMiddlewareBefore: middy.MiddlewareFn = async (request) => {
    const { headers, body } = request.event

    const contentTypeHeader = headers?.["Content-Type"] ?? headers?.["content-type"]

    if (mimePattern.test(contentTypeHeader)) {
      try {
        const data = request.event.isBase64Encoded
          ? Buffer.from(body, "base64").toString()
          : body

        request.event.rawBody = body
        request.event.body = JSON.parse(data, options.reviver)
      } catch (err) {
        // eslint-disable-next-line import/no-extraneous-dependencies,global-require,@typescript-eslint/no-var-requires
        const { createError } = require("@middy/util")
        // UnprocessableEntity
        throw createError(422, "Content type defined as JSON but an invalid JSON was provided")
      }
    }
  }

  return {
    before: httpJsonBodyParserMiddlewareBefore,
  }
}
