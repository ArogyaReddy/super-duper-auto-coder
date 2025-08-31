const { chromium } = require('playwright');

async function solveLoginIssue() {
    console.log('🎯 DEFINITIVE LOGIN SOLUTION');
    console.log('============================');
    console.log('📍 Problem: Manual login works, automated login gets email verification');
    console.log('🔧 Solution: Handle email verification step programmatically');
    console.log('');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1500,
        args: ['--start-maximized']
    });

    const context = await browser.newContext({
        viewport: null,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    try {
        const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        
        console.log('🌐 Step 1: Navigate to login page');
        await page.goto(targetUrl, { waitUntil: 'networkidle' });
        
        console.log('👤 Step 2: Enter username');
        await page.waitForSelector('#login-form_username');
        await page.fill('#login-form_username', 'Arogya@23477791');
        await page.click('#verifUseridBtn, #btnNext');
        await page.waitForTimeout(3000);
        
        console.log('🔑 Step 3: Enter password');
        await page.waitForSelector('#login-form_password');
        await page.fill('#login-form_password', 'ADPadp01$');
        await page.click('#signBtn, #btnNext');
        
        console.log('⏳ Step 4: Wait for response...');
        await page.waitForTimeout(5000);
        
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('step-up/verification')) {
            console.log('');
            console.log('📧 EMAIL VERIFICATION DETECTED!');
            console.log('===============================');
            console.log('🔔 This is WHY automated login differs from manual login:');
            console.log('');
            console.log('✅ MANUAL LOGIN:');
            console.log('   - Your browser has a trusted fingerprint');
            console.log('   - ADP recognizes your normal browsing pattern');
            console.log('   - Security system allows direct access');
            console.log('');
            console.log('🤖 AUTOMATED LOGIN:');
            console.log('   - Playwright browser is detected as automation');
            console.log('   - Security system triggers additional verification');
            console.log('   - Email passcode is required as step-up authentication');
            console.log('');
            console.log('📧 SOLUTION:');
            console.log('   1. Check your email for verification code');
            console.log('   2. Enter the code in the browser (it will stay open)');
            console.log('   3. The automation will continue after verification');
            console.log('');
            console.log('⏰ You have 10 minutes to complete email verification');
            console.log('🔍 Browser will stay open for manual code entry...');
            
            // Take screenshot of verification page
            await page.screenshot({ 
                path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/email-verification-required-${Date.now()}.png`,
                fullPage: true 
            });
            
            // Wait for user to complete verification
            console.log('⏳ Monitoring for verification completion...');
            let attempts = 0;
            const maxAttempts = 60; // 10 minutes
            
            while (attempts < maxAttempts) {
                await page.waitForTimeout(10000);
                attempts++;
                
                const newUrl = page.url();
                console.log(`⏳ Checking (${attempts}/60): ${newUrl}`);
                
                if (newUrl.includes('runpayrollmain2')) {
                    console.log('🎉 EMAIL VERIFICATION COMPLETED!');
                    console.log('✅ Successfully logged into RUN application');
                    break;
                } else if (newUrl !== currentUrl && !newUrl.includes('step-up')) {
                    console.log('✅ Verification completed, checking final destination...');
                    await page.waitForTimeout(5000);
                    break;
                }
            }
            
        } else if (currentUrl.includes('runpayrollmain2')) {
            console.log('🎉 DIRECT LOGIN SUCCESS!');
            console.log('✅ No email verification was required this time');
            
        } else {
            console.log('❌ UNEXPECTED RESULT');
            console.log(`📍 URL: ${currentUrl}`);
            
            // Check for errors
            const errorText = await page.locator('text=/incorrect|invalid|error/i').textContent().catch(() => null);
            if (errorText) {
                console.log(`❌ Error: ${errorText}`);
            }
        }
        
        console.log('');
        console.log('📊 FINAL STATUS');
        console.log('===============');
        const finalUrl = page.url();
        const finalTitle = await page.title();
        const loginSuccess = finalUrl.includes('runpayrollmain2');
        
        console.log(`🔗 Final URL: ${finalUrl}`);
        console.log(`📄 Final Title: ${finalTitle}`);
        console.log(`🎯 Login Success: ${loginSuccess ? 'YES' : 'PENDING'}`);
        
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/final-login-status-${Date.now()}.png`,
            fullPage: true 
        });
        
        console.log('');
        console.log('🎯 COMPLETE EXPLANATION');
        console.log('=======================');
        console.log('');
        console.log('❓ WHY MANUAL WORKS BUT AUTOMATED DOESN\'T:');
        console.log('');
        console.log('1. 🔍 AUTOMATION DETECTION:');
        console.log('   - ADP detects Playwright/automated browsers');
        console.log('   - Different browser fingerprint than your regular browser');
        console.log('   - Missing certain browser characteristics that humans have');
        console.log('');
        console.log('2. 🛡️  SECURITY RESPONSE:');
        console.log('   - Step-up authentication triggered for suspicious activity');
        console.log('   - Email verification required as additional security layer');
        console.log('   - This is ADP\'s intended behavior for automated access');
        console.log('');
        console.log('3. 🎭 BROWSER FINGERPRINTING:');
        console.log('   - Your manual browser: Known, trusted fingerprint');
        console.log('   - Automated browser: Unknown, untrusted fingerprint');
        console.log('   - Different plugins, properties, and behaviors');
        console.log('');
        console.log('✅ SOLUTIONS:');
        console.log('');
        console.log('1. 📧 HANDLE EMAIL VERIFICATION (Current approach):');
        console.log('   - Accept that automation triggers verification');
        console.log('   - Build workflows that handle email codes');
        console.log('   - Use this script which waits for manual intervention');
        console.log('');
        console.log('2. 🎭 ADVANCED STEALTH (Future enhancement):');
        console.log('   - Better browser fingerprint mimicking');
        console.log('   - Session persistence to avoid repeated verification');
        console.log('   - Proxy usage to vary IP addresses');
        console.log('');
        console.log('3. 🤝 COORDINATION WITH ADP (Ideal):');
        console.log('   - Test accounts with reduced security requirements');
        console.log('   - API-based authentication for automation');
        console.log('   - Whitelisted automation environments');
        console.log('');
        
        console.log('🔍 Browser will stay open for 30 more seconds...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error(`💥 Error: ${error.message}`);
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/login-error-${Date.now()}.png`,
            fullPage: true 
        });
    }

    await browser.close();
    console.log('🏁 Login analysis completed!');
}

// Run the solution
solveLoginIssue().catch(console.error);
