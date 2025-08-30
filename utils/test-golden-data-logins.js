const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');
const fs = require('fs');
const path = require('path');

async function testAllGoldenDataLogins() {
    console.log('🏆 TESTING ALL GOLDEN DATA LOGINS');
    console.log('=================================');
    
    // Read golden data
    const goldenDataPath = '/Users/arog/auto/auto/qa_automation/SBS_Automation/data/iat/runmod/billing/golden_data.json';
    const goldenData = JSON.parse(fs.readFileSync(goldenDataPath, 'utf8'));
    
    console.log(`📊 Found ${Object.keys(goldenData).length} data entries`);
    
    // Extract user credentials
    const userCredentials = extractUserCredentials(goldenData);
    console.log(`👥 Extracted ${userCredentials.length} user accounts to test`);
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 300,
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
    
    for (let i = 0; i < userCredentials.length; i++) {
        const user = userCredentials[i];
        console.log(`\n🧪 TEST ${i + 1}/${userCredentials.length}: ${user.role}`);
        console.log('=' + '='.repeat(50));
        
        const page = await context.newPage();
        
        try {
            // Determine target URL based on user type
            const targetUrl = getTargetUrl(user);
            const credentials = `${user.username}/${user.password}`;
            
            console.log(`👤 User: ${user.username}`);
            console.log(`🎭 Role: ${user.role}`);
            console.log(`🌐 Target: ${targetUrl}`);
            
            const result = await auth.performUniversalAuthentication(page, targetUrl, credentials);
            
            const testResult = {
                role: user.role,
                username: user.username,
                userType: user.userType,
                success: result.success,
                finalUrl: result.finalUrl,
                error: result.error,
                totalTime: result.totalTime
            };
            
            results.push(testResult);
            
            if (result.success) {
                console.log(`✅ ${user.role} - LOGIN SUCCESSFUL`);
                console.log(`🎉 Final URL: ${result.finalUrl}`);
            } else {
                console.log(`❌ ${user.role} - LOGIN FAILED`);
                console.log(`📝 Error: ${result.error}`);
            }
            
            // Wait a moment before next test
            await page.waitForTimeout(2000);
            
        } catch (error) {
            console.log(`💥 ${user.role} - TEST ERROR: ${error.message}`);
            results.push({
                role: user.role,
                username: user.username,
                userType: user.userType,
                success: false,
                error: error.message,
                finalUrl: null,
                totalTime: null
            });
        } finally {
            await page.close();
        }
    }
    
    await browser.close();
    
    // Generate comprehensive report
    generateLoginReport(results);
    
    return results;
}

function extractUserCredentials(goldenData) {
    const credentials = [];
    
    // SERVICE_USER accounts (ending with @adp)
    const serviceUsers = [
        { key: 'customerservice', role: 'Customer Service' },
        { key: 'hr411service', role: 'HR 411 Service' },
        { key: 'taxassociate', role: 'Tax Associate' },
        { key: 'adminassociate', role: 'Admin Associate' },
        { key: 'tssassociate', role: 'TSS Associate' },
        { key: 'tsalesassociate', role: 'Telesales Associate' },
        { key: 'insuranceservices', role: 'Insurance Services' },
        { key: 'teledatarep', role: 'Teledata Rep' },
        { key: 'implementationspecialist', role: 'Implementation Specialist' },
        { key: 'corpsupport', role: 'Corp Support' },
        { key: 'supportassociate', role: 'Support Associate' },
        { key: 'tsrassociate', role: 'TSR Associate' },
        { key: 'bankingassociate', role: 'Banking Associate' },
        { key: 'managerassociate', role: 'Manager Associate' },
        { key: 'fltadmin', role: 'FLT Admin' },
        { key: 'controlassociate', role: 'Control Associate' },
        { key: 'saleshelpdesk', role: 'Sales Help Desk' },
        { key: 'callmentor', role: 'Call Mentor' },
        { key: 'hrbpassociate', role: 'HRBP Associate' },
        { key: 'superuserassociate', role: 'Super User Associate' }
    ];
    
    serviceUsers.forEach(user => {
        const usernameKey = `${user.key}_username`;
        const passwordKey = `${user.key}_password`;
        
        if (goldenData[usernameKey] && goldenData[passwordKey]) {
            credentials.push({
                role: user.role,
                username: goldenData[usernameKey],
                password: goldenData[passwordKey],
                userType: 'SERVICE_USER'
            });
        }
    });
    
    // CLIENT accounts (format username@IID)
    const clientUsers = [
        {
            role: 'Max Capacity Client',
            username: goldenData.maxcapacity_username,
            password: goldenData.maxcapacity_password,
            userType: 'CLIENT'
        },
        {
            role: 'MCA Client',
            username: goldenData.mca_username,
            password: goldenData.mca_password,
            userType: 'CLIENT'
        }
    ];
    
    clientUsers.forEach(user => {
        if (user.username && user.password) {
            credentials.push(user);
        }
    });
    
    return credentials;
}

function getTargetUrl(user) {
    if (user.userType === 'CLIENT') {
        // CLIENT users - online portal
        return 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
    } else {
        // SERVICE_USER - internal portal  
        return 'https://runpayroll-iat.es.ad.adp.com/@836D254C-789B-41B8-8052-D48A639E95D8/admin/login.aspx';
    }
}

function generateLoginReport(results) {
    console.log('\n📊 GOLDEN DATA LOGIN REPORT');
    console.log('===========================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful Logins: ${successful.length}`);
    console.log(`❌ Failed Logins: ${failed.length}`);
    console.log(`📊 Total Tests: ${results.length}`);
    console.log(`🎯 Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
    
    console.log('\n✅ SUCCESSFUL LOGINS:');
    console.log('====================');
    successful.forEach(result => {
        console.log(`✅ ${result.role} (${result.username}) - ${result.userType}`);
    });
    
    if (failed.length > 0) {
        console.log('\n❌ FAILED LOGINS:');
        console.log('================');
        failed.forEach(result => {
            console.log(`❌ ${result.role} (${result.username}) - ${result.userType}`);
            console.log(`   Error: ${result.error}`);
        });
    }
    
    // Group by user type
    console.log('\n📊 RESULTS BY USER TYPE:');
    console.log('========================');
    
    const serviceUsers = results.filter(r => r.userType === 'SERVICE_USER');
    const clientUsers = results.filter(r => r.userType === 'CLIENT');
    
    console.log(`🔧 SERVICE_USER accounts: ${serviceUsers.filter(r => r.success).length}/${serviceUsers.length} successful`);
    console.log(`👤 CLIENT accounts: ${clientUsers.filter(r => r.success).length}/${clientUsers.length} successful`);
    
    // Save detailed report
    const reportPath = `/Users/arog/auto/auto/qa_automation/auto-coder/reports/golden_data_login_report_${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`📄 Detailed report saved: ${reportPath}`);
}

// Run the test
testAllGoldenDataLogins().catch(console.error);
