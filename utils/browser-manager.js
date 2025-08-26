// Browser setup using SBS_Automation patterns
const { Builder } = require('selenium-webdriver');

class BrowserManager {
  constructor() {
    this.driver = null;
    this.config = {
  "headless": false,
  "timeout": 30000,
  "viewport": {
    "width": 1920,
    "height": 1080
  }
};
    this.baseUrl = 'https://staging.example.com';
  }

  async initializeBrowser() {
    this.driver = await new Builder()
      .forBrowser(this.config.defaultBrowser)
      .setFirefoxOptions(this.config.firefoxOptions)
      .setChromeOptions(this.config.chromeOptions)
      .build();
    
    await this.driver.manage().window().maximize();
    await this.driver.manage().setTimeouts({
      implicit: this.config.timeouts.implicit,
      pageLoad: this.config.timeouts.pageLoad
    });
    
    return this.driver;
  }

  async closeBrowser() {
    if (this.driver) {
      await this.driver.quit();
    }
  }
}

module.exports = BrowserManager;