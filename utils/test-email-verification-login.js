const { chromium } = require('playwright');

async function handleEmailVerificationLogin() {
    console.log('📧 EMAIL VERIFICATION LOGIN HANDLER');
    console.log('===================================');
    console.log('📍 Issue Identified: ADP sends a passcode to your email during automated login');
    console.log('📧 Email: a·········e@adp.com (your email address)');
    console.log('🎯 Mission: Complete login with email verification support');
    console.log('');
    console.log('⚠️  IMPORTANT: You will need to check your email for the passcode!');
    console.log('');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1500,
        args: [
            '--start-maximized',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--no-default-browser-check'
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
    });

    try {
        const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        
        console.log('🎯 PHASE 1: STANDARD LOGIN');
        console.log('==========================');
        
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Username
        console.log('👤 Entering username: Arogya@23477791');
        await page.waitForSelector('#login-form_username', { timeout: 15000 });
        await page.fill('#login-form_username', 'Arogya@23477791');
        await page.waitForTimeout(1000);
        
        await page.click('#verifUseridBtn, #btnNext');
        await page.waitForTimeout(3000);
        
        // Password
        console.log('🔑 Entering password...');
        await page.waitForSelector('#login-form_password', { timeout: 15000 });
        await page.fill('#login-form_password', 'ADPadp01$');
        await page.waitForTimeout(1000);
        
        await page.click('#signBtn, #btnNext');
        console.log('🚀 Login submitted, waiting for response...');
        await page.waitForTimeout(5000);
        
        const currentUrl = page.url();
        console.log(`🔗 Current URL: ${currentUrl}`);
        
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/email-verification-step-${Date.now()}.png`,
            fullPage: true 
        });
        
        console.log('🎯 PHASE 2: EMAIL VERIFICATION HANDLING');
        console.log('=======================================');
        
        if (currentUrl.includes('step-up/verification')) {
            console.log('✅ Email verification page detected!');
            console.log('📧 ADP has sent a passcode to your email address');
            console.log('');
            
            // Look for the passcode input field
            const passcodeSelectors = [
                'input[type="text"]',
                'input[placeholder*="code"]',
                'input[placeholder*="passcode"]',
                'input[name*="code"]',
                'input[id*="code"]',
                '#passcode',
                '#verification-code',
                '[data-test-id*="code"]'
            ];
            
            let passcodeInput = null;
            
            for (const selector of passcodeSelectors) {
                try {
                    const input = page.locator(selector).first();
                    if (await input.isVisible({ timeout: 2000 })) {
                        console.log(`✅ Found passcode input field: ${selector}`);
                        passcodeInput = input;
                        break;
                    }
                } catch (error) {
                    // Continue checking
                }
            }
            
            if (passcodeInput) {
                console.log('');
                console.log('📧 EMAIL VERIFICATION REQUIRED');
                console.log('==============================');
                console.log('🔔 MANUAL INTERVENTION NEEDED:');
                console.log('');
                console.log('1. 📧 Check your email inbox for a message from ADP');
                console.log('2. 🔍 Look for a subject like "Verification Code" or "Security Code"');
                console.log('3. 📋 Copy the verification code from the email');
                console.log('4. ⌨️  The browser will wait for you to enter the code manually');
                console.log('');
                console.log('⏰ The code is valid for 10 minutes');
                console.log('');
                console.log('🖱️  YOU CAN MANUALLY ENTER THE CODE IN THE BROWSER NOW');
                console.log('');
                
                // Wait for user to manually enter the code
                console.log('⏳ Waiting for you to enter the verification code...');
                console.log('   (Script will continue automatically after code is submitted)');
                
                // Monitor for URL change or form submission
                let codeEntered = false;
                let attempts = 0;
                const maxAttempts = 60; // Wait up to 10 minutes
                
                while (!codeEntered && attempts < maxAttempts) {
                    await page.waitForTimeout(10000); // Check every 10 seconds
                    attempts++;
                    
                    const newUrl = page.url();
                    console.log(`⏳ Waiting... (${attempts}/${maxAttempts}) - Current URL: ${newUrl}`);
                    
                    // Check if URL changed (successful verification)
                    if (newUrl !== currentUrl) {
                        console.log('✅ URL changed - verification appears successful!');
                        codeEntered = true;
                        break;
                    }
                    
                    // Check if we reached the main application
                    if (newUrl.includes('runpayrollmain2')) {
                        console.log('🎉 Successfully reached main application!');
                        codeEntered = true;
                        break;
                    }
                    
                    // Take periodic screenshots
                    if (attempts % 6 === 0) { // Every minute
                        await page.screenshot({ 
                            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/email-verification-waiting-${Date.now()}.png`,
                            fullPage: true 
                        });
                    }
                }
                
                if (codeEntered) {
                    console.log('✅ Email verification completed!');
                } else {
                    console.log('⏰ Timeout waiting for verification code entry');
                    console.log('💡 You can still complete the verification manually');
                }
                
            } else {
                console.log('❌ Could not find passcode input field');
                console.log('📄 Page content for analysis:');
                const pageText = await page.textContent('body').catch(() => '');
                console.log(pageText.substring(0, 1000));
            }
            
        } else if (currentUrl.includes('runpayrollmain2')) {
            console.log('🎉 LOGIN SUCCESSFUL - No email verification required!');
            
        } else {
            console.log('⚠️  Unexpected page after login');
            const errorText = await page.locator('text=/error|incorrect|invalid/i').textContent().catch(() => null);
            if (errorText) {
                console.log(`❌ Error: ${errorText}`);
            }
        }
        
        console.log('🎯 PHASE 3: FINAL STATUS CHECK');
        console.log('==============================');
        
        // Final status check
        await page.waitForTimeout(5000);
        const finalUrl = page.url();
        const finalTitle = await page.title();
        
        console.log(`🔗 Final URL: ${finalUrl}`);
        console.log(`📄 Final Title: ${finalTitle}`);
        
        const loginSuccessful = finalUrl.includes('runpayrollmain2') || 
                               (!finalUrl.includes('signin') && !finalUrl.includes('step-up'));
        
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/email-verification-final-${Date.now()}.png`,
            fullPage: true 
        });
        
        console.log('');
        console.log('📊 FINAL RESULTS');
        console.log('================');
        console.log(`🎯 Login Success: ${loginSuccessful ? 'YES' : 'NO'}`);
        console.log(`📧 Email Verification: ${currentUrl.includes('step-up') ? 'REQUIRED' : 'NOT REQUIRED'}`);
        console.log(`🌐 Final Status: ${loginSuccessful ? 'Successfully logged in' : 'Login incomplete'}`);
        
        if (loginSuccessful) {
            console.log('🎉 COMPLETE SUCCESS! You are now logged into the RUN application.');
            
            // Test some basic functionality
            console.log('');
            console.log('🔍 Testing application functionality...');
            
            try {
                // Look for main navigation or dashboard elements
                const homeElements = await page.locator('[data-test-id*="home"], .dashboard, .navigation').count();
                console.log(`📊 Found ${homeElements} main application elements`);
                
                // Check page title for success
                if (finalTitle.includes('RUN')) {
                    console.log('✅ Page title confirms RUN application access');
                }
                
            } catch (error) {
                console.log('⚠️  Could not test application functionality');
            }
        }
        
        console.log('');
        console.log('🔍 Browser will stay open for 30 seconds for final inspection...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error(`💥 Email verification login error: ${error.message}`);
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/email-verification-error-${Date.now()}.png`,
            fullPage: true 
        });
    }

    await browser.close();
    
    console.log('');
    console.log('🎯 EXPLANATION: WHY MANUAL WORKS BUT AUTOMATED DOESN\'T');
    console.log('======================================================');
    console.log('');
    console.log('📋 Root Cause Analysis:');
    console.log('');
    console.log('1. 🤖 AUTOMATION DETECTION:');
    console.log('   - ADP\'s security system detects automated browsers');
    console.log('   - Triggers additional security measures for non-human behavior');
    console.log('');
    console.log('2. 📧 EMAIL VERIFICATION STEP:');
    console.log('   - Manual login: Often bypassed due to trusted browser fingerprint');
    console.log('   - Automated login: Triggers email verification as security measure');
    console.log('');
    console.log('3. 🔐 STEP-UP AUTHENTICATION:');
    console.log('   - When automation is detected, ADP requires additional verification');
    console.log('   - Email passcode is sent to confirm user identity');
    console.log('');
    console.log('4. 🎭 BROWSER FINGERPRINTING:');
    console.log('   - Your manual browser has a trusted fingerprint');
    console.log('   - Automated browsers have different characteristics');
    console.log('');
    console.log('💡 SOLUTIONS:');
    console.log('=============');
    console.log('');
    console.log('✅ IMMEDIATE (This Script):');
    console.log('   - Handles the email verification step');
    console.log('   - Allows manual code entry during automation');
    console.log('   - Completes the full login flow');
    console.log('');
    console.log('✅ LONG-TERM:');
    console.log('   - Session persistence to avoid repeated verifications');
    console.log('   - Better stealth techniques to reduce detection');
    console.log('   - API-based authentication where possible');
    console.log('   - Coordinate with ADP for testing accounts with reduced security');
    console.log('');
    console.log('🏁 Email verification login analysis completed!');
}

// Run the email verification login handler
handleEmailVerificationLogin().catch(console.error);
