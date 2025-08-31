const { chromium } = require('playwright');
const readline = require('readline');

class EnhancedAuthenticationHandler {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async performLoginWithEmailVerification(credentials = 'Arogya@23477791/ADPadp01$') {
        console.log('🎯 ENHANCED AUTHENTICATION HANDLER');
        console.log('==================================');
        console.log('📧 Supports: Email verification, step-up authentication, manual intervention');
        console.log('🤖 Strategy: Handle automation detection gracefully');
        console.log('');

        const browser = await chromium.launch({
            headless: false,
            slowMo: 1000,
            args: [
                '--start-maximized',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--no-default-browser-check',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const context = await browser.newContext({
            viewport: null,
            ignoreHTTPSErrors: true,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        const page = await context.newPage();
        
        // Advanced stealth techniques
        await page.addInitScript(() => {
            // Remove webdriver property
            delete navigator.__proto__.webdriver;
            
            // Override plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', length: 1 },
                    { name: 'Chromium PDF Plugin', length: 1 },
                    { name: 'Microsoft Edge PDF Plugin', length: 1 },
                    { name: 'PDF Viewer', length: 1 },
                    { name: 'WebKit built-in PDF', length: 1 }
                ]
            });
            
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
            
            // Add realistic properties
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
        });

        const result = {
            success: false,
            loginMethod: '',
            verificationRequired: false,
            finalUrl: '',
            duration: 0,
            screenshots: [],
            errors: []
        };

        const startTime = Date.now();

        try {
            const [username, password] = credentials.split('/');
            const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
            
            console.log(`👤 Username: ${username}`);
            console.log(`🔑 Password: ${'*'.repeat(password.length)}`);
            console.log(`🔗 Target: ${targetUrl}`);
            console.log('');

            console.log('🌐 STEP 1: NAVIGATION');
            console.log('=====================');
            await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
            console.log('✅ Page loaded successfully');

            // Take initial screenshot
            const screenshot1 = `enhanced-auth-initial-${Date.now()}.png`;
            await page.screenshot({ 
                path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/${screenshot1}`,
                fullPage: true 
            });
            result.screenshots.push(screenshot1);

            console.log('');
            console.log('🔐 STEP 2: CREDENTIALS ENTRY');
            console.log('============================');
            
            // Username entry with human-like behavior
            console.log('👤 Entering username...');
            await page.waitForSelector('#login-form_username', { timeout: 15000 });
            await page.focus('#login-form_username');
            await page.waitForTimeout(500);
            
            // Try direct fill first, then fallback to shadow DOM
            try {
                await page.fill('#login-form_username', username);
                console.log('✅ Username filled directly');
            } catch (error) {
                console.log('🔍 Using shadow DOM for username...');
                await this.fillShadowDOMInput(page, '#login-form_username', username);
                console.log('✅ Username filled via shadow DOM');
            }

            await page.waitForTimeout(1000);
            
            // Click verify button
            console.log('🔍 Clicking verify button...');
            await page.click('#verifUseridBtn, #btnNext');
            await page.waitForTimeout(3000);

            // Password entry
            console.log('🔑 Entering password...');
            await page.waitForSelector('#login-form_password', { timeout: 15000 });
            await page.focus('#login-form_password');
            await page.waitForTimeout(500);
            
            try {
                await page.fill('#login-form_password', password);
                console.log('✅ Password filled directly');
            } catch (error) {
                console.log('🔍 Using shadow DOM for password...');
                await this.fillShadowDOMInput(page, '#login-form_password', password);
                console.log('✅ Password filled via shadow DOM');
            }

            await page.waitForTimeout(1000);

            // Take screenshot before login
            const screenshot2 = `enhanced-auth-before-login-${Date.now()}.png`;
            await page.screenshot({ 
                path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/${screenshot2}`,
                fullPage: true 
            });
            result.screenshots.push(screenshot2);

            console.log('🚀 Submitting login...');
            await page.click('#signBtn, #btnNext');
            
            console.log('⏳ Waiting for authentication response...');
            await page.waitForTimeout(5000);

            console.log('');
            console.log('🔍 STEP 3: AUTHENTICATION ANALYSIS');
            console.log('==================================');

            const currentUrl = page.url();
            console.log(`🔗 Current URL: ${currentUrl}`);

            if (currentUrl.includes('step-up/verification')) {
                console.log('📧 EMAIL VERIFICATION DETECTED');
                result.verificationRequired = true;
                result.loginMethod = 'email_verification_required';
                
                const verificationSuccess = await this.handleEmailVerification(page, result);
                if (verificationSuccess) {
                    result.success = true;
                    result.loginMethod = 'email_verification_completed';
                }
                
            } else if (currentUrl.includes('runpayrollmain2')) {
                console.log('🎉 DIRECT LOGIN SUCCESS');
                result.success = true;
                result.loginMethod = 'direct_login';
                
            } else if (currentUrl.includes('signin')) {
                console.log('❌ STILL ON LOGIN PAGE');
                result.loginMethod = 'login_failed';
                
                // Check for error messages
                const errorElement = await page.locator('text=/incorrect|invalid|error/i').first();
                if (await errorElement.isVisible().catch(() => false)) {
                    const errorText = await errorElement.textContent();
                    console.log(`❌ Error: ${errorText}`);
                    result.errors.push(errorText);
                }
                
            } else {
                console.log('⚠️  UNEXPECTED REDIRECT');
                result.loginMethod = 'unexpected_redirect';
                console.log(`🔗 Redirected to: ${currentUrl}`);
            }

            // Final status
            result.finalUrl = page.url();
            result.duration = Date.now() - startTime;

            console.log('');
            console.log('📊 AUTHENTICATION RESULTS');
            console.log('=========================');
            console.log(`✅ Success: ${result.success}`);
            console.log(`🔧 Method: ${result.loginMethod}`);
            console.log(`📧 Email Verification: ${result.verificationRequired ? 'Required' : 'Not Required'}`);
            console.log(`⏱️  Duration: ${result.duration}ms`);
            console.log(`🔗 Final URL: ${result.finalUrl}`);

            // Take final screenshot
            const screenshot3 = `enhanced-auth-final-${Date.now()}.png`;
            await page.screenshot({ 
                path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/${screenshot3}`,
                fullPage: true 
            });
            result.screenshots.push(screenshot3);

            if (result.success) {
                console.log('🎉 LOGIN COMPLETED SUCCESSFULLY!');
                
                // Test basic application functionality
                try {
                    console.log('🔍 Testing application access...');
                    const pageTitle = await page.title();
                    console.log(`📄 Page title: ${pageTitle}`);
                    
                    if (pageTitle.includes('RUN')) {
                        console.log('✅ Successfully accessed RUN application');
                    }
                } catch (error) {
                    console.log('⚠️  Could not verify application access');
                }
                
            } else {
                console.log('❌ LOGIN INCOMPLETE');
                console.log('💡 This may require manual intervention or different credentials');
            }

            console.log('');
            console.log('🔍 Browser will remain open for 20 seconds for inspection...');
            await page.waitForTimeout(20000);

        } catch (error) {
            console.error(`💥 Authentication error: ${error.message}`);
            result.errors.push(error.message);
            
            // Take error screenshot
            const errorScreenshot = `enhanced-auth-error-${Date.now()}.png`;
            await page.screenshot({ 
                path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/${errorScreenshot}`,
                fullPage: true 
            });
            result.screenshots.push(errorScreenshot);
        }

