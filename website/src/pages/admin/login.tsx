import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { useGoogleLogin, GoogleLoginResponse } from "react-google-login"

import Section, { SectionTitle } from "../../components/Section"
import Alert from "../../components/Alert"
import logo from "../../images/logo.png"
import { useAuthState, useRawAxios } from "../../helpers/networking"
import env from "../../env/env"
import Button from "../../components/Button"
import { LoginResponse } from "../../helpers/schemaTypes"

const requiredScopes = [
  "email",
  "profile",
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
]

const Login: React.FC<RouteComponentProps> = () => {
  const [error, setError] = React.useState<React.ReactNode | Error | undefined>()

  return (
    <Section className="mt-8 text-center">
      <img alt="" src={logo} height={60} width={95} className="mb-8" />
      <div className="max-w-lg bg-black bg-opacity-20 rounded p-8 mx-auto">
        <SectionTitle>Admin Login</SectionTitle>
        {error && <Alert variant="error" className="-mt-2 mb-4">{error}</Alert>}
        {env.GOOGLE_LOGIN_ENABLED && <GoogleLoginForm setError={setError} />}
        {env.IMPERSONATION_LOGIN_ENABLED && <ImpersonationLoginForm setError={setError} />}
      </div>
    </Section>
  )
}

const GoogleLoginForm = ({ setError }: { setError: (err: React.ReactNode | Error | undefined) => void }) => {
  const [_, setAuth] = useAuthState()
  const axios = useRawAxios()
  const googleLogin = useGoogleLogin({
    clientId: env.GOOGLE_CLIENT_ID,
    scope: requiredScopes.join(" "),
    onScriptLoadFailure: () => {
      setError("Failed to load Google Login script")
    },
    onRequest: () => {
      setError(undefined)
    },
    onSuccess: async (_res) => {
      // We can remove this override once the TypeScript definitions are improved:
      // https://github.com/anthonyjgrove/react-google-login/pull/482
      const res = _res as GoogleLoginResponse

      const grantedScopes = res.tokenObj.scope.split(" ")
      const missingScopes = requiredScopes.filter((s) => !grantedScopes.includes(s))
      if (missingScopes.length > 0) {
        setError(`Missing scopes: ${JSON.stringify(missingScopes)}`)
      } else {
        try {
          const loginResponse = await axios.post<LoginResponse>("/admin/login/google", { idToken: res.tokenId, accessToken: res.accessToken })
          setAuth({ token: loginResponse.data.accessToken, expiresAt: loginResponse.data.expiresAt, groups: loginResponse.data.groups })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
          setError(err instanceof Error ? err : String(err))
        }
      }
    },
    onFailure: (err) => {
      // eslint-disable-next-line no-console
      console.error(err)
      const errorMessage = [err.message, err.error, err.details].filter((s) => s).join(": ")
      setError(errorMessage.length > 0 ? errorMessage : String(err))
    },
  })

  return (
    <Button
      onClick={googleLogin.signIn}
      disabled={!googleLogin.loaded}
    >
      Google Login
    </Button>
  )
}

const ImpersonationLoginForm = ({ setError }: { setError: (err: React.ReactNode | Error | undefined) => void }) => {
  const [_, setAuth] = useAuthState()
  const axios = useRawAxios()

  return (
    <Button
      onClick={async () => {
        try {
          // eslint-disable-next-line no-alert
          const email = prompt("Email to login as:", "raisenational@gmail.com")
          if (!email) {
            setError("No email address provided")
            return
          }
          const loginResponse = await axios.post<LoginResponse>("/admin/login/impersonation", { email })
          setAuth({ token: loginResponse.data.accessToken, expiresAt: loginResponse.data.expiresAt, groups: loginResponse.data.groups })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
          setError(err instanceof Error ? err : String(err))
        }
      }}
    >
      Impersonation Login
    </Button>
  )
}

export default Login
