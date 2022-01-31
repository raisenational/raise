const mapOf = <T extends string>(keys: readonly T[]): { [K in T]: K } => keys.reduce((acc, cur) => {
  acc[cur] = cur
  return acc
}, Object.create(null))

export const groups = [
  "National",

  "Cambridge",
  "Durham",
  "Glasgow",
  "Oxford",
  "Sheffield",
  "Warwick",
  "Imperial",

  "Demo",
  "Test",
] as const

export const g = mapOf(groups)

export type Group = keyof typeof g;
