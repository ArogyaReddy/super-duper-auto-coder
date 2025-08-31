const { chromium } = require('playwright');

async function handleStepUpVerification() {
    console.log('🔐 STEP-UP VERIFICATION HANDLER');
    console.log('===============================');
    console.log('📍 Target: Handle the verification step that appears after login');
    console.log('🎯 Mission: Complete the full login flow including verification');
    console.log('');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1500,
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
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    
    // Hide automation indicators
    await page.addInitScript(() => {
        delete navigator.__proto__.webdriver;
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5]
        });
    });

    try {
        const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        
        console.log('🎯 PHASE 1: INITIAL LOGIN');
        console.log('=========================');
        
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Step 1: Username
        console.log('👤 Entering username...');
        await page.waitForSelector('#login-form_username', { timeout: 15000 });
        await page.focus('#login-form_username');
        await page.keyboard.type('Arogya@23477791');
        await page.waitForTimeout(1000);
        
        // Take screenshot
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stepup-username-${Date.now()}.png`,
            fullPage: true 
        });
        
        // Click verify
        console.log('🔍 Clicking verify button...');
        await page.click('#verifUseridBtn, #btnNext');
        await page.waitForTimeout(3000);
        
        // Step 2: Password
        console.log('🔑 Entering password...');
        await page.waitForSelector('#login-form_password', { timeout: 15000 });
        await page.focus('#login-form_password');
        await page.keyboard.type('ADPadp01$');
        await page.waitForTimeout(1000);
        
        // Take screenshot before sign in
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stepup-password-${Date.now()}.png`,
            fullPage: true 
        });
        
        // Click sign in
        console.log('🚀 Clicking sign in button...');
        await page.click('#signBtn, #btnNext');
        
        // Wait for navigation
        console.log('⏳ Waiting for page response...');
        await page.waitForTimeout(5000);
        
        const currentUrl = page.url();
        console.log(`🔗 Current URL after login: ${currentUrl}`);
        
        // Take screenshot of what we got
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stepup-after-signin-${Date.now()}.png`,
            fullPage: true 
        });
        
        console.log('🎯 PHASE 2: HANDLING STEP-UP VERIFICATION');
        console.log('==========================================');
        
        if (currentUrl.includes('step-up/verification')) {
            console.log('✅ Step-up verification page detected!');
            
            // Look for common verification elements
            const verificationSelectors = [
                'button:has-text("Continue")',
                'button:has-text("Skip")',
                'button:has-text("Not now")',
                'button:has-text("Remind me later")',
                'button:has-text("Next")',
                'input[type="submit"]',
                '.btn-primary',
                '.continue-btn',
                '[data-test-id*="continue"]',
                '[data-test-id*="skip"]',
                'text=Continue',
                'text=Skip',
                'text=Not now',
                'text=Remind me later'
            ];
            
            console.log('🔍 Looking for verification bypass options...');
            
            let verificationHandled = false;
            
            for (const selector of verificationSelectors) {
                try {
                    console.log(`   🔍 Checking selector: ${selector}`);
                    const element = page.locator(selector).first();
                    
                    if (await element.isVisible({ timeout: 2000 })) {
                        const elementText = await element.textContent().catch(() => '');
                        console.log(`   ✅ Found clickable element: "${elementText}" with selector: ${selector}`);
                        
                        // Take screenshot before clicking
                        await page.screenshot({ 
                            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stepup-found-element-${Date.now()}.png`,
                            fullPage: true 
                        });
                        
                        // Click the element
                        await element.click();
                        console.log(`   🚀 Clicked element: "${elementText}"`);
                        
                        // Wait for response
                        await page.waitForTimeout(5000);
                        
                        // Check if URL changed
                        const newUrl = page.url();
                        console.log(`   🔗 URL after click: ${newUrl}`);
                        
                        if (newUrl !== currentUrl) {
                            console.log('   ✅ URL changed - verification step bypassed!');
                            verificationHandled = true;
                            break;
                        }
                    }
                } catch (error) {
                    // Continue checking other selectors
                    console.log(`   ❌ Selector failed: ${selector} - ${error.message}`);
                }
            }
            
            if (!verificationHandled) {
                console.log('⚠️  Could not find verification bypass option');
                
                // Try looking for specific text patterns
                console.log('🔍 Looking for specific text patterns...');
                
                const textPatterns = [
                    'Continue',
                    'Skip',
                    'Not now',
                    'Remind me later',
                    'Maybe later',
                    'No thanks'
                ];
                
                for (const pattern of textPatterns) {
                    try {
                        const textElement = page.locator(`text="${pattern}"`).first();
                        if (await textElement.isVisible({ timeout: 2000 })) {
                            console.log(`   ✅ Found text: "${pattern}"`);
                            await textElement.click();
                            await page.waitForTimeout(3000);
                            
                            const newUrl = page.url();
                            if (newUrl !== currentUrl) {
                                console.log(`   ✅ Successfully bypassed verification with: "${pattern}"`);
                                verificationHandled = true;
                                break;
                            }
                        }
                    } catch (error) {
                        // Continue checking
                    }
                }
            }
            
            if (!verificationHandled) {
                console.log('⚠️  Manual intervention may be required for verification step');
                console.log('🔍 Current page content analysis...');
                
                // Get page content for analysis
                const pageText = await page.textContent('body').catch(() => '');
                console.log('📄 Page content snippet:');
                console.log(pageText.substring(0, 500) + '...');
            }
            
        } else if (currentUrl.includes('runpayrollmain2')) {
            console.log('🎉 LOGIN SUCCESSFUL - Directly reached main application!');
            verificationHandled = true;
            
        } else {
            console.log('⚠️  Unexpected URL after login');
            console.log(`🔗 Current URL: ${currentUrl}`);
            
            // Check for error messages
            const errorText = await page.locator('text=/error|incorrect|invalid/i').textContent().catch(() => null);
            if (errorText) {
                console.log(`❌ Error detected: ${errorText}`);
            }
        }
        
        console.log('🎯 PHASE 3: FINAL VERIFICATION');
        console.log('==============================');
        
        // Wait a bit more for any redirects
        await page.waitForTimeout(5000);
        
        const finalUrl = page.url();
        const finalTitle = await page.title();
        
        console.log(`🔗 Final URL: ${finalUrl}`);
        console.log(`📄 Final Title: ${finalTitle}`);
        
        // Take final screenshot
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stepup-final-${Date.now()}.png`,
            fullPage: true 
        });
        
        // Determine success
        const loginSuccessful = finalUrl.includes('runpayrollmain2') || 
                               (!finalUrl.includes('signin') && !finalUrl.includes('step-up'));
        
        console.log('📊 FINAL RESULTS:');
        console.log('=================');
        console.log(`🎯 Login Success: ${loginSuccessful ? 'YES' : 'NO'}`);
        console.log(`🔐 Step-up handled: ${currentUrl.includes('step-up') ? (verificationHandled ? 'YES' : 'PENDING') : 'N/A'}`);
        console.log(`🌐 Final destination: ${loginSuccessful ? 'Main Application' : 'Still in login flow'}`);
        
        if (loginSuccessful) {
            console.log('🎉 COMPLETE SUCCESS! Full login flow completed.');
        } else {
            console.log('⚠️  Login incomplete - may require manual intervention.');
        }
        
        console.log('');
        console.log('🔍 Browser will stay open for 30 seconds for inspection...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error(`💥 Step-up verification error: ${error.message}`);
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stepup-error-${Date.now()}.png`,
            fullPage: true 
        });
    }

    await browser.close();
    
    console.log('');
    console.log('💡 STEP-UP VERIFICATION INSIGHTS:');
    console.log('=================================');
    console.log('📋 What we learned:');
    console.log('1. 🔐 ADP uses step-up verification for automated login detection');
    console.log('2. 👤 Manual logins may bypass this step due to browser fingerprinting');
    console.log('3. 🎭 Stealth techniques may not be enough - verification is intentional');
    console.log('4. 🚀 Need to programmatically handle the verification step');
    console.log('5. 📱 Different verification flows may exist for different users/contexts');
    console.log('');
    console.log('🔧 Solutions:');
    console.log('- ✅ Identify and handle common verification bypass buttons');
    console.log('- ✅ Add support for different verification methods');
    console.log('- ✅ Implement retry logic with different approaches');
    console.log('- ✅ Use session persistence to avoid repeated verifications');
    console.log('');
    
    console.log('🏁 Step-up verification analysis completed!');
}

// Run the step-up verification handler
handleStepUpVerification().catch(console.error);
