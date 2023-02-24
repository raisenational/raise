import { join } from "path"
import { getEndpointDefinitions } from "./helpers"
import { writeFileSync } from "fs"

const main = async () => {
  const definitions = await getEndpointDefinitions();

  const source = `/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the server, and run "npm run generate:router" from the server.
 */
/* eslint-disable */

export const importMap = {
${definitions.map(d => `  "${d.path}/${d.method}": () => import(".${d.path}/${d.method}"),`).join('\n')}
}
`

  const outputFile = join(__dirname, "../src/api/_router-imports.ts")

  writeFileSync(outputFile, source)

  console.log(`✔ Wrote router imports for ${definitions.length} endpoints`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
