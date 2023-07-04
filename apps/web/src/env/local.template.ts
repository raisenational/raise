import type { Env } from '../helpers/types';

const env: Env = {
  STAGE: 'local',

  CUSTOM_RAISE_DOMAIN: 'localhost:8000',
  CUSTOM_MWA_DOMAIN: 'localhost:8000',

  API_BASE_URL: 'http://localhost:8001',

  STRIPE_PUBLISHABLE_KEY: 'pk_test_51KCByfI5VgKIYyWlqwp6p3qRFscr4s7bAaIC7EjZAunHLJEQoclC4it33M4Iv0U5jCVlDMQ0g8nMcJngVnIwjIOJ00vfxDTCMw',

  IMPERSONATION_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_CLIENT_ID: '730827052132-u1tatnr4anip3vf7j5tq82k33gb5okpe.apps.googleusercontent.com',

  CLOUDFLARE_WEB_ANALYTICS_TOKEN_RAISE: undefined,
  CLOUDFLARE_WEB_ANALYTICS_TOKEN_MWA: undefined,
};

export default env;
