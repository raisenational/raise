import axios from "axios"
import env from "../env/env"

export const sendMessage = async (text: string): Promise<void> => {
  const response = await axios({
    method: "post",
    baseURL: "https://slack.com/api/",
    url: "chat.postMessage",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
    data: {
      channel: env.SLACK_CHANNEL_ID,
      text,
    },
  })

  if (!response.data.ok) {
    throw new Error(`Error from Slack API: ${response.data.error}`)
  }
}
