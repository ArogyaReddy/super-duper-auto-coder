const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');
const fs = require('fs');

async function testSingleLogin(username, password, userType) {
    console.log(`🎯 TESTING SINGLE LOGIN: ${userType}`);
    console.log('========================================');
    
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
    
    const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
    const credentials = `${username}/${password}`;
    
    console.log(`👤 Username: ${username}`);
    console.log(`🔑 Password: ******* (${password})`);
    console.log(`🌍 Environment: IAT`);
    console.log(`📱 Application: RUN`);
    console.log('');
    
    try {
        const startTime = Date.now();
        const result = await auth.performUniversalAuthentication(page, targetUrl, credentials);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (result.success) {
            console.log(`✅ ${userType} LOGIN SUCCESSFUL!`);
            console.log(`🎉 Final URL: ${result.finalUrl}`);
            console.log(`⏱️  Duration: ${duration}ms`);
            
            // Keep browser open for 5 seconds to observe
            console.log('🔍 Keeping browser open for 5 seconds...');
            await page.waitForTimeout(5000);
            
            return { success: true, userType, username, duration, finalUrl: result.finalUrl };
            
        } else {
            console.log(`❌ ${userType} LOGIN FAILED`);
            console.log(`📝 Error: ${result.error}`);
            
            // Keep browser open for 3 seconds to see error
            await page.waitForTimeout(3000);
            
            return { success: false, userType, username, error: result.error };
        }
        
    } catch (error) {
        console.error(`💥 Test execution failed for ${userType}:`, error.message);
        return { success: false, userType, username, error: error.message };
        
    } finally {
        await browser.close();
        console.log(`🏁 ${userType} test completed\n`);
    }
}

async function testAllGoldenDataUsers() {
    console.log('🎯 TESTING ALL GOLDEN DATA USERS WITH CORRECT PASSWORD');
    console.log('=====================================================');
    
    // Read the golden data file
    const goldenDataPath = '/Users/arog/auto/auto/qa_automation/SBS_Automation/data/iat/runmod/homepage/homeCredentials.json';
    const goldenData = JSON.parse(fs.readFileSync(goldenDataPath, 'utf8'));
    
    // Correct password
    const correctPassword = 'ADPadp01$';
    
    // User mappings
    const userMappings = [
        { type: 'Owner', username: goldenData.Owner.Owner_username },
        { type: 'PayrollAdmin', username: goldenData.PayrollAdmin.PayrollAdmin_username },
        { type: 'HRAdmin', username: goldenData.HRAdmin.HRAdmin_username },
        { type: 'HR411Only', username: goldenData.HR411Only.HR411Only_username },
        { type: 'PayrollHRAdmin', username: goldenData.PayrollHRAdmin.PayrollHRAdmin_username },
        { type: 'ClientUpdate', username: goldenData.ClientUpdate.ClientUpdate_username },
        { type: 'CPAView', username: goldenData.CPAView.CPAView_username }
    ];
    
    const results = [];
    
    for (let i = 0; i < userMappings.length; i++) {
        const user = userMappings[i];
        console.log(`\n📝 Testing ${i + 1}/${userMappings.length}: ${user.type}`);
        
        const result = await testSingleLogin(user.username, correctPassword, user.type);
        results.push(result);
        
        // Wait between tests
        if (i < userMappings.length - 1) {
            console.log('⏳ Waiting 2 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Generate summary
    console.log('\n\n📊 FINAL SUMMARY REPORT');
    console.log('========================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful logins: ${successful.length}/${results.length}`);
    console.log(`❌ Failed logins: ${failed.length}/${results.length}`);
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
    
    return results;
}

// Run the test
testAllGoldenDataUsers().catch(console.error);
