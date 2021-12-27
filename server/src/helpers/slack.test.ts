import axios from "axios"
import env from "../env/env"
import { sendMessage } from "./slack"

jest.mock("axios", () => jest.fn().mockResolvedValue({ data: { ok: true } }))
jest.unmock("./slack")

test("sendMessage calls Slack API correctly", async () => {
  await sendMessage("This message was sent from slack.test.ts")

  expect(axios).toHaveBeenCalledTimes(1)
  expect(axios).toHaveBeenCalledWith({
    method: "post",
    baseURL: "https://slack.com/api/",
    url: "chat.postMessage",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
    data: {
      channel: env.SLACK_CHANNEL_ID,
      text: "This message was sent from slack.test.ts",
    },
  })
})

test("rethrows axios error", async () => {
  (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { ok: false, error: "not_in_channel" } })

  await expect(() => sendMessage("This message was sent from slack.test.ts"))
    .rejects.toThrowError("Slack API: not_in_channel")

  expect(axios).toHaveBeenCalledTimes(1)
})

test("rethrows Slack API error", async () => {
  (axios as unknown as jest.Mock).mockRejectedValueOnce(new Error("this would be an axios error"))

  await expect(() => sendMessage("This message was sent from slack.test.ts"))
    .rejects.toThrowError("this would be an axios error")

  expect(axios).toHaveBeenCalledTimes(1)
})
