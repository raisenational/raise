import { RouteComponentProps } from '@gatsbyjs/reach-router';
// We are using oidc-client rather than oidc-client-ts because it supports
// the implicit flow, which is currently needed for Google authentication
// https://github.com/authts/oidc-client-ts/issues/152
import { UserManager, UserManagerSettings } from 'oidc-client';
import { useEffect, useState } from 'react';
import Section, { SectionTitle } from '../../components/Section';
import Alert from '../../components/Alert';
import Logo from '../../components/Logo';
import { useAuthState, useRawAxios, useRawReq } from '../../helpers/networking';
import env from '../../env/env';
import Button from '../../components/Button';
import { LoginResponse } from '../../helpers/generated-api-client';
import Spinner from '../../components/Spinner';
import Link from '../../components/Link';
import { helpLink } from './_helpLink';

const Login: React.FC<RouteComponentProps> = () => (
  <Section className="mt-8 text-center">
    <Logo className="my-8 w-24" />
    <div className="max-w-lg bg-black bg-opacity-20 rounded p-8 mx-auto">
      <SectionTitle>Admin Login</SectionTitle>
      <LoadingBoxContent />
    </div>
    <footer className="mt-4 py-4 text-xl">
      <Link href={helpLink}>Help</Link>
    </footer>
  </Section>
);

const LoadingBoxContent: React.FC = () => {
  const [loading, setLoading] = useState<boolean | string>(false);
  const [error, setError] = useState<React.ReactNode | Error | undefined>();

  if (loading) {
    return (
      <div className="flex justify-center gap-4">
        <span>{typeof loading === 'string' ? loading : 'Logging in...'}</span>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {error && <Alert variant="error" className="-mt-2 mb-4">{error}</Alert>}
      {env.GOOGLE_LOGIN_ENABLED && <GoogleLoginForm setError={setError} setLoading={setLoading} />}
      {env.IMPERSONATION_LOGIN_ENABLED && <ImpersonationLoginForm setError={setError} setLoading={setLoading} />}
    </>
  );
};

interface LoginFormProps {
  setError: (err: React.ReactNode | Error | undefined) => void,
  setLoading: (loading: boolean | string) => void,
}

const googleRequiredScopes = [
  'email',
  'profile',
  'openid',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const userManagerSettings: UserManagerSettings = {
  authority: 'https://accounts.google.com',
  client_id: env.GOOGLE_LOGIN_CLIENT_ID,
  redirect_uri: `${(typeof window !== 'undefined') ? window.location.origin : ''}/admin/oauth-callback`,
  scope: googleRequiredScopes.join(' '),
  response_type: 'id_token',
};

const GoogleLoginForm: React.FC<LoginFormProps> = ({ setError, setLoading }) => {
  const [, setAuthState] = useAuthState();
  const req = useRawReq();

  return (
    <Button
      onClick={async () => {
        setLoading('Waiting on Google login...');
        try {
          const user = await new UserManager(userManagerSettings).signinPopup();
          setLoading(true);

          const missingScopes = googleRequiredScopes.filter((s) => !user.scopes.includes(s));
          if (missingScopes.length > 0) {
            throw new Error(`Missing scopes: ${JSON.stringify(missingScopes)}`);
          }

          const loginResponse = await req(
            'post /admin/login/google',
            { idToken: user.id_token },
          );

          setAuthState(loginResponse.data);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
        setLoading(false);
      }}
    >
      Google Login
    </Button>
  );
};

const ImpersonationLoginForm: React.FC<LoginFormProps> = ({ setError, setLoading }) => {
  const [, setAuthState] = useAuthState();
  const axios = useRawAxios();

  return (
    <Button
      onClick={async () => {
        try {
          setError(undefined);
          setLoading(true);

          // eslint-disable-next-line no-alert
          const email = prompt('Email to login as:', 'raisedemo@gmail.com');
          if (!email) {
            setError('No email address provided');
            setLoading(false);
            return;
          }
          const loginResponse = await axios.post<LoginResponse>('/admin/login/impersonation', { email });
          setAuthState(loginResponse.data);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          setError(err instanceof Error ? err : String(err));
          setLoading(false);
        }
      }}
    >
      Impersonation Login
    </Button>
  );
};

export const OauthCallbackPage: React.FC<RouteComponentProps> = () => {
  const [error, setError] = useState<undefined | React.ReactNode | Error>();

  useEffect(() => {
    try {
      new UserManager(userManagerSettings).signinCallback();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  return (
    <Section className="mt-8 text-center">
      {error && <Alert variant="error">{error}</Alert>}
      {!error && <h1>Logging you in...</h1>}
    </Section>
  );
};

export default Login;
