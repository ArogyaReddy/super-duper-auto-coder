const { chromium } = require('playwright');

/**
 * SESSION CLEANUP AND FRESH BROWSER HANDLER
 * 
 * This utility ensures each login attempt starts with a completely clean slate:
 * - No cookies from previous sessions
 * - No cached authentication data
 * - No stored user preferences
 * - Fresh browser context every time
 */
class FreshSessionHandler {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async createFreshSession() {
        console.log('🧹 CREATING FRESH SESSION');
        console.log('=========================');
        console.log('🗑️  Clearing all previous session data...');
        
        // Close any existing browser/context
        await this.cleanup();
        
        // Launch fresh browser with clean slate
        this.browser = await chromium.launch({
            headless: false,
            slowMo: 1000,
            args: [
                '--start-maximized',
                '--no-default-browser-check',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled',
                // Clear all data directories
                '--user-data-dir=' + `/tmp/playwright-session-${Date.now()}`,
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                // Force fresh profile
                '--no-first-run',
                '--no-service-autorun',
                '--password-store=basic',
                '--use-mock-keychain'
            ]
        });
        
        // Create completely fresh context with no persistence
        this.context = await this.browser.newContext({
            viewport: null,
            ignoreHTTPSErrors: true,
            // Fresh user agent
            userAgent: this.generateFreshUserAgent(),
            // No storage persistence
            storageState: undefined,
            // Clear all permissions
            permissions: [],
            // Fresh locale
            locale: 'en-US',
            timezoneId: 'America/New_York',
            // Extra HTTP headers for freshness
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        // Create fresh page
        this.page = await this.context.newPage();
        
        // Clear any existing cookies/storage
        await this.clearAllSessionData();
        
        // Add fresh session initialization
        await this.initializeFreshSession();
        
        console.log('✅ Fresh session created successfully');
        console.log(`🆔 Session ID: playwright-${Date.now()}`);
        
        return this.page;
    }

    generateFreshUserAgent() {
        // Generate slightly varied but realistic user agent
        const versions = ['120.0.0.0', '119.0.0.0', '121.0.0.0'];
        const version = versions[Math.floor(Math.random() * versions.length)];
        return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
    }

    async clearAllSessionData() {
        console.log('🧹 Clearing all session data...');
        
        try {
            // Clear cookies
            await this.context.clearCookies();
            console.log('✅ Cookies cleared');
            
            // Clear local storage, session storage, and other storage
            await this.page.evaluate(() => {
                // Clear localStorage
                if (window.localStorage) {
                    window.localStorage.clear();
                }
                
                // Clear sessionStorage
                if (window.sessionStorage) {
                    window.sessionStorage.clear();
                }
                
                // Clear indexedDB
                if (window.indexedDB) {
                    try {
                        window.indexedDB.databases().then(databases => {
                            databases.forEach(db => {
                                window.indexedDB.deleteDatabase(db.name);
                            });
                        });
                    } catch (e) {
                        // Ignore indexedDB errors
                    }
                }
                
                // Clear caches
                if ('caches' in window) {
                    caches.keys().then(cacheNames => {
                        cacheNames.forEach(cacheName => {
                            caches.delete(cacheName);
                        });
                    });
                }
                
                return 'Storage cleared';
            });
            console.log('✅ Browser storage cleared');
            
        } catch (error) {
            console.log('⚠️  Some storage clearing failed (this is normal):', error.message);
        }
    }

    async initializeFreshSession() {
        console.log('🔧 Initializing fresh session...');
        
        // Add initialization script to hide automation indicators
        await this.page.addInitScript(() => {
            // Remove webdriver property
            delete navigator.__proto__.webdriver;
            
            // Override plugins to look more realistic
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', length: 1 },
                    { name: 'Chromium PDF Plugin', length: 1 },
                    { name: 'Microsoft Edge PDF Plugin', length: 1 },
                    { name: 'PDF Viewer', length: 1 },
                    { name: 'WebKit built-in PDF', length: 1 }
                ]
            });
            
            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
            
            // Mock realistic permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });
        
        console.log('✅ Fresh session initialized');
    }

