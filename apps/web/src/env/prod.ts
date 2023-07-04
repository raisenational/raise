import type { Env } from '../helpers/types';

const env: Env = {
  STAGE: 'prod',

  CUSTOM_RAISE_DOMAIN: 'www.joinraise.org',
  CUSTOM_MWA_DOMAIN: 'www.mayweekalternative.org.uk',

  API_BASE_URL: 'https://5kh7xzkn5m.execute-api.eu-west-1.amazonaws.com',

  STRIPE_PUBLISHABLE_KEY: 'pk_live_51KIc1HAeST0582s0h65vQVlCe9rleFhFfNqffP68kY4Uh98QxA0jsQSKRCXqLUosLGxZnxfgerEiq2YFlFjIdgGP00XJBBXdXD',

  IMPERSONATION_LOGIN_ENABLED: false,
  GOOGLE_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_CLIENT_ID: '730827052132-u1tatnr4anip3vf7j5tq82k33gb5okpe.apps.googleusercontent.com',

  CLOUDFLARE_WEB_ANALYTICS_TOKEN_RAISE: 'cd16cb3b71af440a8828d3bc6be5f061',
  CLOUDFLARE_WEB_ANALYTICS_TOKEN_MWA: '88e901f7c15648c78bd891be8d8f4573',
};

export default env;
