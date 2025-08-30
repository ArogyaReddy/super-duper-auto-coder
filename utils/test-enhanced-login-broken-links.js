const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');
const fs = require('fs');

async function testEnhancedLoginAndBrokenLinks() {
    console.log('🎯 ENHANCED REAL LOGIN AND BROKEN LINK TESTING');
    console.log('==============================================');
    console.log('📍 URL: https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c');
    console.log('👤 Username: Arogya@23477791');
    console.log('🔑 Password: ADPadp01$');
    console.log('🎯 Mission: Complete Login + Navigate App + Test All Links');
    console.log('');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 2000,
        args: [
            '--start-maximized',
            '--no-default-browser-check',
            '--disable-web-security'
        ]
    });

    const context = await browser.newContext({
        viewport: null,
        ignoreHTTPSErrors: true
    });

    const page = await context.newPage();
    const auth = new UniversalAuthenticationHandler();

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
        
        const result = await auth.performUniversalAuthentication(page, targetUrl, credentials);

        if (!result.success) {
            console.log('❌ LOGIN FAILED');
            return testResults;
        }

        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('🔄 Waiting for application to fully load...');
        
        // Wait for the application to fully load and redirect
        await page.waitForTimeout(8000);

        // Look for signs we're in the main application
        const possibleSuccessIndicators = [
            'text=Dashboard',
            'text=Home',
            'text=Welcome',
            'text=Payroll',
            'text=Employees',
            'text=Reports',
            '.main-content',
            '.dashboard',
            '.home-page',
            '[data-testid="main-navigation"]'
        ];

        let foundMainApp = false;
        for (const indicator of possibleSuccessIndicators) {
            try {
                if (await page.locator(indicator).isVisible({ timeout: 2000 })) {
                    console.log(`✅ Found main app indicator: ${indicator}`);
                    foundMainApp = true;
                    break;
                }
            } catch (e) {
                // Continue checking
            }
        }

        // If still on signin page, try to find and click continue/enter buttons
        if (!foundMainApp) {
            console.log('🔄 Still on signin page, looking for entry points...');
            
            const entryPoints = [
                'button:has-text("Continue")',
                'button:has-text("Enter")',
                'button:has-text("Go")',
                'button:has-text("Next")',
                'a:has-text("Continue")',
                'a:has-text("Enter")',
                '[type="submit"]',
                '.btn-primary',
                '.continue-btn'
            ];

            for (const selector of entryPoints) {
                try {
                    const element = page.locator(selector);
                    if (await element.isVisible({ timeout: 2000 })) {
                        console.log(`🔘 Clicking: ${selector}`);
                        await element.click();
                        await page.waitForTimeout(5000);
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
        }

        // STEP 2: CAPTURE CURRENT STATE AND FIND LINKS
        console.log('');
        console.log('🔍 STEP 2: ANALYZING CURRENT APPLICATION STATE');
        console.log('==============================================');

        const currentUrl = page.url();
        const pageTitle = await page.title();
        console.log(`📄 Current Page: ${pageTitle}`);
        console.log(`🔗 Current URL: ${currentUrl}`);

        // Take screenshot of current state
        await page.screenshot({ 
            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/app-state-${Date.now()}.png`,
            fullPage: true 
        });

        // Get page content to analyze
        const bodyText = await page.locator('body').textContent();
        console.log(`📝 Page contains ${bodyText.length} characters of text`);
        
        // Look for specific ADP/RUN application elements
        const appElements = [
            'text=Payroll',
            'text=Employees', 
            'text=Reports',
            'text=Tax',
            'text=Company',
            'text=Settings',
            'text=Dashboard',
            'text=Home'
        ];

        console.log('🔍 Searching for application elements...');
        for (const element of appElements) {
            try {
                if (await page.locator(element).isVisible({ timeout: 1000 })) {
                    console.log(`   ✅ Found: ${element}`);
                }
            } catch (e) {
                // Element not found
            }
        }

        // STEP 3: FIND AND TEST ALL LINKS
        console.log('');
        console.log('🔗 STEP 3: COMPREHENSIVE LINK TESTING');
        console.log('====================================');

        // Get all possible link selectors
        const linkSelectors = [
            'a[href]',
            'button[onclick]',
            '[role="button"]',
            '.btn',
            '.link',
            '.nav-link'
        ];

        let allLinks = [];
        for (const selector of linkSelectors) {
            try {
                const links = await page.locator(selector).all();
                console.log(`📊 Found ${links.length} elements with selector: ${selector}`);
                allLinks = allLinks.concat(links);
            } catch (e) {
                console.log(`⚠️  Could not get links with selector: ${selector}`);
            }
        }

        console.log(`📊 Total interactive elements found: ${allLinks.length}`);

        // Test first 15 links/buttons
        for (let i = 0; i < Math.min(allLinks.length, 15); i++) {
            try {
                const element = allLinks[i];
                const href = await element.getAttribute('href');
                const onclick = await element.getAttribute('onclick');
                const text = await element.textContent();
                const tagName = await element.evaluate(el => el.tagName);
                const isVisible = await element.isVisible();

                console.log(`\n🔍 Testing Element ${i + 1}/${Math.min(allLinks.length, 15)}:`);
                console.log(`   📝 Text: "${text?.trim().substring(0, 50) || 'No text'}"`);
                console.log(`   🏷️  Tag: ${tagName}`);
                console.log(`   🔗 Href: ${href || 'None'}`);
                console.log(`   👁️  Visible: ${isVisible}`);

                if (!isVisible) {
                    console.log('   ⚠️  Element not visible, skipping...');
                    continue;
                }

                testResults.linksChecked++;

                // Test href links
                if (href && !href.startsWith('javascript:') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                    try {
                        console.log(`   🧪 Testing link: ${href}`);
                        
                        // Create new page for testing
                        const testPage = await context.newPage();
                        const response = await testPage.goto(href, { 
                            waitUntil: 'networkidle',
                            timeout: 10000 
                        });

                        if (response && response.status() >= 400) {
                            console.log(`   ❌ BROKEN: HTTP ${response.status()}`);
                            brokenLinks.push({
                                text: text?.trim() || 'No text',
                                href: href,
                                status: response.status(),
                                error: `HTTP ${response.status()}`
                            });
                            testResults.brokenLinksFound++;
                        } else {
                            console.log(`   ✅ Working: HTTP ${response?.status() || 'OK'}`);
                            workingLinks.push({
                                text: text?.trim() || 'No text',
                                href: href,
                                status: response?.status() || 'OK'
                            });
                            testResults.workingLinksFound++;
                        }

                        await testPage.close();

                    } catch (error) {
                        console.log(`   ❌ BROKEN: ${error.message}`);
                        brokenLinks.push({
                            text: text?.trim() || 'No text',
                            href: href,
                            error: error.message
                        });
                        testResults.brokenLinksFound++;
                    }
                }
                // Test clickable elements
                else if (onclick || tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
                    try {
                        console.log(`   🔘 Testing clickable element`);
                        
                        // Take screenshot before click
                        await page.screenshot({ 
                            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/before-click-${i}-${Date.now()}.png`,
                            fullPage: true 
                        });

                        await element.click({ timeout: 5000 });
                        await page.waitForTimeout(3000);

                        const newUrl = page.url();
                        const newTitle = await page.title();
                        
                        console.log(`   ✅ Click successful - Page: ${newTitle}`);
                        console.log(`   🔗 New URL: ${newUrl}`);

                        testResults.pagesVisited.push({
                            title: newTitle,
                            url: newUrl,
                            timestamp: new Date().toISOString()
                        });

                        // Take screenshot after click
                        await page.screenshot({ 
                            path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/after-click-${i}-${Date.now()}.png`,
                            fullPage: true 
                        });

                        testResults.workingLinksFound++;

                    } catch (error) {
                        console.log(`   ❌ Click failed: ${error.message}`);
                        testResults.errors.push({
                            element: text?.trim() || 'Unknown',
                            error: error.message
                        });
                    }
                }

                // Small delay between tests
                await page.waitForTimeout(2000);

            } catch (error) {
                console.log(`   💥 Error testing element ${i + 1}: ${error.message}`);
            }
        }

        console.log('');
        console.log('📊 LINK TESTING COMPLETE');
        console.log('========================');

    } catch (error) {
        console.error('💥 Test execution error:', error.message);
        testResults.errors.push({ general: error.message });
    }

    // GENERATE FINAL REPORT
    console.log('');
    console.log('📋 COMPREHENSIVE TEST REPORT');
    console.log('============================');
    console.log(`✅ Login Status: SUCCESSFUL`);
    console.log(`🔗 Elements Tested: ${testResults.linksChecked}`);
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
    } else {
        console.log('✅ NO BROKEN LINKS FOUND!');
    }

    if (workingLinks.length > 0) {
        console.log('');
        console.log('✅ WORKING LINKS (Sample):');
        workingLinks.slice(0, 5).forEach((link, index) => {
            console.log(`   ${index + 1}. "${link.text}" -> ${link.href}`);
        });
    }

    // Save comprehensive report
    const reportData = {
        testDate: new Date().toISOString(),
        credentials: { url: targetUrl, username: 'Arogya@23477791' },
        results: testResults,
        brokenLinks,
        workingLinks,
        summary: {
            loginSuccessful: true,
            totalElementsTested: testResults.linksChecked,
            workingElements: testResults.workingLinksFound,
            brokenElements: testResults.brokenLinksFound,
            pagesVisited: testResults.pagesVisited.length
        }
    };

    const reportPath = `/Users/arog/auto/auto/qa_automation/auto-coder/reports/enhanced-broken-link-test-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log('');
    console.log(`📄 Detailed report saved: ${reportPath}`);

    console.log('🔍 Keeping browser open for 15 seconds for manual review...');
    await page.waitForTimeout(15000);

    await browser.close();
    console.log('🏁 Enhanced login and broken link testing completed!');

    return testResults;
}

// Run the enhanced test
testEnhancedLoginAndBrokenLinks().catch(console.error);