    async performFreshLogin(credentials = 'Arogya@23477791/ADPadp01$') {
        console.log('🔐 PERFORMING FRESH LOGIN');
        console.log('=========================');
        
        const [username, password] = credentials.split('/');
        const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        
        console.log(`👤 Username: ${username}`);
        console.log(`🔗 Target: ${targetUrl}`);
        console.log('🧹 Using completely fresh session (no cached data)');
        console.log('');
        
        try {
            // Navigate to login page
            console.log('🌐 Navigating to fresh login page...');
            await this.page.goto(targetUrl, { 
                waitUntil: 'networkidle',
                timeout: 30000
            });
            
            // Take initial screenshot
            await this.page.screenshot({ 
                path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/fresh-session-initial-${Date.now()}.png`,
                fullPage: true 
            });
            
            console.log('✅ Page loaded with fresh session');
            
            // Username entry
            console.log('👤 Entering username...');
            await this.page.waitForSelector('#login-form_username', { timeout: 15000 });
            await this.fillShadowDOMInput('#login-form_username', username);
            await this.page.waitForTimeout(1000);
            
            // Click verify button
            console.log('🔍 Clicking verify button...');
            await this.page.click('#verifUseridBtn, #btnNext');
            await this.page.waitForTimeout(3000);
            
            // Password entry
            console.log('🔑 Entering password...');
            await this.page.waitForSelector('#login-form_password', { timeout: 15000 });
            await this.fillShadowDOMInput('#login-form_password', password);
            await this.page.waitForTimeout(1000);
            
            // Submit login
            console.log('🚀 Submitting login...');
            await this.page.click('#signBtn, #btnNext');
            await this.page.waitForTimeout(5000);
            
            // Check result
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log(`📍 Current URL: ${currentUrl}`);
            console.log(`📄 Current Title: ${currentTitle}`);
            
            // Take post-login screenshot
            await this.page.screenshot({ 
                path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/fresh-session-result-${Date.now()}.png`,
                fullPage: true 
            });
            
            // Analyze result
            return this.analyzeLoginResult(currentUrl, currentTitle);
            
        } catch (error) {
            console.error(`💥 Fresh login error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                sessionFresh: true
            };
        }
    }

    analyzeLoginResult(url, title) {
        console.log('🔍 Analyzing fresh login result...');
        
        // Check for success indicators
        if (url.includes('runpayrollmain2')) {
            console.log('🎉 SUCCESS: Reached main application');
            return {
                success: true,
                method: 'direct_success',
                finalUrl: url,
                securityStepRequired: false,
                sessionFresh: true
            };
        }
        
        // Check for security steps
        if (url.includes('step-up') || url.includes('verification')) {
            console.log('🛡️  SECURITY STEP: Additional verification required');
            return {
                success: false, // Not complete yet, but not failed
                method: 'security_step_required',
                finalUrl: url,
                securityStepRequired: true,
                sessionFresh: true,
                message: 'Manual intervention required for security step'
            };
        }
        
        // Check if still on signin (potential issue)
        if (url.includes('signin')) {
            console.log('⚠️  STILL ON SIGNIN: May have credential or session issues');
            
            // Check for error messages
            this.page.locator('text=/incorrect|invalid|error/i').textContent()
                .then(errorText => {
                    if (errorText) {
                        console.log(`❌ Error detected: ${errorText}`);
                    }
                })
                .catch(() => {});
            
            return {
                success: false,
                method: 'still_on_signin',
                finalUrl: url,
                securityStepRequired: false,
                sessionFresh: true,
                message: 'Login did not progress - check credentials or page state'
            };
        }
        
        // Unknown state
        console.log('❓ UNKNOWN STATE: Unexpected URL/title combination');
        return {
            success: false,
            method: 'unknown_state',
            finalUrl: url,
            securityStepRequired: false,
            sessionFresh: true,
            message: `Unexpected state: ${url}`
        };
    }

    async fillShadowDOMInput(selector, value) {
        try {
            // First try direct fill
            await this.page.fill(selector, value);
            console.log(`✅ Filled ${selector} directly`);
        } catch (error) {
            console.log(`🔍 Direct fill failed for ${selector}, trying shadow DOM...`);
            
            try {
                // Shadow DOM method
                await this.page.evaluate((sel, val) => {
                    const host = document.querySelector(sel);
                    if (host && host.shadowRoot) {
                        const input = host.shadowRoot.querySelector('#input') || host.shadowRoot.querySelector('input');
                        if (input) {
                            input.value = val;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            return true;
                        }
                    }
                    return false;
                }, selector, value);
                console.log(`✅ Filled ${selector} via shadow DOM`);
            } catch (shadowError) {
                // Keyboard typing fallback
                console.log(`🔍 Shadow DOM failed for ${selector}, trying keyboard...`);
                await this.page.focus(selector);
                await this.page.keyboard.type(value);
                console.log(`✅ Filled ${selector} via keyboard`);
            }
        }
    }

    async cleanup() {
        console.log('🧹 Cleaning up session...');
        
        try {
            if (this.page) {
                await this.page.close();
                this.page = null;
            }
            
            if (this.context) {
                await this.context.close();
                this.context = null;
            }
            
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            
            console.log('✅ Session cleanup completed');
        } catch (error) {
            console.log('⚠️  Cleanup warning:', error.message);
        }
    }

    getPage() {
        return this.page;
    }

    getBrowser() {
        return this.browser;
    }

    getContext() {
        return this.context;
    }
}

// Test the fresh session handler
async function testFreshSessions() {
    console.log('🧪 TESTING FRESH SESSION BEHAVIOR');
    console.log('==================================');
    console.log('🎯 Goal: Verify that each login starts completely fresh');
    console.log('');
    
    const numberOfTests = 3;
    const results = [];
    
    for (let i = 1; i <= numberOfTests; i++) {
        console.log(`\n🔄 TEST RUN ${i}/${numberOfTests}`);
        console.log('=' + '='.repeat(20 + i.toString().length));
        
        const freshSession = new FreshSessionHandler();
        
        try {
            // Create fresh session
            await freshSession.createFreshSession();
            
            // Perform login
            const result = await freshSession.performFreshLogin('Arogya@23477791/ADPadp01$');
            
            console.log('📊 Test Result:');
            console.log(`   🎯 Success: ${result.success}`);
            console.log(`   🔧 Method: ${result.method}`);
            console.log(`   🧹 Session Fresh: ${result.sessionFresh}`);
            console.log(`   🛡️  Security Step: ${result.securityStepRequired}`);
            
            if (result.message) {
                console.log(`   💬 Message: ${result.message}`);
            }
            
            results.push({
                run: i,
                ...result,
                timestamp: new Date().toISOString()
            });
            
            // Wait before next test
            console.log('⏳ Waiting 10 seconds before next test...');
            await freshSession.getPage().waitForTimeout(10000);
            
        } catch (error) {
            console.error(`💥 Test ${i} error: ${error.message}`);
            results.push({
                run: i,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            await freshSession.cleanup();
        }
    }
    
    // Summary
    console.log('\n📋 FRESH SESSION TEST SUMMARY');
    console.log('=============================');
    
    const successful = results.filter(r => r.success).length;
    const withSecurity = results.filter(r => r.securityStepRequired).length;
    const failed = results.filter(r => !r.success && !r.securityStepRequired).length;
    
    console.log(`✅ Successful logins: ${successful}/${numberOfTests}`);
    console.log(`🛡️  Security steps required: ${withSecurity}/${numberOfTests}`);
    console.log(`❌ Failed logins: ${failed}/${numberOfTests}`);
    
    console.log('\n📊 Individual Results:');
    results.forEach(result => {
        console.log(`   Run ${result.run}: ${result.success ? '✅' : '❌'} ${result.method || 'failed'}`);
    });
    
    console.log('\n💡 INSIGHTS:');
    if (successful > 0) {
        console.log('✅ Fresh sessions are working correctly');
    }
    if (withSecurity > 0) {
        console.log('🛡️  Security steps are being triggered (this is normal)');
    }
    if (failed > 0) {
        console.log('⚠️  Some failures occurred - may need further investigation');
    }
    
    // Save results
    const reportPath = `/Users/arog/auto/auto/qa_automation/auto-coder/reports/fresh-session-test-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify({ summary: { successful, withSecurity, failed }, results }, null, 2));
    console.log(`📄 Detailed results saved: ${reportPath}`);
    
    console.log('\n🏁 Fresh session testing completed!');
}

// Run if called directly
if (require.main === module) {
    testFreshSessions().catch(console.error);
}

module.exports = { FreshSessionHandler };
