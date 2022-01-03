// eslint-disable-next-line import/no-extraneous-dependencies
import { compile } from "json-schema-to-typescript"
import { readFileSync, writeFileSync, unlinkSync } from "fs"

// Hack to import schemas defined in ts into js
const schemasSource = readFileSync(new URL("./src/schemas.ts", import.meta.url), { encoding: "utf-8" })
  .replace(/import (type )?(\{[^}]*\}|\* as) .*/gm, "")
  .replace(/export type .*/g, "")
  .replace(/: JSONSchema<[^>]*>/g, "")
writeFileSync(new URL("schemas.mjs", import.meta.url), schemasSource)
// eslint-disable-next-line import/no-unresolved,import/extensions
const schemas = await import("./schemas.mjs")
unlinkSync(new URL("schemas.mjs", import.meta.url))

const deepClone = (item) => {
  if (Array.isArray(item)) return item.slice().map(deepClone)
  if (typeof item !== "object") return item

  const n = {}
  // eslint-disable-next-line no-restricted-syntax,guard-for-in
  for (const key in item) {
    n[key] = deepClone(item[key])
  }
  return n
}

const sourceWithDuplicates = (await Promise.all(
  Object.entries(schemas).map(([k, v]) =>
    compile(deepClone(v), k.replace(/Schema$/, ""), { bannerComment: "" })
  )
)).join("\n")

// Remove duplicate definitions
const names = new Set()
const source = sourceWithDuplicates.split(/^export /m).map((d) => {
  if (!d) return d

  const name = d.match(/(?:type|interface) (?<name>\w+) [={]/)?.groups?.name
  if (!name) throw new Error('Failed to determine name for code: ' + d)

  if (names.has(name)) return "";
  names.add(name)

  return "export " + d;
}).join('')

writeFileSync(
  new URL("./src/schemaTypes.ts", import.meta.url),
  `/* eslint-disable */\n/**\n* This file was automatically generated. DO NOT MODIFY IT BY HAND.\n* Instead, modify schemas.ts, and run "npm run build".\n*/\n${source}`
)
