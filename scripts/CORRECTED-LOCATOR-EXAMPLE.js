const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

/**
 * 🚀 EXAMPLE: CORRECTED LOCATOR FORMAT
 * 
 * This shows the proper consolidated locator format you requested.
 * Each locator combines multiple strategies in a single constant.
 */

// ====== ELEMENT LOCATORS ======
// Consolidated CSS locators with multiple strategies (comma-separated)
const CFC_PROMO_HEADER = By.css('[data-test-id="cfc-promo-header"], .cfc-promo-header, h1[class*="cfc"], h2[class*="cfc"]');
const NEW_BADGE = By.css('[data-test-id="new-badge"], .new-badge, .badge[text="New"], span[text="New"]');
const SUBMIT_BUTTON = By.css('[data-test-id="submit-btn"], #submit-btn, [aria-label="Submit"], button[type="submit"]');
const USER_MENU = By.css('[data-test-id="user-menu"], .user-menu, [aria-label="User Menu"], [role="menu"]');

// XPath alternatives (only when significantly different from CSS)
const NEW_BADGE_XPATH = By.xpath('//span[text()="New"] | //div[text()="New"] | //*[contains(@class, "badge")][text()="New"]');
const DYNAMIC_CONTENT_XPATH = By.xpath('//div[contains(text(), "Dynamic")] | //*[@role="alert"][contains(text(), "Success")]');

class CorrectedExamplePage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  // ====== PAGE METHODS ======
  
  // CFC Promo Header
  async clickCfcPromoHeader() {
    await this.clickElement(CFC_PROMO_HEADER);
  }

  async verifyCfcPromoHeaderIsVisible() {
    const isVisible = await this.isVisible(CFC_PROMO_HEADER);
    if (!isVisible) {
      throw new Error('CFC Promo Header is not visible');
    }
    return true;
  }

  // New Badge (with XPath alternative)
  async verifyNewBadgeIsVisible() {
    const isVisible = await this.isVisible(NEW_BADGE);
    if (!isVisible) {
      throw new Error('New Badge is not visible');
    }
    return true;
  }

  // Alternative XPath method for New Badge
  async verifyNewBadgeXPath() {
    const element = await this.page.locator(NEW_BADGE_XPATH);
    const isVisible = await element.isVisible();
    if (!isVisible) {
      throw new Error('New Badge (XPath) is not visible');
    }
    return true;
  }

  // Submit Button
  async clickSubmitButton() {
    await this.clickElement(SUBMIT_BUTTON);
  }

  async verifySubmitButtonIsVisible() {
    const isVisible = await this.isVisible(SUBMIT_BUTTON);
    if (!isVisible) {
      throw new Error('Submit Button is not visible');
    }
    return true;
  }

  // User Menu
  async clickUserMenu() {
    await this.clickElement(USER_MENU);
  }

  async verifyUserMenuIsVisible() {
    const isVisible = await this.isVisible(USER_MENU);
    if (!isVisible) {
      throw new Error('User Menu is not visible');
    }
    return true;
  }

  // ====== UTILITY METHODS ======
  async verifyPageLoaded() {
    await this.waitForElement(CFC_PROMO_HEADER);
    return true;
  }

  async getAllVisibleElements() {
    const statuses = {};
    try { statuses['cfc-promo-header'] = await this.isVisible(CFC_PROMO_HEADER); } catch (e) { statuses['cfc-promo-header'] = false; }
    try { statuses['new-badge'] = await this.isVisible(NEW_BADGE); } catch (e) { statuses['new-badge'] = false; }
    try { statuses['submit-button'] = await this.isVisible(SUBMIT_BUTTON); } catch (e) { statuses['submit-button'] = false; }
    try { statuses['user-menu'] = await this.isVisible(USER_MENU); } catch (e) { statuses['user-menu'] = false; }
    return statuses;
  }

  // Helper method for XPath locators
  async clickElementByXPath(xpathLocator) {
    const element = await this.page.locator(xpathLocator);
    await element.click();
  }
}

module.exports = CorrectedExamplePage;
