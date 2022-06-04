import axios, { AxiosPromise, AxiosResponse } from "axios"
import { join } from "path"
import { ExternalHandler } from "../src/helpers/types"
import { JSONSchema } from "../src/schemas"
import { getFunctionEvent, getFunctionPaths, Method } from "./helpers"

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

  const source = `import type * as S from "./typescript"

type Routes = {
${definitions.map(d => `  ${JSON.stringify(d.method + " " + d.path)}: {
    "request": ${d.requestType === null ? "null" : `S.${d.requestType}`},
    "response": ${d.responseType === null ? "null" : `S.${d.responseType}`},
    "params": ${d.params.length === 0 ? "null" : `{
${d.params.map(p => `      ${JSON.stringify(p)}: string,`).join('\n')}
    }`},
  },`).join('\n')}
}

const routes = {
${definitions.map(d => `  ${JSON.stringify(d.method + " " + d.path)}: {
    "method": ${JSON.stringify(d.method)},
    "makePath": ({${d.params.length === 0 ? ""
      : "\n" + d.params.map(p => `      ${p},`).join('\n') + "\n   "
    } }: {${d.params.length === 0 ? ""
      : "\n" + d.params.map(p => `      ${p}: string,`).join('\n') + "\n    "
    }}) => \`${d.path.replace(/\{[a-zA-Z0-9]*\}/g, '$$$&')}\`,
    "hasRequest": ${!!d.requestType},
    "hasResponse": ${!!d.responseType},
    "hasParams": ${d.params.length !== 0},
  },`).join('\n')}
} as const`

  console.log(source)

  // writeFileSync(
  //   join(__dirname, "../src/schemas/typescript.ts"),
  //   `/**\n* This file was automatically generated. DO NOT MODIFY IT BY HAND.\n* Instead, modify schemas.ts, and run "npm run schemas".\n*/\n/* eslint-disable */\n${source}`,
  // )

  // console.log(`✔ Wrote ${names.size} types based on ${Object.keys(schemas).length} schemas`)
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



// type Routes = {
//   "get /public/status": {
//     "req": null,
//     "res": string,
//     "params": null,
//   },
//   "get /public/something": {
//     "req": number,
//     "res": { thing: string },
//     "params": null,
//   },
//   "get /public/{fundraiserId}": {
//     "req": number,
//     "res": string,
//     "params": {
//       "fundraiserId": string,
//     }
//   },
//   "post /public/something": {
//     "req": {
//       "ok": boolean
//     },
//     "res": null,
//     "params": null,
//   },
// }

// const routes = {
//   "get /public/status": {
//     requiresAuth: false,
//     method: "get",
//     makePath: () => "/public/status",
//     params: null,
//     req: null,
//     res: {},
//   },
//   "get /public/something": {
//     requiresAuth: false,
//     method: "get",
//     makePath: () => "/public/something",
//     params: null,
//     req: null,
//     res: {},
//   },
//   "get /public/{fundraiserId}": {
//     requiresAuth: false,
//     method: "get",
//     makePath: (args: { fundraiserId: string }) => `/public/${args.fundraiserId}`,
//     params: ["fundraiserId"],
//     req: null,
//     res: {},
//   },
//   "post /public/something": {
//     requiresAuth: false,
//     method: "post",
//     makePath: () => "/public/something",
//     params: null,
//     req: null,
//     res: {},
//   },
// } as const

// type x = Routes["get /public/something"]["req"]

// type Options<Data, Params> =
//   (Data extends null ? {} : { data: Data })
//   & (Params extends null ? {} : { params: Params })

// const call = <
//   Route extends keyof Routes,
//   Data extends Routes[Route]["req"],
//   Params extends Routes[Route]["params"],
//   Result extends Routes[Route]["res"],
//   >(
//     route: Route,
//     ...[options]: Data | Params extends null ? [options?: Options<Data, Params>] : [options: Options<Data, Params>]
//   ): Promise<Result> => {
//   return '' as any;
// }

// const call = <
//   Route extends keyof Routes,
//   Data extends Routes[Route]["req"],
//   Params extends Routes[Route]["params"],
//   Result extends Routes[Route]["res"],
//   >(
//     route: Route,
//     ...args: Params extends null
//       ? Data extends null
//       ? []
//       : [data: Data]
//       : Data extends null
//       ? [params: Params]
//       : [params: Params, data: Data]
//   ): Promise<Result> => {
//   return '' as any;
// }

const call = <
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

  return axios({
    method: routes[route].method,
    url: routes[route].makePath(paramsIndex === null ? undefined as any : args[paramsIndex]),
    data: dataIndex !== null ? args[dataIndex] : undefined,
  });
}

// const a: Promise<AxiosResponse<{ thing: string }>> = call("get /public/something", 123)
// const b: Promise<AxiosResponse<string>> = call("get /public/status")
// const c: Promise<AxiosResponse<string>> = call("get /public/{fundraiserId}", { fundraiserId: "123" }, 123)
// const d: Promise<AxiosResponse<null>> = call("post /public/something", { ok: true })
// const e: Promise<AxiosResponse<string>> = call("get /public/{fundraiserId}", { fundraiserId: "ABCD" }, 123)


const f: Promise<AxiosResponse<S.Status>> = call("get /public/status")
const g: Promise<AxiosResponse<S.PublicFundraiser>> = call("get /public/fundraisers/{fundraiserId}", { fundraiserId: "abcd" })
const h: Promise<AxiosResponse<S.Donations>> = call("get /admin/fundraisers/{fundraiserId}/donations", { fundraiserId: "abcd" })

h.then(r => r.data[0].donationAmount)

import type * as S from "../src/schemas/typescript"

type Routes = {
  "get /admin/audit-logs/by-object/{objectId}": {
    "request": null,
    "response": S.AuditLogs,
    "params": {
      "objectId": string,
    },
  },
  "get /admin/audit-logs/by-subject/{subjectId}": {
    "request": null,
    "response": S.AuditLogs,
    "params": {
      "subjectId": string,
    },
  },
  "get /admin/fundraisers": {
    "request": null,
    "response": S.Fundraisers,
    "params": null,
  },
  "post /admin/fundraisers": {
    "request": S.FundraiserCreation,
    "response": S.Ulid,
    "params": null,
  },
  "get /admin/fundraisers/{fundraiserId}/donations": {
    "request": null,
    "response": S.Donations,
    "params": {
      "fundraiserId": string,
    },
  },
  "post /admin/fundraisers/{fundraiserId}/donations": {
    "request": S.DonationCreation,
    "response": S.Ulid,
    "params": {
      "fundraiserId": string,
    },
  },
  "patch /admin/fundraisers/{fundraiserId}/donations/{donationId}": {
    "request": S.DonationEdits,
    "response": null,
    "params": {
      "fundraiserId": string,
      "donationId": string,
    },
  },
  "get /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments": {
    "request": null,
    "response": S.Payments,
    "params": {
      "fundraiserId": string,
      "donationId": string,
    },
  },
  "post /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments": {
    "request": S.PaymentCreation,
    "response": S.Ulid,
    "params": {
      "fundraiserId": string,
      "donationId": string,
    },
  },
  "patch /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/{paymentId}": {
    "request": S.PaymentPropertyEdits,
    "response": null,
    "params": {
      "fundraiserId": string,
      "donationId": string,
      "paymentId": string,
    },
  },
  "patch /admin/fundraisers/{fundraiserId}": {
    "request": S.FundraiserEdits,
    "response": null,
    "params": {
      "fundraiserId": string,
    },
  },
  "get /admin/login": {
    "request": null,
    "response": S.Profile,
    "params": null,
  },
  "post /admin/login/google": {
    "request": S.GoogleLoginRequest,
    "response": S.LoginResponse,
    "params": null,
  },
  "post /admin/login/impersonation": {
    "request": S.ImpersonationLoginRequest,
    "response": S.LoginResponse,
    "params": null,
  },
  "get /admin/tasks": {
    "request": null,
    "response": S.Tasks,
    "params": null,
  },
  "post /admin/tasks/{taskId}": {
    "request": null,
    "response": null,
    "params": {
      "taskId": string,
    },
  },
  "post /public/fundraisers/{fundraiserId}/donation": {
    "request": S.PublicDonationRequest,
    "response": S.PublicPaymentIntentResponse,
    "params": {
      "fundraiserId": string,
    },
  },
  "get /public/fundraisers/{fundraiserId}": {
    "request": null,
    "response": S.PublicFundraiser,
    "params": {
      "fundraiserId": string,
    },
  },
  "get /public/status": {
    "request": null,
    "response": S.Status,
    "params": null,
  },
  "post /scheduler/collect-payments": {
    "request": null,
    "response": null,
    "params": null,
  },
  "post /stripe/webhook": {
    "request": S.StripeWebhookRequest,
    "response": null,
    "params": null,
  },
}

const routes = {
  "get /admin/audit-logs/by-object/{objectId}": {
    "method": "get",
    "makePath": ({
      objectId,
    }: {
      objectId: string,
    }) => `/admin/audit-logs/by-object/${objectId}`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": true,
  },
  "get /admin/audit-logs/by-subject/{subjectId}": {
    "method": "get",
    "makePath": ({
      subjectId,
    }: {
      subjectId: string,
    }) => `/admin/audit-logs/by-subject/${subjectId}`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": true,
  },
  "get /admin/fundraisers": {
    "method": "get",
    "makePath": ({ }: {}) => `/admin/fundraisers`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": false,
  },
  "post /admin/fundraisers": {
    "method": "post",
    "makePath": ({ }: {}) => `/admin/fundraisers`,
    "hasRequest": true,
    "hasResponse": true,
    "hasParams": false,
  },
  "get /admin/fundraisers/{fundraiserId}/donations": {
    "method": "get",
    "makePath": ({
      fundraiserId,
    }: {
      fundraiserId: string,
    }) => `/admin/fundraisers/${fundraiserId}/donations`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": true,
  },
  "post /admin/fundraisers/{fundraiserId}/donations": {
    "method": "post",
    "makePath": ({
      fundraiserId,
    }: {
      fundraiserId: string,
    }) => `/admin/fundraisers/${fundraiserId}/donations`,
    "hasRequest": true,
    "hasResponse": true,
    "hasParams": true,
  },
  "patch /admin/fundraisers/{fundraiserId}/donations/{donationId}": {
    "method": "patch",
    "makePath": ({
      fundraiserId,
      donationId,
    }: {
      fundraiserId: string,
      donationId: string,
    }) => `/admin/fundraisers/${fundraiserId}/donations/${donationId}`,
    "hasRequest": true,
    "hasResponse": false,
    "hasParams": true,
  },
  "get /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments": {
    "method": "get",
    "makePath": ({
      fundraiserId,
      donationId,
    }: {
      fundraiserId: string,
      donationId: string,
    }) => `/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": true,
  },
  "post /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments": {
    "method": "post",
    "makePath": ({
      fundraiserId,
      donationId,
    }: {
      fundraiserId: string,
      donationId: string,
    }) => `/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments`,
    "hasRequest": true,
    "hasResponse": true,
    "hasParams": true,
  },
  "patch /admin/fundraisers/{fundraiserId}/donations/{donationId}/payments/{paymentId}": {
    "method": "patch",
    "makePath": ({
      fundraiserId,
      donationId,
      paymentId,
    }: {
      fundraiserId: string,
      donationId: string,
      paymentId: string,
    }) => `/admin/fundraisers/${fundraiserId}/donations/${donationId}/payments/${paymentId}`,
    "hasRequest": true,
    "hasResponse": false,
    "hasParams": true,
  },
  "patch /admin/fundraisers/{fundraiserId}": {
    "method": "patch",
    "makePath": ({
      fundraiserId,
    }: {
      fundraiserId: string,
    }) => `/admin/fundraisers/${fundraiserId}`,
    "hasRequest": true,
    "hasResponse": false,
    "hasParams": true,
  },
  "get /admin/login": {
    "method": "get",
    "makePath": ({ }: {}) => `/admin/login`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": false,
  },
  "post /admin/login/google": {
    "method": "post",
    "makePath": ({ }: {}) => `/admin/login/google`,
    "hasRequest": true,
    "hasResponse": true,
    "hasParams": false,
  },
  "post /admin/login/impersonation": {
    "method": "post",
    "makePath": ({ }: {}) => `/admin/login/impersonation`,
    "hasRequest": true,
    "hasResponse": true,
    "hasParams": false,
  },
  "get /admin/tasks": {
    "method": "get",
    "makePath": ({ }: {}) => `/admin/tasks`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": false,
  },
  "post /admin/tasks/{taskId}": {
    "method": "post",
    "makePath": ({
      taskId,
    }: {
      taskId: string,
    }) => `/admin/tasks/${taskId}`,
    "hasRequest": false,
    "hasResponse": false,
    "hasParams": true,
  },
  "post /public/fundraisers/{fundraiserId}/donation": {
    "method": "post",
    "makePath": ({
      fundraiserId,
    }: {
      fundraiserId: string,
    }) => `/public/fundraisers/${fundraiserId}/donation`,
    "hasRequest": true,
    "hasResponse": true,
    "hasParams": true,
  },
  "get /public/fundraisers/{fundraiserId}": {
    "method": "get",
    "makePath": ({
      fundraiserId,
    }: {
      fundraiserId: string,
    }) => `/public/fundraisers/${fundraiserId}`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": true,
  },
  "get /public/status": {
    "method": "get",
    "makePath": ({ }: {}) => `/public/status`,
    "hasRequest": false,
    "hasResponse": true,
    "hasParams": false,
  },
  "post /scheduler/collect-payments": {
    "method": "post",
    "makePath": ({ }: {}) => `/scheduler/collect-payments`,
    "hasRequest": false,
    "hasResponse": false,
    "hasParams": false,
  },
  "post /stripe/webhook": {
    "method": "post",
    "makePath": ({ }: {}) => `/stripe/webhook`,
    "hasRequest": true,
    "hasResponse": false,
    "hasParams": false,
  },
} as const
