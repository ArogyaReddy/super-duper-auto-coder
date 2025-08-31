const { chromium } = require('playwright');

/**
 * Smart Login Handler - Handles both scenarios with FRESH SESSIONS:
 * 1. No security step: Proceeds directly with automation
 * 2. Security step detected: Waits for manual completion, then continues
 * 
 * FRESH SESSION FEATURES:
 * - Each login starts with completely clean browser state
 * - No cookies, cache, or session data from previous runs
 * - Prevents interference from previous authentication attempts
 */
class SmartLoginHandler {
    constructor() {
        this.browser = null;
        this.page = null;
        this.sessionId = `smart-login-${Date.now()}`;
    }

    async performSmartLogin(credentials = 'Arogya@23477791/ADPadp01$') {
        console.log('🎯 SMART LOGIN HANDLER WITH FRESH SESSIONS');
        console.log('==========================================');
        console.log('🧠 Strategy: Detect security steps and handle appropriately');
        console.log('🧹 Session: Completely fresh (no cached data)');
        console.log('📱 Scenarios: Direct login OR wait for manual security completion');
        console.log(`🆔 Session ID: ${this.sessionId}`);
        console.log('');

        // Create fresh browser session
        await this.createFreshSession();

        try {
            const [username, password] = credentials.split('/');
            const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';

            console.log(`👤 Username: ${username}`);
            console.log(`🔗 Target: ${targetUrl}`);
            console.log('');

            // PHASE 1: STANDARD LOGIN WITH FRESH SESSION
            console.log('🔐 PHASE 1: FRESH SESSION LOGIN');
            console.log('===============================');
            
            await this.page.goto(targetUrl, { waitUntil: 'networkidle' });
            console.log('✅ Page loaded with fresh session');

            // Username
            await this.page.waitForSelector('#login-form_username');
            await this.fillShadowDOMInput('#login-form_username', username);
            await this.page.click('#verifUseridBtn, #btnNext');
            await this.page.waitForTimeout(3000);
            console.log('✅ Username submitted');

            // Password
            await this.page.waitForSelector('#login-form_password');
            await this.fillShadowDOMInput('#login-form_password', password);
            await this.page.click('#signBtn, #btnNext');
            await this.page.waitForTimeout(5000);
            console.log('✅ Password submitted');

            // PHASE 2: SMART DETECTION
            console.log('');
            console.log('🧠 PHASE 2: SMART SECURITY DETECTION');
            console.log('====================================');
            
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log(`📍 Current URL: ${currentUrl}`);
            console.log(`📄 Current Title: ${currentTitle}`);
            console.log('');

            // Analyze the current state
            const securityStepDetected = this.detectSecurityStep(currentUrl, currentTitle);
            
            if (securityStepDetected.detected) {
                console.log('🛡️  SECURITY STEP DETECTED!');
                console.log('===========================');
                console.log(`📋 Type: ${securityStepDetected.type}`);
                console.log(`📝 Description: ${securityStepDetected.description}`);
                console.log('');
                console.log('👤 MANUAL INTERVENTION REQUIRED:');
                console.log('🔔 Please complete the security step in the browser');
                console.log('⏳ Script will automatically continue once home page is reached');
                console.log('');
                
                // Wait for manual completion with specific instructions
                const completionResult = await this.waitForManualCompletion(securityStepDetected.type);
                return completionResult;
                
            } else {
                console.log('✅ NO SECURITY STEP DETECTED!');
                console.log('=============================');
                console.log('🚀 Direct login successful - proceeding with automation');
                
                return {
                    success: true,
                    method: 'direct_login',
                    finalUrl: currentUrl,
                    securityStepRequired: false,
                    readyForAutomation: true,
                    sessionFresh: true,
                    sessionId: this.sessionId
                };
            }

        } catch (error) {
            console.error(`💥 Smart login error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                readyForAutomation: false,
                sessionFresh: true,
                sessionId: this.sessionId
            };
        }
    }

    async createFreshSession() {
        console.log('🧹 CREATING FRESH SESSION');
        console.log('=========================');
        
        // Close any existing session
        await this.cleanup();
        
        // Create unique user data directory for this session
        const userDataDir = `/tmp/playwright-${this.sessionId}`;
        
        // Launch fresh browser with persistent context
        this.browser = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            viewport: null,
            ignoreHTTPSErrors: true,
            // Fresh user agent
            userAgent: this.generateFreshUserAgent(),
            // Clear permissions
            permissions: [],
            locale: 'en-US',
            timezoneId: 'America/New_York',
            args: [
                '--start-maximized',
                '--no-default-browser-check',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--no-service-autorun',
                '--password-store=basic',
                '--use-mock-keychain'
            ],
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        // Get the first page from the persistent context
        const pages = this.browser.pages();
        if (pages.length > 0) {
            this.page = pages[0];
        } else {
            this.page = await this.browser.newPage();
        }
        
        // Clear any existing storage
        await this.browser.clearCookies();
        
        // Add fresh session init
        await this.page.addInitScript(() => {
            // Clear all storage
            if (window.localStorage) window.localStorage.clear();
            if (window.sessionStorage) window.sessionStorage.clear();
            
            // Hide automation
            delete navigator.__proto__.webdriver;
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', length: 1 },
                    { name: 'Chromium PDF Plugin', length: 1 }
                ]
            });
        });
        
        console.log('✅ Fresh session created');
        console.log(`🆔 Session ID: ${this.sessionId}`);
        console.log(`📂 User Data Dir: ${userDataDir}`);
    }

    generateFreshUserAgent() {
        const versions = ['120.0.0.0', '119.0.0.0', '121.0.0.0'];
        const version = versions[Math.floor(Math.random() * versions.length)];
        return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
    }

    async cleanup() {
        console.log('🧹 Cleaning up smart login session...');
        try {
            if (this.page) {
                await this.page.close();
                this.page = null;
            }
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            console.log('✅ Smart login cleanup completed');
        } catch (error) {
            console.error(`⚠️  Cleanup error: ${error.message}`);
        }
    }

    detectSecurityStep(url, title) {
        console.log('🔍 Analyzing current page state...');
        
        // Check for various security step indicators
        const indicators = [
            {
                condition: url.includes('multitabmessage'),
                type: 'concurrent_session',
                description: 'Multiple session conflict - already signed in elsewhere'
            },
            {
                condition: url.includes('step-up/verification'),
                type: 'email_verification',
                description: 'Email verification code required'
            },
            {
                condition: url.includes('step-up/qna'),
                type: 'security_questions',
                description: 'Security questions required'
            },
            {
                condition: url.includes('step-up'),
                type: 'step_up_auth',
                description: 'Step-up authentication required'
            },
            {
                condition: url.includes('verification'),
                type: 'verification_required',
                description: 'Additional verification required'
            },
            {
                condition: url.includes('signin') && !url.includes('runpayrollmain'),
                type: 'still_on_signin',
                description: 'Still on signin page - may need additional steps'
            },
            {
                condition: title.includes('Sign In') && !url.includes('runpayrollmain'),
                type: 'signin_page_title',
                description: 'Page title indicates still signing in'
            }
        ];

        for (const indicator of indicators) {
            if (indicator.condition) {
                console.log(`🔍 Security step detected: ${indicator.type}`);
                return {
                    detected: true,
                    type: indicator.type,
                    description: indicator.description
                };
            }
        }

        // Check for success indicators
        const successIndicators = [
            url.includes('runpayrollmain2'),
            title.includes('RUN powered by ADP'),
            !url.includes('signin')
        ];

        const successScore = successIndicators.filter(Boolean).length;
        console.log(`🏠 Success indicators: ${successScore}/3`);

        return {
            detected: successScore < 2,
            type: successScore >= 2 ? 'none' : 'unknown_state',
            description: successScore >= 2 ? 'Login appears successful' : 'Unknown state - may need verification'
        };
    }

    async waitForManualCompletion(securityStepType) {
        console.log('⏳ WAITING FOR MANUAL SECURITY COMPLETION');
        console.log('=========================================');
        
        // Provide specific instructions based on the type of security step
        if (securityStepType === 'concurrent_session') {
            console.log('🚨 CONCURRENT SESSION DETECTED!');
            console.log('================================');
            console.log('📋 The system detected you are already signed in elsewhere.');
            console.log('   This is the "multiple tab/window" error from ADP.');
            console.log('');
            console.log('🔧 REQUIRED ACTIONS:');
            console.log('   1. ❌ Close ALL other browser windows/tabs with ADP sessions');
            console.log('   2. ❌ Sign out from any other ADP sessions');
            console.log('   3. ✅ Refresh this page or try logging in again');
            console.log('   4. ✅ Complete any security steps if prompted');
            console.log('   5. ✅ Navigate to the home page');
            console.log('');
            console.log('💡 TIP: Our fresh session approach should prevent this, but');
            console.log('   ADP might still detect lingering sessions. This is normal.');
        } else {
            console.log('📋 General Instructions:');
            console.log('   1. Check your email for verification code (if applicable)');
            console.log('   2. Enter the code in the browser');
            console.log('   3. Complete any additional security steps');
            console.log('   4. Navigate to the home page');
            console.log('   5. Script will detect completion automatically');
        }
        
        console.log('');
        console.log('🎯 Monitoring for home page arrival...');
        console.log('');

        const startTime = Date.now();
        const maxWaitTime = 15 * 60 * 1000; // 15 minutes
        const checkInterval = 10000; // 10 seconds
        let attempts = 0;
        const maxAttempts = Math.floor(maxWaitTime / checkInterval);

        while (attempts < maxAttempts) {
            await this.page.waitForTimeout(checkInterval);
            attempts++;

            const url = this.page.url();
            const title = await this.page.title().catch(() => '');
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);

            console.log(`⏳ Check ${attempts}/${maxAttempts} (${minutes}:${seconds.toString().padStart(2, '0')}) - ${url.substring(0, 60)}...`);

            // Special handling for concurrent session - check if user resolved it
            if (securityStepType === 'concurrent_session') {
                // If still on multitabmessage, user hasn't resolved conflict yet
                if (url.includes('multitabmessage')) {
                    if (attempts % 6 === 0) { // Every minute
                        console.log('🚨 Still detecting concurrent session conflict...');
                        console.log('   Please close other ADP sessions and refresh this page.');
                    }
                    continue;
                } else {
                    console.log('✅ Concurrent session conflict appears resolved!');
                    // Continue with normal home page detection
                }
            }

            // Check if we've reached the home page
            const homePageReached = await this.checkIfHomePage(url, title);
            
            if (homePageReached.success) {
                console.log('');
                console.log('🎉 HOME PAGE REACHED!');
                console.log('=====================');
                console.log(`✅ Detection method: ${homePageReached.method}`);
                console.log(`🏠 Final URL: ${url}`);
                console.log(`📄 Final title: ${title}`);
                console.log(`⏱️  Total time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
                console.log('🚀 Ready for automation to continue!');
                
                return {
                    success: true,
                    method: 'manual_security_completion',
                    finalUrl: url,
                    securityStepRequired: true,
                    securityStepDuration: elapsed,
                    readyForAutomation: true
                };
            }

            // Progress update every minute
            if (attempts % 6 === 0) {
                console.log(`📊 Status update (${minutes}:${seconds.toString().padStart(2, '0')} elapsed):`);
                console.log(`   📄 Title: ${title}`);
                console.log(`   🔗 URL: ${url}`);
                console.log(`   💡 Still waiting for home page...`);
                console.log('');
            }
        }

        // Timeout reached
        console.log('');
        console.log('⏰ TIMEOUT REACHED');
        console.log('==================');
        console.log('🔍 Performing final status check...');
        
        const finalUrl = this.page.url();
        const finalTitle = await this.page.title().catch(() => '');
        const finalCheck = await this.checkIfHomePage(finalUrl, finalTitle);
        
        if (finalCheck.success) {
            console.log('✅ Home page reached despite timeout!');
            return {
                success: true,
                method: 'timeout_but_succeeded',
                finalUrl: finalUrl,
                securityStepRequired: true,
                readyForAutomation: true
            };
        }

        console.log('❌ Security step not completed within time limit');
        return {
            success: false,
            method: 'manual_completion_timeout',
            finalUrl: finalUrl,
            securityStepRequired: true,
            readyForAutomation: false,
            error: 'Manual security step completion timeout'
        };
    }

