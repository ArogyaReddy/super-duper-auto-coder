#!/usr/bin/env node

/**
 * 🔄 Universal Authentication Batch Test Script
 * 
 * Test authentication across multiple environments and applications
 * Usage: node utils/test-batch-auth.js [credentials] [applications] [environments]
 */

const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');

async function testBatchAuthentication(credentials, applications, environments) {
    console.log('🔄 UNIVERSAL AUTHENTICATION BATCH TEST');
    console.log('======================================');
    console.log(`🔑 Credentials: ${credentials.split('/')[0]}/${credentials.split('/')[1]?.replace(/./g, '*')}`);
    console.log(`📱 Applications: ${applications.join(', ')}`);
    console.log(`🌍 Environments: ${environments.join(', ')}`);
    console.log(`🎯 Total Tests: ${applications.length * environments.length}`);
    console.log('');

    let browser, page;
    const results = [];

    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await chromium.launch({ 
            headless: true,   // Run headless for batch testing
            timeout: 60000
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        
        page = await context.newPage();
        
        // Initialize Universal Authentication Handler
        console.log('🔧 Initializing Universal Authentication Handler...');
        const auth = new UniversalAuthenticationHandler({
            timeout: 20000,
            retryAttempts: 2,
            screenshots: true,
            sessionCache: true
        });

        // Perform batch authentication
        console.log('🎯 Starting batch authentication tests...\n');
        const batchResults = await auth.performBatchAuthentication(page, credentials, applications, environments);

        // Display detailed results
        console.log('\n📊 DETAILED BATCH RESULTS');
        console.log('=========================');
        
        let successCount = 0;
        let failCount = 0;
        
        batchResults.forEach((result, index) => {
            const status = result.success ? '✅ PASS' : '❌ FAIL';
            const duration = result.duration ? `${result.duration}ms` : 'N/A';
            
            console.log(`${status} ${result.environment}-${result.applicationType} (${result.userType}) - ${duration}`);
            
            if (result.error) {
                console.log(`    Error: ${result.error}`);
            }
            
            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }
        });

        // Summary statistics
        console.log('\n📈 BATCH TEST SUMMARY');
        console.log('====================');
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`📊 Success Rate: ${batchResults.length > 0 ? ((successCount / batchResults.length) * 100).toFixed(1) : 0}%`);
        console.log(`⏱️  Total Tests: ${batchResults.length}`);

        // Generate comprehensive report
        const report = auth.generateAuthenticationReport();
        const reportPath = await auth.saveAuthenticationReport();
        console.log(`📄 Detailed report saved: ${reportPath.filePath}`);

        return {
            success: successCount > 0,
            results: batchResults,
            summary: {
                total: batchResults.length,
                successful: successCount,
                failed: failCount,
                successRate: batchResults.length > 0 ? ((successCount / batchResults.length) * 100).toFixed(1) : 0
            }
        };

    } catch (error) {
        console.error('❌ Batch test failed:', error.message);
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
        console.log('Usage: node test-batch-auth.js [credentials] [applications] [environments]');
        console.log('');
        console.log('Parameters:');
        console.log('  credentials   - Format: username/password');
        console.log('  applications  - Comma-separated: RUN,MAX,WFN');
        console.log('  environments  - Comma-separated: QAFIT,IAT,PROD');
        console.log('');
        console.log('Examples:');
        console.log('  node test-batch-auth.js "owner1@12345/password" "RUN,MAX" "QAFIT,IAT"');
        console.log('  node test-batch-auth.js "cautomation3@adp/servicepass" "RUN" "QAFIT"');
        process.exit(1);
    }

    const credentials = args[0];
    const applications = args[1].split(',').map(app => app.trim());
    const environments = args[2].split(',').map(env => env.trim());

    // Validate applications
    const validApps = ['RUN', 'MAX', 'WFN', 'DTO'];
    const invalidApps = applications.filter(app => !validApps.includes(app));
    if (invalidApps.length > 0) {
        console.error(`❌ Invalid applications: ${invalidApps.join(', ')}`);
        console.error(`Valid applications: ${validApps.join(', ')}`);
        process.exit(1);
    }

    // Validate environments
    const validEnvs = ['QAFIT', 'IAT', 'PROD'];
    const invalidEnvs = environments.filter(env => !validEnvs.includes(env));
    if (invalidEnvs.length > 0) {
        console.error(`❌ Invalid environments: ${invalidEnvs.join(', ')}`);
        console.error(`Valid environments: ${validEnvs.join(', ')}`);
        process.exit(1);
    }

    testBatchAuthentication(credentials, applications, environments)
        .then(result => {
            if (result.success) {
                console.log('\n🎉 Batch Authentication Test COMPLETED');
                console.log(`📊 Overall Status: ${result.summary.successful}/${result.summary.total} tests passed`);
                process.exit(0);
            } else {
                console.log('\n❌ Batch Authentication Test FAILED');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { testBatchAuthentication };
