const { UltraFreshSmartLogin } = require('./ultra-fresh-smart-login');
const SuperAggressiveSessionKiller = require('./super-aggressive-session-killer');

class ConcurrentSessionHandler {
    constructor() {
        this.ultraLogin = new UltraFreshSmartLogin();
        this.superKiller = new SuperAggressiveSessionKiller();
    }

    async handleConcurrentSessionWithRetry() {
        console.log('🔄 CONCURRENT SESSION HANDLER WITH RETRY');
        console.log('==========================================');
        console.log('🎯 Intelligent handling of ADP\'s aggressive session detection');
        console.log('');

        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            attempt++;
            console.log(`🔄 ATTEMPT ${attempt}/${maxRetries}`);
            console.log('='.repeat(50));

            try {
                // For attempt 2 and beyond, use super aggressive cleanup
                if (attempt > 1) {
                    console.log('💥 Using super aggressive session termination...');
                    await this.superKiller.terminateAllADPSessions();
                    
                    // Wait longer between aggressive attempts
                    const waitTime = attempt * 10000; // 10, 20, 30 seconds
                    console.log(`⏳ Waiting ${waitTime/1000} seconds for server-side cleanup...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }

                // Attempt login
                const result = await this.ultraLogin.performUltraFreshLogin();

                if (result.success) {
                    console.log('');
                    console.log('🎉 SUCCESS! Concurrent session issue resolved');
                    console.log(`✅ Successful on attempt ${attempt}`);
                    return result;
                }

                // Check if it's a concurrent session issue
                if (result.actionRequired === 'MANUAL_LOGOUT_ALL_SESSIONS') {
                    console.log('');
                    console.log('🚨 CONCURRENT SESSION DETECTED');
                    console.log('==============================');
                    console.log(`❌ Attempt ${attempt} failed due to server-side session conflict`);
                    
                    if (attempt === 1) {
                        console.log('');
                        console.log('📋 IMMEDIATE ACTION REQUIRED:');
                        console.log('=============================');
                        console.log('1. 🌐 Open a regular Chrome browser (not automated)');
                        console.log('2. 🔗 Go to: https://online-iat.adp.com');
                        console.log('3. 🚪 Click "Sign Out" if you see it');
                        console.log('4. 🧹 Clear all browser data (Ctrl+Shift+Delete)');
                        console.log('5. 🔄 Try this test again');
                        console.log('');
                        console.log('⏳ Continuing with aggressive cleanup attempts...');
                    }

                    if (attempt < maxRetries) {
                        console.log(`🔄 Will retry with more aggressive cleanup...`);
                        continue;
                    }
                }

                // Other types of failures
                console.log(`⚠️  Attempt ${attempt} failed: ${result.issue}`);
                if (attempt < maxRetries) {
                    console.log('🔄 Retrying...');
                    continue;
                }

            } catch (error) {
                console.log(`💥 Attempt ${attempt} error: ${error.message}`);
                if (attempt < maxRetries) {
                    console.log('🔄 Retrying after error...');
                    continue;
                }
            }
        }

        // All attempts failed
        console.log('');
        console.log('❌ ALL ATTEMPTS FAILED');
        console.log('======================');
        console.log('🎯 ADP\'s session detection is very aggressive');
        console.log('');
        console.log('📋 MANUAL RESOLUTION REQUIRED:');
        console.log('==============================');
        console.log('1. 🕐 Wait 15-30 minutes for server sessions to expire');
        console.log('2. 🌐 Manually logout from ALL ADP sessions in ALL browsers');
        console.log('3. 🧹 Clear browser data from ALL browsers');
        console.log('4. 🔄 Restart your computer to clear all session remnants');
        console.log('5. 🆕 Try the test again with a completely fresh start');
        console.log('');
        console.log('💡 Alternative: Use a different user account for testing');

        return {
            success: false,
            issue: 'concurrent_session_unresolved',
            message: 'Unable to resolve concurrent session after multiple attempts',
            recommendation: 'Manual intervention required',
            attemptsUsed: maxRetries,
            actionRequired: 'WAIT_OR_MANUAL_LOGOUT'
        };
    }

    async testBrokenLinksWithSessionHandling() {
        console.log('🔗 BROKEN LINKS TESTING WITH SESSION CONFLICT HANDLING');
        console.log('=======================================================');
        console.log('🎯 Comprehensive testing with concurrent session resolution');
        console.log('');

        try {
            // Attempt login with concurrent session handling
            const loginResult = await this.handleConcurrentSessionWithRetry();

            if (!loginResult.success) {
                console.log('');
                console.log('❌ BROKEN LINKS TEST ABORTED');
                console.log('============================');
                console.log('Cannot proceed without successful login');
                console.log(`Reason: ${loginResult.message}`);
                return loginResult;
            }

            console.log('');
            console.log('🔗 PROCEEDING WITH BROKEN LINKS TESTING');
            console.log('=======================================');
            
            // Get the authenticated page
            const page = this.ultraLogin.getPage();
            
            // Perform broken links testing
            const brokenLinksResult = await this.performBrokenLinksTest(page);

            console.log('');
            console.log('🎉 BROKEN LINKS TESTING COMPLETED');
            console.log('=================================');
            
            return {
                success: true,
                loginResult,
                brokenLinksResult,
                sessionHandling: 'successful'
            };

        } catch (error) {
            console.log('');
            console.log('💥 BROKEN LINKS TEST ERROR');
            console.log('==========================');
            console.log(`Error: ${error.message}`);
            
            return {
                success: false,
                error: error.message,
                sessionHandling: 'failed'
            };
        } finally {
            // Cleanup
            try {
                await this.ultraLogin.cleanup();
            } catch (cleanupError) {
                console.log(`⚠️  Cleanup error: ${cleanupError.message}`);
            }
        }
    }

    async performBrokenLinksTest(page) {
        console.log('🔍 SCANNING FOR LINKS');
        console.log('=====================');

        try {
            const currentUrl = page.url();
            const pageTitle = await page.title();

            console.log(`📄 Current Page: ${pageTitle}`);
            console.log(`🔗 Current URL: ${currentUrl}`);

            // Find all links on the page
            const links = await page.evaluate(() => {
                const linkElements = Array.from(document.querySelectorAll('a[href]'));
                return linkElements.map(link => ({
                    href: link.href,
                    text: link.textContent.trim(),
                    tagName: link.tagName,
                    target: link.target
                }));
            });

            console.log(`📊 Found ${links.length} total links on the page`);

            // Filter for internal ADP links
            const internalLinks = links.filter(link => 
                link.href.includes('adp.com') && 
                !link.href.includes('mailto:') &&
                !link.href.includes('tel:') &&
                !link.href.includes('javascript:')
            );

            console.log(`🎯 Testing ${internalLinks.length} internal links for broken status`);

            const results = {
                pageTitle,
                currentUrl,
                totalLinks: links.length,
                internalLinks: internalLinks.length,
                testedLinks: 0,
                workingLinks: 0,
                brokenLinks: 0,
                skippedLinks: 0,
                linkDetails: []
            };

            // Test each internal link
            for (let i = 0; i < Math.min(internalLinks.length, 20); i++) { // Limit to 20 links
                const link = internalLinks[i];
                console.log(`🔗 Testing link ${i + 1}/${Math.min(internalLinks.length, 20)}: ${link.href}`);

                try {
                    const response = await page.goto(link.href, { 
                        waitUntil: 'networkidle',
                        timeout: 30000 
                    });

                    const status = response.status();
                    const isWorking = status >= 200 && status < 400;

                    results.testedLinks++;
                    if (isWorking) {
                        results.workingLinks++;
                    } else {
                        results.brokenLinks++;
                    }

                    results.linkDetails.push({
                        url: link.href,
                        text: link.text,
                        status,
                        working: isWorking
                    });

                    console.log(`${isWorking ? '✅' : '❌'} Status: ${status}`);

                } catch (error) {
                    results.testedLinks++;
                    results.brokenLinks++;
                    results.linkDetails.push({
                        url: link.href,
                        text: link.text,
                        status: 'ERROR',
                        working: false,
                        error: error.message
                    });

                    console.log(`❌ Error: ${error.message}`);
                }

                // Small delay between tests
                await page.waitForTimeout(1000);
            }

            // Display results
            this.displayBrokenLinksResults(results);
            return results;

        } catch (error) {
            console.log(`💥 Broken links test error: ${error.message}`);
            throw error;
        }
    }

    displayBrokenLinksResults(results) {
        console.log('');
        console.log('📊 BROKEN LINKS TEST RESULTS');
        console.log('============================');
        console.log(`📄 Page: ${results.pageTitle}`);
        console.log(`🔗 URL: ${results.currentUrl}`);
        console.log(`📊 Total links found: ${results.totalLinks}`);
        console.log(`🎯 Internal links: ${results.internalLinks}`);
        console.log(`🧪 Links tested: ${results.testedLinks}`);
        console.log(`✅ Working links: ${results.workingLinks}`);
        console.log(`❌ Broken links: ${results.brokenLinks}`);
        console.log(`⚠️  Skipped links: ${results.skippedLinks}`);

        if (results.brokenLinks === 0) {
            console.log('');
            console.log('🎉 NO BROKEN LINKS FOUND!');
            console.log('=========================');
            console.log('All tested links are working properly.');
        } else {
            console.log('');
            console.log('🚨 BROKEN LINKS DETECTED!');
            console.log('=========================');
            results.linkDetails.filter(link => !link.working).forEach((link, index) => {
                console.log(`${index + 1}. ❌ ${link.url}`);
                console.log(`   Status: ${link.status}`);
                console.log(`   Text: "${link.text}"`);
                if (link.error) {
                    console.log(`   Error: ${link.error}`);
                }
                console.log('');
            });
        }
    }
}

// Test the concurrent session handler
async function testConcurrentSessionHandler() {
    const handler = new ConcurrentSessionHandler();
    const result = await handler.testBrokenLinksWithSessionHandling();
    
    console.log('');
    console.log('🏁 TEST COMPLETED');
    console.log('==================');
    console.log(`Success: ${result.success}`);
    
    return result;
}

if (require.main === module) {
    testConcurrentSessionHandler().catch(console.error);
}

module.exports = ConcurrentSessionHandler;
