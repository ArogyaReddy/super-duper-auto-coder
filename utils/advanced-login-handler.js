const { chromium } = require('playwright');
const { SessionKiller } = require('./session-killer');

class AdvancedLoginHandler {
    constructor() {
        this.sessionKiller = new SessionKiller();
        this.browser = null;
        this.page = null;
    }

    async performAdvancedLogin() {
        console.log('🚀 ADVANCED LOGIN HANDLER');
        console.log('=========================');
        console.log('🎯 Using sophisticated element detection and interaction');
        console.log('');

        try {
            // Create fresh session
            await this.sessionKiller.killAllSessions();
            const sessionId = `advanced-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

            // Wait for and analyze the username field
            await this.page.waitForSelector('#login-form_username');
            const usernameFieldInfo = await this.analyzeField('#login-form_username');
            console.log('📝 Username field analysis:', usernameFieldInfo);

            // Advanced username filling
            await this.advancedFillField('#login-form_username', 'Arogya@23477791');

            // Wait and watch for button state changes
            await this.watchButtonStateChanges();

            // If button is still disabled, try alternative approaches
            const isButtonEnabled = await this.page.locator('#verifUseridBtn, #btnNext').isEnabled();
            if (!isButtonEnabled) {
                console.log('🔧 Button still disabled, trying alternative approaches...');
                await this.tryAlternativeEnablementMethods();
            }

            // Final attempt to proceed
            await this.attemptButtonClick();

            console.log('');
            console.log('🔍 ADVANCED LOGIN SESSION COMPLETE');
            console.log('Browser will stay open for manual inspection...');
            await this.page.waitForTimeout(60000);

        } catch (error) {
            console.error(`💥 Advanced login error: ${error.message}`);
        } finally {
            await this.cleanup();
        }
    }

    async analyzeField(selector) {
        try {
            const element = this.page.locator(selector);
            const tagName = await element.evaluate(el => el.tagName);
            const type = await element.getAttribute('type');
            const role = await element.getAttribute('role');
            const contentEditable = await element.getAttribute('contenteditable');
            const value = await element.evaluate(el => el.value || el.textContent || el.innerText);
            
            return {
                tagName,
                type,
                role,
                contentEditable,
                value: value?.trim()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async advancedFillField(selector, value) {
        console.log(`🔧 ADVANCED FIELD FILLING: ${selector}`);
        
        try {
            const element = this.page.locator(selector);
            
            // Method 1: Standard fill
            try {
                await element.fill(value);
                console.log('✅ Method 1: Standard fill succeeded');
                await this.triggerValidationEvents(selector);
                return;
            } catch (e) {
                console.log('⚠️  Method 1: Standard fill failed');
            }

            // Method 2: Click and type
            try {
                await element.click();
                await this.page.keyboard.press('Control+a');
                await this.page.keyboard.type(value);
                console.log('✅ Method 2: Click and type succeeded');
                await this.triggerValidationEvents(selector);
                return;
            } catch (e) {
                console.log('⚠️  Method 2: Click and type failed');
            }

            // Method 3: JavaScript setValue
            try {
                await element.evaluate((el, val) => {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.value = val;
                    } else {
                        el.textContent = val;
                        el.innerText = val;
                    }
                    
                    // Trigger events
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('blur', { bubbles: true }));
                }, value);
                console.log('✅ Method 3: JavaScript setValue succeeded');
                return;
            } catch (e) {
                console.log('⚠️  Method 3: JavaScript setValue failed');
            }

            // Method 4: Focus and simulate user typing
            try {
                await element.focus();
                await this.page.keyboard.press('Control+a');
                for (const char of value) {
                    await this.page.keyboard.type(char);
                    await this.page.waitForTimeout(100); // Slower typing
                }
                console.log('✅ Method 4: Simulated user typing succeeded');
                await this.triggerValidationEvents(selector);
                return;
            } catch (e) {
                console.log('⚠️  Method 4: Simulated user typing failed');
            }

        } catch (error) {
            console.log(`❌ All filling methods failed: ${error.message}`);
        }
    }

    async triggerValidationEvents(selector) {
        try {
            const element = this.page.locator(selector);
            await element.evaluate(el => {
                // Trigger comprehensive validation events
                const events = ['input', 'change', 'blur', 'keyup', 'keydown', 'focus'];
                events.forEach(eventType => {
                    el.dispatchEvent(new Event(eventType, { bubbles: true }));
                });
                
                // Also trigger form validation
                const form = el.closest('form');
                if (form) {
                    form.checkValidity();
                }
            });
            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.log(`⚠️  Event triggering failed: ${error.message}`);
        }
    }

    async watchButtonStateChanges() {
        console.log('👀 WATCHING BUTTON STATE CHANGES...');
        
        for (let i = 0; i < 10; i++) {
            await this.page.waitForTimeout(1000);
            
            try {
                const button = this.page.locator('#verifUseridBtn, #btnNext').first();
                const isEnabled = await button.isEnabled();
                const ariaDisabled = await button.getAttribute('aria-disabled');
                const classes = await button.getAttribute('class');
                const hasDisabledClass = classes?.includes('disabled');
                
                console.log(`Check ${i + 1}: Enabled=${isEnabled}, AriaDisabled=${ariaDisabled}, HasDisabledClass=${hasDisabledClass}`);
                
                if (isEnabled && ariaDisabled !== 'true' && !hasDisabledClass) {
                    console.log('✅ Button is now enabled!');
                    return true;
                }
            } catch (error) {
                console.log(`⚠️  Button check ${i + 1} failed: ${error.message}`);
            }
        }
        
        console.log('⏰ Button state monitoring completed - button still disabled');
        return false;
    }

    async tryAlternativeEnablementMethods() {
        console.log('🔧 TRYING ALTERNATIVE ENABLEMENT METHODS...');
        
        // Method 1: Try re-filling the field
        console.log('Method 1: Re-filling username field...');
        await this.advancedFillField('#login-form_username', 'Arogya@23477791');
        await this.page.waitForTimeout(2000);
        
        // Method 2: Try focusing other elements and coming back
        console.log('Method 2: Focus cycling...');
        try {
            await this.page.click('body');
            await this.page.waitForTimeout(500);
            await this.page.click('#login-form_username');
            await this.page.waitForTimeout(1000);
        } catch (e) {}
        
        // Method 3: Check if there are other required fields
        console.log('Method 3: Checking for hidden required fields...');
        const allInputs = await this.page.locator('input').count();
        console.log(`Found ${allInputs} input fields on page`);
        
        // Method 4: Try triggering form submission events
        console.log('Method 4: Triggering form events...');
        try {
            await this.page.evaluate(() => {
                const form = document.querySelector('form');
                if (form) {
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            });
        } catch (e) {}
    }

    async attemptButtonClick() {
        console.log('🖱️  ATTEMPTING BUTTON CLICK...');
        
        try {
            const button = this.page.locator('#verifUseridBtn, #btnNext').first();
            
            // Force click even if disabled
            await button.click({ force: true });
            console.log('✅ Force click attempted');
            await this.page.waitForTimeout(3000);
            
            // Check if we progressed
            const currentUrl = this.page.url();
            console.log(`Current URL after click: ${currentUrl}`);
            
        } catch (error) {
            console.log(`⚠️  Button click failed: ${error.message}`);
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

// Run the advanced login handler
async function runAdvancedLogin() {
    const advancedLogin = new AdvancedLoginHandler();
    await advancedLogin.performAdvancedLogin();
}

if (require.main === module) {
    runAdvancedLogin().catch(console.error);
}

module.exports = AdvancedLoginHandler;
