/* eslint-disable quote-props */
import { createHash } from "crypto"
import env from "../env/env"
import { Env } from "./types"

export const NATIONAL = "National"
export const DEMO = "Demo"
export const CAMBRIDGE = "Cambridge"

// To add a user, SHA1 (lowercase hex) their Google account email and add them to this map
// This is hopefully temporary until we get G Suite
// We use hashes to avoid checking-in people's personal emails to the repo
const USER_MAP: Record<Env["STAGE"], Record<string, string[]>> = {
  "local": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": [NATIONAL], // Adam
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": [NATIONAL], // Malena
    "48a578c28e6c22a3075773c60a601c8971551518": [NATIONAL], // Valentin
    "9c42b2f09ca8ade4772ffede4c988b3a6fb12b29": [NATIONAL], // Veer
    "e64a1becda7234d98691524ee0789e31372414ba": [NATIONAL], // Abe
    "ea72b00f4d71e8c8bca6089a741b848fc793d2c0": [NATIONAL], // raisenational@gmail.com
  },
  "dev": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": [NATIONAL], // Adam
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": [NATIONAL], // Malena
    "48a578c28e6c22a3075773c60a601c8971551518": [NATIONAL], // Valentin
    "9c42b2f09ca8ade4772ffede4c988b3a6fb12b29": [NATIONAL], // Veer
    "e64a1becda7234d98691524ee0789e31372414ba": [NATIONAL], // Abe
    "ea72b00f4d71e8c8bca6089a741b848fc793d2c0": [NATIONAL], // raisenational@gmail.com
  },
  // Before granting a user prod access, you MUST check:
  // - they are adequately trained
  // - they have passed the security quiz
  // - this is a individual's account, not a group of people
  "prod": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": [NATIONAL], // Adam
  },
}

// This should only be used for login. In other places, we should be getting groups from the decoded JWT
export const getGroups = (email: string): string[] | undefined => USER_MAP[env.STAGE][createHash("sha1").update(email).digest("hex")]
