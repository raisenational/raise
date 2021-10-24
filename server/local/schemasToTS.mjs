// eslint-disable-next-line import/no-extraneous-dependencies
import { compile } from "json-schema-to-typescript"
import { readFileSync, writeFileSync, unlinkSync } from "fs"

// Hack to import schemas defined in ts into js
const schemasSource = readFileSync(new URL("../src/helpers/schemas.ts", import.meta.url), { encoding: "utf-8" })
  .replace(/import (type )?(\{[^}]*\}|\* as) .*/gm, "")
  .replace(/export type .*/g, "")
  .replace(/: JSONSchema<[^>]*>/g, "")
writeFileSync(new URL("schemas.mjs", import.meta.url), schemasSource)
const schemas = await import("./schemas.mjs")
unlinkSync(new URL("schemas.mjs", import.meta.url))

const schemaTypesSource = (await Promise.all(Object.entries(schemas).map(([k, v]) => compile({ ...v }, k, { bannerComment: "" })))).join("\n")
writeFileSync(new URL("../src/helpers/schemaTypes.ts", import.meta.url), `/* eslint-disable */\n/**\n* This file was automatically generated. DO NOT MODIFY IT BY HAND.\n* Instead, modify schemas.ts, and run "npm run schemas".\n*/\n${schemaTypesSource}`)
