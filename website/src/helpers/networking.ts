/* eslint-disable no-restricted-imports */
import _axios, { AxiosError, AxiosRequestConfig } from "axios"
import {
  makeUseAxios, Options, ResponseValues, UseAxios,
} from "axios-hooks"
import { useEffect, useState } from "react"

export interface AuthState {
  token: string,
  expiresAt: number,
}

const LS_AUTH_KEY = "raise_auth"
const getAuthFromLocalStorage = (): AuthState | undefined => {
  const value = typeof localStorage === "undefined" ? null : localStorage.getItem(LS_AUTH_KEY)
  if (value !== null) {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed.token !== "string") return undefined
      if (typeof parsed.expiresAt !== "number") return undefined
      if (parsed.expiresAt < (new Date().getTime() / 1000)) return undefined
      return {
        token: parsed.token,
        expiresAt: parsed.expiresAt,
      }
    } catch {
      // invalid JSON
    }
  }
  return undefined
}

let authState: AuthState | undefined = getAuthFromLocalStorage()
const authStateListeners = new Set<() => void>()
const setAuthState = (newState?: AuthState) => {
  authState = newState
  try {
    if (newState) {
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(newState))
    } else {
      localStorage.removeItem(LS_AUTH_KEY)
    }
  } catch {
    // no-op
  }
  authStateListeners.forEach((l) => l())
}

export const useAuthState = () => {
  const [state, setState] = useState(authState)
  useEffect(() => {
    const listener = () => {
      setState(authState)
    }
    authStateListeners.add(listener)
    listener()
    return () => { authStateListeners.delete(listener) }
  }, [])
  return [state, setAuthState] as const
}

const defaultConfig: AxiosRequestConfig = {
  baseURL: typeof window !== "undefined" && window.location.host.startsWith("localhost")
    ? "http://localhost:8001/"
    : "https://bblp6lj50j.execute-api.eu-west-1.amazonaws.com/",
  timeout: 60000,
}

const logoutOnTokenExpiry = (err: any) => {
  // TODO: show a notification explaining the access token has expired
  // (or maybe just handle this in the alert displayed about the error, prompting the user to relogin?)

  if (err && err.isAxiosError) {
    const axiosError = err as AxiosError
    if (axiosError.response?.status === 401 && typeof axiosError.response?.data?.message === "string" && axiosError.response.data.message.startsWith("Token expired")) {
      setAuthState()
    }
  }
  return Promise.reject(err)
}

const axiosWithDefaults = _axios.create(defaultConfig)
axiosWithDefaults.interceptors.response.use(undefined, logoutOnTokenExpiry)

const realUseAxios = makeUseAxios({ axios: axiosWithDefaults })

export const useAxios = (<TResponse = unknown, TError = unknown>(config: AxiosRequestConfig | string, options?: Options) => {
  if (typeof config === "string") {
    // eslint-disable-next-line no-param-reassign
    config = { url: config }
  }

  const [auth] = useAuthState()
  if (auth?.token) {
    // eslint-disable-next-line no-param-reassign
    config.headers = config.headers ?? {}
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return realUseAxios<TResponse, TError>(config, options)
}) as UseAxios
// @ts-ignore
// eslint-disable-next-line no-restricted-syntax,guard-for-in
for (const key in realUseAxios) useAxios[key] = realUseAxios[key]

export const useRawAxios = () => {
  const [auth] = useAuthState()
  if (auth?.token) {
    const axios = _axios.create({
      ...defaultConfig,
      headers: {
        ...defaultConfig.headers,
        Authorization: `Bearer ${auth.token}`,
      },
    })
    axios.interceptors.response.use(undefined, logoutOnTokenExpiry)

    return axios
  }

  return axiosWithDefaults
}

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
