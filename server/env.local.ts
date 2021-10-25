export default {
  // Generate with:
  // openssl ecparam -genkey -name prime256v1 -noout -out ec_private.pem
  // openssl ec -in ec_private.pem -pubout -out ec_public.pem
  JWT_PUBLIC_KEY: "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKgpIxpMaAup1EqDjJkg28RtHaq3r\ni8mRQvBD9tlqyB7jdBwd01Xqt8r1wc9eF3HKpGeZ1FNrB37S67xCz96NYw==\n-----END PUBLIC KEY-----",
  JWT_PRIVATE_KEY: "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKDradf4l8/YH44v1woIh1Mt1SN3al2DIUNgLVjYQqkLoAoGCCqGSM49\nAwEHoUQDQgAEKgpIxpMaAup1EqDjJkg28RtHaq3ri8mRQvBD9tlqyB7jdBwd01Xq\nt8r1wc9eF3HKpGeZ1FNrB37S67xCz96NYw==\n-----END EC PRIVATE KEY-----",

  // OAuth 2 client id for Google sign-in
  GOOGLE_CLIENT_ID: "730827052132-u1tatnr4anip3vf7j5tq82k33gb5okpe.apps.googleusercontent.com",

  // Stripe secret key
  STRIPE_PUBLISHABLE_KEY: "pk_test_51JoQv0KzqibgSMB7aaaSq8ZJUsTwC4Hd1rfRwehKncms8iaHsKl941RvdBWNNVGQDcdRZmRaDaMknmBTilFqOhYU00EyfZikdJ",
  STRIPE_SECRET_KEY: "sk_test_51JoQv0KzqibgSMB7Oe3m4t2wcaTp3nMhg0xol8MPHLCBICO96ETErfvwB724kCFoD5MKA9OfzHYL6EdQaaYGh7Az00DdEdhY2z",
}
