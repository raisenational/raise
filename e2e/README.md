# 🎭 End-to-end tests

Browser tests, using [Playwright](https://playwright.dev/), that run through the main things people do on Raise, against the real website and API running locally:

- [`donate.spec.ts`](./donate.spec.ts): the public donation flow, for one-off and weekly donations, including paying with a Stripe test card
- [`admin.spec.ts`](./admin.spec.ts): the common Donations Admin processes from the [help doc](https://docs.google.com/document/d/1H5RdqTJijH-wWb2thCqJrT8IoLiVvxSpWLDEUmDyLxU/edit). These are logging in, editing a fundraiser, adding manual donations and payments, donor wall visibility, marking payments refunded, creating fundraisers, groups and users, and access control

These tests give us confidence that refactors and dependency upgrades haven't broken anything, so if you add a new feature or process, consider adding a test for it here.

## 🏃 Running

One-off setup: `npx playwright install chromium`

Then run `npm run test:e2e` from the root of the repo. This starts the API (with a freshly seeded local database) and a production build of the website, then runs the tests. Add `--ui` to watch and debug them interactively (`npm run test:e2e -- --ui`).

If you already have the API running (`npx turbo start --filter @raise/server`), it'll be reused. Note the tests will then run against whatever data is in your local database, so you may want to restart it to get a clean state.

## 🧠 How it works

- **Website**: we test a static export (like what we deploy), rather than `next dev`. `next dev` behaves differently. For example, React strict mode runs effects twice, which creates duplicate payment intents and stops some dropdowns opening.
- **Payments**: these use the Raise Local Stripe account in test mode, so the tests need internet access. Locally, Stripe can't send webhooks to us, so after paying, the tests fetch the payment intent from Stripe and send our API a correctly signed `payment_intent.succeeded` webhook, just like Stripe would.
- **Login**: tests use impersonation login (available on local and dev only) with the users seeded from `apps/server/local/table_user.json`.
- **Data**: tests run one at a time against a shared database. Each test creates the things it changes where possible, and checks relative changes (e.g. the fundraiser total went up by £300) so that tests don't depend on each other.

In CI, these run on every pull request, and the deploy only runs if they pass.

## 🎬 Watching the tests

Every test is recorded. Locally, run `npx playwright show-report` after a run. In CI, open the workflow run's summary page, download the `playwright-report` artifact, unzip it and open `playwright-report/index.html`. Click a test to see its video (and, for failures, a trace you can step through with `npx playwright show-trace`).
