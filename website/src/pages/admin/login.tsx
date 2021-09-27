import * as React from "react"
import { RouteComponentProps } from "@reach/router"
import { GoogleLogin, GoogleLoginResponse } from "react-google-login"

import Section, { SectionTitle } from "../../components/Section"
import Alert from "../../components/Alert"
import logo from "../../images/logo.png"
import { AuthContext } from "../../components/AuthProvider"

const requiredScopes = [
  "email",
  "profile",
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
]

const Login: React.FC<RouteComponentProps> = () => {
  const { setAuth } = React.useContext(AuthContext)
  const [error, setError] = React.useState<string | undefined>()

  return (
    <Section className="mt-8">
      <img alt="" src={logo} height={60} width={95} className="mb-8" />
      <div className="max-w-lg bg-black bg-opacity-20 rounded p-8 mx-auto">
        <SectionTitle>Admin Login</SectionTitle>
        {error && <Alert variant="error" className="-mt-2">{error}</Alert>}
        <GoogleLogin
          clientId="730827052132-u1tatnr4anip3vf7j5tq82k33gb5okpe.apps.googleusercontent.com"
          scope={requiredScopes.join(" ")}
          onSuccess={(_res) => {
            // FIXME: bad typescript definitions
            // https://github.com/anthonyjgrove/react-google-login/pull/482
            const res = _res as GoogleLoginResponse

            const grantedScopes = res.tokenObj.scope.split(" ")
            const missingScopes = requiredScopes.filter((s) => !grantedScopes.includes(s))
            if (missingScopes.length > 0) {
              setError(`Missing scopes: ${JSON.stringify(missingScopes)}`)
            } else {
              setError(undefined)
              setAuth({
                idToken: res.tokenId,
                accessToken: res.accessToken,
                name: res.profileObj.name,
                email: res.profileObj.email,
              })
            }
          }}
          onFailure={(err) => setError(err.error ? err.error : String(err))}
          onScriptLoadFailure={(err) => setError(err.error ? err.error : "Failed to load Google Sign-In script")}
          // FIXME: This is a hack to get styles working
          // https://github.com/anthonyjgrove/react-google-login/issues/201
          // className="rounded px-2"
          className="raise-google-button"
        />
      </div>
    </Section>
  )
}

export default Login
