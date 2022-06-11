import type { AWS } from "@serverless/typescript"
import { readdirSync } from "fs"
import { join } from "path"

export const ALLOWED_METHODS = ["get", "post", "patch", "delete"] as const
export type Method = typeof ALLOWED_METHODS[number]

/**
 * @returns Array of file paths, with each one representing a handler for an API endpoint
 */
export const getFunctionPaths = (basePath: string = join(__dirname, "..", "src", "api"), path: string = basePath): string[] => {
  const results: string[] = []
  const files = readdirSync(path, { withFileTypes: true })
  for (const file of files) {
    if (file.name.startsWith("_") || file.name.endsWith(".test.ts") || file.name === "router.ts") {
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

const isAllowedMethod = (method: string): method is Method => (ALLOWED_METHODS as readonly string[]).includes(method);
