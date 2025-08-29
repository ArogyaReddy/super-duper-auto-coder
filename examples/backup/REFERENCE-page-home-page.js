const BasePage = require('../../base-page');

class HomePage extends BasePage {

  constructor(page) {
    super(page);
    this.page = page;
    
    // Page locators
    this.globalSearchBox = 'input[data-testid="global-search-box"]';
    this.searchButton = 'button[data-testid="global-search-button"]';
    this.searchResults = '[data-testid="search-results"]';
    this.searchResultOption = (option) => `[data-testid="search-result-option"]:has-text("${option}")`;
    this.dashboardOverviewLink = 'a[href*="dashboard-overview"]';
    this.viewPendingPayrollItems = '[data-testid="view-pending-payroll-items"]';
    this.empTask = (task) => `[data-testid="emp-task"]:has-text("${task}")`;
    this.garnishmentTask = '[data-testid="garnishment-task"]';
    this.homePagePayrollCarousel = '[data-testid="home-page-payroll-carousel"]';
    this.wholesaleParentHomePage = '[data-testid="wholesale-parent-home-page"]';
    this.notificationIcon = '[data-testid="notification-icon"]';
    this.payrollSection = '[data-testid="payroll-section"]';
    this.toDoSection = '[data-testid="todo-section"]';
    this.growYourBusinessSection = '[data-testid="grow-your-business-section"]';
    this.latestPayrollSection = '[data-testid="latest-payroll-section"]';
    this.calendarSection = '[data-testid="calendar-section"]';
    this.reportSection = '[data-testid="report-section"]';
    this.runPayrollButton = '[data-testid="run-payroll-button"]';
    this.reportsSearchResults = '[data-testid="reports-search-results"]';
    this.reportsSearchOption = (option) => `[data-testid="reports-search-option"]:has-text("${option}")`;
  }

  async SearchAndSelectOption(option) {
    await this.waitForLocator(this.globalSearchBox);
    await this.clickElement(this.globalSearchBox);
    await this.page.fill(this.globalSearchBox, option);
    await this.clickElement(this.searchButton);
    await this.waitForLocator(this.searchResultOption(option));
    await this.clickElement(this.searchResultOption(option));
  }

  async SearchAndSelectOptionInReports(option) {
    await this.waitForLocator(this.globalSearchBox);
    await this.clickElement(this.globalSearchBox);
    await this.page.fill(this.globalSearchBox, option);
    await this.clickElement(this.searchButton);
    await this.waitForLocator(this.reportsSearchOption(option));
    await this.clickElement(this.reportsSearchOption(option));
  }

  async searchForAnOptionInHomePage(option) {
    await this.waitForLocator(this.globalSearchBox);
    await this.clickElement(this.globalSearchBox);
    await this.page.fill(this.globalSearchBox, option);
    await this.clickElement(this.searchButton);
  }

  async isOptionDisplayedInSearchResults(option) {
    await this.waitForLocator(this.searchResults);
    return await this.isVisible(this.searchResultOption(option));
  }

  async clickOptioninSearchResult(option) {
    await this.waitForLocator(this.searchResultOption(option));
    await this.clickElement(this.searchResultOption(option));
  }

  async NavigateToDashboardOverviewPage() {
    await this.waitForLocator(this.dashboardOverviewLink);
    await this.clickElement(this.dashboardOverviewLink);
  }

  async isViewPendingPayrollItemsDisplayed() {
    return await this.isVisible(this.viewPendingPayrollItems);
  }

  async clickOnEmpTask(task) {
    await this.waitForLocator(this.empTask(task));
    await this.clickElement(this.empTask(task));
  }

  async clickGarnishmentTask() {
    await this.waitForLocator(this.garnishmentTask);
    await this.clickElement(this.garnishmentTask);
  }

  async isHomePagePayrollCarouselDisplayed() {
    return await this.isVisible(this.homePagePayrollCarousel);
  }

  async isWholesaleParentHomePageDisplayed() {
    return await this.isVisible(this.wholesaleParentHomePage);
  }

  async clickNotificationIcon() {
    await this.waitForLocator(this.notificationIcon);
    await this.clickElement(this.notificationIcon);
  }

  async isPayrollSectionDisplayed() {
    return await this.isVisible(this.payrollSection);
  }

  async isToDosSectionDisplayed() {
    return await this.isVisible(this.toDoSection);
  }

  async isGrowYourBusinessSectionDisplayed() {
    return await this.isVisible(this.growYourBusinessSection);
  }

  async isLatestPayrollSectionDisplayed() {
    return await this.isVisible(this.latestPayrollSection);
  }

  async isCalendarSectionDisplayed() {
    return await this.isVisible(this.calendarSection);
  }

  async isReportSectionDisplayed() {
    return await this.isVisible(this.reportSection);
  }

  async isRunPayrollButtonDisplayed() {
    return await this.isVisible(this.runPayrollButton);
  }
}

module.exports = HomePage;
