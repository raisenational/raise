import { join } from "path"
import { ExternalHandler } from "../src/helpers/types"
import { JSONSchema } from "../src/schemas"
import { getFunctionEvent, getFunctionPaths, Method } from "./helpers"
import { copyFileSync, writeFileSync } from "fs"

interface RouteDefinition {
  path: string,
  method: Method,
  params: string[],
  requestType: string | null,
  responseType: string | null,
  requestSchema: string | null,
  responseSchema: string | null,
  requiresAuth: boolean,
}

const main = async () => {
  const schemas = await import("../src/schemas/jsonSchema")
  const findSchemaName = makeFindSchemaName(schemas);

  const functionPaths = getFunctionPaths()

  const definitions: RouteDefinition[] = await Promise.all(functionPaths.map(async filePath => {
    const exports: { main: ExternalHandler<any, any, any> } = await import(join(__dirname, "..", "src", "api", filePath));
    verifyIsHandler({ filePath, exports });
    const { httpApi: { path, method } } = getFunctionEvent(filePath)

    const params = path.match(/\{[a-zA-Z0-9]*\}/g)?.map((k) => k.slice(1, -1)) ?? [];

    const requestSchema = findSchemaName({ filePath, schema: exports.main.requestSchema })
    const responseSchema = findSchemaName({ filePath, schema: exports.main.responseSchema })

    // On the assumption that the schemas have the name of the type prefixed with a '$'
    const requestType = requestSchema === null ? null : requestSchema.slice(1)
    const responseType = responseSchema === null ? null : responseSchema.slice(1)

    return {
      path,
      method,
      params,
      requestType,
      requestSchema,
      responseType,
      responseSchema,
      requiresAuth: exports.main.requiresAuth,
    }
  }))

  const source = `/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the server, and run "npm run generate:client" from the server.
 */
/* eslint-disable */

import axios, { AxiosInstance, AxiosResponse } from "axios"
import type * as S from "./types"

export * from "./types"

export type Routes = {
${definitions.map(d => `  ${JSON.stringify(d.method + " " + d.path)}: {
    request: ${d.requestType === null ? "null" : `S.${d.requestType}`},
    response: ${d.responseType === null ? "null" : `S.${d.responseType}`},
    params: ${d.params.length === 0 ? "null" : `{
${d.params.map(p => `      ${JSON.stringify(p)}: string,`).join('\n')}
    }`},
  },`).join('\n')}
}

export const routes = {
${definitions.map(d => `  ${JSON.stringify(d.method + " " + d.path)}: {
    method: ${JSON.stringify(d.method)},
    makePath: ({${d.params.length === 0 ? ""
      : "\n" + d.params.map(p => `      ${p},`).join('\n') + "\n   "
    } }: {${d.params.length === 0 ? ""
      : "\n" + d.params.map(p => `      ${p}: string,`).join('\n') + "\n    "
    }}) => \`${d.path.replace(/\{[a-zA-Z0-9]*\}/g, '$$$&')}\`,
    hasRequest: ${!!d.requestType},
    hasResponse: ${!!d.responseType},
    hasParams: ${d.params.length !== 0},
  },`).join('\n')}
} as const

export const makeClient = (a: AxiosInstance = axios) => <
  Route extends keyof Routes,
  Data extends Routes[Route]["request"],
  Params extends Routes[Route]["params"],
  Result extends Routes[Route]["response"],
  >(
    route: Route,
    ...args: [
      ...Params extends null ? [] : [params: Params],
      ...Data extends null ? [] : [data: Data],
    ]
  ): Promise<AxiosResponse<Result>> => {
  const paramsIndex = routes[route].hasParams ? 0 : null;
  const dataIndex = routes[route].hasRequest ? (routes[route].hasParams ? 1 : 0) : null;

  return a({
    method: routes[route].method,
    url: routes[route].makePath(paramsIndex === null ? {} as any : args[paramsIndex]),
    data: dataIndex !== null ? args[dataIndex] : undefined,
  });
}`

  const outputDir = join(__dirname, "../../web/src/helpers/generated-api-client")

  writeFileSync(
    join(outputDir, "index.ts"),
    source,
  )

  copyFileSync(
    join(__dirname, "../src/schemas/typescript.ts"),
    join(outputDir, "types.ts"),
  )

  console.log(`✔ Wrote client for ${definitions.length} endpoints based on ${functionPaths.length} files`)
}

const verifyIsHandler = ({ filePath, exports }: { filePath: string, exports: { main: ExternalHandler<any, any, any> } }) => {
  if (typeof exports !== "object") throw new Error(`Expected handler export an object, but didn't in ${filePath}`)
  if (typeof exports.main !== "function") throw new Error(`Expected handler to have a named export 'main', but didn't in ${filePath}`)
  if (typeof exports.main.requestSchema !== "object") throw new Error(`Expected handler main function to have an requestSchema object property, but didn't in ${filePath}`)
  if (typeof exports.main.responseSchema !== "object") throw new Error(`Expected handler main function to have an responseSchema object property, but didn't in ${filePath}`)
  if (typeof exports.main.requiresAuth !== "boolean") throw new Error(`Expected handler main function to have an requiresAuth boolean property, but didn't in ${filePath}`)
}

const makeFindSchemaName = (schemas: Record<string, JSONSchema<any>>) => {
  const schemaToName = new Map<JSONSchema<any>, string>()
  Object.entries(schemas).forEach(([name, schema]) => schemaToName.set(schema, name))

  return ({ filePath, schema }: { filePath: string, schema: JSONSchema<any> }) => {
    if (schema === null) return null;

    const result = schemaToName.get(schema)

    if (!result) {
      throw new Error(`Failed to match schema in ${filePath}, make sure both its request and response schemas are top-level schemas defined in jsonSchema.ts`)
    }
    return result;
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
