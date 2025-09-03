import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 1,
  use: {
    headless: true,
    baseURL: 'https://oasisanswers.com',
    // Built-in artifacts:
    screenshot: 'only-on-failure',   // auto full-page shot on failure
    video: 'retain-on-failure',      // video on failure
    trace: 'on-first-retry',         // trace on first retry
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['./reporters/mailgun-reporter.ts']
  ],
});