import { createHash } from "crypto"

export const NATIONAL = "National"
export const DEMO = "Demo"
export const CAMBRIDGE = "Cambridge"

// To add a user, SHA1 their Google account email and add them to this map
// This is hopefully temporary until we get G Suite
// We use hashes to avoid checking-in people's personal emails to the repo
const USER_MAP: Record<string, string[]> = {
  "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": [NATIONAL], // Adam
  "7b023b5154a262453b5c3f1157a866a8f3be6f63": [DEMO], // Malena
  "48a578c28e6c22a3075773c60a601c8971551518": [NATIONAL] // Valentin
}

export const getGroups = (email: string): string[] | undefined => USER_MAP[createHash("sha1").update(email).digest("hex")]
