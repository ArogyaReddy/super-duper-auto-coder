#!/usr/bin/env node

/**
 * 🎯 Universal Authentication Auto-Load Test Script
 * 
 * Test authentication using auto-loaded SBS_Automation credentials
 * Usage: node utils/test-auto-auth.js [environment] [userType] [application]
 */

const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');

async function testAutoLoadAuthentication(environment, userType, application) {
    console.log('🎯 UNIVERSAL AUTHENTICATION AUTO-LOAD TEST');
    console.log('===========================================');
    console.log(`🌍 Environment: ${environment}`);
    console.log(`👥 User Type: ${userType}`);
    console.log(`📱 Application: ${application}`);
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

        // First, construct the target URL based on parameters
        const loginUrl = auth.constructLoginURL(userType, environment, application, {});
        console.log(`🔗 Constructed Login URL: ${loginUrl}`);

        // Perform auto-load authentication
        console.log('🎯 Starting auto-load authentication...');
        const result = await auth.authenticateWithAutoCredentials(page, loginUrl, userType, environment, application);

        // Display results
        console.log('\n📊 AUTO-LOAD AUTHENTICATION RESULTS');
        console.log('===================================');
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

        // Check credential loading
        console.log('\n🔍 CREDENTIAL LOADING ANALYSIS');
        console.log('==============================');
        
        const credentialsFound = await auth.loadCredentialsFromSBSAutomation(environment, userType, application);
        if (credentialsFound) {
            console.log('✅ Credentials successfully loaded from SBS_Automation');
            console.log(`👤 Username: ${credentialsFound.username}`);
            console.log(`🔑 Password: ${'*'.repeat(credentialsFound.password?.length || 0)}`);
            if (credentialsFound.iid) {
                console.log(`🏢 IID: ${credentialsFound.iid}`);
            }
            if (credentialsFound.ooid) {
                console.log(`🏢 OOID: ${credentialsFound.ooid}`);
            }
        } else {
            console.log('❌ No credentials found in SBS_Automation data');
            console.log('💡 Check the following paths:');
            console.log(`   • SBS_Automation/data/${environment.toLowerCase()}/config.json`);
            if (userType === 'CLIENT') {
                console.log(`   • SBS_Automation/data/${environment.toLowerCase()}/runmod/loginCreds.json`);
                console.log(`   • SBS_Automation/data/${environment.toLowerCase()}/max/dtoLoginCreds.json`);
            }
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
        console.error('❌ Auto-load test failed:', error.message);
        
        // Provide troubleshooting information
        console.log('\n🔧 TROUBLESHOOTING TIPS');
        console.log('=======================');
        console.log('1. Verify SBS_Automation directory structure exists');
        console.log('2. Check credential files are present and properly formatted');
        console.log('3. Ensure environment data directory exists');
        console.log('4. Validate user type and application combination');
        
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
    
    if (args.length < 3) {
        console.log('Usage: node test-auto-auth.js [environment] [userType] [application]');
        console.log('');
        console.log('Parameters:');
        console.log('  environment  - QAFIT, IAT, PROD');
        console.log('  userType     - CLIENT, SERVICE_USER');
        console.log('  application  - RUN, MAX, WFN, DTO');
        console.log('');
        console.log('Examples:');
        console.log('  node test-auto-auth.js QAFIT CLIENT RUN');
        console.log('  node test-auto-auth.js IAT SERVICE_USER RUN');
        console.log('  node test-auto-auth.js QAFIT CLIENT MAX');
        console.log('');
        console.log('Prerequisites:');
        console.log('  • SBS_Automation directory with proper data structure');
        console.log('  • Credential files in SBS_Automation/data/[env]/');
        console.log('  • Valid environment configuration');
        process.exit(1);
    }

    const environment = args[0].toUpperCase();
    const userType = args[1].toUpperCase();
    const application = args[2].toUpperCase();

    // Validate parameters
    const validEnvs = ['QAFIT', 'IAT', 'PROD'];
    const validUserTypes = ['CLIENT', 'SERVICE_USER'];
    const validApps = ['RUN', 'MAX', 'WFN', 'DTO'];

    if (!validEnvs.includes(environment)) {
        console.error(`❌ Invalid environment: ${environment}`);
        console.error(`Valid environments: ${validEnvs.join(', ')}`);
        process.exit(1);
    }

    if (!validUserTypes.includes(userType)) {
        console.error(`❌ Invalid user type: ${userType}`);
        console.error(`Valid user types: ${validUserTypes.join(', ')}`);
        process.exit(1);
    }

    if (!validApps.includes(application)) {
        console.error(`❌ Invalid application: ${application}`);
        console.error(`Valid applications: ${validApps.join(', ')}`);
        process.exit(1);
    }

    testAutoLoadAuthentication(environment, userType, application)
        .then(result => {
            if (result.success) {
                console.log('\n🎉 Auto-Load Authentication Test PASSED');
                process.exit(0);
            } else {
                console.log('\n❌ Auto-Load Authentication Test FAILED');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { testAutoLoadAuthentication };
