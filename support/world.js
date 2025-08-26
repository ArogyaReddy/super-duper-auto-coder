const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('playwright');

// Set default timeout
setDefaultTimeout(180000);

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
    this.config = this.parameters.config || {};
    this.data = this.parameters.data || {};
    this.screenshots = [];
  }

  async init() {
    // Launch browser based on configuration
    const browserType = this.config.browser || 'chrome';
    const headless = this.config.headless !== false; // Default to headless unless explicitly set to false
    
    const launchOptions = {
      headless,
      slowMo: this.config.slowMo || 0,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    };

    switch (browserType.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
      case 'safari':
        this.browser = await webkit.launch(launchOptions);
        break;
      case 'chrome':
      case 'chromium':
      default:
        this.browser = await chromium.launch(launchOptions);
        break;
    }

    // Create context and page
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: this.config.recordVideo ? { dir: './test-results/videos' } : undefined
    });

    this.page = await this.context.newPage();

    // Enable console logging in debug mode
    if (this.config.debug) {
      this.page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    }
  }

  async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name = 'screenshot') {
    if (!this.page) return null;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const path = `./test-results/screenshots/${filename}`;
    
    await this.page.screenshot({ path, fullPage: true });
    this.screenshots.push(filename);
    
    return filename;
  }

  async getCurrentUrl() {
    return this.page ? this.page.url() : null;
  }

  async getPageTitle() {
    return this.page ? this.page.title() : null;
  }
}

setWorldConstructor(CustomWorld);

module.exports = CustomWorld;
