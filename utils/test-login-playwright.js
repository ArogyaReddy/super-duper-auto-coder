const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');

async function demonstratePlaywrightLogin() {
    console.log('🎯 DEMONSTRATION: PLAYWRIGHT LOGIN WITH FULL SCREEN');
    console.log('================================================');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500,
        args: [
            '--start-maximized',
            '--no-default-browser-check',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    });
    
    // Create context with full viewport
    const context = await browser.newContext({
        viewport: null, // This will use the full screen
        ignoreHTTPSErrors: true
    });
    
    const page = await context.newPage();
    const auth = new UniversalAuthenticationHandler();
    
    console.log('🌐 Testing with your specific IAT credentials...');
    
    try {
        // Test with user's specific credentials
        const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        const credentials = 'Arogya@24890183/Test0705';
        
        console.log(`🔗 Target URL: ${targetUrl}`);
        console.log(`👤 Using credentials: ${credentials.split('/')[0]}/****`);
        
        const result = await auth.performUniversalAuthentication(page, targetUrl, credentials);
        
        if (result.success) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log(`🎉 Final URL: ${result.finalUrl}`);
            console.log(`⏱️  Total time: ${result.totalTime}ms`);
            
            // Keep browser open for 10 seconds to see the result
            console.log('🔍 Keeping browser open for 10 seconds to observe...');
            await page.waitForTimeout(10000);
            
        } else {
            console.log('❌ LOGIN FAILED');
            console.log(`📝 Error: ${result.error}`);
        }
        
    } catch (error) {
        console.error('💥 Test execution failed:', error.message);
        
        // Take screenshot for debugging
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/playwright-login-error-${Date.now()}.png`,
            fullPage: true 
        });
        
    } finally {
        await browser.close();
        console.log('🏁 Playwright test completed');
    }
}

// Run the demonstration
demonstratePlaywrightLogin().catch(console.error);
