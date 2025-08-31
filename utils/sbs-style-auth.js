#!/usr/bin/env node

/**
 * 🔗 SBS-STYLE AUTHENTICATION ADAPTER
 * 
 * Uses the proven SBS_Automation framework's login flow directly
 * Eliminates custom session management issues in auto-coder
 */

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

class SbsStyleAuth {
    constructor() {
        this.sbsPath = '/Users/arog/auto/auto/qa_automation/SBS_Automation';
        this.configPath = path.join(this.sbsPath, 'config');
        this.pagesPath = path.join(this.sbsPath, 'pages');
        this.supportPath = path.join(this.sbsPath, 'support');
        
        // Load SBS modules
        this.loadSbsModules();
    }

    loadSbsModules() {
        try {
            // Load SBS credentials manager
            this.CredentialsManager = require(path.join(this.supportPath, 'credentials-manager'));
            
            // Load SBS login page
            this.LoginPage = require(path.join(this.pagesPath, 'common', 'practitioner-login'));
            
            // Load SBS driver factory
            this.DriverFactory = require(path.join(this.supportPath, 'driver-factory'));
            
            console.log(chalk.green('✅ SBS modules loaded successfully'));
            
        } catch (error) {
            console.log(chalk.red(`❌ Failed to load SBS modules: ${error.message}`));
            throw error;
        }
    }

    async createAuthenticatedSession(clientId = '26153101', role = 'Owner', keepAlive = false) {
        console.log(chalk.blue.bold('🔗 SBS-STYLE AUTHENTICATION'));
        console.log(chalk.blue.bold('==========================='));
        console.log(`🏢 Client ID: ${chalk.cyan(clientId)}`);
        console.log(`👤 Role: ${chalk.cyan(role)}`);
        console.log(`⏰ Keep alive: ${chalk.cyan(keepAlive ? 'Yes' : 'No')}`);
        console.log('');

        try {
            // Step 1: Create browser context using SBS DriverFactory
            console.log('1️⃣  Creating browser context...');
            const context = await this.createSbsBrowserContext();
            const page = await context.newPage();
            
            console.log('   ✅ Browser context created');

            // Step 2: Load SBS configuration
            console.log('2️⃣  Loading SBS configuration...');
            const config = await this.loadSbsConfig();
            
            console.log('   ✅ Configuration loaded');

            // Step 3: Setup test data structure (mimicking SBS world.js)
            console.log('3️⃣  Setting up test data structure...');
            const testData = await this.createTestDataStructure(clientId);
            
            console.log('   ✅ Test data structure ready');

            // Step 4: Get credentials using SBS CredentialsManager
            console.log('4️⃣  Retrieving credentials...');
            const credentialsManager = new this.CredentialsManager(config);
            const userCredentials = await credentialsManager.getOwnerDetails(parseInt(clientId));
            
            console.log(`   👤 Username: ${userCredentials.ADP_USER_ID}`);
            console.log(`   🔑 Password: ${'*'.repeat(userCredentials.Password.length)}`);
            console.log('   ✅ Credentials retrieved');

            // Step 5: Perform login using SBS LoginPage
            console.log('5️⃣  Performing SBS-style login...');
            const loginPage = new this.LoginPage(page);
            
            // Navigate to login page
            await loginPage.navigateTo(config.url);
            console.log('   🌐 Navigated to login page');
            
            // Perform login using proven SBS method
            await loginPage.performRunLogin(userCredentials.ADP_USER_ID, userCredentials.Password);
            console.log('   ✅ Login completed successfully');

            // Step 6: Verify successful authentication
            console.log('6️⃣  Verifying authentication...');
            const currentUrl = page.url();
            const currentTitle = await page.title();
            
            console.log(`   📍 Current URL: ${currentUrl}`);
            console.log(`   📄 Page title: ${currentTitle}`);

            if (currentUrl.includes('multitabmessage')) {
                console.log(chalk.yellow('   ⚠️  Session conflict detected - this is expected'));
                console.log(chalk.yellow('   💡 SBS framework handles this automatically'));
            } else if (currentUrl.includes('runpayrollmain') || currentTitle.includes('RUN')) {
                console.log(chalk.green('   ✅ Successfully authenticated and on main page'));
            }

            const authResult = {
                success: true,
                page: page,
                context: context,
                browser: context.browser(),
                userCredentials: userCredentials,
                loginPage: loginPage,
                currentUrl: currentUrl,
                currentTitle: currentTitle,
                config: config,
                testData: testData,
                clientId: clientId
            };

            if (keepAlive) {
                console.log('');
                console.log('7️⃣  Session will be kept alive for testing...');
                return authResult;
            } else {
                console.log('');
                console.log('✅ SBS-style authentication completed successfully');
                return authResult;
            }

        } catch (error) {
            console.log(chalk.red(`❌ SBS-style authentication failed: ${error.message}`));
            throw error;
        }
    }

