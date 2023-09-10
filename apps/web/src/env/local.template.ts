import type { Env } from '../helpers/types';

const env: Env = {
  STAGE: 'local',

  CUSTOM_RAISE_DOMAIN: 'localhost:8000',
  CUSTOM_MWA_DOMAIN: 'localhost:8000',

  API_BASE_URL: 'http://localhost:8001',

  STRIPE_PUBLISHABLE_KEY: 'pk_test_51KCByfI5VgKIYyWlqwp6p3qRFscr4s7bAaIC7EjZAunHLJEQoclC4it33M4Iv0U5jCVlDMQ0g8nMcJngVnIwjIOJ00vfxDTCMw',

  IMPERSONATION_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_CLIENT_ID: '200627615486-as2s4no2u20mcbb96ldmc4pjb3d0otg3.apps.googleusercontent.com',

  CLOUDFLARE_WEB_ANALYTICS_TOKEN_RAISE: undefined,
  CLOUDFLARE_WEB_ANALYTICS_TOKEN_MWA: undefined,
};

export default env;
