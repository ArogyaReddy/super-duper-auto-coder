const { assert } = require('chai');
const { expect } = require('@playwright/test');
const { When, Then } = require('@cucumber/cucumber');
const HomePage = require('../../pages/common/home-page');
const CertificationPage = require('../../pages/runMod/runcertification/certification-page');
let WholesaleRunModCompaniesPage = require('../../pages/ac/wholesaleRunMod/wholesaleRunMod-companies-page');

When('Alex Searched and Selected the option {string} on home page', { timeout: 360 * 1000 }, async function (option) {
  await new HomePage(this.page).SearchAndSelectOption(option);
});

When('Alex Searched and Selected the option {string} Report on home page', { timeout: 360 * 1000 }, async function (option) {
  await new HomePage(this.page).SearchAndSelectOptionInReports(option);
});

When('Alex Searched for {string} at home page', async function (option) {
  await new HomePage(this.page).searchForAnOptionInHomePage(option);
});

Then('Alex should be able to see {string} from search results in homepage', { timeout: 180 * 1000 }, async function (option) {
  let isOptionDisplayed = await new HomePage(this.page).isOptionDisplayedInSearchResults(option);
  assert.isTrue(isOptionDisplayed, `Option ${option} is not displayed in search results`);
});

When('Alex Selects {string} from the search results in homepage', { timeout: 180 * 1000 }, async function (option) {
  await new HomePage(this.page).clickOptioninSearchResult(option);
});

When('Alex navigates to dashboard overview page', async function () {
  await new HomePage(this.page).NavigateToDashboardOverviewPage();
});

Then('Alex verifies that View Pending payroll Items task is displayed on the home page', async function () {
  assert.isTrue(await new HomePage(this.page).isViewPendingPayrollItemsDisplayed());
});

When('Alex select and click on {string} task in top things to do on homepage', async function (option) {
  await new HomePage(this.page).clickOnEmpTask(option);
});

When('Alex clicks on garnishment task in top things to do on homepage', async function () {
  await new HomePage(this.page).clickGarnishmentTask();
});

Then('Home page is displayed', { timeout: 600 * 1000 }, async function () {
  assert.isTrue(await new HomePage(this.page).isHomePagePayrollCarouselDisplayed());
});

Then('Wholesale Parent Home page is displayed', async function () {
  assert.isTrue(await new HomePage(this.page).isWholesaleParentHomePageDisplayed(), 'Wholesale Parent Home page is not displayed');
});

When('Alex clicks on home page notifications icon', async function () {
  await new HomePage(this.page).clickNotificationIcon();
});

Then('Alex verifies that the Payroll section on the Home Page is displayed', async function () {
  const isDisplayed = await new HomePage(this.page).isPayrollSectionDisplayed();
  assert.isTrue(isDisplayed, 'Payroll section is not displayed on the Home Page');
});

Then('Alex verifies that the To Dos section on the Home Page is displayed', async function () {
  const isDisplayed = await new HomePage(this.page).isToDosSectionDisplayed();
  assert.isTrue(isDisplayed, 'To Dos section is not displayed on the Home Page');
});

Then('Alex verifies that the Grow Your Own Business section on the Home Page is displayed', async function () {
  const isDisplayed = await new HomePage(this.page).isGrowYourBusinessSectionDisplayed();
  assert.isTrue(isDisplayed, 'Grow Your Own Business section is not displayed on the Home Page');
});

Then('Alex verifies that the Latest Payroll section on the Home Page is displayed', async function () {
  const isDisplayed = await new HomePage(this.page).isLatestPayrollSectionDisplayed();
  assert.isTrue(isDisplayed, 'Latest Payroll section is not displayed on the Home Page');
});

Then('Alex verifies that the Calendar section on the Home Page is displayed', async function () {
  const isDisplayed = await new HomePage(this.page).isCalendarSectionDisplayed();
  assert.isTrue(isDisplayed, 'Calendar section is not displayed on the Home Page');
});

Then('Alex verifies that the Report section on the Home Page is displayed', async function () {
  const isDisplayed = await new HomePage(this.page).isReportSectionDisplayed();
  assert.isTrue(isDisplayed, 'Report section is not displayed on the Home Page');
});

Then('Alex verifies that the Run Payroll button is displayed', async function () {
  const isDisplayed = await new HomePage(this.page).isRunPayrollButtonDisplayed();
  assert.isTrue(isDisplayed, 'Run Payroll button is not displayed');
});
