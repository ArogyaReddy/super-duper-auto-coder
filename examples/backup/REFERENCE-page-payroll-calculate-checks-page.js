const By = require('./../../../support/By.js');
const BasePage = require('../../common/base-page');

class PayrollCalculateChecksPage extends BasePage {

  constructor(page) {
    super(page);
    this.page = page;
    
    // Page locators
    this.calculateChecksHeader = By.xpath("//div[text()='Calculate and record manual checks']");
    this.xButton = By.xpath("//span[@class='sbsicons-close'] | //sdf-icon-button[@data-test-id='modal-header-icon']");
    this.okButton = 'sdf-button#accept-button';
    this.calculateChecksTile = '[data-testid="calculate-checks-tile"]';
    this.payrollLandingPage = '[data-testid="payroll-landing-page"]';
    this.settingsButton = '[data-testid="settings-button"]';
    this.checkAndPaymentOptionsTile = '[data-testid="check-payment-options-tile"]';
    this.checkAndPaymentOptionsModal = '[data-testid="check-payment-options-modal"]';
    this.modalCloseButton = '[data-testid="modal-close-button"]';
    this.morePayrollOptionsTile = '[data-testid="more-payroll-options-tile"]';
    this.morePayrollOptionsOverflow = '[data-testid="more-payroll-options-overflow"]';
  }

  async waitForCalculateChecksPageToLoad() {
    await this.waitForPageToLoad();
  }

  async isCalculateChecksPageDisplayed() {
    await this.waitForLocator(this.calculateChecksHeader);
    return await this.isVisible(this.calculateChecksHeader);
  }

  async closeCalculateChecksPage() {
    await this.clickElement(this.xButton);
    await this.clickElement(this.okButton);
  }

  async selectCalculateChecksTile() {
    await this.waitForLocator(this.calculateChecksTile);
    await this.clickElement(this.calculateChecksTile);
  }

  async isPayrollLandingPageDisplayed() {
    return await this.isVisible(this.payrollLandingPage);
  }

  async clickSettingsButton() {
    await this.waitForLocator(this.settingsButton);
    await this.clickElement(this.settingsButton);
  }

  async selectCheckAndPaymentOptionsTile() {
    await this.waitForLocator(this.checkAndPaymentOptionsTile);
    await this.clickElement(this.checkAndPaymentOptionsTile);
  }

  async isCheckAndPaymentOptionsModalDisplayed() {
    return await this.isVisible(this.checkAndPaymentOptionsModal);
  }

  async closeModal() {
    await this.waitForLocator(this.modalCloseButton);
    await this.clickElement(this.modalCloseButton);
  }

  async selectMorePayrollOptionsTile() {
    await this.waitForLocator(this.morePayrollOptionsTile);
    await this.clickElement(this.morePayrollOptionsTile);
  }

  async isMorePayrollOptionsOverflowDisplayed() {
    return await this.isVisible(this.morePayrollOptionsOverflow);
  }
}

module.exports = PayrollCalculateChecksPage;
