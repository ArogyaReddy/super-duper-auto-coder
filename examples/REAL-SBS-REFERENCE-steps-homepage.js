const { assert, expect } = require('chai');
const { Given, When, Then } = require('@cucumber/cucumber');
const RunModHomePage = require('../../pages/common/home-page');

Given('Alex is logged into RunMod with a homepage test client', { timeout: 420 * 1000 }, async function () {
  // Real SBS login implementation
  const homePage = new RunModHomePage(this.page);
  await homePage.waitForHomePagePayrollCarousel();
});

When('Alex searches for an option {string} in home page', async function (option) {
  const homePage = new RunModHomePage(this.page);
  await homePage.searchForAnOptionInHomePage(option);
});

Then('Alex verifies that the option {string} is displayed in search results', async function (option) {
  const homePage = new RunModHomePage(this.page);
  const isDisplayed = await homePage.isOptionDisplayedInSearchResults(option);
  assert.isTrue(isDisplayed, `Option ${option} not displayed in search results`);
});

When('Alex clicks on option {string} in search result', async function (option) {
  const homePage = new RunModHomePage(this.page);
  await homePage.clickOptioninSearchResult(option);
});

When('Alex launches full offcycle payrun from home page', async function () {
  const homePage = new RunModHomePage(this.page);
  await homePage.launchOffCyclePayroll();
});

When('Alex waits for {int} seconds', async function (seconds) {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

Then('Alex verifies that the Latest Payroll section on the Home Page is displayed', async function () {
  const homePage = new RunModHomePage(this.page);
  const isDisplayed = await homePage.isLatestPayrollSectionDisplayed();
  assert.isTrue(isDisplayed, 'Latest Payroll section not displayed');
});

Then('Alex verifies that the Payroll section on the Home Page is displayed', async function () {
  const homePage = new RunModHomePage(this.page);
  const isDisplayed = await homePage.isPayrollSectionDisplayed();
  assert.isTrue(isDisplayed, 'Payroll section not displayed');
});

Then('Alex verifies that the ToDo section on the Home Page is displayed', async function () {
  const homePage = new RunModHomePage(this.page);
  const isDisplayed = await homePage.isToDosSectionDisplayed();
  assert.isTrue(isDisplayed, 'ToDo section not displayed');
});