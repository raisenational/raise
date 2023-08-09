// eslint-disable-next-line import/no-extraneous-dependencies
import { compile } from "json-schema-to-typescript"
import { writeFileSync } from "fs"
import { join } from "path"
import type { JSONSchema4 } from "json-schema"

const main = async () => {
  const schemas = await import("../src/schemas/jsonSchema")

  const deepClone = <T>(item: T): T => {
    if (Array.isArray(item)) return item.slice().map(deepClone) as unknown as T
    if (typeof item !== "object") return item

    const n = {} as T
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const key in item) {
      n[key] = deepClone(item[key])
    }
    return n
  }

  const sourceWithDuplicates = (await Promise.all(
    Object.entries(schemas).map(([k, v]) => compile(deepClone(v as JSONSchema4), k.replace(/^\$/, ""), { bannerComment: "" })),
  )).join("\n")

  // Remove duplicate definitions
  const names = new Set<string>()
  const source = sourceWithDuplicates.split(/^export /m).map((d) => {
    if (!d) return d

    const name = d.match(/(?:type|interface) (?<name>\w+) [={]/)?.groups?.name
    if (!name) throw new Error(`Failed to determine name for code: ${d}`)

    if (names.has(name)) return ""
    names.add(name)

    return `export ${d}`
  }).join("")

  writeFileSync(
    join(__dirname, "../src/schemas/typescript.ts"),
    `/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify jsonSchema.ts, and run "npm run generate --workspace @raise/server"
 * (generate:schemas is run automatically if you're running the server).
 */
/* eslint-disable */

${source}`,
  )

  console.log(`✔ Wrote ${names.size} types based on ${Object.keys(schemas).length} schemas`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
