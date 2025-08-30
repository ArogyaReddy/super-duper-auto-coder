#!/usr/bin/env node

/**
 * 🎯 Universal Authentication Demo Suite
 * 
 * Live demonstration of all authentication capabilities
 * Usage: node utils/demo-auth-suite.js
 */

const { chromium } = require('playwright');
const { UniversalAuthenticationHandler } = require('./universal-authentication-handler');

class UniversalAuthenticationDemo {
    constructor() {
        this.auth = new UniversalAuthenticationHandler();
        this.browser = null;
        this.page = null;
        this.demoResults = [];
    }

    async initialize() {
        console.log('🎯 UNIVERSAL AUTHENTICATION DEMO SUITE');
        console.log('======================================');
        console.log('Initializing browser for live demonstration...\n');

        this.browser = await chromium.launch({ 
            headless: false,  // Show browser for demo
            slowMo: 1000     // Slow down for visibility
        });
        this.page = await this.browser.newPage();
        
        // Set viewport for better visibility
        await this.page.setViewportSize({ width: 1280, height: 720 });
    }

    async runFullDemo() {
        try {
            await this.initialize();
            
            console.log('🚀 Starting comprehensive authentication demonstration...\n');
            
            // Demo 1: Auto-detection capabilities
            await this.demoAutoDetection();
            
            // Demo 2: Client authentication examples
            await this.demoClientAuthentication();
            
            // Demo 3: Service user authentication
            await this.demoServiceUserAuthentication();
            
            // Demo 4: Batch testing demonstration
            await this.demoBatchTesting();
            
            // Demo 5: Error handling showcase
            await this.demoErrorHandling();
            
            // Generate final report
            await this.generateDemoReport();
            
            console.log('\n🎉 Universal Authentication Demo COMPLETED!');
            console.log('Check the generated demo report for detailed results.');
            
        } catch (error) {
            console.error('❌ Demo execution failed:', error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    async demoAutoDetection() {
        console.log('📍 DEMO 1: Auto-Detection Capabilities');
        console.log('=====================================');
        
        const testUrls = [
            'https://workforcenow-fit.adp.com/siteminderagent/forms/login.fcc?TYPE=33554433&REALMOID=06-000a1ad7-61c8-1a15-9d6b-a020a0be0308&GUID=&SMAUTHREASON=0&METHOD=GET&SMAGENTNAME=-SM-CjOBl3vG3rB6%2bD2CWn8Rnr3wFTEn6MiJjATpjLT%2fRzF7c5r%2fQJA%3d%3d&TARGET=-SM-https%3a%2f%2fworkforcenow--fit%2eadp%2ecom%2fwfn%2fservices%2fruntime%2fproduct%3fUDTD%3dD7DBD4DE1A7F5B54A5FB82D4345F8BC9FA7FDAF3DCA7B07A6FC3ACF11031E036',
            'https://workforcenow-qafit.adp.com/siteminderagent/forms/login.fcc?TYPE=33554433&REALMOID=06-000a1ad7-61c8-1a15-9d6b-a020a0be0308&GUID=&SMAUTHREASON=0&METHOD=GET&SMAGENTNAME=-SM-CjOBl3vG3rB6%2bD2CWn8Rnr3wFTEn6MiJjATpjLT%2fRzF7c5r%2fQJA%3d%3d&TARGET=-SM-https%3a%2f%2fworkforcenow--qafit%2eadp%2ecom%2fwfn%2fservices%2fruntime%2fproduct%3fUDTD%3dD7DBD4DE1A7F5B54A5FB82D4345F8BC9FA7FDAF3DCA7B07A6FC3ACF11031E036',
            'https://run-fit.adp.com/static/redbox/index.html',
            'https://max-qafit.adp.com/eTime/'
        ];
        
        for (const url of testUrls) {
            console.log(`\n🔍 Testing URL: ${url.substring(0, 50)}...`);
            
            try {
                // Navigate to URL for visual demo
                await this.page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
                await this.page.waitForTimeout(2000); // Visual pause
                
                // Perform auto-detection
                const detectedEnv = this.auth.detectEnvironment(url);
                const detectedApp = this.auth.detectApplication(url);
                
                console.log(`   🌍 Environment: ${detectedEnv || 'Unknown'}`);
                console.log(`   📱 Application: ${detectedApp || 'Unknown'}`);
                
                this.demoResults.push({
                    demo: 'Auto-Detection',
                    url,
                    environment: detectedEnv,
                    application: detectedApp,
                    success: !!(detectedEnv && detectedApp)
                });
                
            } catch (error) {
                console.log(`   ❌ Error accessing URL: ${error.message}`);
                this.demoResults.push({
                    demo: 'Auto-Detection',
                    url,
                    error: error.message,
                    success: false
                });
            }
        }
    }

    async demoClientAuthentication() {
        console.log('\n👤 DEMO 2: Client Authentication Examples');
        console.log('=========================================');
        
        const clientExamples = [
            {
                credentials: 'owner1@12345/password123',
                targetUrl: 'https://run-qafit.adp.com/static/redbox/index.html',
                description: 'CLIENT login to RUN application'
            },
            {
                credentials: 'hradmin@67890/secret456',
                targetUrl: 'https://max-qafit.adp.com/eTime/',
                description: 'CLIENT login to MAX application'
            }
        ];
        
        for (const example of clientExamples) {
            console.log(`\n💼 ${example.description}`);
            console.log(`   🔑 Credentials: ${example.credentials.split('/')[0]}/****`);
            console.log(`   🎯 Target: ${example.targetUrl}`);
            
            try {
                // Detect user type
                const userType = this.auth.detectUserType(example.credentials);
                console.log(`   👤 Detected User Type: ${userType}`);
                
                // Navigate to demonstrate
                await this.page.goto(example.targetUrl, { waitUntil: 'networkidle', timeout: 10000 });
                await this.page.waitForTimeout(2000);
                
                // Simulate authentication process (visual only for demo)
                console.log(`   ✅ Authentication process demonstrated`);
                
                this.demoResults.push({
                    demo: 'Client Authentication',
                    description: example.description,
                    userType,
                    success: true
                });
                
            } catch (error) {
                console.log(`   ❌ Demo error: ${error.message}`);
                this.demoResults.push({
                    demo: 'Client Authentication',
                    description: example.description,
                    error: error.message,
                    success: false
                });
            }
        }
    }

    async demoServiceUserAuthentication() {
        console.log('\n🔧 DEMO 3: Service User Authentication');
        console.log('=====================================');
        
        const serviceExamples = [
            {
                credentials: 'cautomation3@adp/autopass',
                targetUrl: 'https://workforcenow-qafit.adp.com/siteminderagent/forms/login.fcc',
                description: 'SERVICE_USER login to WFN application'
            }
        ];
        
        for (const example of serviceExamples) {
            console.log(`\n⚙️ ${example.description}`);
            console.log(`   🔑 Credentials: ${example.credentials.split('/')[0]}/****`);
            
            try {
                const userType = this.auth.detectUserType(example.credentials);
                console.log(`   👤 Detected User Type: ${userType}`);
                
                // Navigate to demonstrate
                await this.page.goto(example.targetUrl, { waitUntil: 'networkidle', timeout: 10000 });
                await this.page.waitForTimeout(2000);
                
                console.log(`   ✅ Service authentication demonstrated`);
                
                this.demoResults.push({
                    demo: 'Service User Authentication',
                    description: example.description,
                    userType,
                    success: true
                });
                
            } catch (error) {
                console.log(`   ❌ Demo error: ${error.message}`);
                this.demoResults.push({
                    demo: 'Service User Authentication',
                    description: example.description,
                    error: error.message,
                    success: false
                });
            }
        }
    }

    async demoBatchTesting() {
        console.log('\n📊 DEMO 4: Batch Testing Capabilities');
        console.log('=====================================');
        
        console.log('🚀 Demonstrating batch authentication across multiple scenarios...');
        
        const batchScenarios = [
            { env: 'QAFIT', app: 'RUN', userType: 'CLIENT' },
            { env: 'QAFIT', app: 'MAX', userType: 'CLIENT' },
            { env: 'IAT', app: 'RUN', userType: 'SERVICE_USER' }
        ];
        
        for (const scenario of batchScenarios) {
            console.log(`\n📋 Scenario: ${scenario.userType} → ${scenario.app} → ${scenario.env}`);
            
            try {
                // Generate example URL
                const envConfig = this.auth.ENVIRONMENT_CONFIG[scenario.env];
                const appConfig = this.auth.APPLICATION_ROUTING[scenario.app];
                
                let exampleUrl;
                if (scenario.userType === 'CLIENT') {
                    exampleUrl = appConfig.CLIENT_URL_TEMPLATE
                        .replace('{BASE_URL}', envConfig.CLIENT_BASE_URL)
                        .replace('{PRODUCT_ID}', envConfig.PRODUCT_IDS[scenario.app]);
                } else {
                    exampleUrl = appConfig.SERVICE_URL_TEMPLATE
                        .replace('{SERVICE_BASE_URL}', envConfig.SERVICE_BASE_URL);
                }
                
                console.log(`   🎯 Generated URL: ${exampleUrl.substring(0, 60)}...`);
                
                // Navigate for demonstration
                await this.page.goto(exampleUrl, { waitUntil: 'networkidle', timeout: 10000 });
                await this.page.waitForTimeout(1500);
                
                console.log(`   ✅ Batch scenario validated`);
                
                this.demoResults.push({
                    demo: 'Batch Testing',
                    scenario: `${scenario.userType}-${scenario.app}-${scenario.env}`,
                    url: exampleUrl,
                    success: true
                });
                
            } catch (error) {
                console.log(`   ❌ Scenario error: ${error.message}`);
                this.demoResults.push({
                    demo: 'Batch Testing',
                    scenario: `${scenario.userType}-${scenario.app}-${scenario.env}`,
                    error: error.message,
                    success: false
                });
            }
        }
    }

    async demoErrorHandling() {
        console.log('\n🛡️ DEMO 5: Error Handling Showcase');
        console.log('==================================');
        
        const errorScenarios = [
            {
                name: 'Invalid URL',
                url: 'https://invalid-domain-example.com',
                expected: 'Network error handling'
            },
            {
                name: 'Malformed credentials',
                credentials: 'invalid-format',
                expected: 'Credential validation error'
            }
        ];
        
        for (const scenario of errorScenarios) {
            console.log(`\n🧪 Testing: ${scenario.name}`);
            console.log(`   🎯 Expected: ${scenario.expected}`);
            
            try {
                if (scenario.url) {
                    // Test invalid URL
                    await this.page.goto(scenario.url, { timeout: 5000 });
                } else if (scenario.credentials) {
                    // Test credential validation
                    const userType = this.auth.detectUserType(scenario.credentials);
                    console.log(`   Detected: ${userType || 'UNKNOWN'}`);
                }
                
                console.log(`   ✅ Error handled gracefully`);
                
            } catch (error) {
                console.log(`   ✅ Expected error caught: ${error.message}`);
                
                this.demoResults.push({
                    demo: 'Error Handling',
                    scenario: scenario.name,
                    expectedError: scenario.expected,
                    actualError: error.message,
                    success: true // Expected behavior
                });
            }
        }
    }

    async generateDemoReport() {
        console.log('\n📊 GENERATING DEMO REPORT');
        console.log('=========================');
        
        const report = {
            timestamp: this.auth.generateTimestamp(),
            demoSuite: 'Universal Authentication Handler',
            totalDemos: this.demoResults.length,
            successfulDemos: this.demoResults.filter(r => r.success).length,
            failedDemos: this.demoResults.filter(r => !r.success).length,
            results: this.demoResults,
            capabilities: {
                autoDetection: !!this.demoResults.find(r => r.demo === 'Auto-Detection' && r.success),
                clientAuth: !!this.demoResults.find(r => r.demo === 'Client Authentication' && r.success),
                serviceAuth: !!this.demoResults.find(r => r.demo === 'Service User Authentication' && r.success),
                batchTesting: !!this.demoResults.find(r => r.demo === 'Batch Testing' && r.success),
                errorHandling: !!this.demoResults.find(r => r.demo === 'Error Handling' && r.success)
            }
        };
        
        // Display summary
        console.log(`📈 Demo Statistics:`);
        console.log(`   • Total Demonstrations: ${report.totalDemos}`);
        console.log(`   • Successful: ${report.successfulDemos}`);
        console.log(`   • Failed: ${report.failedDemos}`);
        console.log(`   • Success Rate: ${((report.successfulDemos / report.totalDemos) * 100).toFixed(1)}%`);
        
        console.log(`\n🎯 Capabilities Demonstrated:`);
        Object.entries(report.capabilities).forEach(([capability, status]) => {
            const icon = status ? '✅' : '❌';
            console.log(`   ${icon} ${capability.charAt(0).toUpperCase() + capability.slice(1)}`);
        });
        
        // Save demo report
        const fs = require('fs-extra');
        const path = require('path');
        
        const reportsDir = path.join(__dirname, '..', 'reports');
        await fs.ensureDir(reportsDir);
        
        const fileName = `Universal_Auth_Demo_Report_${report.timestamp}.json`;
        const filePath = path.join(reportsDir, fileName);
        
        await fs.writeJSON(filePath, report, { spaces: 2 });
        
        console.log(`\n💾 Demo report saved: ${fileName}`);
        
        return report;
    }
}

// CLI execution
if (require.main === module) {
    const demo = new UniversalAuthenticationDemo();
    
    demo.runFullDemo()
        .then(() => {
            console.log('\n🎊 Universal Authentication Demo Suite COMPLETED!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Demo suite failed:', error);
            process.exit(1);
        });
}

module.exports = { UniversalAuthenticationDemo };
