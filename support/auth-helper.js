/**
 * Authentication Helper for Auto-Coder Framework
 * Enhanced with Environment Management and Feature Flags
 * Integrates with SBS_Automation authentication patterns
 */

const fs = require('fs-extra');
const path = require('path');
const ConfigLoader = require('./config-loader.js');
const EnvironmentManager = require('./environment-manager.js');
const FeatureFlagManager = require('./feature-flag-manager.js');

class AuthenticationHelper {
    constructor() {
        this.configLoader = new ConfigLoader();
        this.environmentManager = new EnvironmentManager();
        this.featureFlags = new FeatureFlagManager();
        this.config = this.configLoader.getConfig();
        this.authConfig = this.configLoader.getAuthConfig();
        this.authStatePath = path.join(__dirname, '..', 'SBS_Automation/auth-state.json');
    }

    /**
     * Check if authentication is required based on feature flags and test mode
     * @param {string} testType - Type of test (UI, API, MIXED)
     * @returns {boolean} Whether authentication is required
     */
    isAuthRequired(testType = 'UI') {
        // Check feature flags first
        if (this.featureFlags.shouldSkipLogin()) {
            console.log('🚩 Authentication skipped due to feature flag');
            return false;
        }

        // Check test mode
        if (testType === 'API' && this.featureFlags.shouldSkipUILoginForAPI()) {
            console.log('🚩 UI authentication skipped for API test');
            return false;
        }

        // Check local development mode
        if (this.featureFlags.isEnabled('LOCAL_DEVELOPMENT') && 
            this.featureFlags.isEnabled('BYPASS_AUTH_FOR_LOCAL')) {
            console.log('🚩 Authentication bypassed for local development');
            return false;
        }

        return this.authConfig.enabled === true;
    }

    /**
     * Get current authentication status
     * @returns {object} Authentication status information
     */
    getAuthStatus() {
        return {
            environment: this.environmentManager.getCurrentEnvironment(),
            environmentDisplay: this.environmentManager.getEnvironmentDisplayName(),
            authRequired: this.isAuthRequired(),
            testMode: this.featureFlags.getTestMode(),
            stepUpEnabled: this.featureFlags.shouldUseStepUpAuth(),
            twoFactorEnabled: this.featureFlags.shouldUseTwoFactorAuth(),
            skipLogin: this.featureFlags.shouldSkipLogin()
        };
    }

