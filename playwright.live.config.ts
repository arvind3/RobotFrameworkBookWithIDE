import {defineConfig, devices} from '@playwright/test';

const liveBaseUrl = process.env.LIVE_BASE_URL ?? 'https://arvind3.github.io/RobotFrameworkBookWithIDE/';
const parsed = new URL(liveBaseUrl);
const liveOrigin = `${parsed.protocol}//${parsed.host}`;
const livePath = parsed.pathname === '/' ? '/RobotFrameworkBookWithIDE' : parsed.pathname.replace(/\/+$/, '');

if (!process.env.SITE_BASE_PATH) {
  process.env.SITE_BASE_PATH = livePath;
}

export default defineConfig({
  testDir: './tests/live',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', {outputFolder: 'playwright-report-live'}], ['list']],
  timeout: 240_000,
  expect: {
    timeout: 30_000,
  },
  use: {
    baseURL: liveOrigin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
});
