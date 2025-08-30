const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');
const fs = require('fs');
const path = require('path');

async function testCorrectPasswordLogins() {
    console.log('🎯 TESTING ALL GOLDEN DATA LOGINS WITH CORRECT PASSWORD');
    console.log('======================================================');
    
    // Read the golden data file
    const goldenDataPath = '/Users/arog/auto/auto/qa_automation/SBS_Automation/data/iat/runmod/homepage/homeCredentials.json';
    const goldenData = JSON.parse(fs.readFileSync(goldenDataPath, 'utf8'));
    
    // Correct password provided by user
    const correctPassword = 'ADPadp01$';
    
    // Extract all user types from golden data
    const userTypes = [
        'Owner',
        'PayrollAdmin', 
        'HRAdmin',
        'HR411Only',
        'PayrollHRAdmin',
        'ClientUpdate',
        'CPAView'
    ];
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000,
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
    
    // IAT RUN URL
    const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
    
    const results = [];
    
    console.log(`🧪 Testing ${userTypes.length} different user types from golden data...`);
    console.log(`🔑 Using correct password: ${correctPassword}`);
    console.log(`🌍 Environment: IAT`);
    console.log(`📱 Application: RUN`);
    console.log('');
    
    for (let i = 0; i < userTypes.length; i++) {
        const userType = userTypes[i];
        const userData = goldenData[userType];
        
        if (!userData) {
            console.log(`⚠️  User type ${userType} not found in golden data`);
            continue;
        }
        
        // Extract username and use correct password
        const usernameKey = Object.keys(userData).find(key => key.includes('username'));
        const username = userData[usernameKey];
        
        const credentials = `${username}/${correctPassword}`;
        
        console.log(`\n🧪 TEST ${i + 1}/${userTypes.length}: ${userType}`);
        console.log(`==============================`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ******* (using correct password)`);
        
        try {
            const startTime = Date.now();
            
            // Create a new page for each test to avoid conflicts
            const testPage = await context.newPage();
            
            const result = await auth.performUniversalAuthentication(testPage, targetUrl, credentials);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            if (result.success) {
                console.log(`✅ ${userType} LOGIN SUCCESSFUL!`);
                console.log(`🎉 Final URL: ${result.finalUrl}`);
                console.log(`⏱️  Duration: ${duration}ms`);
                
                results.push({
                    userType,
                    username,
                    status: 'SUCCESS',
                    finalUrl: result.finalUrl,
                    duration,
                    error: null
                });
                
                // Take success screenshot
                await testPage.screenshot({ 
                    path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/golden-${userType}-success-${Date.now()}.png`,
                    fullPage: true 
                });
                
            } else {
                console.log(`❌ ${userType} LOGIN FAILED`);
                console.log(`📝 Error: ${result.error}`);
                
                results.push({
                    userType,
                    username,
                    status: 'FAILED',
                    finalUrl: testPage.url(),
                    duration,
                    error: result.error
                });
                
                // Take failure screenshot
                await testPage.screenshot({ 
                    path: `/Users/arog/auto/auto/qa_automation/auto-coder/screenshots/golden-${userType}-failed-${Date.now()}.png`,
                    fullPage: true 
                });
            }
            
            await testPage.close();
            
            // Wait between tests
            if (i < userTypes.length - 1) {
                console.log('⏳ Waiting 3 seconds before next test...');
                await page.waitForTimeout(3000);
            }
            
        } catch (error) {
            console.error(`💥 Test execution failed for ${userType}:`, error.message);
            
            results.push({
                userType,
                username,
                status: 'ERROR',
                finalUrl: null,
                duration: null,
                error: error.message
            });
        }
    }
    
    // Generate summary report
    console.log('\n\n📊 GOLDEN DATA LOGIN TESTING SUMMARY');
    console.log('=====================================');
    
    const successful = results.filter(r => r.status === 'SUCCESS');
    const failed = results.filter(r => r.status === 'FAILED');
    const errors = results.filter(r => r.status === 'ERROR');
    
    console.log(`✅ Successful logins: ${successful.length}/${results.length}`);
    console.log(`❌ Failed logins: ${failed.length}/${results.length}`);
    console.log(`💥 Error logins: ${errors.length}/${results.length}`);
    console.log('');
    
    if (successful.length > 0) {
        console.log('✅ SUCCESSFUL LOGINS:');
        successful.forEach(r => {
            console.log(`   • ${r.userType} (${r.username}) - ${r.duration}ms`);
        });
        console.log('');
    }
    
    if (failed.length > 0) {
        console.log('❌ FAILED LOGINS:');
        failed.forEach(r => {
            console.log(`   • ${r.userType} (${r.username}) - ${r.error}`);
        });
        console.log('');
    }
    
    if (errors.length > 0) {
        console.log('💥 ERROR LOGINS:');
        errors.forEach(r => {
            console.log(`   • ${r.userType} (${r.username}) - ${r.error}`);
        });
        console.log('');
    }
    
    // Save detailed report
    const reportPath = `/Users/arog/auto/auto/qa_automation/auto-coder/reports/golden-data-login-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
        testDate: new Date().toISOString(),
        environment: 'IAT',
        application: 'RUN',
        correctPassword: correctPassword,
        summary: {
            total: results.length,
            successful: successful.length,
            failed: failed.length,
            errors: errors.length
        },
        results
    }, null, 2));
    
    console.log(`📄 Detailed report saved: ${reportPath}`);
    
    await browser.close();
    console.log('🏁 Golden data login testing completed');
    
    return {
        summary: { successful: successful.length, failed: failed.length, errors: errors.length },
        results
    };
}

// Run the test
testCorrectPasswordLogins().catch(console.error);
