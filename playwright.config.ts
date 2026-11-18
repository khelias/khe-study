import { defineConfig, devices } from '@playwright/test';
import { OFFLINE_PORT } from './e2e/offline-paths';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? 'npm run dev';

/**
 * Playwright config for E2E smoke tests.
 *
 * Tests live in `e2e/` and run against a live Vite dev server that Playwright
 * boots automatically. On CI they serve as the safety net for UI refactors;
 * locally they can also be run interactively with `npm run test:e2e:ui`.
 *
 * The service worker exists only in a production build, so `offline.spec.ts` runs against builds
 * made by `e2e/global-setup.ts` and served by `e2e/server.ts`.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /offline\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'offline',
      testMatch: /offline\.spec\.ts/,
      // The specs deploy builds over the one directory the server reads.
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${OFFLINE_PORT}` },
    },
  ],
  webServer: [
    {
      command: webServerCommand,
      url: `${baseURL}/study/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    { command: 'node e2e/server.ts', port: OFFLINE_PORT, reuseExistingServer: false },
  ],
});
