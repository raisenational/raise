import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		globalSetup: './local/test-setup-global.ts',
		setupFiles: './local/test-setup-env.ts',
		restoreMocks: true,
	},
});
