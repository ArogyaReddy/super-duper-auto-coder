const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');
const PageNamePage = require('../pages/page-name-page');

// Define timeout constant
const TIMEOUT = 240 * 1000;

Given('I am on the page', { timeout: TIMEOUT }, async function() {
  await new PageNamePage(this.page).navigateToPage();
});

When('I perform the main action', { timeout: TIMEOUT }, async function() {
  let mainActionResult = await new PageNamePage(this.page).performMainAction();
  assert.isTrue(mainActionResult, 'Main action was not successful');
});

When('I search for {string}', { timeout: TIMEOUT }, async function(searchTerm) {
  await new PageNamePage(this.page).searchFor(searchTerm);
});

Then('I should see the content', { timeout: TIMEOUT }, async function() {
  let contentVisible = await new PageNamePage(this.page).verifyContent();
  assert.isTrue(contentVisible, 'Content is not visible');
});

Then('I should see {string} in the results', { timeout: TIMEOUT }, async function(expectedText) {
  let resultsContainText = await new PageNamePage(this.page).verifyResultsContain(expectedText);
  assert.isTrue(resultsContainText, `Results do not contain "${expectedText}"`);
});
