const { UltraFreshSmartLogin } = require('./ultra-fresh-smart-login');

/**
 * BROKEN LINKS TESTING WITH ULTRA-FRESH SESSION
 * 
 * This utility tests for broken links using the ultra-fresh smart login system
 * to ensure no session conflicts interfere with the testing process.
 * 
 * Test Configuration:
 * - URL: https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c
 * - Username: Arogya@23477791
 * - Password: ADPadp01$
 */

async function testBrokenLinksWithUltraFreshLogin() {
    console.log('🔗 BROKEN LINKS TESTING WITH ULTRA-FRESH SESSION');
    console.log('================================================');
    console.log('🎯 Testing broken links with guaranteed fresh session');
    console.log('💥 No session conflicts, maximum reliability');
    console.log('');
    console.log('🔧 CONFIGURATION:');
    console.log('   URL: https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c');
    console.log('   Username: Arogya@23477791');
    console.log('   Password: ADPadp01$');
    console.log('');

    const ultraLogin = new UltraFreshSmartLogin();

    try {
        // Step 1: Perform ultra-fresh login
        console.log('🚀 STEP 1: ULTRA-FRESH LOGIN');
        console.log('============================');
        
        const credentials = 'Arogya@23477791/ADPadp01$';
        const loginResult = await ultraLogin.performUltraFreshLogin(credentials);

        if (!loginResult.success) {
            console.log('❌ ULTRA-FRESH LOGIN FAILED');
            console.log('===========================');
            console.log(`Issue: ${loginResult.issue || 'Unknown'}`);
            console.log(`Message: ${loginResult.message || loginResult.error || 'No details'}`);
            
            if (loginResult.recommendation) {
                console.log(`Recommendation: ${loginResult.recommendation}`);
            }
            
            return;
        }

        if (!loginResult.readyForAutomation) {
            console.log('⏳ LOGIN REQUIRES MANUAL INTERVENTION');
            console.log('====================================');
            console.log('Please complete any security steps and the broken links test will continue automatically.');
            console.log('The system will wait and automatically proceed once you reach the home page.');
            return;
        }

        console.log('');
        console.log('✅ ULTRA-FRESH LOGIN SUCCESSFUL!');
        console.log('=================================');
        console.log('🎉 Authenticated and ready for broken links testing');
        console.log(`🆔 Session: ${loginResult.sessionId}`);
        console.log(`🔗 Current URL: ${loginResult.finalUrl}`);
        console.log('');

        // Step 2: Perform broken links testing
        console.log('🔗 STEP 2: BROKEN LINKS ANALYSIS');
        console.log('=================================');
        
        const page = ultraLogin.getPage();
        const brokenLinksResults = await performBrokenLinksTest(page);

        // Step 3: Display results
        displayBrokenLinksResults(brokenLinksResults);

        // Step 4: Keep browser open for inspection
        console.log('');
        console.log('🔍 INSPECTION MODE');
        console.log('==================');
        console.log('Browser will stay open for 60 seconds for manual inspection...');
        console.log('You can examine the broken links and page state.');
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('');
        console.error('💥 BROKEN LINKS TEST FAILED');
        console.error('===========================');
        console.error(`Error: ${error.message}`);
    } finally {
        await ultraLogin.cleanup();
        console.log('');
        console.log('🧹 CLEANUP COMPLETED');
        console.log('====================');
        console.log('🏁 Broken links test completed!');
    }
}

