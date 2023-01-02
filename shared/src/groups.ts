const mapOf = <T extends string>(keys: readonly T[]): { [K in T]: K } => keys.reduce((acc, cur) => {
  acc[cur] = cur
  return acc
}, Object.create(null))

export const groups = [
  "National",
  "NationalTech",

  "Bristol",
  "Cambridge",
  "Durham",
  "Edinburgh",
  "Glasgow",
  "Leeds",
  "Oxford",
  "Sheffield",
  "Warwick",

  "Demo",
  "Test",
] as const

export const g = mapOf(groups)

export type Group = keyof typeof g;