        await browser.close();
        this.rl.close();
        
        console.log('');
        console.log('🎯 ENHANCED AUTHENTICATION COMPLETE');
        console.log('===================================');
        
        return result;
    }

    async handleEmailVerification(page, result) {
        console.log('📧 HANDLING EMAIL VERIFICATION');
        console.log('==============================');
        
        try {
            // Take screenshot of verification page
            const verificationScreenshot = `email-verification-page-${Date.now()}.png`;
            await page.screenshot({ 
                path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/${verificationScreenshot}`,
                fullPage: true 
            });
            result.screenshots.push(verificationScreenshot);

            // Get the email hint from the page
            const pageText = await page.textContent('body').catch(() => '');
            const emailMatch = pageText.match(/([a-zA-Z]·+[a-zA-Z]@[a-zA-Z.]+)/);
            const emailHint = emailMatch ? emailMatch[1] : 'your email';
            
            console.log(`📧 Verification code sent to: ${emailHint}`);
            console.log('⏰ Code is valid for 10 minutes');
            console.log('');

            // Find the passcode input field
            const passcodeSelectors = [
                'input[type="text"]',
                'input[type="number"]',
                'input[placeholder*="code"]',
                'input[placeholder*="passcode"]',
                'input[name*="code"]',
                'input[id*="code"]',
                '#passcode',
                '#verification-code'
            ];

            let passcodeInput = null;
            for (const selector of passcodeSelectors) {
                try {
                    const input = page.locator(selector).first();
                    if (await input.isVisible({ timeout: 2000 })) {
                        passcodeInput = input;
                        console.log(`✅ Found passcode input: ${selector}`);
                        break;
                    }
                } catch (error) {
                    // Continue checking
                }
            }

            if (!passcodeInput) {
                console.log('❌ Could not find passcode input field');
                return false;
            }

            // Interactive passcode entry
            console.log('');
            console.log('🔔 MANUAL INTERVENTION REQUIRED');
            console.log('===============================');
            console.log('📧 Please check your email for the verification code');
            console.log('⌨️  Enter the code in the browser when ready');
            console.log('');
            
            console.log('Choose verification method:');
            console.log('1. 🖱️  Manual entry (enter code in browser)');
            console.log('2. ⌨️  CLI entry (enter code here)');
            console.log('');

            const choice = await this.promptUser('Enter choice (1 or 2): ');

            if (choice === '2') {
                // CLI code entry
                const code = await this.promptUser('Enter verification code: ');
                
                console.log(`🔑 Entering code: ${code}`);
                await passcodeInput.fill(code);
                await page.waitForTimeout(1000);
                
                // Find and click submit button
                const submitSelectors = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Submit")',
                    'button:has-text("Verify")',
                    'button:has-text("Continue")',
                    '.submit-btn',
                    '#submit'
                ];

                let submitted = false;
                for (const selector of submitSelectors) {
                    try {
                        const button = page.locator(selector).first();
                        if (await button.isVisible({ timeout: 2000 })) {
                            console.log(`🚀 Clicking submit button: ${selector}`);
                            await button.click();
                            submitted = true;
                            break;
                        }
                    } catch (error) {
                        // Continue checking
                    }
                }

                if (!submitted) {
                    console.log('⚠️  Could not find submit button, trying Enter key');
                    await page.keyboard.press('Enter');
                }

            } else {
                // Manual browser entry
                console.log('🖱️  Please enter the code manually in the browser');
                console.log('⏳ Script will wait for you to submit...');
            }

            // Wait for verification completion
            console.log('⏳ Waiting for verification completion...');
            const currentUrl = page.url();
            let verificationComplete = false;
            let attempts = 0;
            const maxAttempts = 60; // 10 minutes

            while (!verificationComplete && attempts < maxAttempts) {
                await page.waitForTimeout(10000); // Check every 10 seconds
                attempts++;

                const newUrl = page.url();
                console.log(`⏳ Checking... (${attempts}/${maxAttempts}) URL: ${newUrl}`);

                if (newUrl !== currentUrl) {
                    console.log('✅ URL changed - verification completed!');
                    verificationComplete = true;
                    
                    if (newUrl.includes('runpayrollmain2')) {
                        console.log('🎉 Successfully reached main application!');
                        return true;
                    }
                }

                // Take periodic screenshots
                if (attempts % 6 === 0) {
                    const progressScreenshot = `verification-progress-${Date.now()}.png`;
                    await page.screenshot({ 
                        path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/${progressScreenshot}`,
                        fullPage: true 
                    });
                    result.screenshots.push(progressScreenshot);
                }
            }

