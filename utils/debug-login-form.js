const { chromium } = require('playwright');
const { SessionKiller } = require('./session-killer');

class LoginFormDebugger {
    constructor() {
        this.sessionKiller = new SessionKiller();
        this.browser = null;
        this.page = null;
    }

    async debugLoginForm() {
        console.log('🐛 LOGIN FORM DEBUGGER');
        console.log('======================');
        console.log('🔍 Analyzing ADP login form behavior');
        console.log('');

        try {
            // Create fresh session
            await this.sessionKiller.killAllSessions();
            const sessionId = `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

            // Wait for form to be ready
            await this.page.waitForSelector('#login-form_username');
            console.log('✅ Username field found');

            // Check initial button state
            await this.checkButtonState();

            // Fill username
            console.log('');
            console.log('📝 FILLING USERNAME...');
            await this.page.click('#login-form_username');
            await this.page.keyboard.type('Arogya@23477791');
            
            // Check button state after username
            await this.page.waitForTimeout(1000);
            await this.checkButtonState();

            // Trigger various events
            console.log('');
            console.log('🔄 TRIGGERING VALIDATION EVENTS...');
            await this.page.dispatchEvent('#login-form_username', 'input');
            await this.page.dispatchEvent('#login-form_username', 'change');
            await this.page.dispatchEvent('#login-form_username', 'blur');
            await this.page.waitForTimeout(2000);
            await this.checkButtonState();

            // Check for validation messages
            await this.checkValidationMessages();

            // Try to understand what enables the button
            await this.analyzeButtonEnablement();

            console.log('');
            console.log('🔍 DEBUG SESSION COMPLETE');
            console.log('Browser will stay open for manual inspection...');
            await this.page.waitForTimeout(60000);

        } catch (error) {
            console.error(`🐛 Debug error: ${error.message}`);
        } finally {
            await this.cleanup();
        }
    }

    async checkButtonState() {
        try {
            console.log('');
            console.log('🔘 BUTTON STATE ANALYSIS');
            console.log('========================');

            // Check if button exists
            const buttonExists = await this.page.locator('#verifUseridBtn, #btnNext').count();
            console.log(`Button exists: ${buttonExists > 0}`);

            if (buttonExists > 0) {
                // Get button attributes
                const button = this.page.locator('#verifUseridBtn, #btnNext').first();
                const disabled = await button.getAttribute('disabled');
                const ariaDisabled = await button.getAttribute('aria-disabled');
                const classes = await button.getAttribute('class');
                
                console.log(`Disabled attribute: ${disabled}`);
                console.log(`Aria-disabled: ${ariaDisabled}`);
                console.log(`Classes: ${classes}`);

                // Check if button is actually clickable
                const isVisible = await button.isVisible();
                const isEnabled = await button.isEnabled();
                
                console.log(`Visible: ${isVisible}`);
                console.log(`Enabled: ${isEnabled}`);
            }
        } catch (error) {
            console.log(`⚠️  Button state check error: ${error.message}`);
        }
    }

    async checkValidationMessages() {
        try {
            console.log('');
            console.log('✅ VALIDATION MESSAGES');
            console.log('======================');

            // Look for common validation message selectors
            const validationSelectors = [
                '.error-message',
                '.validation-error',
                '.field-error',
                '[role="alert"]',
                '.sdf-error',
                '.form-error'
            ];

            for (const selector of validationSelectors) {
                const messages = await this.page.locator(selector).count();
                if (messages > 0) {
                    const text = await this.page.locator(selector).first().textContent();
                    console.log(`Found message (${selector}): ${text}`);
                }
            }
        } catch (error) {
            console.log(`⚠️  Validation check error: ${error.message}`);
        }
    }

    async analyzeButtonEnablement() {
        try {
            console.log('');
            console.log('🧠 BUTTON ENABLEMENT ANALYSIS');
            console.log('==============================');

            // Check form validity
            const formValid = await this.page.evaluate(() => {
                const form = document.querySelector('form');
                return form ? form.checkValidity() : 'No form found';
            });
            console.log(`Form validity: ${formValid}`);

            // Check username field value and validity
            const usernameValue = await this.page.inputValue('#login-form_username');
            const usernameValid = await this.page.evaluate(() => {
                const field = document.querySelector('#login-form_username');
                return field ? field.checkValidity() : 'Field not found';
            });
            
            console.log(`Username value: "${usernameValue}"`);
            console.log(`Username valid: ${usernameValid}`);

            // Look for any JavaScript errors
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log(`🐞 JS Error: ${msg.text()}`);
                }
            });

        } catch (error) {
            console.log(`⚠️  Enablement analysis error: ${error.message}`);
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

// Run the debugger
async function runDebugger() {
    const formDebugger = new LoginFormDebugger();
    await formDebugger.debugLoginForm();
}

if (require.main === module) {
    runDebugger().catch(console.error);
}

module.exports = LoginFormDebugger;
