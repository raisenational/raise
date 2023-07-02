import type { Env } from '../helpers/types';

const env: Env = {
  STAGE: 'dev',

  CUSTOM_RAISE_DOMAIN: 'dev.joinraise.org',
  CUSTOM_MWA_DOMAIN: 'dev.mayweekalternative.org.uk',

  API_BASE_URL: 'https://bblp6lj50j.execute-api.eu-west-1.amazonaws.com',

  STRIPE_PUBLISHABLE_KEY: 'pk_test_51JoQv0KzqibgSMB7aaaSq8ZJUsTwC4Hd1rfRwehKncms8iaHsKl941RvdBWNNVGQDcdRZmRaDaMknmBTilFqOhYU00EyfZikdJ',

  IMPERSONATION_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_CLIENT_ID: '730827052132-u1tatnr4anip3vf7j5tq82k33gb5okpe.apps.googleusercontent.com',

  CLOUDFLARE_WEB_ANALYTICS_TOKEN_RAISE: '608e8ce776274e158959615587a77787',
  CLOUDFLARE_WEB_ANALYTICS_TOKEN_MWA: 'a5606078810748adb7c357339cf25281',
};

export default env;
