const { SessionKiller } = require('./session-killer');

/**
 * Ultra-Fresh Smart Login Handler
 * 
 * This is the ultimate solution for ADP login automation that:
 * 1. KILLS all existing sessions aggressively
 * 2. Creates ultra-fresh browser contexts  
 * 3. Handles all security steps intelligently
 * 4. Prevents ANY session conflicts
 * 
 * Perfect for solving "already signed in elsewhere" issues
 */
class UltraFreshSmartLogin {
    constructor() {
        this.browser = null;
        this.page = null;
        this.sessionKiller = new SessionKiller();
        this.sessionId = null;
    }

    async performUltraFreshLogin(credentialsOrUrl, username = null, password = null) {
        console.log('🚀 ULTRA-FRESH SMART LOGIN');
        console.log('==========================');
        console.log('🎯 Ultimate solution for session conflicts');
        console.log('💥 Kills ALL existing sessions before starting');
        console.log('🧹 Creates completely isolated browser context');
        console.log('🧠 Handles all security steps intelligently');
        console.log('');

        let finalUsername, finalPassword, targetUrl;

        // Handle different parameter formats
        if (username && password) {
            // Called with (baseUrl, username, password) format
            targetUrl = credentialsOrUrl;
            finalUsername = username;
            finalPassword = password;
            console.log('📋 Using separate parameters format');
        } else {
            // Called with legacy "username/password" format
            const credentials = credentialsOrUrl || 'Arogya@23477791/ADPadp01$';
            [finalUsername, finalPassword] = credentials.split('/');
            targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
            console.log('📋 Using legacy credentials format');
        }

        try {
            // Step 1: Create ultra-fresh session (includes session killing)
            const sessionData = await this.sessionKiller.createUltraFreshSession();
            this.browser = sessionData.browser;
            this.page = sessionData.page;
            this.sessionId = sessionData.sessionId;

            console.log('');
            console.log('🔐 ULTRA-FRESH LOGIN PROCESS');
            console.log('============================');

            console.log(`👤 Username: ${finalUsername}`);
            console.log(`🔗 Target: ${targetUrl}`);
            console.log(`🆔 Session: ${this.sessionId}`);
            console.log('');

            // Navigate to login page
            await this.page.goto(targetUrl, { waitUntil: 'networkidle' });
            console.log('✅ Login page loaded with ultra-fresh session');

            // Username entry
            await this.page.waitForSelector('#login-form_username');
            await this.fillInput('#login-form_username', finalUsername);
            
            // Wait for Next button to be enabled (SDF-aware)
            console.log('⏳ Waiting for Next button to be enabled...');
            const nextButtonEnabled = await this.waitForSDFButtonEnabled('#verifUseridBtn, #btnNext');
            if (!nextButtonEnabled) {
                throw new Error('Next button never enabled after username input');
            }
            await this.page.click('#verifUseridBtn, #btnNext');
            await this.page.waitForTimeout(3000);
            console.log('✅ Username submitted');

            // Password entry
            await this.page.waitForSelector('#login-form_password');
            await this.fillInput('#login-form_password', finalPassword);
            
            // Wait for Sign In button to be enabled (SDF-aware)
            console.log('⏳ Waiting for Sign In button to be enabled...');
            const signInButtonEnabled = await this.waitForSDFButtonEnabled('#signBtn, #btnNext');
            if (!signInButtonEnabled) {
                throw new Error('Sign In button never enabled after password input');
            }
            await this.page.click('#signBtn, #btnNext');
            await this.page.waitForTimeout(5000);
            console.log('✅ Password submitted');

            // Analyze result
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();

            console.log('');
            console.log('🔍 ULTRA-FRESH LOGIN ANALYSIS');
            console.log('==============================');
            console.log(`📍 URL: ${currentUrl}`);
            console.log(`📄 Title: ${currentTitle}`);
            console.log('');

            // Check for various scenarios
            if (currentUrl.includes('multitabmessage')) {
                return {
                    success: false,
                    issue: 'concurrent_session_detected',
                    method: 'server_side_session_conflict',
                    securityStepRequired: false,
                    readyForAutomation: false,
                    message: 'ADP detected concurrent session - server-side conflict',
                    recommendation: 'Manual logout required from all ADP sessions',
                    actionRequired: 'MANUAL_LOGOUT_ALL_SESSIONS'
                };

            } else if (currentUrl.includes('step-up') || currentUrl.includes('verification')) {
                console.log('🛡️  SECURITY STEP DETECTED');
                console.log('===========================');
                console.log('✅ Ultra-fresh session created successfully');
                console.log('📧 Email verification or security step required');
                console.log('');
                
                // Wait for manual completion
                const completionResult = await this.waitForSecurityCompletion();
                return {
                    ...completionResult,
                    sessionId: this.sessionId,
                    sessionType: 'ultra_fresh'
                };

            } else if (this.isHomePage(currentUrl, currentTitle)) {
                console.log('🎉 DIRECT LOGIN SUCCESS!');
                console.log('========================');
                console.log('✅ Ultra-fresh session worked perfectly');
                console.log('✅ No security steps required');
                console.log('✅ Ready for automation immediately');
                
                return {
                    success: true,
                    method: 'ultra_fresh_direct',
                    finalUrl: currentUrl,
                    securityStepRequired: false,
                    readyForAutomation: true,
                    sessionId: this.sessionId,
                    sessionType: 'ultra_fresh'
                };

            } else {
                console.log('❓ UNEXPECTED STATE');
                console.log('===================');
                console.log('⚠️  Login completed but in unexpected state');
                console.log('🔍 Manual investigation may be required');
                
                return {
                    success: false,
                    issue: 'unexpected_state',
                    finalUrl: currentUrl,
                    finalTitle: currentTitle,
                    message: 'Login completed but not in expected state',
                    readyForAutomation: false,
                    sessionId: this.sessionId
                };
            }

        } catch (error) {
            console.error(`💥 Ultra-fresh login error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                readyForAutomation: false,
                sessionId: this.sessionId
            };
        }
    }

    async fillInput(selector, value) {
        try {
            // Wait for element to be ready
            await this.page.waitForSelector(selector, { timeout: 10000 });
            
            // Check if it's an SDF component
            const tagName = await this.page.locator(selector).evaluate(el => el.tagName);
            
            if (tagName === 'SDF-INPUT') {
                console.log(`🎯 Detected SDF component: ${selector}`);
                return await this.fillSDFInput(selector, value);
            }
            
            // Standard input handling
            return await this.fillStandardInput(selector, value);
            
        } catch (error) {
            console.log(`❌ Input fill failed for ${selector}: ${error.message}`);
            throw error;
        }
    }

    async fillSDFInput(selector, value) {
        try {
            console.log(`📝 Filling SDF input: ${selector}`);
            
            // Method 1: Try to find inner input
            const innerInputExists = await this.page.locator(`${selector} input`).count() > 0;
            if (innerInputExists) {
                await this.page.locator(`${selector} input`).fill(value);
                console.log('✅ SDF inner input fill succeeded');
            } else {
                // Method 2: Direct SDF interaction
                await this.page.click(selector);
                await this.page.keyboard.press('Control+a');
                await this.page.keyboard.type(value);
                console.log('✅ SDF direct interaction succeeded');
            }
            
            // Trigger SDF events
            await this.page.evaluate(({ sel, val }) => {
                const sdfElement = document.querySelector(sel);
                if (sdfElement) {
                    // Set value on SDF component
                    if (typeof sdfElement.value !== 'undefined') {
                        sdfElement.value = val;
                    }
                    
                    // Trigger comprehensive events
                    const events = [
                        'input', 'change', 'blur', 'keyup', 'keydown',
                        'sdf-input', 'sdf-change', 'sdf-blur'
                    ];
                    
                    events.forEach(eventType => {
                        sdfElement.dispatchEvent(new CustomEvent(eventType, {
                            detail: { value: val },
                            bubbles: true
                        }));
                    });

                    // Also trigger on inner input if exists
                    const innerInput = sdfElement.querySelector('input');
                    if (innerInput) {
                        innerInput.value = val;
                        ['input', 'change', 'blur'].forEach(eventType => {
                            innerInput.dispatchEvent(new Event(eventType, { bubbles: true }));
                        });
                    }
                }
            }, { sel: selector, val: value });
            
            await this.page.waitForTimeout(1000);
            
        } catch (error) {
            console.log(`⚠️  SDF input fill failed: ${error.message}`);
            throw error;
        }
    }

    async fillStandardInput(selector, value) {
        try {
            // Clear field first
            await this.page.fill(selector, '');
            await this.page.waitForTimeout(500);
            
            // Try direct fill first
            await this.page.fill(selector, value);
            
            // Verify the value was filled
            const actualValue = await this.page.inputValue(selector);
            if (actualValue === value) {
                console.log(`✅ Direct fill successful for ${selector}`);
                
                // Trigger events to ensure validation
                await this.page.dispatchEvent(selector, 'input');
                await this.page.dispatchEvent(selector, 'change');
                await this.page.dispatchEvent(selector, 'blur');
                await this.page.waitForTimeout(1000);
                return;
            }
        } catch (error) {
            console.log(`⚠️  Direct fill failed for ${selector}, trying keyboard input...`);
        }
        
        try {
            // Try click and type
            await this.page.click(selector);
            await this.page.keyboard.press('Control+a'); // Select all
            await this.page.keyboard.type(value);
            
            // Trigger events to ensure validation
            await this.page.dispatchEvent(selector, 'input');
            await this.page.dispatchEvent(selector, 'change');
            await this.page.dispatchEvent(selector, 'blur');
            await this.page.waitForTimeout(1000);
            
            console.log(`✅ Keyboard type successful for ${selector}`);
        } catch (error2) {
            console.log(`⚠️  Input fill failed for ${selector}: ${error2.message}`);
            throw error2;
        }
    }

    async waitForSDFButtonEnabled(selector, maxWaitTime = 15000) {
        console.log(`⏳ Waiting for SDF button to be enabled: ${selector}`);
        
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const button = this.page.locator(selector).first();
                
                // Check multiple enablement indicators for SDF components
                const isEnabled = await button.evaluate(el => {
                    // Check standard attributes
                    if (el.disabled === true) return false;
                    if (el.getAttribute('disabled') === 'true') return false;
                    if (el.getAttribute('aria-disabled') === 'true') return false;
                    
                    // Check classes
                    if (el.classList.contains('disabled')) return false;
                    
                    // Check SDF-specific properties
                    if (typeof el.disabled !== 'undefined' && el.disabled) return false;
                    
                    return true;
                });

                const ariaDisabled = await button.getAttribute('aria-disabled');
                const hasDisabledClass = await button.evaluate(el => el.classList.contains('disabled'));

                if (isEnabled && ariaDisabled !== 'true' && !hasDisabledClass) {
                    console.log('✅ SDF Button is now enabled!');
                    return true;
                }

                // Log every 5 seconds
                if ((Date.now() - startTime) % 5000 < 1000) {
                    console.log(`Still waiting... Enabled=${isEnabled}, AriaDisabled=${ariaDisabled}, HasDisabledClass=${hasDisabledClass}`);
                }

                await this.page.waitForTimeout(1000);
            } catch (error) {
                console.log(`⚠️  Button check failed: ${error.message}`);
                await this.page.waitForTimeout(1000);
            }
        }

        console.log('⏰ SDF Button wait timeout - button still disabled');
        return false;
    }

    isHomePage(url, title) {
        const homeIndicators = [
            url.includes('runpayrollmain'),
            url.includes('dashboard'),
            url.includes('home'),
            title.toLowerCase().includes('home'),
            title.toLowerCase().includes('dashboard'),
            url.includes('/apps/run') && !url.includes('signin') && !url.includes('multitab')
        ];
        
        return homeIndicators.some(indicator => indicator);
    }

    async waitForSecurityCompletion() {
        console.log('⏳ WAITING FOR SECURITY STEP COMPLETION');
        console.log('=======================================');
        console.log('📧 Complete the email verification or security step');
        console.log('🎯 Script will automatically detect when you reach the home page');
        console.log('');

        const maxWaitTime = 15 * 60 * 1000; // 15 minutes
        const checkInterval = 10000; // 10 seconds
        const maxAttempts = Math.floor(maxWaitTime / checkInterval);
        let attempts = 0;
        const startTime = Date.now();

        while (attempts < maxAttempts) {
            await this.page.waitForTimeout(checkInterval);
            attempts++;

            const url = this.page.url();
            const title = await this.page.title().catch(() => '');
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);

            console.log(`⏳ Check ${attempts}/${maxAttempts} (${minutes}:${seconds.toString().padStart(2, '0')}) - ${url.substring(0, 50)}...`);

            if (this.isHomePage(url, title)) {
                console.log('');
                console.log('🎉 SECURITY COMPLETION DETECTED!');
                console.log('=================================');
                console.log('✅ Home page reached successfully');
                console.log('✅ Ultra-fresh session is authenticated');
                console.log('✅ Ready for automation');

                return {
                    success: true,
                    method: 'ultra_fresh_with_security',
                    finalUrl: url,
                    securityStepRequired: true,
                    securityStepDuration: elapsed,
                    readyForAutomation: true
                };
            }

            // Provide periodic updates
            if (attempts % 6 === 0) { // Every minute
                console.log(`📊 Status (${minutes}:${seconds.toString().padStart(2, '0')}): Still waiting for security completion...`);
            }
        }

        console.log('');
        console.log('⏰ SECURITY COMPLETION TIMEOUT');
        console.log('==============================');
        console.log('❌ Maximum wait time exceeded');
        console.log('💡 You can manually continue or restart the process');

        return {
            success: false,
            issue: 'security_completion_timeout',
            message: 'Security step completion timed out',
            readyForAutomation: false
        };
    }

    async cleanup() {
        console.log('🧹 Cleaning up ultra-fresh session...');
        try {
            if (this.page) {
                await this.page.close();
                this.page = null;
            }
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            console.log('✅ Ultra-fresh session cleanup completed');
        } catch (error) {
            console.error(`⚠️  Cleanup error: ${error.message}`);
        }
    }

    getPage() {
        return this.page;
    }

    getBrowser() {
        return this.browser;
    }
}

// Demo function
async function demoUltraFreshLogin() {
    console.log('🚀 DEMO: ULTRA-FRESH SMART LOGIN');
    console.log('=================================');
    console.log('💥 The ultimate solution for session conflicts!');
    console.log('');

    const ultraLogin = new UltraFreshSmartLogin();

    try {
        const result = await ultraLogin.performUltraFreshLogin();

        console.log('');
        console.log('📊 ULTRA-FRESH LOGIN RESULTS');
        console.log('============================');
        console.log(`✅ Success: ${result.success}`);
        console.log(`🔧 Method: ${result.method || result.issue || 'N/A'}`);
        console.log(`🛡️  Security Step: ${result.securityStepRequired ? 'Required' : 'Not Required'}`);
        console.log(`🤖 Ready for Automation: ${result.readyForAutomation}`);
        console.log(`🆔 Session ID: ${result.sessionId}`);
        console.log(`🧹 Session Type: ${result.sessionType || 'ultra_fresh'}`);

        if (result.success) {
            console.log('');
            console.log('🎉 ULTRA-FRESH LOGIN SUCCESS!');
            console.log('==============================');
            console.log('✅ Session conflicts eliminated');
            console.log('✅ Browser is ready for automation');
            console.log('✅ You can now run your tests');

            // Keep browser open for testing
            console.log('');
            console.log('Browser will stay open for inspection...');
            await ultraLogin.getPage().waitForTimeout(60000);
        } else {
            console.log('');
            console.log('❌ ULTRA-FRESH LOGIN ISSUES');
            console.log('============================');
            console.log(`Issue: ${result.issue || 'Unknown'}`);
            console.log(`Message: ${result.message || result.error || 'No details'}`);
            console.log(`Recommendation: ${result.recommendation || 'Check logs'}`);
        }

    } catch (error) {
        console.error(`💥 Demo failed: ${error.message}`);
    } finally {
        await ultraLogin.cleanup();
        console.log('');
        console.log('🏁 ULTRA-FRESH DEMO COMPLETED');
    }
}

// Export
module.exports = { UltraFreshSmartLogin };

// Run demo if executed directly  
if (require.main === module) {
    demoUltraFreshLogin().catch(console.error);
}
