import {defineConfig, devices} from '@playwright/test';

// End-to-end tests that drive the real website and API running locally.
// See e2e/README.md for details.
export default defineConfig({
	testDir: './e2e',
	// Tests share the seeded local database, so run them one at a time
	fullyParallel: false,
	workers: 1,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	timeout: 90_000,
	expect: {timeout: 15_000},
	reporter: [['list'], ['html', {open: 'never'}]],
	use: {
		baseURL: 'http://localhost:8000',
		// Record every test, so you can see what they do. Both are in the HTML report, which
		// CI uploads as the 'playwright-report' artifact. The trace is the easiest to follow:
		// it lists every step with a snapshot of the page before and after it.
		video: 'on',
		trace: 'on',
		// Set E2E_SLOW_MO=500 to pause 500ms between actions, to make the videos easier to watch
		launchOptions: {slowMo: Number(process.env.E2E_SLOW_MO ?? 0)},
		screenshot: 'only-on-failure',
	},
	projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
	webServer: [
		{
			// API, with DynamoDB Local reseeded from apps/server/local/table_*.json on each start
			command: 'npm start --workspace @raise/server',
			url: 'http://localhost:8001/public/status',
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
		},
		{
			// A production-style static export of the website (not `next dev`, which behaves
			// differently, e.g. React strict mode double-invoking effects)
			command: 'cd apps/web && shx cp src/env/local.ts src/env/env.ts && RAISE_BRAND=RAISE npx next build && node ../../e2e/serve-static.mjs dist/raise 8000',
			url: 'http://localhost:8000/',
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
		},
	],
});
