/** Returns amount in pence for a money string */
export const parseMoney = (value: string): number => {
  const matches = value.match(/^£?(\d+)(\.(\d\d))?$/)
  if (!matches) throw new Error("Not a monetary value")
  return 100 * parseInt(matches[1], 10) + parseInt(matches[3] ?? "0", 10)
}