    async checkIfHomePage(url, title) {
        // Primary indicators (most reliable)
        if (url.includes('runpayrollmain2')) {
            return { success: true, method: 'url_runpayrollmain2' };
        }

        if (title.includes('RUN powered by ADP') && !url.includes('signin')) {
            return { success: true, method: 'title_run_powered_not_signin' };
        }

        // Make sure we're not still on signin page
        if (url.includes('signin') || url.includes('step-up') || url.includes('verification')) {
            // Definitely not home page yet
            return { success: false, method: 'still_on_signin_page' };
        }

        // Secondary indicators (only if not on signin)
        const secondaryIndicators = [
            title.includes('RUN'),
            url.includes('adp.com'),
            !title.includes('Sign In')
        ];

        const secondaryScore = secondaryIndicators.filter(Boolean).length;
        
        if (secondaryScore >= 3) {
            return { success: true, method: 'secondary_indicators' };
        }

        // Check for page elements (only if URL looks promising)
        if (!url.includes('signin') && !url.includes('step-up')) {
            try {
                const homeElements = await Promise.race([
                    this.page.waitForSelector('[data-test-id*="home"]', { timeout: 2000 }).then(() => 'home-element'),
                    this.page.waitForSelector('[data-test-id*="dashboard"]', { timeout: 2000 }).then(() => 'dashboard'),
                    this.page.waitForSelector('[data-test-id*="payroll"]', { timeout: 2000 }).then(() => 'payroll'),
                    this.page.waitForSelector('text=Good morning', { timeout: 2000 }).then(() => 'good-morning'),
                    new Promise(resolve => setTimeout(() => resolve('timeout'), 2000))
                ]);

                if (homeElements !== 'timeout') {
                    return { success: true, method: `element_${homeElements}` };
                }
            } catch (error) {
                // Element check failed
            }
        }

        return { success: false, method: 'not_detected' };
    }

