/* eslint-disable no-restricted-imports */
import _axios, { AxiosError, AxiosRequestConfig } from "axios"
import {
  makeUseAxios, Options, ResponseValues, UseAxios, UseAxiosResult,
} from "axios-hooks"
import { useEffect, useState } from "react"
import env from "../env/env"

export interface AuthState {
  token: string,
  expiresAt: number,
  groups: string[],
}

const LS_AUTH_KEY = "raise_auth"
const getAuthFromLocalStorage = (): AuthState | undefined => {
  const value = typeof localStorage === "undefined" ? null : localStorage.getItem(LS_AUTH_KEY)
  if (value !== null) {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed.token !== "string") return undefined
      if (typeof parsed.expiresAt !== "number") return undefined
      if (!Array.isArray(parsed.groups)) return undefined
      if (!parsed.groups.every((g: unknown) => typeof g === "string")) return undefined
      if (parsed.expiresAt < (new Date().getTime() / 1000)) return undefined
      return {
        token: parsed.token,
        expiresAt: parsed.expiresAt,
        groups: parsed.groups,
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
  baseURL: env.API_BASE_URL,
  timeout: 60000,
}

const logoutOnTokenExpiry = (err: any) => {
  if (err && err.isAxiosError) {
    const axiosError = err as AxiosError
    if (axiosError.response?.status === 401 && typeof axiosError.response?.data?.message === "string" && axiosError.response.data.message.startsWith("Token expired")) {
      setAuthState()
      // eslint-disable-next-line no-alert
      setTimeout(() => alert("You have been logged out as the server indicated your access token has expired."), 100)
    }
  }
  return Promise.reject(err)
}

const axiosWithDefaults = _axios.create(defaultConfig)
axiosWithDefaults.interceptors.response.use(undefined, logoutOnTokenExpiry)

const realUseAxios = makeUseAxios({ axios: axiosWithDefaults })

export const useAxios = (<TResponse = unknown, TBody = unknown, TError = unknown>(config: AxiosRequestConfig | string, options?: Options) => {
  // Hack for Gatsby SSR so that dynamic components appear to be loading
  if (typeof window === "undefined") {
    return [{
      loading: true,
      error: null,
    }, () => { /* noop */ }, () => { /* noop */ }] as UseAxiosResult<TResponse, TBody, TError>
  }

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

  return realUseAxios<TResponse, TBody, TError>(config, options)
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

export const asResponseValues = <TResponse, TBody, TError>(item: TResponse | undefined, inheritFrom: ResponseValues<unknown, TBody, TError>): ResponseValues<TResponse, TBody, TError> => ({
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
