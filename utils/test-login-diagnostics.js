const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');

async function diagnoseLoginIssues() {
    console.log('🔍 LOGIN DIAGNOSTICS - MANUAL vs AUTOMATED');
    console.log('==========================================');
    console.log('📍 URL: https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c');
    console.log('👤 Username: Arogya@23477791');
    console.log('🔑 Password: ADPadp01$');
    console.log('🎯 Mission: Diagnose why manual works but automated might fail');
    console.log('');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 2000, // Even slower for analysis
        args: [
            '--start-maximized',
            '--no-default-browser-check',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-blink-features=AutomationControlled', // Hide automation
            '--disable-dev-shm-usage',
            '--no-sandbox'
        ]
    });

    const context = await browser.newContext({
        viewport: null,
        ignoreHTTPSErrors: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // Add extra headers to appear more human-like
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
        }
    });

    const page = await context.newPage();
    
    // Hide webdriver property
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
    });

    const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
    const credentials = 'Arogya@23477791/ADPadp01$';
    
    const diagnostics = {
        navigationDiagnostics: {},
        formDiagnostics: {},
        errorDiagnostics: {},
        timingDiagnostics: {},
        browserDiagnostics: {}
    };

    try {
        console.log('🌐 STEP 1: NAVIGATION DIAGNOSTICS');
        console.log('=================================');
        
        const navStart = Date.now();
        console.log(`🔗 Navigating to: ${targetUrl}`);
        
        await page.goto(targetUrl, { 
            waitUntil: 'networkidle', 
            timeout: 30000 
        });
        
        const navEnd = Date.now();
        diagnostics.navigationDiagnostics = {
            duration: navEnd - navStart,
            finalUrl: page.url(),
            title: await page.title()
        };
        
        console.log(`✅ Navigation completed in ${navEnd - navStart}ms`);
        console.log(`📄 Page title: ${await page.title()}`);
        console.log(`🔗 Final URL: ${page.url()}`);
        
        // Take initial screenshot
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/diagnostics-initial-${Date.now()}.png`,
            fullPage: true 
        });

        console.log('');
        console.log('🔍 STEP 2: FORM ELEMENT DIAGNOSTICS');
        console.log('===================================');
        
        // Analyze the form elements
        const usernameSelector = '#login-form_username';
        const passwordSelector = '#login-form_password';
        const verifyButtonSelector = '#verifUseridBtn, #btnNext';
        const signInButtonSelector = '#signBtn, #btnNext';
        
        // Check if elements exist
        const usernameExists = await page.locator(usernameSelector).count() > 0;
        const passwordVisible = await page.locator(passwordSelector).isVisible().catch(() => false);
        const verifyButtonVisible = await page.locator(verifyButtonSelector).isVisible().catch(() => false);
        
        console.log(`👤 Username field exists: ${usernameExists}`);
        console.log(`🔑 Password field visible: ${passwordVisible}`);
        console.log(`🔍 Verify button visible: ${verifyButtonVisible}`);
        
        diagnostics.formDiagnostics = {
            usernameExists,
            passwordVisible,
            verifyButtonVisible
        };
        
        if (!usernameExists) {
            console.log('❌ Username field not found! Checking page content...');
            const pageContent = await page.content();
            console.log('📄 Page HTML snippet:');
            console.log(pageContent.substring(0, 1000) + '...');
        }

        console.log('');
        console.log('🔐 STEP 3: AUTOMATED LOGIN WITH DETAILED LOGGING');
        console.log('=================================================');
        
        // Manual step-by-step login with detailed logging
        const loginStart = Date.now();
        
        console.log('👤 Step 3.1: Filling username field...');
        await page.waitForSelector(usernameSelector, { timeout: 10000 });
        
        // Try multiple methods to fill username
        try {
            await page.fill(usernameSelector, 'Arogya@23477791');
            console.log('✅ Username filled using direct method');
        } catch (error) {
            console.log('⚠️  Direct fill failed, trying shadow DOM...');
            
            // Shadow DOM method
            await page.evaluate((selector, value) => {
                const host = document.querySelector(selector);
                if (host && host.shadowRoot) {
                    const input = host.shadowRoot.querySelector('#input') || host.shadowRoot.querySelector('input');
                    if (input) {
                        input.value = value;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }, usernameSelector, 'Arogya@23477791');
            console.log('✅ Username filled using shadow DOM method');
        }
        
        // Verify username was actually filled
        const usernameValue = await page.inputValue(usernameSelector).catch(() => '');
        console.log(`📝 Username field value: "${usernameValue}"`);
        
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/diagnostics-username-filled-${Date.now()}.png`,
            fullPage: true 
        });
        
        console.log('🔍 Step 3.2: Clicking verify button...');
        await page.click(verifyButtonSelector);
        await page.waitForTimeout(3000); // Wait for password field to appear
        
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/diagnostics-after-verify-${Date.now()}.png`,
            fullPage: true 
        });
        
        console.log('🔑 Step 3.3: Filling password field...');
        await page.waitForSelector(passwordSelector, { timeout: 10000 });
        
        // Try multiple methods to fill password
        try {
            await page.fill(passwordSelector, 'ADPadp01$');
            console.log('✅ Password filled using direct method');
        } catch (error) {
            console.log('⚠️  Direct fill failed, trying shadow DOM...');
            
            // Shadow DOM method
            await page.evaluate((selector, value) => {
                const host = document.querySelector(selector);
                if (host && host.shadowRoot) {
                    const input = host.shadowRoot.querySelector('#input') || host.shadowRoot.querySelector('input');
                    if (input) {
                        input.value = value;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        input.dispatchEvent(new Event('blur', { bubbles: true }));
                    }
                }
            }, passwordSelector, 'ADPadp01$');
            console.log('✅ Password filled using shadow DOM method');
        }
        
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/diagnostics-password-filled-${Date.now()}.png`,
            fullPage: true 
        });
        
        console.log('🚀 Step 3.4: Clicking sign in button...');
        await page.click(signInButtonSelector);
        
        console.log('⏳ Step 3.5: Waiting for login result...');
        await page.waitForTimeout(5000); // Wait for response
        
        const loginEnd = Date.now();
        diagnostics.timingDiagnostics = {
            loginDuration: loginEnd - loginStart,
            totalDuration: loginEnd - navStart
        };
        
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/diagnostics-after-signin-${Date.now()}.png`,
            fullPage: true 
        });

        console.log('');
        console.log('🔍 STEP 4: POST-LOGIN ANALYSIS');
        console.log('==============================');
        
        const currentUrl = page.url();
        const currentTitle = await page.title();
        
        console.log(`🔗 Current URL: ${currentUrl}`);
        console.log(`📄 Current Title: ${currentTitle}`);
        
        // Check for error messages
        const errorSelectors = [
            'text=incorrect',
            'text=invalid',
            'text=error',
            '.error',
            '.alert-danger',
            '[class*="error"]'
        ];
        
        let errorFound = false;
        for (const selector of errorSelectors) {
            try {
                const errorElement = await page.locator(selector).first();
                if (await errorElement.isVisible({ timeout: 1000 })) {
                    const errorText = await errorElement.textContent();
                    console.log(`❌ Error found: "${errorText}" (selector: ${selector})`);
                    errorFound = true;
                    diagnostics.errorDiagnostics.errorMessage = errorText;
                    diagnostics.errorDiagnostics.errorSelector = selector;
                }
            } catch (e) {
                // Continue checking
            }
        }
        
        if (!errorFound) {
            console.log('✅ No error messages found');
        }
        
        // Check for success indicators
        const successIndicators = [
            'text=Welcome',
            'text=Dashboard',
            'text=Home',
            '.navigation',
            '[data-testid*="home"]'
        ];
        
        let successFound = false;
        for (const selector of successIndicators) {
            try {
                const successElement = await page.locator(selector).first();
                if (await successElement.isVisible({ timeout: 1000 })) {
                    console.log(`✅ Success indicator found: ${selector}`);
                    successFound = true;
                    break;
                }
            } catch (e) {
                // Continue checking
            }
        }
        
        // Determine login status
        const isStillOnSignin = currentUrl.includes('signin') || currentUrl.includes('login');
        const loginSuccessful = !isStillOnSignin && !errorFound && (successFound || currentUrl.includes('runpayrollmain2'));
        
        console.log(`📊 Login Status Analysis:`);
        console.log(`   - Still on signin page: ${isStillOnSignin}`);
        console.log(`   - Error message found: ${errorFound}`);
        console.log(`   - Success indicator found: ${successFound}`);
        console.log(`   - URL suggests success: ${currentUrl.includes('runpayrollmain2')}`);
        console.log(`   - OVERALL RESULT: ${loginSuccessful ? 'SUCCESS' : 'FAILURE'}`);
        
        diagnostics.errorDiagnostics.loginSuccessful = loginSuccessful;
        diagnostics.errorDiagnostics.stillOnSignin = isStillOnSignin;
        diagnostics.errorDiagnostics.successIndicatorFound = successFound;

        console.log('');
        console.log('🌐 STEP 5: BROWSER DETECTION ANALYSIS');
        console.log('=====================================');
        
        // Check if automation is detected
        const automationDetection = await page.evaluate(() => {
            return {
                webdriver: navigator.webdriver,
                plugins: navigator.plugins.length,
                languages: navigator.languages,
                platform: navigator.platform,
                userAgent: navigator.userAgent,
                windowChrome: !!window.chrome,
                windowExternal: !!window.external,
                documentCreateEvent: !!document.createEvent,
                htmlElementStyle: !!window.HTMLElement.prototype.style,
                functionToString: Function.prototype.toString.toString().includes('[native code]'),
                permissions: typeof navigator.permissions !== 'undefined',
                connectionRtt: navigator.connection ? navigator.connection.rtt : 'undefined'
            };
        });
        
        console.log('🔍 Browser fingerprint analysis:');
        console.log(`   - webdriver property: ${automationDetection.webdriver}`);
        console.log(`   - plugins count: ${automationDetection.plugins}`);
        console.log(`   - languages: ${automationDetection.languages}`);
        console.log(`   - platform: ${automationDetection.platform}`);
        console.log(`   - chrome object: ${automationDetection.windowChrome}`);
        console.log(`   - permissions API: ${automationDetection.permissions}`);
        
        diagnostics.browserDiagnostics = automationDetection;

        console.log('');
        console.log('📋 STEP 6: COMPREHENSIVE DIAGNOSTIC REPORT');
        console.log('==========================================');
        
        const report = {
            timestamp: new Date().toISOString(),
            testUrl: targetUrl,
            credentials: 'Arogya@23477791/***',
            diagnostics,
            summary: {
                navigationSuccessful: diagnostics.navigationDiagnostics.finalUrl === targetUrl,
                formElementsFound: diagnostics.formDiagnostics.usernameExists,
                loginSuccessful: diagnostics.errorDiagnostics.loginSuccessful,
                automationDetected: automationDetection.webdriver !== undefined,
                totalTestDuration: diagnostics.timingDiagnostics.totalDuration
            }
        };
        
        console.log('📊 DIAGNOSTIC SUMMARY:');
        console.log('======================');
        console.log(`✅ Navigation: ${report.summary.navigationSuccessful ? 'SUCCESS' : 'FAILURE'}`);
        console.log(`✅ Form Elements: ${report.summary.formElementsFound ? 'FOUND' : 'NOT FOUND'}`);
        console.log(`✅ Login Result: ${report.summary.loginSuccessful ? 'SUCCESS' : 'FAILURE'}`);
        console.log(`⚠️  Automation Detected: ${report.summary.automationDetected ? 'YES' : 'NO'}`);
        console.log(`⏱️  Total Duration: ${report.summary.totalTestDuration}ms`);
        
        // Save detailed report
        const reportPath = `/Users/arog/auto/auto/qa_automation/auto-coder/reports/login-diagnostics-${Date.now()}.json`;
        require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Detailed diagnostic report saved: ${reportPath}`);

        console.log('');
        console.log('💡 RECOMMENDATIONS:');
        console.log('===================');
        
        if (report.summary.automationDetected) {
            console.log('🔧 Automation detected - consider:');
            console.log('   - Using stealth mode plugins');
            console.log('   - Adding more human-like delays');
            console.log('   - Randomizing user agent strings');
            console.log('   - Using residential proxies');
        }
        
        if (!report.summary.loginSuccessful && report.summary.formElementsFound) {
            console.log('🔧 Login failed with form present - consider:');
            console.log('   - Checking for CAPTCHA');
            console.log('   - Verifying credential accuracy');
            console.log('   - Adding longer waits between actions');
            console.log('   - Using more sophisticated input methods');
        }
        
        if (!report.summary.formElementsFound) {
            console.log('🔧 Form elements not found - consider:');
            console.log('   - Checking for dynamic loading');
            console.log('   - Verifying selector accuracy');
            console.log('   - Adding longer page load waits');
            console.log('   - Checking for iframe content');
        }

        console.log('');
        console.log('🔍 Keeping browser open for 20 seconds for manual inspection...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('💥 Diagnostic test error:', error.message);
        
        // Take error screenshot
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/diagnostics-error-${Date.now()}.png`,
            fullPage: true 
        });
    }

    await browser.close();
    console.log('🏁 Login diagnostics completed!');
}

// Run the diagnostic test
diagnoseLoginIssues().catch(console.error);
