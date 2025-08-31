const { chromium } = require('playwright');

async function simplifiedLoginDiagnostics() {
    console.log('🔍 SIMPLIFIED LOGIN DIAGNOSTICS');
    console.log('===============================');
    console.log('📍 URL: https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c');
    console.log('👤 Username: Arogya@23477791');
    console.log('🔑 Password: ADPadp01$');
    console.log('');

    // Strategy 1: Try with minimal automation detection
    console.log('🎭 STRATEGY 1: STEALTH MODE');
    console.log('===========================');
    
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
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    
    // Hide automation indicators
    await page.addInitScript(() => {
        // Remove webdriver property
        delete navigator.__proto__.webdriver;
        
        // Override plugins
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5]
        });
        
        // Override languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en']
        });
    });

    try {
        const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        
        console.log('🌐 Navigating to login page...');
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        
        console.log('📸 Taking initial screenshot...');
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stealth-initial-${Date.now()}.png`,
            fullPage: true 
        });
        
        // Check what's on the page
        const pageTitle = await page.title();
        const currentUrl = page.url();
        console.log(`📄 Page title: ${pageTitle}`);
        console.log(`🔗 Current URL: ${currentUrl}`);
        
        // Check for automation detection
        const automationCheck = await page.evaluate(() => {
            return {
                webdriver: navigator.webdriver,
                chrome: !!window.chrome,
                plugins: navigator.plugins.length
            };
        });
        
        console.log('🤖 Automation detection results:');
        console.log(`   webdriver: ${automationCheck.webdriver}`);
        console.log(`   chrome: ${automationCheck.chrome}`);
        console.log(`   plugins: ${automationCheck.plugins}`);
        
        // Wait for username field
        console.log('⏳ Waiting for username field...');
        await page.waitForSelector('#login-form_username', { timeout: 15000 });
        
        // Method 1: Human-like typing
        console.log('👤 Method 1: Human-like typing for username...');
        await page.focus('#login-form_username');
        await page.waitForTimeout(500);
        
        // Type slowly like a human
        for (const char of 'Arogya@23477791') {
            await page.keyboard.type(char);
            await page.waitForTimeout(50 + Math.random() * 100); // Random delay between keystrokes
        }
        
        console.log('📸 Username typed, taking screenshot...');
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stealth-username-${Date.now()}.png`,
            fullPage: true 
        });
        
        // Click verify button
        console.log('🔍 Clicking verify button...');
        await page.click('#verifUseridBtn, #btnNext');
        await page.waitForTimeout(3000);
        
        console.log('📸 After verify click, taking screenshot...');
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stealth-after-verify-${Date.now()}.png`,
            fullPage: true 
        });
        
        // Wait for password field
        console.log('⏳ Waiting for password field...');
        await page.waitForSelector('#login-form_password', { timeout: 15000 });
        
        // Type password slowly
        console.log('🔑 Method 1: Human-like typing for password...');
        await page.focus('#login-form_password');
        await page.waitForTimeout(500);
        
        for (const char of 'ADPadp01$') {
            await page.keyboard.type(char);
            await page.waitForTimeout(50 + Math.random() * 100);
        }
        
        console.log('📸 Password typed, taking screenshot...');
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stealth-password-${Date.now()}.png`,
            fullPage: true 
        });
        
        // Click sign in
        console.log('🚀 Clicking sign in button...');
        await page.click('#signBtn, #btnNext');
        
        // Wait for result
        console.log('⏳ Waiting for login result...');
        await page.waitForTimeout(10000);
        
        console.log('📸 After sign in, taking screenshot...');
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stealth-result-${Date.now()}.png`,
            fullPage: true 
        });
        
        // Check final result
        const finalUrl = page.url();
        const finalTitle = await page.title();
        
        console.log('📊 FINAL RESULTS:');
        console.log(`🔗 Final URL: ${finalUrl}`);
        console.log(`📄 Final title: ${finalTitle}`);
        
        // Check for error message
        const errorMessage = await page.locator('text=/incorrect|invalid|error/i').textContent().catch(() => null);
        if (errorMessage) {
            console.log(`❌ Error message found: ${errorMessage}`);
        } else {
            console.log('✅ No error message found');
        }
        
        // Check if login was successful
        const loginSuccess = !finalUrl.includes('signin') && !finalUrl.includes('login');
        console.log(`🎯 Login Success: ${loginSuccess ? 'YES' : 'NO'}`);
        
        if (loginSuccess) {
            console.log('🎉 LOGIN SUCCESSFUL WITH STEALTH MODE!');
        } else {
            console.log('❌ Login failed even with stealth mode');
        }
        
        console.log('');
        console.log('🔍 Browser will stay open for 20 seconds for inspection...');
        await page.waitForTimeout(20000);
        
    } catch (error) {
        console.error(`💥 Stealth test error: ${error.message}`);
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/stealth-error-${Date.now()}.png`,
            fullPage: true 
        });
    }

    await browser.close();
    
    console.log('');
    console.log('💡 ANALYSIS SUMMARY:');
    console.log('====================');
    console.log('The difference between manual and automated login could be:');
    console.log('');
    console.log('1. 🤖 AUTOMATION DETECTION:');
    console.log('   - Website detects Playwright/automation tools');
    console.log('   - Solution: Use stealth techniques');
    console.log('');
    console.log('2. ⏱️ TIMING ISSUES:');
    console.log('   - Automation is too fast compared to human behavior');
    console.log('   - Solution: Add realistic delays');
    console.log('');
    console.log('3. 🎭 BROWSER FINGERPRINTING:');
    console.log('   - Automated browsers have different fingerprints');
    console.log('   - Solution: Mimic real browser behavior');
    console.log('');
    console.log('4. 🔐 SESSION/SECURITY:');
    console.log('   - Different session handling between manual/automated');
    console.log('   - Solution: Better session management');
    console.log('');
    console.log('5. 🌐 NETWORK/IP DETECTION:');
    console.log('   - Server-side detection of automated traffic');
    console.log('   - Solution: Use proxies or different networks');
    console.log('');
    
    console.log('🏁 Simplified diagnostics completed!');
}

// Run the simplified diagnostic test
simplifiedLoginDiagnostics().catch(console.error);