    async fillShadowDOMInput(selector, value) {
        try {
            // First try direct fill
            await this.page.fill(selector, value);
            console.log(`✅ Filled ${selector} using direct method`);
        } catch (error) {
            console.log(`🔍 Direct fill failed for ${selector}, trying shadow DOM...`);
            
            // Try shadow DOM method
            try {
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
                console.log(`✅ Filled ${selector} using shadow DOM method`);
            } catch (shadowError) {
                // Try typing method as fallback
                console.log(`🔍 Shadow DOM failed for ${selector}, trying keyboard typing...`);
                await this.page.focus(selector);
                await this.page.keyboard.type(value);
                console.log(`✅ Filled ${selector} using keyboard typing`);
            }
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    // Get the page instance for further automation
    getPage() {
        return this.page;
    }

    // Get the browser instance
    getBrowser() {
        return this.browser;
    }
}

// Usage example and test
async function testSmartLogin() {
    const smartLogin = new SmartLoginHandler();
    
    try {
        console.log('🚀 Starting Smart Login Test');
        console.log('============================');
        
        const result = await smartLogin.performSmartLogin('Arogya@23477791/ADPadp01$');
        
        console.log('');
        console.log('📊 SMART LOGIN RESULTS');
        console.log('======================');
        console.log(`🎯 Success: ${result.success}`);
        console.log(`🔧 Method: ${result.method}`);
        console.log(`🛡️  Security Step Required: ${result.securityStepRequired}`);
        console.log(`🚀 Ready for Automation: ${result.readyForAutomation}`);
        
        if (result.securityStepDuration) {
            const minutes = Math.floor(result.securityStepDuration / 60000);
            const seconds = Math.floor((result.securityStepDuration % 60000) / 1000);
            console.log(`⏱️  Security Step Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
        
        if (result.finalUrl) {
            console.log(`🔗 Final URL: ${result.finalUrl}`);
        }
        
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        }
        
        if (result.readyForAutomation) {
            console.log('');
            console.log('🎉 SUCCESS! Ready to proceed with automation');
            console.log('✅ You can now run your testing utilities');
            console.log('✅ Browser session is authenticated and active');
            
            // Example: Continue with your testing here
            // const page = smartLogin.getPage();
            // await runYourTestingUtilities(page);
        }
        
        console.log('');
        console.log('🔍 Browser will stay open for 30 seconds for inspection...');
        await smartLogin.getPage().waitForTimeout(30000);
        
    } catch (error) {
        console.error(`💥 Test error: ${error.message}`);
    } finally {
        await smartLogin.close();
        console.log('🏁 Smart login test completed!');
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testSmartLogin().catch(console.error);
}

module.exports = { SmartLoginHandler };
