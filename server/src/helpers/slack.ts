import axios from "axios"

export const main = async () => {
  try {
    const text = "Hello World ! "

    const response = await axios({
      method: "post",
      baseURL: "https://slack.com/api/",
      url: "chat.postMessage",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer xoxb-825862040501-2829297236371-ThN78vWqKY46NDUEtlbiLpGX",
      },
      data: {
        channel: "CQ9RC2HB7",
        text,
      },
    })
    console.log(response)
    if (!response.data.ok) {
      throw new Error(response.data.error)
    }
  } catch (e) {
    console.error(`There was an error ${e}`)
  }
}