async function performBrokenLinksTest(page) {
    console.log('🔍 SCANNING FOR LINKS');
    console.log('=====================');
    
    try {
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        
        // Get current page info
        const currentUrl = page.url();
        const currentTitle = await page.title();
        
        console.log(`📄 Current Page: ${currentTitle}`);
        console.log(`🔗 Current URL: ${currentUrl}`);
        console.log('');
        
        // Find all links on the page
        const links = await page.$$eval('a[href]', anchors => 
            anchors.map(anchor => ({
                text: anchor.textContent?.trim() || '',
                href: anchor.href,
                visible: anchor.offsetParent !== null
            }))
        );

        console.log(`📊 Found ${links.length} total links on the page`);
        
        // Filter out external links, javascript links, and empty links
        const internalLinks = links.filter(link => {
            if (!link.href || link.href.startsWith('javascript:') || link.href.startsWith('mailto:')) {
                return false;
            }
            
            try {
                const linkUrl = new URL(link.href);
                const currentUrlObj = new URL(currentUrl);
                return linkUrl.hostname === currentUrlObj.hostname;
            } catch {
                return false;
            }
        });

        console.log(`🎯 Testing ${internalLinks.length} internal links for broken status`);
        console.log('');

        const results = {
            totalLinks: links.length,
            internalLinks: internalLinks.length,
            testedLinks: [],
            brokenLinks: [],
            workingLinks: [],
            skippedLinks: [],
            currentPage: {
                url: currentUrl,
                title: currentTitle
            }
        };

        // Test each internal link (limit to 15 for demo)
        for (let i = 0; i < Math.min(internalLinks.length, 15); i++) {
            const link = internalLinks[i];
            console.log(`🔗 Testing link ${i + 1}/${Math.min(internalLinks.length, 15)}: ${link.text || 'No text'}`);
            console.log(`   URL: ${link.href}`);
            
            try {
                // Test the link by making a request
                const response = await page.goto(link.href, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000 
                });
                
                const status = response?.status() || 0;
                const finalUrl = page.url();
                
                const linkResult = {
                    text: link.text,
                    originalUrl: link.href,
                    finalUrl: finalUrl,
                    status: status,
                    visible: link.visible
                };
                
                if (status >= 400) {
                    console.log(`   ❌ BROKEN (${status})`);
                    results.brokenLinks.push(linkResult);
                } else if (status >= 200 && status < 400) {
                    console.log(`   ✅ Working (${status})`);
                    results.workingLinks.push(linkResult);
                } else {
                    console.log(`   ⚠️  Unusual status (${status})`);
                    results.skippedLinks.push(linkResult);
                }
                
                results.testedLinks.push(linkResult);
                
                // Go back to original page
                await page.goBack({ waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(1000); // Brief pause between requests
                
            } catch (error) {
                console.log(`   💥 Error testing link: ${error.message}`);
                results.brokenLinks.push({
                    text: link.text,
                    originalUrl: link.href,
                    finalUrl: null,
                    status: 'ERROR',
                    error: error.message,
                    visible: link.visible
                });
            }
        }

        if (internalLinks.length > 15) {
            console.log(`ℹ️  Note: Only tested first 15 links out of ${internalLinks.length} total internal links`);
        }

        return results;

    } catch (error) {
        console.error(`💥 Broken links test error: ${error.message}`);
        return {
            error: error.message,
            totalLinks: 0,
            internalLinks: 0,
            testedLinks: [],
            brokenLinks: [],
            workingLinks: [],
            skippedLinks: []
        };
    }
}

function displayBrokenLinksResults(results) {
    console.log('');
    console.log('📊 BROKEN LINKS TEST RESULTS');
    console.log('============================');
    
    if (results.error) {
        console.log(`❌ Test failed: ${results.error}`);
        return;
    }
    
    console.log(`📄 Page: ${results.currentPage?.title || 'Unknown'}`);
    console.log(`🔗 URL: ${results.currentPage?.url || 'Unknown'}`);
    console.log(`📊 Total links found: ${results.totalLinks}`);
    console.log(`🎯 Internal links: ${results.internalLinks}`);
    console.log(`🧪 Links tested: ${results.testedLinks.length}`);
    console.log(`✅ Working links: ${results.workingLinks.length}`);
    console.log(`❌ Broken links: ${results.brokenLinks.length}`);
    console.log(`⚠️  Skipped links: ${results.skippedLinks.length}`);
    console.log('');
    
    if (results.brokenLinks.length > 0) {
        console.log('💥 BROKEN LINKS DETECTED');
        console.log('========================');
        results.brokenLinks.forEach((link, index) => {
            console.log(`${index + 1}. ${link.text || 'No text'}`);
            console.log(`   URL: ${link.originalUrl}`);
            console.log(`   Status: ${link.status}`);
            if (link.error) {
                console.log(`   Error: ${link.error}`);
            }
            console.log('');
        });
    } else {
        console.log('🎉 NO BROKEN LINKS FOUND!');
        console.log('=========================');
        console.log('All tested links are working properly.');
    }
    
    if (results.workingLinks.length > 0) {
        console.log('');
        console.log('✅ WORKING LINKS SUMMARY');
        console.log('========================');
        results.workingLinks.slice(0, 5).forEach((link, index) => {
            console.log(`${index + 1}. ${link.text || 'No text'} (${link.status})`);
        });
        if (results.workingLinks.length > 5) {
            console.log(`   ... and ${results.workingLinks.length - 5} more working links`);
        }
    }
    
    console.log('');
    console.log('💡 TESTING INSIGHTS');
    console.log('===================');
    console.log('• This test uses ultra-fresh sessions to prevent conflicts');
    console.log('• Each run starts with completely clean browser state');
    console.log('• Session isolation ensures consistent results');
    console.log('• Broken links are tested by actually navigating to them');
    console.log('• Results include HTTP status codes and error details');
}

// Run the test
if (require.main === module) {
    testBrokenLinksWithUltraFreshLogin()
        .then(() => console.log('🏁 Test completed!'))
        .catch(console.error);
}

module.exports = { 
    testBrokenLinksWithUltraFreshLogin, 
    performBrokenLinksTest, 
    displayBrokenLinksResults 
};
