import jwt from "jsonwebtoken"
import env from "../env/env"
import { LoginResponse } from "../schemas"
import { insertAudit } from "./db"
import { getGroups } from "./groups"
import { AuthTokenPayload } from "./types"

export const login = async (email: string): Promise<LoginResponse> => {
  const now = Math.floor(new Date().getTime() / 1000)
  const expiresAt = now + 3600 // 1 hour

  const groups = getGroups(email)

  await insertAudit({
    object: email,
    action: "login",
  })

  const authTokenPayload: AuthTokenPayload = {
    subject: email,
    groups,
    iat: now,
    exp: expiresAt,
  }

  return {
    accessToken: jwt.sign(
      authTokenPayload,
      env.JWT_PRIVATE_KEY,
      { algorithm: "ES256" },
    ),
    expiresAt,
    groups,
  }
}
