const By = require('../../../SBS_Automation/support/By.js');
const BasePage = require('../../../SBS_Automation/pages/common/base-page');

// Element locators defined at the top level
const ELEMENT_NAME = (param) => By.xpath(`//element-type[@attribute="${param}"]`);
const PAGE_CONTAINER = By.xpath('//div[contains(@class, "page-container")]');
const MAIN_BUTTON = By.xpath('//button[contains(@class, "main-button")]');
const SEARCH_INPUT = By.xpath('//input[@type="search"]');
const CONTENT_AREA = By.xpath('//main[contains(@class, "content")]');

class PageNamePage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  /**
   * Navigate to the page
   */
  async navigateToPage() {
    await this.page.goto('/page-url');
    await this.waitForElement(PAGE_CONTAINER);
  }
  
  /**
   * Perform main action on the page
   */
  async performMainAction() {
    await this.clickElement(MAIN_BUTTON);
    await this.waitForElement(By.xpath('//div[contains(@class, "result")]'));
  }
  
  /**
   * Search for a term
   * @param {string} term - Term to search for
   */
  async searchFor(term) {
    await this.fill(SEARCH_INPUT, term);
    await this.pressKey(SEARCH_INPUT, 'Enter');
    await this.waitForElement(By.xpath('//div[contains(@class, "search-results")]'));
  }
  
  /**
   * Verify content is displayed
   * @returns {Promise<boolean>} - Whether content is visible
   */
  async verifyContent() {
    return await this.isElementVisible(CONTENT_AREA);
  }
}

module.exports = PageNamePage;
