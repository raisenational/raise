import type { Env } from "../helpers/types"

const env: Env = {
  STAGE: "local",

  API_BASE_URL: "http://localhost:8001",

  // Generate with:
  // openssl ecparam -genkey -name prime256v1 -noout -out ec_private.pem
  // openssl ec -in ec_private.pem -pubout -out ec_public.pem
  JWT_PUBLIC_KEY: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKgpIxpMaAup1EqDjJkg28RtHaq3r\ni8mRQvBD9tlqyB7jdBwd01Xqt8r1wc9eF3HKpGeZ1FNrB37S67xCz96NYw==\n-----END PUBLIC KEY-----",
  JWT_PRIVATE_KEY: "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKDradf4l8/YH44v1woIh1Mt1SN3al2DIUNgLVjYQqkLoAoGCCqGSM49\nAwEHoUQDQgAEKgpIxpMaAup1EqDjJkg28RtHaq3ri8mRQvBD9tlqyB7jdBwd01Xq\nt8r1wc9eF3HKpGeZ1FNrB37S67xCz96NYw==\n-----END EC PRIVATE KEY-----",

  // OAuth 2 client id for Google sign-in
  GOOGLE_CLIENT_ID: "730827052132-u1tatnr4anip3vf7j5tq82k33gb5okpe.apps.googleusercontent.com",

  // Stripe keys and secrets
  // https://dashboard.stripe.com/test/apikeys
  // https://dashboard.stripe.com/webhooks (locally: stripe listen --forward-to localhost:8001/stripe/webhook)
  STRIPE_PUBLISHABLE_KEY: "pk_test_51KCByfI5VgKIYyWlqwp6p3qRFscr4s7bAaIC7EjZAunHLJEQoclC4it33M4Iv0U5jCVlDMQ0g8nMcJngVnIwjIOJ00vfxDTCMw",
  STRIPE_SECRET_KEY: "sk_test_51KCByfI5VgKIYyWliV6VxJ7qFw9xJm1K7eeB9HeGiQvAtvuRbKOPp9f1hQ4MDyKviZp4vQhIRVby5LbDmrjpdZnC00OUE1muam",
  STRIPE_WEBHOOK_SECRET: "whsec_3V5u8MmBEOcDjGdoAPIyWqJonW422WmL",

  // Slack configuration
  // The bot should have the chat:write scope and be able to access the channel
  SLACK_BOT_TOKEN: "xoxb-825862040501-2829297236371-ThN78vWqKY46NDUEtlbiLpGX",
  SLACK_CHANNEL_ID: "CQ9RC2HB7",

  // Timestamp which JWTs must be issued after. Either an integer (unix timestamp in seconds) or undefined (undefined means this check is disabled)
  // For emergency use in case we want to quickly make all tokens invalid but don't have access to a computer with openssl installed to regenerate keys
  // NB: changing this is pointless if the JWT private key has been exposed
  JWT_REQUIRE_ISSUED_AT_AFTER: undefined,

  // Whether to enable login methods
  GOOGLE_LOGIN_ENABLED: true,
  IMPERSONATION_LOGIN_ENABLED: true,
}

export default env
