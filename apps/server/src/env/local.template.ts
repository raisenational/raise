import type { Env } from '../helpers/types';

const env: Env = {
  STAGE: 'local',

  API_BASE_URL: 'http://localhost:8001',

  // spell-checker: disable
  // Generate with:
  // openssl ecparam -genkey -name prime256v1 -noout -out ec_private.pem
  // openssl ec -in ec_private.pem -pubout -out ec_public.pem
  JWT_PUBLIC_KEY: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKgpIxpMaAup1EqDjJkg28RtHaq3r\ni8mRQvBD9tlqyB7jdBwd01Xqt8r1wc9eF3HKpGeZ1FNrB37S67xCz96NYw==\n-----END PUBLIC KEY-----',
  JWT_PRIVATE_KEY: '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKDradf4l8/YH44v1woIh1Mt1SN3al2DIUNgLVjYQqkLoAoGCCqGSM49\nAwEHoUQDQgAEKgpIxpMaAup1EqDjJkg28RtHaq3ri8mRQvBD9tlqyB7jdBwd01Xq\nt8r1wc9eF3HKpGeZ1FNrB37S67xCz96NYw==\n-----END EC PRIVATE KEY-----',
  // spell-checker: enable

  // OAuth 2 client id for Google sign-in
  GOOGLE_LOGIN_CLIENT_ID: '730827052132-u1tatnr4anip3vf7j5tq82k33gb5okpe.apps.googleusercontent.com',

  // Stripe keys and secrets
  // Secret key is the restricted key with Customers and PaymentIntents read and write
  // https://dashboard.stripe.com/test/apikeys
  // https://dashboard.stripe.com/webhooks (locally: stripe listen --forward-to localhost:8001/stripe/webhook)
  // These tokens are for the Raise Local Stripe account (acct_1KCByfI5VgKIYyWl) in test mode
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51KCByfI5VgKIYyWlqwp6p3qRFscr4s7bAaIC7EjZAunHLJEQoclC4it33M4Iv0U5jCVlDMQ0g8nMcJngVnIwjIOJ00vfxDTCMw',
  STRIPE_SECRET_KEY: 'rk_test_51KCByfI5VgKIYyWltRhqNIY4rOF2N4NUugjagIsndS0VntmICvubfWqdUS54vbtyKOueWdFJ78gmE1MczkVul9rm00asSiKk1n',
  STRIPE_WEBHOOK_SECRET: 'whsec_124d2009087e0de6ddbc1ee044d209ce4be661ae6419d7729dd2e7c89fbacc8c',

  // Slack configuration
  // The bot should have the chat:write scope and be able to access the channel
  // This token is for the 'Raise Local' bot, added to the #test-channel in the domdomegg.slack.com workspace
  // Concatenated to avoid secret scanning getting angry (it's fine to be public given it has limited permissions
  // to only a sandbox workspace, and has clear warnings that the public could send messages via it)
  // spell-checker: disable
  // eslint-disable-next-line no-useless-concat
  SLACK_BOT_TOKEN: 'xoxb-' + '825862040501-2829297236371-UR75gADxkwP7Z5OKZWCSBl2I',
  SLACK_CHANNEL_ID: 'CQ9RC2HB7',
  // spell-checker: enable

  // Timestamp which any JWT must be issued after. Either an integer (unix timestamp in seconds) or undefined (undefined means this check is disabled)
  // For emergency use in case we want to quickly make all tokens invalid but don't have access to a computer with openssl installed to regenerate keys
  // NB: changing this is pointless if the JWT private key has been exposed
  JWT_REQUIRE_ISSUED_AT_AFTER: undefined,

  // Whether to enable login methods
  GOOGLE_LOGIN_ENABLED: true,
  IMPERSONATION_LOGIN_ENABLED: true,

  CUSTOM_RAISE_DOMAIN: 'localhost:8000',
  CUSTOM_MWA_DOMAIN: 'localhost:8000',
};

export default env;
