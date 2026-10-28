const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './performance',
  workers: 1,
  reporter: 'list',
  outputDir: './test-results',
  use: {
    browserName: 'chromium',
    channel: process.env.PERF_BROWSER_CHANNEL || undefined,
    headless: true,
  },
});
