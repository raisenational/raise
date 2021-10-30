import type { ScheduledHandler } from "aws-lambda"
import axios from "axios"
import jwt from "jsonwebtoken"
import type { AuthTokenPayload } from "../../helpers/types"

export const main: ScheduledHandler<unknown> = async (event) => {
  const now = Math.floor(new Date().getTime() / 1000)
  const authTokenPayload: AuthTokenPayload = {
    subject: "scheduler",
    groups: [],
    iat: now,
    exp: now + 60, // 1 minute
  }

  const token = jwt.sign(
    authTokenPayload,
    process.env.JWT_PRIVATE_KEY!,
    { algorithm: "ES256" },
  )

  await axios("/scheduler/collect-payments", {
    baseURL: process.env.API_BASE_URL!,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
