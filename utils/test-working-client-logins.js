const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');
const fs = require('fs');

async function testWorkingClientLogins() {
    console.log('🎯 TESTING WORKING CLIENT LOGINS FROM GOLDEN DATA');
    console.log('===============================================');
    
    // Read golden data
    const goldenDataPath = '/Users/arog/auto/auto/qa_automation/SBS_Automation/data/iat/runmod/billing/golden_data.json';
    const goldenData = JSON.parse(fs.readFileSync(goldenDataPath, 'utf8'));
    
    // Working CLIENT accounts
    const workingAccounts = [
        {
            role: 'Max Capacity Client',
            username: goldenData.maxcapacity_username, // Sai@34162645
            password: goldenData.maxcapacity_password, // ADPadp01
            iid: goldenData.maxcapacity_iid // 34162645
        },
        {
            role: 'MCA Client', 
            username: goldenData.mca_username, // owner@24875701
            password: goldenData.mca_password, // Test1357
            iid: goldenData.mca_iid // 24875701
        }
    ];
    
    console.log(`✅ Testing ${workingAccounts.length} verified working CLIENT accounts`);
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500,
        args: [
            '--start-maximized',
            '--no-default-browser-check',
            '--disable-web-security'
        ]
    });
    
    const context = await browser.newContext({
        viewport: null, // Full screen
        ignoreHTTPSErrors: true
    });
    
    const auth = new UniversalAuthenticationHandler();
    const results = [];
    
    for (let i = 0; i < workingAccounts.length; i++) {
        const account = workingAccounts[i];
        
        console.log(`\n🧪 TEST ${i + 1}/${workingAccounts.length}: ${account.role}`);
        console.log('=' + '='.repeat(60));
        
        const page = await context.newPage();
        
        try {
            const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
            const credentials = `${account.username}/${account.password}`;
            
            console.log(`👤 Username: ${account.username}`);
            console.log(`🏢 IID: ${account.iid}`);
            console.log(`🎭 Role: ${account.role}`);
            console.log(`🔗 Target: ${targetUrl}`);
            
            const startTime = Date.now();
            const result = await auth.performUniversalAuthentication(page, targetUrl, credentials);
            const endTime = Date.now();
            
            const testResult = {
                role: account.role,
                username: account.username,
                iid: account.iid,
                success: result.success,
                finalUrl: result.finalUrl,
                error: result.error,
                totalTime: endTime - startTime,
                loginTime: result.totalTime
            };
            
            results.push(testResult);
            
            if (result.success) {
                console.log(`✅ ${account.role} - LOGIN SUCCESSFUL!`);
                console.log(`🎉 Final URL: ${result.finalUrl}`);
                console.log(`⏱️  Login Time: ${testResult.totalTime}ms`);
                
                // Keep browser open for 5 seconds to observe
                console.log('🔍 Keeping page open for 5 seconds...');
                await page.waitForTimeout(5000);
                
            } else {
                console.log(`❌ ${account.role} - LOGIN FAILED`);
                console.log(`📝 Error: ${result.error}`);
            }
            
        } catch (error) {
            console.log(`💥 ${account.role} - TEST ERROR: ${error.message}`);
            results.push({
                role: account.role,
                username: account.username,
                iid: account.iid,
                success: false,
                error: error.message,
                finalUrl: null,
                totalTime: null,
                loginTime: null
            });
        } finally {
            await page.close();
        }
    }
    
    await browser.close();
    
    // Generate report
    generateClientReport(results, goldenData);
    
    return results;
}

function generateClientReport(results, goldenData) {
    console.log('\n📊 CLIENT LOGIN VALIDATION REPORT');
    console.log('=================================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful Logins: ${successful.length}`);
    console.log(`❌ Failed Logins: ${failed.length}`);
    console.log(`📊 Total Tests: ${results.length}`);
    console.log(`🎯 Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
    
    console.log('\n🎉 SUCCESSFUL CLIENT ACCOUNTS:');
    console.log('=============================');
    successful.forEach(result => {
        console.log(`✅ ${result.role}`);
        console.log(`   👤 Username: ${result.username}`);
        console.log(`   🏢 IID: ${result.iid}`);
        console.log(`   ⏱️  Login Time: ${result.totalTime}ms`);
        console.log(`   🌐 Final URL: ${result.finalUrl}`);
        console.log('');
    });
    
    if (failed.length > 0) {
        console.log('\n❌ FAILED CLIENT ACCOUNTS:');
        console.log('=========================');
        failed.forEach(result => {
            console.log(`❌ ${result.role} (${result.username})`);
            console.log(`   Error: ${result.error}`);
        });
    }
    
    console.log('\n🔍 ADDITIONAL GOLDEN DATA INFO:');
    console.log('==============================');
    console.log(`🏢 Company IID: ${goldenData.company_iid}`);
    console.log(`📊 Total Data Entries: ${Object.keys(goldenData).length}`);
    console.log(`🔢 Wholesale Child IID: ${goldenData.wholesale_child_iid}`);
    console.log(`🔢 Wholesale Firm IID: ${goldenData.wholesale_firm_iid}`);
    console.log(`🏢 Wholesale Company: ${goldenData.wholesale_company_name}`);
    
    // Save detailed report
    const reportData = {
        testResults: results,
        goldenDataSummary: {
            company_iid: goldenData.company_iid,
            maxcapacity_iid: goldenData.maxcapacity_iid,
            mca_iid: goldenData.mca_iid,
            wholesale_child_iid: goldenData.wholesale_child_iid,
            wholesale_firm_iid: goldenData.wholesale_firm_iid,
            wholesale_company_name: goldenData.wholesale_company_name
        },
        testSummary: {
            totalTests: results.length,
            successful: successful.length,
            failed: failed.length,
            successRate: ((successful.length / results.length) * 100).toFixed(1) + '%',
            testDate: new Date().toISOString()
        }
    };
    
    const reportPath = `/Users/arog/auto/auto/qa_automation/auto-coder/reports/working_client_logins_${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved: ${reportPath}`);
    
    console.log('\n✅ RECOMMENDATION FOR UTILITIES:');
    console.log('===============================');
    console.log('🎯 These CLIENT accounts are VALIDATED and ready for utility testing:');
    successful.forEach(result => {
        console.log(`   ✅ ${result.username} (${result.role})`);
    });
    console.log('\n🚀 You can now proceed to test your utilities with these working credentials!');
}

// Run the focused test
testWorkingClientLogins().catch(console.error);
