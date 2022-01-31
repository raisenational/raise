export interface Env {
  STAGE: "local" | "dev" | "prod",

  CUSTOM_RAISE_DOMAIN: string,
  CUSTOM_MWA_DOMAIN: string,

  API_BASE_URL: string,

  GOOGLE_CLIENT_ID: string,

  STRIPE_PUBLISHABLE_KEY: string,

  GOOGLE_LOGIN_ENABLED: boolean,
  IMPERSONATION_LOGIN_ENABLED: boolean,
}
