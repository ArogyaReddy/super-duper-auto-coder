#!/usr/bin/env node

/**
 * 🎯 Universal Authentication Test Script - Single Authentication
 * 
 * Test a single authentication scenario with auto-detection
 * Usage: node utils/test-universal-auth.js [targetUrl] [credentials]
 */

const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');

async function testUniversalAuthentication(targetUrl, credentials) {
    console.log('🎯 UNIVERSAL AUTHENTICATION SINGLE TEST');
    console.log('========================================');
    console.log(`🔗 Target URL: ${targetUrl}`);
    console.log(`🔑 Credentials: ${credentials.split('/')[0]}/${credentials.split('/')[1]?.replace(/./g, '*')}`);
    console.log('');

    let browser, page;

    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await chromium.launch({ 
            headless: false,  // Show browser for debugging
            slowMo: 1000      // Slow down for observation
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        
        page = await context.newPage();
        
        // Initialize Universal Authentication Handler
        console.log('🔧 Initializing Universal Authentication Handler...');
        const auth = new UniversalAuthenticationHandler({
            timeout: 30000,
            retryAttempts: 3,
            screenshots: true,
            sessionCache: true
        });

        // Perform authentication
        console.log('🎯 Starting universal authentication...');
        const result = await auth.performUniversalAuthentication(page, targetUrl, credentials);

        // Display results
        console.log('\n📊 AUTHENTICATION RESULTS');
        console.log('=========================');
        console.log(`✅ Success: ${result.success ? 'YES' : 'NO'}`);
        console.log(`👥 User Type: ${result.userType}`);
        console.log(`🌍 Environment: ${result.environment}`);
        console.log(`📱 Application: ${result.applicationType}`);
        console.log(`⏱️  Duration: ${result.duration}ms`);
        console.log(`🔗 Final URL: ${result.finalUrl}`);
        
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        }
        
        if (result.screenshots && result.screenshots.length > 0) {
            console.log(`📸 Screenshots: ${result.screenshots.length} saved`);
            result.screenshots.forEach(screenshot => {
                console.log(`   • ${screenshot}`);
            });
        }

        // Generate report
        const report = auth.generateAuthenticationReport();
        console.log(`\n📈 Success Rate: ${report.totalAttempts > 0 ? ((report.successfulAttempts / report.totalAttempts) * 100).toFixed(1) : 0}%`);

        // Keep browser open for 5 seconds to observe result
        if (result.success) {
            console.log('\n⏳ Keeping browser open for 5 seconds to observe result...');
            await page.waitForTimeout(5000);
        }

        return result;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: node test-universal-auth.js [targetUrl] [credentials]');
        console.log('');
        console.log('Examples:');
        console.log('  node test-universal-auth.js "https://online-fit.nj.adp.com/signin/v1/?APPID=RUN" "owner1@12345/password"');
        console.log('  node test-universal-auth.js "https://runpayroll-iat.es.ad.adp.com/admin/login.aspx" "cautomation3@adp/servicepass"');
        process.exit(1);
    }

    const targetUrl = args[0];
    const credentials = args[1];

    testUniversalAuthentication(targetUrl, credentials)
        .then(result => {
            if (result.success) {
                console.log('\n🎉 Universal Authentication Test PASSED');
                process.exit(0);
            } else {
                console.log('\n❌ Universal Authentication Test FAILED');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { testUniversalAuthentication };