    async createSbsBrowserContext() {
        // Use SBS DriverFactory to create browser context with proper settings
        const driverFactory = new this.DriverFactory();
        
        // Get the browser configuration from SBS
        const browserConfig = {
            headless: false,
            viewport: { width: 1366, height: 768 },
            args: [
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled'
            ]
        };

        const browser = await driverFactory.createPlaywrightBrowser('chromium', browserConfig);
        const context = await browser.newContext({
            viewport: browserConfig.viewport,
            ignoreHTTPSErrors: true
        });

        return context;
    }

    async loadSbsConfig() {
        try {
            // Load the SBS configuration structure
            const configFiles = [
                'environment-config.json',
                'cross-platform.config.json'
            ];

            let config = {};

            for (const configFile of configFiles) {
                const configPath = path.join(this.configPath, configFile);
                if (fs.existsSync(configPath)) {
                    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    config = { ...config, ...fileConfig };
                }
            }

            // Set environment-specific defaults
            if (!config.url) {
                config.url = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
            }

            if (!config.owner_user_test_password) {
                config.owner_user_test_password = 'Test0507';
            }

            if (!config.owner_user_test_password_expiry) {
                config.owner_user_test_password_expiry = 30;
            }

            // Add environment
            process.env.ADP_ENV = process.env.ADP_ENV || 'IAT';

            return config;

        } catch (error) {
            console.log(chalk.yellow(`⚠️  Using default config: ${error.message}`));
            
            // Return default config that works
            return {
                url: 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c',
                owner_user_test_password: 'Test0507',
                owner_user_test_password_expiry: 30,
                environment: 'IAT'
            };
        }
    }

    async createTestDataStructure(clientId) {
        try {
            // Load homepage test data
            const homepageDataPath = path.join(this.sbsPath, 'data', 'iat', 'runmod', 'homepage', 'homepage_test_data.json');
            let homepageData = {};
            
            if (fs.existsSync(homepageDataPath)) {
                homepageData = JSON.parse(fs.readFileSync(homepageDataPath, 'utf8'));
            }

            // Ensure our client ID is set
            if (!homepageData.homepage_iid) {
                homepageData.homepage_iid = parseInt(clientId);
            }

            // Create data structure similar to SBS world.js
            return {
                config: await this.loadSbsConfig(),
                runmod: {
                    homepage: {
                        homepage_test_data: homepageData
                    }
                }
            };

        } catch (error) {
            console.log(chalk.yellow(`⚠️  Using minimal test data: ${error.message}`));
            
            return {
                config: await this.loadSbsConfig(),
                runmod: {
                    homepage: {
                        homepage_test_data: {
                            homepage_iid: parseInt(clientId),
                            payroll_home_iid: parseInt(clientId)
                        }
                    }
                }
            };
        }
    }

    async testUtilityWithSbsAuth(utilityName, clientId = '26153101') {
        console.log(chalk.blue.bold(`🧪 TESTING UTILITY: ${utilityName.toUpperCase()}`));
        console.log(chalk.blue.bold('=' .repeat(40)));
        console.log('');

        try {
            // Step 1: Create authenticated session
            console.log('🔗 Creating SBS-style authenticated session...');
            const authSession = await this.createAuthenticatedSession(clientId, 'Owner', true);
            
            console.log('');
            console.log(`🔧 Running utility: ${utilityName}`);
            console.log('');

            // Step 2: Run the utility with the authenticated session
            const utilityPath = path.join(__dirname, `${utilityName}.js`);
            
            if (!fs.existsSync(utilityPath)) {
                throw new Error(`Utility not found: ${utilityPath}`);
            }

            // Load and run the utility with SBS session
            const UtilityClass = require(utilityPath);
            
            if (typeof UtilityClass === 'function') {
                const utility = new UtilityClass(authSession.page, authSession.config);
                
                if (utility.run) {
                    const result = await utility.run();
                    console.log(chalk.green('✅ Utility completed successfully'));
                    return result;
                } else {
                    console.log(chalk.yellow('⚠️  Utility does not have a run method'));
                }
            }

        } catch (error) {
            console.log(chalk.red(`❌ Utility test failed: ${error.message}`));
            throw error;
        }
    }

