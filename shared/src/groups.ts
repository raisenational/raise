const mapOf = <T extends string>(keys: readonly T[]): { [K in T]: K } => keys.reduce((acc, cur) => {
  acc[cur] = cur
  return acc
}, Object.create(null))

/** @deprecated */
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

/** @deprecated */
export const g = mapOf(groups)

/** @deprecated */
export type Group = keyof typeof g;

export const fixedGroups = {
  National: "01GPY6D06N6EHEE0RGRNZJ60K7",
  NationalTech: "01GPY6D06NTBC0674WHR7H60YT",
}
