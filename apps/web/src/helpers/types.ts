export type Brand = 'MWA' | 'Raise';

export interface Env {
  STAGE: 'local' | 'dev' | 'prod',

  CUSTOM_RAISE_DOMAIN: string,
  CUSTOM_MWA_DOMAIN: string,

  API_BASE_URL: string,

  /** Stripe publishable key. The secret key should NEVER be exposed to the front-end. */
  STRIPE_PUBLISHABLE_KEY: string,

  /** Whether to enable impersonation login. Should always be disabled in prod. */
  IMPERSONATION_LOGIN_ENABLED: boolean,
  /** Whether to enable login with Google. */
  GOOGLE_LOGIN_ENABLED: boolean,
  /** OAuth 2 client id for Google sign-in. */
  GOOGLE_LOGIN_CLIENT_ID: string,

  /** API token to configure Cloudflare Web Analytics for the Raise site */
  CLOUDFLARE_WEB_ANALYTICS_TOKEN_RAISE: string | undefined,
  /** API token to configure Cloudflare Web Analytics for the May Week Alternative site */
  CLOUDFLARE_WEB_ANALYTICS_TOKEN_MWA: string | undefined,
}

export interface ChapterConfig {
  title: string,
  fundraiserIds: Record<Env['STAGE'], string>,
  brand?: Brand,
}