    async cleanup(authSession) {
        if (authSession) {
            try {
                console.log('🧹 Cleaning up SBS session...');
                
                if (authSession.context) {
                    await authSession.context.close();
                }
                
                if (authSession.browser) {
                    await authSession.browser.close();
                }
                
                console.log('✅ Cleanup completed');
                
            } catch (error) {
                console.log(chalk.yellow(`⚠️  Cleanup warning: ${error.message}`));
            }
        }
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    const clientIndex = args.indexOf('--client');
    const clientId = clientIndex !== -1 ? args[clientIndex + 1] : '26153101';
    
    const utilityIndex = args.indexOf('--utility');
    const utility = utilityIndex !== -1 ? args[utilityIndex + 1] : null;
    
    const keepAliveFlag = args.includes('--keep-alive');

    console.log(chalk.cyan('🔗 SBS-STYLE AUTHENTICATION ADAPTER'));
    console.log(chalk.cyan('==================================='));
    console.log('');

    const sbsAuth = new SbsStyleAuth();

    try {
        if (utility) {
            // Test specific utility
            await sbsAuth.testUtilityWithSbsAuth(utility, clientId);
        } else {
            // Just create authenticated session
            const authSession = await sbsAuth.createAuthenticatedSession(clientId, 'Owner', keepAliveFlag);
            
            console.log('');
            console.log(chalk.green.bold('🎉 SBS-STYLE AUTHENTICATION SUCCESSFUL!'));
            console.log('');
            console.log('📋 Session Details:');
            console.log(`   🏢 Client ID: ${authSession.clientId}`);
            console.log(`   👤 Username: ${authSession.userCredentials.ADP_USER_ID}`);
            console.log(`   🌐 Current URL: ${authSession.currentUrl}`);
            console.log(`   📄 Page Title: ${authSession.currentTitle}`);

            if (keepAliveFlag) {
                console.log('');
                console.log(chalk.cyan('⏰ Session is kept alive for testing. Press Ctrl+C to exit.'));
                
                // Keep process alive
                process.on('SIGINT', async () => {
                    console.log('');
                    console.log('🛑 Received interrupt signal...');
                    await sbsAuth.cleanup(authSession);
                    process.exit(0);
                });
                
                // Keep alive indefinitely
                await new Promise(() => {});
            } else {
                await sbsAuth.cleanup(authSession);
            }
        }
        
    } catch (error) {
        console.log('');
        console.log(chalk.red.bold('💥 SBS AUTHENTICATION ERROR!'));
        console.log(chalk.red(`Error: ${error.message}`));
        process.exit(1);
    }
}

// Usage help
function showUsage() {
    console.log(chalk.cyan('🔗 SBS-STYLE AUTHENTICATION ADAPTER'));
    console.log(chalk.cyan('==================================='));
    console.log('');
    console.log('Usage:');
    console.log('  node sbs-style-auth.js --client 26153101');
    console.log('  node sbs-style-auth.js --client 26153101 --keep-alive');
    console.log('  node sbs-style-auth.js --client 26153101 --utility broken-link-checker');
    console.log('');
    console.log('Options:');
    console.log('  --client <id>      Client ID to use (default: 26153101)');
    console.log('  --utility <name>   Run specific utility with authentication');
    console.log('  --keep-alive       Keep session alive for manual testing');
    console.log('  --help            Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  # Test authentication only');
    console.log('  node sbs-style-auth.js');
    console.log('');
    console.log('  # Keep session alive for manual testing');
    console.log('  node sbs-style-auth.js --keep-alive');
    console.log('');
    console.log('  # Test broken link checker with authentication');
    console.log('  node sbs-style-auth.js --utility role-based-broken-links-test');
}

// Run if executed directly
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        showUsage();
    } else {
        main().catch(console.error);
    }
}

module.exports = SbsStyleAuth;
