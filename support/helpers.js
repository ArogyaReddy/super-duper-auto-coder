/**
 * SBS-style helper utilities
 * Extracted from SBS_Automation patterns
 */

const helpers = {
  /**
   * Retry navigation with exponential backoff
   */
  async retryGoto(page, url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await page.goto(url, options);
        return;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  },

  /**
   * Wait for specified time
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Wait for element with retry logic
   */
  async waitForElement(page, selector, options = {}) {
    const timeout = options.timeout || 30000;
    const interval = options.interval || 1000;
    const maxAttempts = Math.floor(timeout / interval);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await page.locator(selector).waitFor({ 
          state: options.state || 'visible', 
          timeout: interval 
        });
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`Element ${selector} not found after ${timeout}ms`);
        }
      }
    }
  },

  /**
   * Safe click with retry
   */
  async safeClick(page, selector, options = {}) {
    await this.waitForElement(page, selector, { state: 'visible' });
    await page.locator(selector).click(options);
  },

  /**
   * Safe fill with retry
   */
  async safeFill(page, selector, text, options = {}) {
    await this.waitForElement(page, selector, { state: 'visible' });
    await page.locator(selector).fill(text, options);
  },

  /**
   * Get current timestamp for unique data
   */
  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  },

  /**
   * Generate random string
   */
  generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle(page, timeout = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  },

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(page, name = 'screenshot') {
    const timestamp = this.getTimestamp();
    const filename = `${name}-${timestamp}.png`;
    await page.screenshot({ path: `test-results/screenshots/${filename}`, fullPage: true });
    return filename;
  }
};

module.exports = helpers;
