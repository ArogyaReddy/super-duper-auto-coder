const { chromium } = require('playwright');
const { SessionKiller } = require('./session-killer');

class SDFLoginHandler {
    constructor() {
        this.sessionKiller = new SessionKiller();
        this.browser = null;
        this.page = null;
    }

    async performSDFLogin() {
        console.log('🎯 SDF LOGIN HANDLER');
        console.log('====================');
        console.log('🔧 Specialized handler for Stencil Design Framework components');
        console.log('');

        try {
            // Create fresh session
            await this.sessionKiller.killAllSessions();
            const sessionId = `sdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const userDataDir = `/tmp/playwright-${sessionId}`;

            this.browser = await chromium.launchPersistentContext(userDataDir, {
                headless: false,
                viewport: { width: 1920, height: 1080 },
                args: [
                    '--start-maximized',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            });

            this.page = this.browser.pages()[0];

            // Navigate to login page
            const url = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
            await this.page.goto(url, { waitUntil: 'networkidle' });
            console.log('✅ Login page loaded');

            // Wait for SDF components to load
            await this.page.waitForSelector('#login-form_username');
            await this.page.waitForTimeout(2000); // Extra wait for SDF hydration
            console.log('✅ SDF components loaded');

            // Fill username using SDF-specific method
            await this.fillSDFInput('#login-form_username', 'Arogya@23477791');

            // Wait for Next button with SDF-aware approach
            const nextButtonEnabled = await this.waitForSDFButtonEnabled('#verifUseridBtn');
            if (nextButtonEnabled) {
                await this.clickSDFButton('#verifUseridBtn');
                console.log('✅ Username step completed');

                // Wait for password field
                await this.page.waitForSelector('#login-form_password');
                await this.page.waitForTimeout(1000);

                // Fill password
                await this.fillSDFInput('#login-form_password', 'ADPadp01$');

                // Wait for Sign In button
                const signInButtonEnabled = await this.waitForSDFButtonEnabled('#signBtn');
                if (signInButtonEnabled) {
                    await this.clickSDFButton('#signBtn');
                    console.log('✅ Password step completed');

                    // Analyze result
                    await this.page.waitForTimeout(5000);
                    const result = await this.analyzeLoginResult();
                    console.log('📊 LOGIN RESULT:', result);
                    
                    return result;
                } else {
                    console.log('❌ Sign In button never enabled');
                }
            } else {
                console.log('❌ Next button never enabled');
            }

            console.log('');
            console.log('🔍 SDF LOGIN SESSION COMPLETE');
            console.log('Browser will stay open for manual inspection...');
            await this.page.waitForTimeout(60000);

        } catch (error) {
            console.error(`💥 SDF login error: ${error.message}`);
        } finally {
            await this.cleanup();
        }
    }

    async fillSDFInput(selector, value) {
        console.log(`📝 FILLING SDF INPUT: ${selector}`);
        
        try {
            const sdfInput = this.page.locator(selector);
            
            // Method 1: Try to find the actual input inside the SDF component
            const innerInput = await this.page.locator(`${selector} input`).count();
            if (innerInput > 0) {
                console.log('🎯 Found inner input element');
                await this.page.locator(`${selector} input`).fill(value);
                await this.triggerSDFEvents(selector, value);
                console.log('✅ Inner input fill succeeded');
                return;
            }

            // Method 2: Direct interaction with SDF component
            await sdfInput.click();
            await this.page.keyboard.press('Control+a');
            await this.page.keyboard.type(value);
            await this.triggerSDFEvents(selector, value);
            console.log('✅ SDF component interaction succeeded');

        } catch (error) {
            console.log(`❌ SDF input fill failed: ${error.message}`);
            throw error;
        }
    }

    async triggerSDFEvents(selector, value) {
        try {
            await this.page.evaluate((sel, val) => {
                const sdfElement = document.querySelector(sel);
                if (sdfElement) {
                    // Set value directly on SDF component
                    if (typeof sdfElement.value !== 'undefined') {
                        sdfElement.value = val;
                    }
                    
                    // Trigger SDF-specific events
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

                    // Also trigger on any inner input
                    const innerInput = sdfElement.querySelector('input');
                    if (innerInput) {
                        innerInput.value = val;
                        ['input', 'change', 'blur'].forEach(eventType => {
                            innerInput.dispatchEvent(new Event(eventType, { bubbles: true }));
                        });
                    }
                }
            }, selector, value);
            
            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.log(`⚠️  SDF event triggering failed: ${error.message}`);
        }
    }

    async waitForSDFButtonEnabled(selector, maxWaitTime = 15000) {
        console.log(`⏳ WAITING FOR SDF BUTTON: ${selector}`);
        
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const button = this.page.locator(selector);
                
                // Check multiple enablement indicators
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

                console.log(`Check: Enabled=${isEnabled}, AriaDisabled=${ariaDisabled}, HasDisabledClass=${hasDisabledClass}`);

                if (isEnabled && ariaDisabled !== 'true' && !hasDisabledClass) {
                    console.log('✅ SDF Button is now enabled!');
                    return true;
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

    async clickSDFButton(selector) {
        console.log(`🖱️  CLICKING SDF BUTTON: ${selector}`);
        
        try {
            const button = this.page.locator(selector);
            
            // Try normal click first
            await button.click();
            console.log('✅ Normal SDF button click succeeded');
            await this.page.waitForTimeout(2000);
            
        } catch (error) {
            console.log(`⚠️  Normal click failed, trying force click: ${error.message}`);
            
            try {
                await button.click({ force: true });
                console.log('✅ Force SDF button click succeeded');
                await this.page.waitForTimeout(2000);
            } catch (error2) {
                console.log(`❌ All SDF button click methods failed: ${error2.message}`);
                throw error2;
            }
        }
    }

    async analyzeLoginResult() {
        try {
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log('');
            console.log('🔍 SDF LOGIN ANALYSIS');
            console.log('======================');
            console.log(`📍 URL: ${currentUrl}`);
            console.log(`📄 Title: ${currentTitle}`);
            
            // Check for various scenarios
            if (currentUrl.includes('multitabmessage')) {
                return {
                    success: false,
                    issue: 'concurrent_session',
                    message: 'Multiple session detected',
                    recommendation: 'Close other ADP sessions'
                };
            }
            
            if (currentUrl.includes('dashboard') || currentUrl.includes('runpayrollmain') || currentUrl.includes('/apps/run')) {
                return {
                    success: true,
                    method: 'direct_login',
                    securityStepRequired: false,
                    readyForAutomation: true
                };
            }
            
            if (currentUrl.includes('verify') || currentTitle.toLowerCase().includes('verify')) {
                return {
                    success: true,
                    method: 'security_step_required',
                    securityStepRequired: true,
                    readyForAutomation: false,
                    message: 'Manual email verification required'
                };
            }
            
            return {
                success: false,
                issue: 'unknown_state',
                message: `Unexpected page: ${currentTitle}`,
                url: currentUrl
            };
            
        } catch (error) {
            return {
                success: false,
                issue: 'analysis_error',
                message: error.message
            };
        }
    }

    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
            }
        } catch (error) {
            console.log(`⚠️  Cleanup error: ${error.message}`);
        }
    }
}

// Test the SDF login handler
async function testSDFLogin() {
    const sdfLogin = new SDFLoginHandler();
    const result = await sdfLogin.performSDFLogin();
    return result;
}

if (require.main === module) {
    testSDFLogin().catch(console.error);
}

module.exports = SDFLoginHandler;