    /**
     * Print authentication configuration
     */
    printAuthConfig() {
        const status = this.getAuthStatus();
        
        console.log('\n🔐 Authentication Configuration:');
        console.log('================================');
        console.log(`Environment: ${status.environmentDisplay} (${status.environment})`);
        console.log(`Test Mode: ${status.testMode}`);
        console.log(`Auth Required: ${status.authRequired ? '✅ Yes' : '❌ No'}`);
        console.log(`Skip Login: ${status.skipLogin ? '✅ Yes' : '❌ No'}`);
        console.log(`Step-Up Auth: ${status.stepUpEnabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`Two-Factor Auth: ${status.twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log('================================\n');
    }

    /**
     * Switch environment and update configuration
     * @param {string} environment - Target environment (fit, iat, prod)
     */
    switchEnvironment(environment) {
        console.log(`🔄 Switching to environment: ${environment}`);
        this.environmentManager.setEnvironment(environment);
        
        // Validate the new environment configuration
        try {
            if (!this.environmentManager.validateConfiguration()) {
                console.warn(`⚠️  Warning: Invalid configuration for environment: ${environment}`);
            } else {
                console.log(`✅ Successfully switched to ${this.environmentManager.getEnvironmentDisplayName()}`);
            }
        } catch (error) {
            console.warn(`⚠️  Warning: Could not validate configuration for ${environment}: ${error.message}`);
        }
    }

    /**
     * Get login URL based on login type and environment
     * @param {string} loginType - Type of login (standard, max, associate)
     * @returns {string} Login URL
     */
    getLoginUrl(loginType = 'standard') {
        try {
            const config = this.environmentManager.getEnvironmentConfig();
            
            switch (loginType.toLowerCase()) {
                case 'associate':
                    return config.associate_url || this.configLoader.getBaseUrl() + '/admin';
                    
                case 'max':
                case 'standard':
                default:
                    return config.url || this.configLoader.getBaseUrl() + (this.authConfig.loginUrl || '/login');
            }
        } catch (error) {
            console.warn(`⚠️  Warning: Could not get login URL for ${loginType}: ${error.message}`);
            return this.configLoader.getBaseUrl() + (this.authConfig.loginUrl || '/login');
        }
    }

    /**
     * Get credentials for the current environment
     * @param {string} credentialType - Type of credentials (user, associate, admin)
     * @returns {object} Credential object with username and password
     */
    getCredentials(credentialType = 'user') {
        const environment = this.environmentManager.getCurrentEnvironment();
        console.log(`🔐 Getting ${credentialType} credentials for environment: ${environment}`);

        try {
            switch (credentialType.toLowerCase()) {
                case 'associate':
                    return this.getAssociateCredentials();
                    
                case 'admin':
                    return this.getAdminCredentials();
                    
                case 'user':
                default:
                    return this.getUserCredentials();
            }
        } catch (error) {
            console.error(`❌ Failed to get credentials for ${credentialType}:`, error.message);
            throw error;
        }
    }

    /**
     * Get user credentials from environment configuration
     * @returns {object} User credentials
     */
    getUserCredentials() {
        // For MAX/DigitalPlus login, try to get from test data first
        try {
            const maxData = this.environmentManager.getTestData('max/max');
            if (maxData && maxData.dtoLoginCreds) {
                return {
                    username: maxData.dtoLoginCreds.username,
                    password: maxData.dtoLoginCreds.password,
                    iid: maxData.dtoLoginCreds.iid
                };
            }
        } catch (error) {
            console.warn('⚠️  No MAX credentials found, using fallback credentials');
        }

        // Fallback to auth config and environment variables
        return {
            username: this.authConfig.username || process.env.TEST_USERNAME || 'test@sbs-automation.com',
            password: this.authConfig.password || process.env.TEST_PASSWORD || 'TestPassword123'
        };
    }

    /**
     * Get associate credentials from environment configuration
     * @returns {object} Associate credentials
     */
    getAssociateCredentials() {
        return this.environmentManager.getAssociateCredentials();
    }

    /**
     * Get admin credentials from environment configuration
     * @returns {object} Admin credentials
     */
    getAdminCredentials() {
        const config = this.environmentManager.getEnvironmentConfig();
        
        return {
            username: process.env.ADMIN_USERNAME || config.admin_username || 'admin@adp.com',
            password: process.env.ADMIN_PASSWORD || config.admin_password || 'Admin123'
        };
    }

    /**
     * Perform login for a Playwright page
     * Enhanced for ADP authentication flow
     */
    async performLogin(page, options = {}) {
        if (!this.isAuthRequired()) {
            console.log('🔓 Authentication not required, skipping login');
            return true;
        }

        const credentials = this.getCredentials();
        const loginUrl = this.getLoginUrl();

        console.log(`🔑 Performing ADP login at: ${loginUrl}`);

        try {
            // Navigate to login page if not already there
            const currentUrl = page.url();
            if (!currentUrl.includes('signin') && !currentUrl.includes('login')) {
                await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 60000 });
            }

            // Wait for login form (ADP specific)
            const loginSelectors = options.selectors || this.getADPLoginSelectors();

            // Fill username
            await page.waitForSelector(loginSelectors.username, { timeout: 15000 });
            await page.fill(loginSelectors.username, credentials.username);
            console.log(`📧 Filled username: ${credentials.username}`);

            // Fill password
            await page.fill(loginSelectors.password, credentials.password);
            console.log('🔑 Password filled');

            // Take screenshot before submitting
            const screenshotPath = path.join(__dirname, '..', 'SBS_Automation/reports/screenshots/adp-before-submit.png');
            await fs.ensureDir(path.dirname(screenshotPath));
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);

            // Click login button
            await page.click(loginSelectors.submit);
            console.log('🚀 Login button clicked');

            // Wait for navigation or error (ADP specific)
            try {
                await Promise.race([
                    // Wait for URL to change (successful login)
                    page.waitForFunction(() => 
                        !window.location.href.includes('signin'), 
                        { timeout: 30000 }
                    ),
                    // Wait for navigation
                    page.waitForNavigation({ 
                        waitUntil: 'networkidle', 
                        timeout: 30000 
                    })
                ]);

                console.log('✅ ADP Login successful');
                
                // Take success screenshot
                const successScreenshot = path.join(__dirname, '..', 'SBS_Automation/reports/screenshots/adp-login-success.png');
                await page.screenshot({ path: successScreenshot, fullPage: true });
                
                return true;

            } catch (navError) {
                console.warn('⚠️  Navigation timeout, checking current URL...');
                
                const newUrl = page.url();
                if (!newUrl.includes('signin')) {
                    console.log('✅ Login appears successful (URL changed)');
                    return true;
                } else {
                    throw new Error('Login failed - still on signin page');
                }
            }

        } catch (error) {
            console.error('❌ ADP Login failed:', error.message);
            
            // Save screenshot for debugging
            const errorScreenshot = path.join(__dirname, '..', 'SBS_Automation/reports/screenshots/adp-login-failure.png');
            await fs.ensureDir(path.dirname(errorScreenshot));
            await page.screenshot({ path: errorScreenshot, fullPage: true });
            console.log(`📸 Error screenshot saved: ${errorScreenshot}`);
            
            return false;
        }
    }

    /**
     * Get default login selectors (customize based on actual application)
     */
    getDefaultLoginSelectors() {
        return {
            username: 'input[name="email"], input[name="username"], input[type="email"], #email, #username',
            password: 'input[name="password"], input[type="password"], #password',
            submit: 'button[type="submit"], input[type="submit"], .login-button, .btn-login'
        };
    }

    /**
     * Get ADP-specific login selectors
     */
    getADPLoginSelectors() {
        const authConfig = this.configLoader.getAuthConfig();
        
        // Use custom selectors from config if available
        if (authConfig.selectors) {
            return authConfig.selectors;
        }
        
        // ADP default selectors (will be updated after inspecting actual page)
        return {
            username: 'input[name="user"], input[id="user"], #username, input[type="email"], input[placeholder*="User"], input[placeholder*="Email"]',
            password: 'input[name="password"], input[id="password"], input[type="password"], input[placeholder*="Password"]',
            submit: 'button[type="submit"], input[type="submit"], .signin-button, .login-btn, button:has-text("Sign In"), button:has-text("Login")'
        };
    }

    /**
     * Load saved authentication state
     */
    async loadAuthState() {
        try {
            if (await fs.pathExists(this.authStatePath)) {
                return await fs.readJson(this.authStatePath);
            }
        } catch (error) {
            console.warn('⚠️  Could not load auth state:', error.message);
        }
        return null;
    }

    /**
     * Save authentication state
     */
    async saveAuthState(authData) {
        try {
            await fs.ensureDir(path.dirname(this.authStatePath));
            await fs.writeJson(this.authStatePath, {
                ...authData,
                timestamp: new Date().toISOString()
            });
            console.log('💾 Authentication state saved');
        } catch (error) {
            console.error('❌ Failed to save auth state:', error.message);
        }
    }

    /**
     * Create authenticated page context (for tests that need authentication)
     */
    async createAuthenticatedContext(browser, options = {}) {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            ignoreHTTPSErrors: true,
            ...options
        });

        if (this.isAuthRequired()) {
            const page = await context.newPage();
            const loginSuccess = await this.performLogin(page);
            
            if (!loginSuccess) {
                console.warn('⚠️  Authentication failed, continuing with unauthenticated context');
            }
            
            return { context, page };
        }

        return { context, page: await context.newPage() };
    }

    /**
     * Get authentication headers for API requests (if needed)
     */
    getAuthHeaders() {
        // This is a placeholder - implement based on actual authentication method
        return {
            'Content-Type': 'application/json',
            // Add actual auth headers here (Authorization, API keys, etc.)
        };
    }

    /**
     * Log authentication configuration (for debugging)
     */
    logAuthConfig() {
        console.log('\n🔐 Authentication Configuration:');
        console.log(`   Enabled: ${this.isAuthRequired()}`);
        
        if (this.isAuthRequired()) {
            console.log(`   Login URL: ${this.getLoginUrl()}`);
            console.log(`   Username: ${this.getCredentials().username}`);
            console.log(`   Password: ${this.getCredentials().password ? '[SET]' : '[NOT SET]'}`);
        }
        console.log('');
    }
}

module.exports = AuthenticationHelper;
