import type { Env } from "../helpers/types"

const env: Env = {
  API_BASE_URL: "https://bblp6lj50j.execute-api.eu-west-1.amazonaws.com",

  // OAuth 2 client id for Google sign-in
  GOOGLE_CLIENT_ID: "730827052132-u1tatnr4anip3vf7j5tq82k33gb5okpe.apps.googleusercontent.com",

  // Stripe publishable key
  // The secret key should NEVER be exposed to the front-end
  STRIPE_PUBLISHABLE_KEY: "pk_test_51JoQv0KzqibgSMB7aaaSq8ZJUsTwC4Hd1rfRwehKncms8iaHsKl941RvdBWNNVGQDcdRZmRaDaMknmBTilFqOhYU00EyfZikdJ",
}

export default env