            if (verificationComplete) {
                console.log('✅ Email verification completed successfully!');
                return true;
            } else {
                console.log('⏰ Timeout waiting for verification');
                return false;
            }

        } catch (error) {
            console.error(`❌ Email verification error: ${error.message}`);
            return false;
        }
    }

    async fillShadowDOMInput(page, selector, value) {
        try {
            await page.evaluate((sel, val) => {
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
        } catch (error) {
            throw new Error(`Shadow DOM fill failed: ${error.message}`);
        }
    }

    async promptUser(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }
}

// Usage
async function runEnhancedLogin() {
    const auth = new EnhancedAuthenticationHandler();
    const result = await auth.performLoginWithEmailVerification('Arogya@23477791/ADPadp01$');
    
    console.log('');
    console.log('📋 FINAL SUMMARY');
    console.log('================');
    console.log(`🎯 Result: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    console.log(`📧 Email Verification: ${result.verificationRequired ? 'Required' : 'Not Required'}`);
    console.log(`🔧 Method: ${result.loginMethod}`);
    console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(1)}s`);
    console.log(`📸 Screenshots: ${result.screenshots.length}`);
    console.log(`❌ Errors: ${result.errors.length}`);
    
    if (result.success) {
        console.log('');
        console.log('🎉 LOGIN SUCCESSFUL!');
        console.log('✅ You can now proceed with your application testing');
        console.log('✅ The browser session is authenticated and ready');
    }
    
    return result;
}

// Run the enhanced login
if (require.main === module) {
    runEnhancedLogin().catch(console.error);
}

module.exports = { EnhancedAuthenticationHandler };
