import * as React from "react"
import { RouteComponentProps } from "@gatsbyjs/reach-router"
import { useGoogleLogin, GoogleLoginResponse } from "react-google-login"
import Section, { SectionTitle } from "../../components/Section"
import Alert from "../../components/Alert"
import Logo from "../../components/Logo"
import { useAuthState, useRawAxios } from "../../helpers/networking"
import env from "../../env/env"
import Button from "../../components/Button"
import { LoginResponse } from "../../helpers/generated-api-client"
import Spinner from "../../components/Spinner"

const Login: React.FC<RouteComponentProps> = () => (
  <Section className="mt-8 text-center">
    <Logo className="my-8 w-24" />
    <div className="max-w-lg bg-black bg-opacity-20 rounded p-8 mx-auto">
      <SectionTitle>Admin Login</SectionTitle>
      <LoadingBoxContent />
    </div>
  </Section>
)

const LoadingBoxContent: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean | string>(false)
  const [error, setError] = React.useState<React.ReactNode | Error | undefined>()

  if (loading) {
    return (
      <div className="flex justify-center gap-4">
        <span>{typeof loading === "string" ? loading : "Logging in..."}</span>
        <Spinner />
      </div>
    )
  }

  return (
    <>
      {error && <Alert variant="error" className="-mt-2 mb-4">{error}</Alert>}
      {env.GOOGLE_LOGIN_ENABLED && <GoogleLoginForm setError={setError} setLoading={setLoading} />}
      {env.IMPERSONATION_LOGIN_ENABLED && <ImpersonationLoginForm setError={setError} setLoading={setLoading} />}
    </>
  )
}

interface LoginFormProps {
  setError: (err: React.ReactNode | Error | undefined) => void,
  setLoading: (loading: boolean | string) => void,
}

const googleRequiredScopes = [
  "email",
  "profile",
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
]

const GoogleLoginForm: React.FC<LoginFormProps> = ({ setError, setLoading }) => {
  const [_, setAuthState] = useAuthState()
  const axios = useRawAxios()
  const googleLogin = useGoogleLogin({
    clientId: env.GOOGLE_LOGIN_CLIENT_ID,
    scope: googleRequiredScopes.join(" "),
    onScriptLoadFailure: () => {
      setError("Failed to load Google login script")
    },
    onRequest: () => {
      setError(undefined)
      setLoading("Waiting on Google login...")
    },
    onSuccess: async (_res) => {
      // We can remove this override once the TypeScript definitions are improved:
      // https://github.com/anthonyjgrove/react-google-login/pull/482
      const res = _res as GoogleLoginResponse

      const grantedScopes = res.tokenObj.scope.split(" ")
      const missingScopes = googleRequiredScopes.filter((s) => !grantedScopes.includes(s))
      if (missingScopes.length > 0) {
        setError(`Missing scopes: ${JSON.stringify(missingScopes)}`)
      } else {
        try {
          setLoading(true)
          const loginResponse = await axios.post<LoginResponse>("/admin/login/google", { idToken: res.tokenId, accessToken: res.accessToken })
          setAuthState({
            token: loginResponse.data.accessToken,
            expiresAt: loginResponse.data.expiresAt,
            groups: loginResponse.data.groups,
          })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
          setError(err instanceof Error ? err : String(err))
          setLoading(false)
        }
      }
    },
    onFailure: (err) => {
      // eslint-disable-next-line no-console
      console.error(err)
      const errorMessage = [err.message, err.error, err.details].filter((s) => s).join(": ")
      setError(errorMessage.length > 0 ? errorMessage : String(err))
      setLoading(false)
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

const ImpersonationLoginForm: React.FC<LoginFormProps> = ({ setError, setLoading }) => {
  const [_, setAuthState] = useAuthState()
  const axios = useRawAxios()

  return (
    <Button
      onClick={async () => {
        try {
          setError(undefined)
          setLoading(true)

          // eslint-disable-next-line no-alert
          const email = prompt("Email to login as:", "raisedemo@gmail.com")
          if (!email) {
            setError("No email address provided")
            setLoading(false)
            return
          }
          const loginResponse = await axios.post<LoginResponse>("/admin/login/impersonation", { email })
          setAuthState({
            token: loginResponse.data.accessToken,
            expiresAt: loginResponse.data.expiresAt,
            groups: loginResponse.data.groups,
          })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
          setError(err instanceof Error ? err : String(err))
          setLoading(false)
        }
      }}
    >
      Impersonation Login
    </Button>
  )
}

export default Login
