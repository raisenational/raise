/* eslint-disable quote-props */
import { createHash } from "crypto"
import { g, Group } from "@raise/shared"
import createHttpError from "http-errors"
import env from "../env/env"
import { Env } from "./types"

const TRAINING_VALIDITY_IN_MILLISECONDS = 31556952000 // 1 year

interface UserGroupDefinition {
  _comment: string,
  groups: Group[],
  passedTrainingAt?: Date,
}

// To add a user, SHA1 (lowercase hex) their lowercased Google account email and add them to this map
// We use hashes to avoid checking-in people's personal emails to the repo
const USER_MAP: Record<Env["STAGE"], Record<string, UserGroupDefinition>> = {
  "local": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": {
      _comment: "Adam Jones",
      groups: [g.National, g.NationalTech],
    },
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": {
      _comment: "Malena Schmidt",
      groups: [g.National, g.NationalTech],
    },

    "ea72b00f4d71e8c8bca6089a741b848fc793d2c0": {
      _comment: "raisenational@gmail.com",
      groups: [g.National],
    },
    "94e827a024769e9176640c706ff36f921b9426b0": {
      _comment: "raisedemo@gmail.com",
      groups: [g.Demo],
    },
  },
  "dev": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": {
      _comment: "Adam Jones",
      groups: [g.National, g.NationalTech],
    },
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": {
      _comment: "Malena Schmidt",
      groups: [g.National, g.NationalTech],
    },

    "ea72b00f4d71e8c8bca6089a741b848fc793d2c0": {
      _comment: "raisenational@gmail.com",
      groups: [g.National],
    },
    "c9c98271bd9417e5088546f8a2fb0dc43e015569": {
      _comment: "raisenationaltech@gmail.com",
      groups: [g.National, g.NationalTech],
    },
    "94e827a024769e9176640c706ff36f921b9426b0": {
      _comment: "raisedemo@gmail.com",
      groups: [g.Demo],
    },
    "75645e6de554c23dfdcca834864e0915656ced8e": {
      _comment: "mayweekalternative@gmail.com",
      groups: [g.Cambridge],
    },
    "5a2cb00a68211d0daf14de911f5fc6058adb660d": {
      _comment: "raisedurham@gmail.com",
      groups: [g.Durham],
    },
    "e94af59772715a31fffd47d56f7214f1c40ae046": {
      _comment: "raiseglasgow@gmail.com",
      groups: [g.Glasgow],
    },
    "79ddbd6325661f5d92f28790a0ba17740b49a96e": {
      _comment: "raiseoxford@gmail.com",
      groups: [g.Oxford],
    },
    "c2f0068ec52507376aab3b18769ec2695083b309": {
      _comment: "raisesheffield@gmail.com",
      groups: [g.Sheffield],
    },
    "74d103d8a3c04b7f427e377cf0787be96e51576a": {
      _comment: "raisewarwick@gmail.com",
      groups: [g.Warwick],
    },
    "127ef66bb694c8f3a32c9a18034e879ad142039e": {
      _comment: "raisebristol@gmail.com",
      groups: [g.Bristol],
    },
    "651abf267485d06b931c681d0e457e61ab3a2141": {
      _comment: "raiseedinburgh@gmail.com",
      groups: [g.Edinburgh],
    },
    "4633c328a67be2d45aa5e70bc7fb0c6b0e418241": {
      _comment: "raiseleeds@gmail.com",
      groups: [g.Leeds],
    },
  },
  // Before granting a user prod access, you MUST check:
  // - they are adequately trained
  // - they have passed the security training
  // - this is a individual's account, not a group of people
  "prod": {
    "715ec86cfb0e42b3f41aec77fa7b4a8441128d5e": {
      _comment: "Adam Jones",
      groups: [g.National, g.NationalTech],
      passedTrainingAt: new Date("2023-01-02T18:47:46Z"),
    },
    "7b023b5154a262453b5c3f1157a866a8f3be6f63": {
      _comment: "Malena Schmidt",
      groups: [g.National, g.NationalTech],
      passedTrainingAt: new Date("2022-01-30T23:39:16Z"),
    },
    "69121db77450a21ada845a6390feacc6ded18e41": {
      _comment: "Joe Benton",
      groups: [g.National],
      passedTrainingAt: new Date("2022-01-26T08:15:42Z"),
    },
    "e64a1becda7234d98691524ee0789e31372414ba": {
      _comment: "Abe Tolley",
      groups: [g.National],
      passedTrainingAt: new Date("2022-01-27T00:03:13Z"),
    },
    "92e6bbd90b80e38395c5f8935fd33912e70ca578": {
      _comment: "Susanne Karbe",
      groups: [g.National],
      passedTrainingAt: new Date("2022-01-31T21:24:01Z"),
    },
    "397e695a66c7a39fd56784ab336030e668ec094b": {
      _comment: "George Rosenfeld",
      groups: [g.National],
      passedTrainingAt: new Date("2022-01-28T02:54:24Z"),
    },
    "98ce26167b64593f49a124209dcfaaf9ae31a2da": {
      _comment: "Clara Tuffrey",
      groups: [g.National],
      passedTrainingAt: new Date("2022-02-13T17:26:19Z"),
    },
    "cbd2e0b2e4b5ba20ce967efefd508b211e15078f": {
      _comment: "Thomas Cohen",
      groups: [g.National],
      passedTrainingAt: new Date("2022-01-31T14:57:13Z"),
    },
    "9d5eef6abcc85deeb6db5a5ecde8a39f6a804272": {
      _comment: "Rahul Shah",
      groups: [g.National],
      passedTrainingAt: new Date("2022-02-02T17:23:16Z"),
    },
    "c37b818d29d0811a29f85348e9287e6a8e9b4447": {
      _comment: "Hannah Wragg",
      groups: [g.National],
      passedTrainingAt: new Date("2022-02-04T13:10:28Z"),
    },
    "0361cc51f2c7f88fee8249b70da9c723bb7ee51d": {
      _comment: "Oviya Anand",
      groups: [g.Oxford],
      passedTrainingAt: new Date("2022-02-03T19:47:17Z"),
    },
    "127da419c96f6dfcfa2d32e71e1a9c2581b781ef": {
      _comment: "Shahamath Hussain",
      groups: [g.Warwick],
      passedTrainingAt: new Date("2022-05-26T13:08:31Z"),
    },
    "834f979cdd47e5b894847e224f52ae43acbb9b64": {
      _comment: "Olivia Collotta",
      groups: [g.Edinburgh],
      passedTrainingAt: new Date("2023-01-02T21:07:22Z"),
    },
    "db9406e849723d5400afac8f8fff1417872b4276": {
      _comment: "Chloe Shieh",
      groups: [g.Cambridge],
      passedTrainingAt: new Date("2023-01-02T22:30:41Z"),
    },
    "813530c6cc110b5fc97534e53cfa6c2c9f2f92b2": {
      _comment: "Benjamin Smith",
      groups: [g.Bristol],
      passedTrainingAt: new Date("2023-01-04T20:19:30Z"),
    },
    "ddb53eb9576f2ccc93b191240d0d37570fc37ec0": {
      _comment: "Louis Danker",
      groups: [g.Edinburgh],
      passedTrainingAt: new Date("2023-01-05T02:38:22Z"),
    },
  },
}

// This should only be used for login. In other places, we should be getting groups from the decoded JWT
export const getGroups = (email: string): Group[] => {
  const userGroupDefinition = USER_MAP[env.STAGE][createHash("sha1").update(email.toLowerCase()).digest("hex")]
  if (userGroupDefinition === undefined) {
    throw new createHttpError.Forbidden(`Your account, ${email}, is not allowlisted to use the platform`)
  }

  if (env.STAGE === "prod" && Number.isNaN(userGroupDefinition.passedTrainingAt)) {
    throw new createHttpError.InternalServerError(`Invalid passedTrainingAt for ${email}`)
  }

  if (userGroupDefinition.passedTrainingAt) {
    if (userGroupDefinition.passedTrainingAt.getTime() + TRAINING_VALIDITY_IN_MILLISECONDS < new Date().getTime()) {
      throw new createHttpError.Forbidden(`Security training for ${email} out of date, last marked completed on ${userGroupDefinition.passedTrainingAt}`)
    }
  }

  return userGroupDefinition.groups
}
