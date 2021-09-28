import axios from "axios"
import { makeUseAxios } from "axios-hooks"

export default makeUseAxios({
  axios: axios.create({
    // baseURL: "https://bblp6lj50j.execute-api.eu-west-1.amazonaws.com/",
    baseURL: "http://localhost:3000/",
  }),
})
