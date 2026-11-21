# 🎭 End-to-end tests

Browser tests, using [Playwright](https://playwright.dev/), that run through the main things people do on Raise, against the real website and API running locally:

- [`journey.spec.ts`](./journey.spec.ts): one long test following a chapter through a donations push, based on the processes in the [help doc](https://docs.google.com/document/d/1H5RdqTJijH-wWb2thCqJrT8IoLiVvxSpWLDEUmDyLxU/edit). The National team sets up a chapter group, president and fundraisers. Supporters make one-off and weekly donations with a Stripe test card. The president reviews them, hides a donor's name and records a cash donation. The National team cancels a scheduled payment, marks a refund and checks the audit log.
- [`access.spec.ts`](./access.spec.ts): who can log in to Donations Admin, and what chapter admins can see and edit

Each test is split into named steps (`test.step`), so the report, trace and any failure message show which part broke.

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

Every test is recorded. Locally, run `npx playwright show-report` after a run. In CI, open the workflow run's summary page, use the "Download the report" link on the workflow run summary page (or the `playwright-report` artifact, kept for 7 days), unzip it and run `npx playwright show-report <unzipped folder>`. Click a test to see its trace (the easiest way to follow along: every step, with a snapshot of the page before and after) and video. To make videos easier to watch locally, slow the tests down with e.g. `E2E_SLOW_MO=500 npm run test:e2e`.
