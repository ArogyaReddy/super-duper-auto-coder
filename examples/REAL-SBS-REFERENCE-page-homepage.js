const By = require('../../support/By.js');
const BasePage = require('./base-page');

// Real SBS locator patterns using By.css(), By.xpath(), etc.
const home = By.css('[id=PAYROLL]');
const topMenuHome = By.xpath("//div[@id='ngshellcontent']/..//span[contains(text(),'Home')]");
const employeeTile = By.xpath(`//div[@data-test-id='sc_EMPLOYEE_LIST'] | //div[@data-test-id='sc_EMPLOYEE_LIST_SYNERG']`);
const payrollCarousel = By.xpath("//div[@data-test-id='payroll-tile-wrapper']");
const ToDo_NotificationText = By.css("div[data-test-id='view-all-notifications-button'], [data-test-id='view-all-notifications-button']");
const LAST_PAYROLL_ACTION_MENU = By.xpath("//sdf-action-menu[@data-test-id='latest-payroll-action-menu']");
const LAST_PAYROLL_DETAILS = By.css('[data-test-id=latest-payroll-view-payrolls-details]');
const LAST_PAYROLL_OPTIONS = By.css("[label='Payroll options']");
const OFFCYCLE_PAYROLL = By.css("[data-test-id='New-Off-Cycle-Payroll']");
const tileLatestPayrollSection = By.xpath("//div[@data-test-id='latest-payroll-wrapper']");
const GLOBAL_SEARCH_BAR = By.xpath('//input[@data-test-id="omnisearch-input"]');
const OTXTSEARCH = By.xpath("(//*[@data-test-id='omnisearch-input'])[2]");
const OMNI_SEARCH_VALUE = (SEARCH_OPTION) => By.xpath(`//div[text()="${SEARCH_OPTION}"]`);
const RUN_PAYROLL_BUTTON = By.css('[data-test-id=run-payroll-btn]');

class RunModHomePage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async waitForHomePagePayrollCarousel() {
    try {
      await this.waitForSelector(RUN_PAYROLL_BUTTON, 15);
    } catch (error) {
      // Handle timeout gracefully
    }
  }

  async isClientHomePageDisplayed() {
    if (await this.isVisible(payrollCarousel, 30)) {
      return true;
    } else if (await this.isVisibleIgnoreError('[data-test-id="setup-panel"]', 5)) {
      return true;
    } else {
      return await this.isVisible(GLOBAL_SEARCH_BAR, 5);
    }
  }

  async launchOffCyclePayroll() {
    await this.clickElement(OFFCYCLE_PAYROLL);
  }

  async clickLastPayrollActionMenu() {
    await this.clickElement(LAST_PAYROLL_ACTION_MENU);
  }

  async clickLastPayrollDetails() {
    await this.clickElement(LAST_PAYROLL_DETAILS);
  }

  async clickLastPayrollOptions() {
    await this.clickElement(LAST_PAYROLL_OPTIONS);
  }

  async clickLastPayrollModalClose() {
    let lastPayrollModalCloseIcon = await this.getShadowElementDepthOfOne(
      By.css("sdf-focus-pane[heading='Weekly payroll']"), 
      By.css("sdf-close-button[id='close-button']")
    );
    await lastPayrollModalCloseIcon.click();
  }

  async isLatestPayrollSectionDisplayed() {
    return await this.isVisible(tileLatestPayrollSection);
  }

  async getUpcomingPayrollText() {
    return await this.innerText(payrollCarousel);
  }

  async SearchAndSelectOption(option) {
    await this.closeImportantNotificationPopup();
    await this.clear(OTXTSEARCH);
    await this.fill(OTXTSEARCH, option);

    const optionParts = option.toString().split(' ');
    let requiredLocator;
    if (optionParts.length > 1) {
      requiredLocator = `(//b[contains(text(),'${optionParts[0]}')]/following-sibling::b[contains(text(),'${optionParts[1]}')])[1]`;
    } else {
      requiredLocator = `//b[contains(text(),'${option}')]`;
    }
    await this.clickElement(requiredLocator);
  }

  async searchForAnOptionInHomePage(option) {
    await this.closeImportantNotificationPopup();
    await this.fill(`[data-test-id="home-search-container"] input[data-test-id="omnisearch-input"]`, option);
  }

  async isOptionDisplayedInSearchResults(option) {
    return await this.isVisible(OMNI_SEARCH_VALUE(option), 120);
  }

  async clickOptioninSearchResult(option) {
    await this.clickElement(OMNI_SEARCH_VALUE(option));
  }

  async closeImportantNotificationPopup() {
    const importantNotificationPopupClose = By.xpath("//span[@class='crm-dialog-title popupTitle' and contains(text(),'Important Notification')]/ancestor::span[@class='dlg-title-text']//../span[@class='dlg-close-action dlg-CombinedMessage']");
    if (await this.isVisibleIgnoreError(importantNotificationPopupClose, 10)) {
      await this.clickElement(importantNotificationPopupClose);
    }
  }

  async selectPayrollFromLeftHandNavigation() {
    let payrollElement = By.xpath(`//sdf-icon[@data-test-id='Payroll-icon']`);
    await this.clickElement(payrollElement);
  }

  async clickHomeFromLeftHandNavOption() {
    let homeElement = By.xpath(`//sdf-icon[@data-test-id='Home-icon']`);
    let homePageSearch = By.xpath("(//input[@data-test-id='omnisearch-input'])[2]");

    await this.clickElement(homeElement);
    return await this.isVisible(homePageSearch);
  }

  async NavigateToDashboardOverviewPage() {
    const otxtSearch = await this.find(By.xpath("(//*[@data-test-id='omnisearch-input'])[2]"));
    await otxtSearch.clear();
    await otxtSearch.fill('Overview');

    const DASHBOARD_OVERVIEW = By.xpath("//div[@data-menuid='DASHBOARD_OVERVIEW']");
    await this.scrollIntoView(DASHBOARD_OVERVIEW);
    await this.clickElement(DASHBOARD_OVERVIEW);
    
    const RUN_DASHBOARD = By.xpath(`//div[@class="Cwc_Header_Caption" and contains(text(),"Run Dashboard")]`);
    let run_Dashboard = await this.Classic.find(RUN_DASHBOARD);
    await run_Dashboard.click();
  }

  async isPayrollSectionDisplayed() {
    const tilePayrollSection = By.xpath("//div[@data-test-id='payroll-tile-wrapper']");
    return await this.isVisible(tilePayrollSection);
  }

  async isToDosSectionDisplayed() {
    const tileToDosSection = By.xpath("//div[@data-test-id='todos-wrapper']");
    return await this.isVisible(tileToDosSection);
  }

  async isGrowYourBusinessSectionDisplayed() {
    const tileGrowYourBusinessSection = By.xpath("//div[@data-test-id='grow-your-business-wrapper']");
    return await this.isVisible(tileGrowYourBusinessSection, 30);
  }

  async isCalendarSectionDisplayed() {
    const tileCalendarSection = By.xpath("//div[@data-test-id='calendar-wrapper']");
    return await this.isVisible(tileCalendarSection);
  }

  async isReportSectionDisplayed() {
    const tileReportsSection = By.xpath("//div[@data-test-id='reports-tile-container']");
    return await this.isVisible(tileReportsSection);
  }
}

module.exports = RunModHomePage;
