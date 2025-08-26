import { defineConfig, devices } from '@playwright/test';

// Load Auto-Coder configuration with SBS_Automation integration
const ConfigLoader = require('../support/config-loader.js');
const configLoader = new ConfigLoader();
const config = configLoader.getConfig();

// Log configuration at startup
configLoader.logConfiguration();

export default defineConfig({
  // Look for test files in the "generated/tests" directory, with JS files
  testDir: './generated/tests',
  testMatch: '**/*.js',
  timeout: configLoader.getTimeout() * 2, // Double for Playwright's longer timeout needs

  // Run tests in parallel
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use - Enhanced with custom reporting
  reporter: [
    ['html', { 
      outputFolder: 'generated/reports/playwright-report',
      open: 'never'  // Don't auto-open browser
    }],
    ['json', { outputFile: 'generated/reports/results.json' }],
    ['junit', { outputFile: 'generated/reports/results.xml' }],
    ['list'],
    ['./support/custom-reporter.js']  // Custom detailed reporter
  ],

  use: {
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Base URL from configuration (SBS_Automation integration)
    baseURL: configLoader.getBaseUrl(),
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Global timeout for all actions (from SBS_Automation config)
    actionTimeout: configLoader.getTimeout() / 6, // 30 seconds from 180s total
    navigationTimeout: configLoader.getTimeout() / 3, // 60 seconds from 180s total
    
    // Additional browser options from configuration
    headless: configLoader.isHeadless()
  },

  // Configure projects for single browser only (Chrome/Chromium)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  // Run your local dev server before starting the tests (optional)
  // webServer: {
  //   command: 'npm run dev',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },

  // Global setup and teardown
  globalSetup: require.resolve('./../support/global-setup.js'),
  globalTeardown: require.resolve('./../support/global-teardown.js'),

  // Output directory for test artifacts
  outputDir: 'generated/reports/artifacts/'
});
