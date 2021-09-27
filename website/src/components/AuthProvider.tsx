import * as React from "react"

export interface Auth {
  idToken: string,
  accessToken: string,
  name: string,
  email: string,
}

// NB: for ease of use, we always assume we are in an authed AuthProvider - the only time this isn't the case is on the login screen
// eslint-disable-next-line no-spaced-func,func-call-spacing
export const AuthContext = React.createContext<{ auth: Auth, setAuth: (a?: Auth) => void }>(undefined as never)

const LS_AUTH_KEY = "raise_auth"

const getAuthFromLocalStorage = (): Auth | undefined => {
  const value = typeof localStorage === "undefined" ? null : localStorage.getItem(LS_AUTH_KEY)
  if (value !== null) {
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed.idToken !== "string") return undefined
      if (typeof parsed.accessToken !== "string") return undefined
      if (typeof parsed.name !== "string") return undefined
      if (typeof parsed.email !== "string") return undefined
      return {
        idToken: parsed.idToken,
        accessToken: parsed.accessToken,
        name: parsed.name,
        email: parsed.email,
      }
    } catch {
      // invalid JSON
    }
  }
  return undefined
}

export const AuthProvider: React.FC<{}> = ({ children }) => {
  const [auth, _setAuth] = React.useState<Auth | undefined>(getAuthFromLocalStorage())
  const setAuth = typeof localStorage === "undefined" ? _setAuth : (a?: Auth) => {
    _setAuth(a)
    try {
      if (a) {
        localStorage.setItem(LS_AUTH_KEY, JSON.stringify(a))
      } else {
        localStorage.removeItem(LS_AUTH_KEY)
      }
    } catch {
      // no-op
    }
  }

  return (
    <AuthContext.Provider value={{ auth: auth as Auth, setAuth }}>{children}</AuthContext.Provider>
  )
}
