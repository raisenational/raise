import { join } from "path"
import { getEndpointDefinitions } from "./helpers"
import { copyFileSync, writeFileSync } from "fs"

const main = async () => {
  const definitions = await getEndpointDefinitions();

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

  console.log(`✔ Wrote client for ${definitions.length} endpoints`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
