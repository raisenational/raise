/* eslint-disable quote-props */
import { createHash } from "crypto"
import { g, Group } from "@raise/shared"
import env from "../env/env"
import { Env } from "./types"

// To add a user, SHA1 (lowercase hex) their lowercased Google account email and add them to this map
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
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": [g.National], // Adam Jones
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": [g.National], // Malena Schmidt
    "69121db77450a21ada845a6390feacc6ded18e41": [g.National], // Joe Benton
    "e64a1becda7234d98691524ee0789e31372414ba": [g.National], // Abe Tolley
    "92e6bbd90b80e38395c5f8935fd33912e70ca578": [g.National], // Susanne Karbe
    "397e695a66c7a39fd56784ab336030e668ec094b": [g.National], // George Rosenfeld
    "84c27a03d56e751ff8331777004b0b157c8e78a5": [g.Glasgow], // Andrew Taylor
    "1fa16431019b62af5bcbcb93b27f6b29014a5ba1": [g.Glasgow], // Rhiannon Fagan
    "cbd2e0b2e4b5ba20ce967efefd508b211e15078f": [g.Durham], // Thomas Cohen
    "9d5eef6abcc85deeb6db5a5ecde8a39f6a804272": [g.Cambridge], // Rahul Shah
    "4423c1c1d952c230b42d1b621935e4222bae2a56": [g.Cambridge], // Riya Mody
    "20e6081c59abea2fbca6c58b44c785ab7a80ca4f": [g.Oxford], // Neha Banerjee
    "0361cc51f2c7f88fee8249b70da9c723bb7ee51d": [g.Oxford], // Oviya Anand
  },
}

// This should only be used for login. In other places, we should be getting groups from the decoded JWT
export const getGroups = (email: string): Group[] | undefined => USER_MAP[env.STAGE][createHash("sha1").update(email.toLowerCase()).digest("hex")]
