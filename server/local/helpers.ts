import { readdirSync } from "fs"
import { join } from "path"
import { JSONSchema } from "../src/schemas"
import { ExternalHandler } from "../src/helpers/types"

export const ALLOWED_METHODS = ["get", "post", "patch", "delete"] as const
export type Method = typeof ALLOWED_METHODS[number]

const isAllowedMethod = (method: string): method is Method => (ALLOWED_METHODS as readonly string[]).includes(method);

export interface RouteDefinition {
  /**
   * @example "/public/fundraisers/{fundraiserId}"
   */
  path: string,
  method: Method,
  params: string[],
  requestType: string | null,
  responseType: string | null,
  requestSchema: string | null,
  responseSchema: string | null,
  requiresAuth: boolean,
}

/**
 * @returns Array of file paths, with each one representing a handler for an API endpoint
 */
export const getFunctionPaths = (basePath: string = join(__dirname, "..", "src", "api"), path: string = basePath): string[] => {
  const results: string[] = []
  const files = readdirSync(path, { withFileTypes: true })
  for (const file of files) {
    if (file.name.startsWith("_") || file.name.endsWith(".test.ts")) {
      // ignore
    } else if (file.isFile()) {
      const method = file.name.slice(0, file.name.lastIndexOf("."))
      if (!isAllowedMethod(method)) {
        throw new Error(`Disallowed method ${method} at path ${path} found when scanning for functions`)
      }

      const relativePath = join(path.slice(basePath.length + 1), method)
      results.push(relativePath)
    } else if (file.isDirectory()) {
      getFunctionPaths(basePath, join(path, file.name)).forEach(p => results.push(p))
    } else {
      throw new Error(`Unexpected file ${file.name} at path ${path} found when scanning for functions`)
    }
  }
  return results
}

export const camelCase = (s: string): string => s.replace(/[/_\-\\ ]+([a-zA-Z])/g, (g) => g.charAt(g.length - 1).toUpperCase())
export const pascalCase = (s: string): string => s.replace(/(^|[/_\-\\ ]+)([a-zA-Z])/g, (g) => g.charAt(g.length - 1).toUpperCase())

export const getLambdaFunctionName = (path: string) => camelCase(path.replace(/\{.*?\}/g, ""))

// NonNullable<NonNullable<AWS["functions"]>[""]["events"][0]>
export const getFunctionEvent = (filePath: string): { httpApi: { method: Method, path: string } } => {
  const routePathSegments = ("/" + filePath.replace(/\\+/g, "/")).split('/');
  const method = routePathSegments[routePathSegments.length - 1];
  const path = routePathSegments.slice(0, -1).join('/');

  if (!isAllowedMethod(method)) {
    throw new Error(`Disallowed method ${method} at path ${filePath}`)
  }

  return ({ httpApi: { method: method, path } })
}

export const getEndpointDefinitions = async () => {
  const schemas = await import("../src/schemas/jsonSchema")
  const findSchemaName = makeFindSchemaName(schemas);

  return Promise.all(getFunctionPaths().map(async filePath => {
    const exported: { main: ExternalHandler<any, any, any> } = await import(join(__dirname, "..", "src", "api", filePath));
    verifyIsHandler({ filePath, exports: exported });
    const { httpApi: { path, method } } = getFunctionEvent(filePath)

    const params = path.match(/\{[a-zA-Z0-9]*\}/g)?.map((k) => k.slice(1, -1)) ?? [];

    const requestSchema = findSchemaName({ filePath, schema: exported.main.requestSchema })
    const responseSchema = findSchemaName({ filePath, schema: exported.main.responseSchema })

    // On the assumption that the schemas have the name of the type prefixed with a '$'
    const requestType = requestSchema === null ? null : requestSchema.slice(1)
    const responseType = responseSchema === null ? null : responseSchema.slice(1)

    const definition: RouteDefinition = {
      path,
      method,
      params,
      requestType,
      requestSchema,
      responseType,
      responseSchema,
      requiresAuth: exported.main.requiresAuth,
    }
    return definition;
  }))
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
