const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');
const fs = require('fs');

async function testRealLoginAndBrokenLinks() {
    console.log('🎯 REAL LOGIN AND BROKEN LINK TESTING');
    console.log('====================================');
    console.log('📍 URL: https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c');
    console.log('👤 Username: Arogya@23477791');
    console.log('🔑 Password: ADPadp01$');
    console.log('🎯 Mission: Login + Test Broken Links');
    console.log('');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1500,
        args: [
            '--start-maximized',
            '--no-default-browser-check',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    });

    const context = await browser.newContext({
        viewport: null, // Full screen
        ignoreHTTPSErrors: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    const auth = new UniversalAuthenticationHandler();

    // User's specific credentials and URL
    const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
    const credentials = 'Arogya@23477791/ADPadp01$';

    const brokenLinks = [];
    const workingLinks = [];
    const testResults = {
        loginResult: null,
        pagesVisited: [],
        linksChecked: 0,
        brokenLinksFound: 0,
        workingLinksFound: 0,
        errors: []
    };

    try {
        // STEP 1: PERFORM REAL LOGIN
        console.log('🔐 STEP 1: PERFORMING REAL LOGIN');
        console.log('================================');
        
        const startTime = Date.now();
        const result = await auth.performUniversalAuthentication(page, targetUrl, credentials);
        const loginDuration = Date.now() - startTime;

        if (!result.success) {
            console.log('❌ LOGIN FAILED - Cannot proceed with broken link testing');
            console.log('📝 Error:', result.error);
            testResults.loginResult = { success: false, error: result.error };
            return testResults;
        }

        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('🎉 Final URL:', result.finalUrl);
        console.log('⏱️  Login Duration:', loginDuration + 'ms');
        console.log('');

        testResults.loginResult = { success: true, duration: loginDuration, finalUrl: result.finalUrl };

        // Wait for page to fully load after login
        await page.waitForTimeout(5000);

        // STEP 2: EXPLORE THE APPLICATION AND TEST LINKS
        console.log('🔍 STEP 2: EXPLORING APPLICATION AND TESTING LINKS');
        console.log('=================================================');

        // Get current page info
        const currentUrl = page.url();
        const pageTitle = await page.title();
        console.log(`📄 Current Page: ${pageTitle}`);
        console.log(`🔗 Current URL: ${currentUrl}`);

        testResults.pagesVisited.push({
            title: pageTitle,
            url: currentUrl,
            timestamp: new Date().toISOString()
        });

        // Take screenshot of logged-in state
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/logged-in-state-${Date.now()}.png`,
            fullPage: true 
        });

        // STEP 3: FIND AND TEST ALL LINKS
        console.log('🔗 STEP 3: FINDING AND TESTING ALL LINKS');
        console.log('========================================');

        // Get all links on the page
        const links = await page.locator('a[href]').all();
        console.log(`📊 Found ${links.length} links to test`);
        console.log('');

        for (let i = 0; i < Math.min(links.length, 20); i++) { // Test first 20 links
            try {
                const link = links[i];
                const href = await link.getAttribute('href');
                const linkText = await link.textContent();
                const isVisible = await link.isVisible();

                if (!href || href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:')) {
                    continue; // Skip javascript, anchor, and mailto links
                }

                console.log(`🔍 Testing Link ${i + 1}/${Math.min(links.length, 20)}: "${linkText?.trim() || 'No text'}" -> ${href}`);

                if (!isVisible) {
                    console.log('   ⚠️  Link not visible, skipping...');
                    continue;
                }

                testResults.linksChecked++;

                // Test the link by opening in new page
                const newPage = await context.newPage();
                
                try {
                    const response = await newPage.goto(href, { 
                        waitUntil: 'networkidle',
                        timeout: 15000 
                    });

                    if (response && response.status() >= 400) {
                        console.log(`   ❌ BROKEN LINK: HTTP ${response.status()}`);
                        brokenLinks.push({
                            text: linkText?.trim() || 'No text',
                            href: href,
                            status: response.status(),
                            error: `HTTP ${response.status()}`
                        });
                        testResults.brokenLinksFound++;
                    } else {
                        console.log(`   ✅ Working: HTTP ${response?.status() || 'OK'}`);
                        workingLinks.push({
                            text: linkText?.trim() || 'No text',
                            href: href,
                            status: response?.status() || 'OK'
                        });
                        testResults.workingLinksFound++;
                    }

                    // Take screenshot if it's a significant page
                    if (href.includes('dashboard') || href.includes('home') || href.includes('main')) {
                        await newPage.screenshot({ 
                            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/link-test-${i + 1}-${Date.now()}.png`,
                            fullPage: true 
                        });
                    }

                } catch (error) {
                    console.log(`   ❌ BROKEN LINK: ${error.message}`);
                    brokenLinks.push({
                        text: linkText?.trim() || 'No text',
                        href: href,
                        error: error.message
                    });
                    testResults.brokenLinksFound++;
                    testResults.errors.push({
                        link: href,
                        error: error.message
                    });
                } finally {
                    await newPage.close();
                }

                // Small delay between tests
                await page.waitForTimeout(1000);

            } catch (error) {
                console.log(`   💥 Error testing link ${i + 1}: ${error.message}`);
                testResults.errors.push({
                    linkIndex: i + 1,
                    error: error.message
                });
            }
        }

        // STEP 4: EXPLORE NAVIGATION MENU
        console.log('');
        console.log('🧭 STEP 4: TESTING NAVIGATION MENU');
        console.log('=================================');

        // Look for common navigation elements
        const navSelectors = [
            'nav a',
            '.nav a',
            '.navbar a',
            '.menu a',
            '.navigation a',
            '[role="navigation"] a',
            '.sidebar a'
        ];

        for (const selector of navSelectors) {
            try {
                const navLinks = await page.locator(selector).all();
                if (navLinks.length > 0) {
                    console.log(`📋 Found ${navLinks.length} navigation links with selector: ${selector}`);
                    
                    for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
                        const navLink = navLinks[i];
                        const href = await navLink.getAttribute('href');
                        const text = await navLink.textContent();
                        
                        if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
                            console.log(`   🔗 Nav Link: "${text?.trim()}" -> ${href}`);
                            
                            try {
                                await navLink.click({ timeout: 5000 });
                                await page.waitForTimeout(3000);
                                
                                const newUrl = page.url();
                                const newTitle = await page.title();
                                
                                console.log(`   ✅ Navigated to: ${newTitle} (${newUrl})`);
                                
                                testResults.pagesVisited.push({
                                    title: newTitle,
                                    url: newUrl,
                                    timestamp: new Date().toISOString()
                                });
                                
                                // Take screenshot
                                await page.screenshot({ 
                                    path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/nav-${i + 1}-${Date.now()}.png`,
                                    fullPage: true 
                                });
                                
                                break; // Test just one navigation to avoid getting lost
                                
                            } catch (error) {
                                console.log(`   ❌ Navigation failed: ${error.message}`);
                            }
                        }
                    }
                    break; // Found navigation, stop looking
                }
            } catch (error) {
                // Continue to next selector
            }
        }

        console.log('');
        console.log('📊 TESTING COMPLETE - GENERATING REPORT');
        console.log('======================================');

    } catch (error) {
        console.error('💥 Test execution error:', error.message);
        testResults.errors.push({
            general: error.message
        });
    }

    // GENERATE FINAL REPORT
    console.log('');
    console.log('📋 FINAL BROKEN LINK TEST REPORT');
    console.log('================================');
    console.log(`✅ Login Status: ${testResults.loginResult?.success ? 'SUCCESSFUL' : 'FAILED'}`);
    console.log(`🔗 Total Links Checked: ${testResults.linksChecked}`);
    console.log(`✅ Working Links: ${testResults.workingLinksFound}`);
    console.log(`❌ Broken Links: ${testResults.brokenLinksFound}`);
    console.log(`📄 Pages Visited: ${testResults.pagesVisited.length}`);
    console.log('');

    if (brokenLinks.length > 0) {
        console.log('❌ BROKEN LINKS FOUND:');
        brokenLinks.forEach((link, index) => {
            console.log(`   ${index + 1}. "${link.text}" -> ${link.href}`);
            console.log(`      Error: ${link.error || `HTTP ${link.status}`}`);
        });
        console.log('');
    } else {
        console.log('✅ NO BROKEN LINKS FOUND!');
        console.log('');
    }

    if (workingLinks.length > 0) {
        console.log('✅ WORKING LINKS SAMPLE:');
        workingLinks.slice(0, 5).forEach((link, index) => {
            console.log(`   ${index + 1}. "${link.text}" -> ${link.href} (${link.status})`);
        });
        console.log('');
    }

    // Save detailed report
    const reportData = {
        testDate: new Date().toISOString(),
        credentials: {
            url: targetUrl,
            username: 'Arogya@23477791'
        },
        results: testResults,
        brokenLinks,
        workingLinks
    };

    const reportPath = `/Users/arog/auto/auto/qa_automation/auto-coder/reports/broken-link-test-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved: ${reportPath}`);

    // Keep browser open for final review
    console.log('🔍 Keeping browser open for 10 seconds for final review...');
    await page.waitForTimeout(10000);

    await browser.close();
    console.log('🏁 Real login and broken link testing completed!');

    return testResults;
}

// Run the comprehensive test
testRealLoginAndBrokenLinks().catch(console.error);
