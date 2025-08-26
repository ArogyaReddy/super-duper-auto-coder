/**
 * MAX Login Page - Digital Plus Test Credentials
 * Handles authentication for MAX application with digital plus test credentials
 * Based on SBS_Automation framework patterns
 */

const By = require('./By');
const helpers = require('./helpers');
let BasePage = require('./pages/base-page');

// MAX Login Locators - Following SBS_Automation pattern
const USERNAME = By.css('#login-form_username');
const PASSWORD = By.css('#login-form_password');
const VERIFY_USERID_BUTTON = By.css('#verifUseridBtn, #btnNext');
const REMIND_ME_LATER_BUTTON = By.xpath("//*[text() = 'Remind me later']");
const SIGN_IN_BUTTON = By.css('#signBtn, #btnNext');

class MaxLoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.page = page;
    }

    /**
     * Navigate to the MAX application URL
     * @param {string} url - Application URL from configuration
     */
    async navigateTo(url) {
        await this.page.goto(url, { waitUntil: 'load' });
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Perform MAX login with digital plus test credentials
     * @param {string} username - Login username
     * @param {string} password - Login password
     */
    async performMAXLogin(username, password) {
        // Wait for login form to be visible
        await this.page.waitForSelector(USERNAME, { timeout: 30000 });
        
        // Enter username
        await this.page.fill(USERNAME, username);
        
        // Enter password
        await this.page.fill(PASSWORD, password);
        
        // Click verify user ID button if present
        try {
            const verifyButton = this.page.locator(VERIFY_USERID_BUTTON);
            if (await verifyButton.isVisible({ timeout: 5000 })) {
                await verifyButton.click();
                await this.page.waitForTimeout(2000);
            }
        } catch (error) {
            // Continue if verify button not found
        }
        
        // Handle "Remind me later" button if present
        try {
            const remindLaterButton = this.page.locator(REMIND_ME_LATER_BUTTON);
            if (await remindLaterButton.isVisible({ timeout: 5000 })) {
                await remindLaterButton.click();
                await this.page.waitForTimeout(1000);
            }
        } catch (error) {
            // Continue if remind me later button not found
        }
        
        // Click sign in button
        const signInButton = this.page.locator(SIGN_IN_BUTTON);
        await signInButton.click();
        
        // Wait for navigation after login
        await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    }

    /**
     * Verify if login was successful by checking for post-login elements
     */
    async verifyLoginSuccess() {
        // Wait for post-login navigation
        await this.page.waitForTimeout(3000);
        
        // Check if we're redirected from login page (basic verification)
        const currentUrl = this.page.url();
        const isLoginPage = currentUrl.includes('login') || currentUrl.includes('signin');
        
        return !isLoginPage;
    }

    /**
     * Get current page title for verification
     */
    async getPageTitle() {
        return await this.page.title();
    }

    /**
     * Check if login form is present
     */
    async isLoginFormPresent() {
        try {
            const usernameField = this.page.locator(USERNAME);
            const passwordField = this.page.locator(PASSWORD);
            
            return await usernameField.isVisible() && await passwordField.isVisible();
        } catch (error) {
            return false;
        }
    }

    /**
     * Handle any login errors
     */
    async getLoginError() {
        try {
            // Common error selectors
            const errorSelectors = [
                '.error-message',
                '.alert-danger',
                '.login-error',
                '[class*="error"]',
                '[class*="invalid"]'
            ];
            
            for (const selector of errorSelectors) {
                const errorElement = this.page.locator(selector);
                if (await errorElement.isVisible()) {
                    return await errorElement.textContent();
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }
}

module.exports = MaxLoginPage;
