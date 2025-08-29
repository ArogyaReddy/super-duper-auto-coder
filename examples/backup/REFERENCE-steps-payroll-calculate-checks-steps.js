const { assert } = require('chai');
let PayrollCalculateChecksPage = require('../../pages/runMod/payroll/payroll-calculate-checks-page');
const { When, Then } = require('@cucumber/cucumber');

Then('Alex verifies the Calculate Checks page has loaded', async function () {
  var payrollCalculateChecksPage = new PayrollCalculateChecksPage(this.page);
  await payrollCalculateChecksPage.waitForCalculateChecksPageToLoad();
  var isCalculateChecksPageDisplayed = await payrollCalculateChecksPage.isCalculateChecksPageDisplayed();
  assert.isTrue(isCalculateChecksPageDisplayed, 'Calculate Checks page is not displayed');
});

When('Alex closes Calculate Checks page', async function () {
  await new PayrollCalculateChecksPage(this.page).closeCalculateChecksPage();
});

When('Alex selects Calculate Checks tile on the Payroll landing page', async function () {
  await new PayrollLandingPage(this.page).selectCalculateChecksTile();
});

Then('Alex verifies that runmod payroll landing page is displayed', async function () {
  const isDisplayed = await new PayrollLandingPage(this.page).isPayrollLandingPageDisplayed();
  assert.isTrue(isDisplayed, 'Payroll landing page is not displayed');
});

When('Alex navigates to company settings page by clicking on settings button on Payroll landing page', async function () {
  await new PayrollLandingPage(this.page).clickSettingsButton();
});

When('Alex selects Check and Payment Options tile on the Payroll landing page', async function () {
  await new PayrollLandingPage(this.page).selectCheckAndPaymentOptionsTile();
});

Then('Alex verifies the Check and Payment Option modal is displayed', async function () {
  const isDisplayed = await new PayrollLandingPage(this.page).isCheckAndPaymentOptionsModalDisplayed();
  assert.isTrue(isDisplayed, 'Check and Payment Option modal is not displayed');
});

When('Alex closes Modal box displayed on Payroll landing page', async function () {
  await new PayrollLandingPage(this.page).closeModal();
});

When('Alex selects More payroll options tile on the Payroll landing page', async function () {
  await new PayrollLandingPage(this.page).selectMorePayrollOptionsTile();
});

Then('Alex verifies the More Payroll Options Overflow is displayed', async function () {
  const isDisplayed = await new PayrollLandingPage(this.page).isMorePayrollOptionsOverflowDisplayed();
  assert.isTrue(isDisplayed, 'More Payroll Options Overflow is not displayed');
});
