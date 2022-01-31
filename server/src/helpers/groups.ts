/* eslint-disable quote-props */
import { createHash } from "crypto"
import { g, Group } from "@raise/shared"
import env from "../env/env"
import { Env } from "./types"

// To add a user, SHA1 (lowercase hex) their Google account email and add them to this map
// This is hopefully temporary until we get G Suite
// We use hashes to avoid checking-in people's personal emails to the repo
const USER_MAP: Record<Env["STAGE"], Record<string, Group[]>> = {
  "local": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": [g.National], // Adam
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": [g.National], // Malena
    "48a578c28e6c22a3075773c60a601c8971551518": [g.National], // Valentin
    "9c42b2f09ca8ade4772ffede4c988b3a6fb12b29": [g.National], // Veer
    "e64a1becda7234d98691524ee0789e31372414ba": [g.National], // Abe
    "69121db77450a21ada845a6390feacc6ded18e41": [g.National], // Joe

    "ea72b00f4d71e8c8bca6089a741b848fc793d2c0": [g.National], // raisenational@gmail.com
    "94e827a024769e9176640c706ff36f921b9426b0": [g.Demo], // raisedemo@gmail.com
  },
  "dev": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": [g.National], // Adam
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": [g.National], // Malena
    "48a578c28e6c22a3075773c60a601c8971551518": [g.National], // Valentin
    "9c42b2f09ca8ade4772ffede4c988b3a6fb12b29": [g.National], // Veer
    "e64a1becda7234d98691524ee0789e31372414ba": [g.National], // Abe
    "69121db77450a21ada845a6390feacc6ded18e41": [g.National], // Joe

    "ea72b00f4d71e8c8bca6089a741b848fc793d2c0": [g.National], // raisenational@gmail.com
    "94e827a024769e9176640c706ff36f921b9426b0": [g.Demo], // raisedemo@gmail.com
    "75645e6de554c23dfdcca834864e0915656ced8e": [g.Cambridge], // mayweekalternative@gmail.com
    "5a2cb00a68211d0daf14de911f5fc6058adb660d": [g.Durham], // raisedurham@gmail.com
    "e94af59772715a31fffd47d56f7214f1c40ae046": [g.Glasgow], // raiseglasgow@gmail.com
    "79ddbd6325661f5d92f28790a0ba17740b49a96e": [g.Oxford], // raiseoxford@gmail.com
    "c2f0068ec52507376aab3b18769ec2695083b309": [g.Sheffield], // raisesheffield@gmail.com
    "74d103d8a3c04b7f427e377cf0787be96e51576a": [g.Warwick], // raisewarwick@gmail.com
    "c14fd714d3274986212e1f51e70e6878aa28c641": [g.Imperial], // raiseimperial@gmail.com
  },
  // Before granting a user prod access, you MUST check:
  // - they are adequately trained
  // - they have passed the security quiz
  // - this is a individual's account, not a group of people
  "prod": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": [g.National], // Adam
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": [g.National], // Malena
    "69121db77450a21ada845a6390feacc6ded18e41": [g.National], // Joe
  },
}

// This should only be used for login. In other places, we should be getting groups from the decoded JWT
export const getGroups = (email: string): Group[] | undefined => USER_MAP[env.STAGE][createHash("sha1").update(email).digest("hex")]
