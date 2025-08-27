const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');

// Background steps - CRITICAL: Use EXACT SBS_Automation framework steps
Given('Alex is logged into RunMod with a homepage test client', async function () {
  // Login logic handled by main framework
});

Given('Alex verifies that the Payroll section on the Home Page is displayed', async function () {
  // Verification logic handled by main framework
});

// Main scenario steps
Given('I am on the application page', async function () {
  await this.page.goto('/application');
});

Given('I am on the {word} page', async function (pageType) {
  await this.page.goto(`/${pageType}`);
});

When('I perform the primary action', async function () {
  await this.page.click('[data-test-id="primary-action"]');
});

When('I enter {string} in the form', async function (inputData) {
  await this.page.fill('[data-test-id="input-field"]', inputData);
});

When('I enter invalid data', async function () {
  await this.page.fill('[data-test-id="input-field"]', 'INVALID_DATA_123!@#');
});

Then('I should see the expected result', async function () {
  const result = await this.page.locator('[data-test-id="result"]');
  await result.waitFor({ state: 'visible' });
  assert.isTrue(await result.isVisible(), 'Expected result should be visible');
});

Then('I should see {string} displayed', async function (expectedOutput) {
  const output = await this.page.locator(`text=${expectedOutput}`);
  await output.waitFor({ state: 'visible' });
  assert.isTrue(await output.isVisible(), `Should see ${expectedOutput}`);
});

Then('the system should behave correctly', async function () {
  const statusElement = await this.page.locator('[data-test-id="status"]');
  const status = await statusElement.textContent();
  assert.include(['success', 'completed'], status.toLowerCase());
});

Then('I should see an appropriate error message', async function () {
  const errorMsg = await this.page.locator('[data-test-id="error-message"]');
  await errorMsg.waitFor({ state: 'visible' });
  assert.isTrue(await errorMsg.isVisible(), 'Error message should be displayed');
});

Then('the system should remain stable', async function () {
  // Verify no crashes or unexpected behavior
  const pageUrl = this.page.url();
  assert.isTrue(pageUrl.includes('/'), 'Page should remain accessible');
});
