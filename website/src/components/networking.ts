/* eslint-disable no-restricted-imports */
import _axios from "axios"
import { makeUseAxios, ResponseValues } from "axios-hooks"

export const axios = _axios.create({
  baseURL: window.location.host.startsWith("localhost")
    ? "http://localhost:3000/"
    : "https://bblp6lj50j.execute-api.eu-west-1.amazonaws.com/",
})

export const useAxios = makeUseAxios({ axios })

export const asResponseValues = <TResponse, TError>(item: TResponse | undefined, inheritFrom: ResponseValues<unknown, TError>): ResponseValues<TResponse, TError> => ({
  data: item ?? undefined,
  loading: inheritFrom.loading,
  error: inheritFrom.error,
  response: inheritFrom.response === undefined || item === undefined || item === null ? undefined : {
    data: item,
    status: inheritFrom.response.status,
    statusText: inheritFrom.response.statusText,
    headers: inheritFrom.response.headers,
    config: inheritFrom.response.config,
    request: inheritFrom.response.request,
  },
})
