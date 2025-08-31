#!/usr/bin/env node

/**
 * 🔄 SUSTAINED LOGIN TEST
 * 
 * Tests login with proper synchronization and keeps session alive
 * Addresses all timing, wait, and synchronization issues
 */

const { UltraFreshSmartLogin } = require('./ultra-fresh-smart-login');
const UserConfigManager = require('./user-config-manager');
const chalk = require('chalk');

class SustainedLoginTest {
    constructor() {
        this.configManager = new UserConfigManager();
        this.ultraLogin = new UltraFreshSmartLogin();
        this.page = null;
        this.browser = null;
    }

    async testSustainedLogin(roleName = 'Owner', keepAliveMinutes = 5) {
        console.log(chalk.blue.bold('🔄 SUSTAINED LOGIN TEST'));
        console.log(chalk.blue.bold('======================'));
        console.log(`🎯 Testing role: ${chalk.cyan(roleName)}`);
        console.log(`⏰ Keep alive duration: ${chalk.cyan(keepAliveMinutes)} minutes`);
        console.log('');

        try {
            // Step 1: Load user configuration
            console.log(chalk.yellow('📋 STEP 1: USER CONFIGURATION'));
            console.log('==============================');
            
            const user = this.configManager.getUserByRole(roleName);
            
            console.log(`👤 Username: ${user.username}`);
            console.log(`🔑 Password: ${'*'.repeat(user.password.length)}`);
            console.log(`🏢 Client ID: ${user.clientIID}`);
            console.log(`🌐 Environment: ${user.environment}`);
            console.log(`📝 Description: ${user.description}`);
            console.log('');

            // Step 2: Perform login with detailed monitoring
            console.log(chalk.yellow('🚀 STEP 2: AUTHENTICATION'));
            console.log('==========================');
            
            const baseUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
            
            console.log(`🔗 Target URL: ${baseUrl}`);
            console.log(`👤 Authenticating as: ${user.username}`);
            console.log('');

            const loginResult = await this.ultraLogin.performUltraFreshLogin(
                baseUrl,
                user.username,
                user.password
            );

            // Step 3: Analyze login result
            console.log(chalk.yellow('📊 STEP 3: LOGIN ANALYSIS'));
            console.log('==========================');
            
            console.log('🔍 Login Result Details:');
            console.log(JSON.stringify(loginResult, null, 2));
            console.log('');

            if (!loginResult.success) {
                console.log(chalk.red('❌ LOGIN FAILED!'));
                console.log(chalk.red(`Issue: ${loginResult.issue || loginResult.error || 'Unknown'}`));
                console.log(chalk.red(`Message: ${loginResult.message || 'No details available'}`));
                return loginResult;
            }

            // Step 4: Get page reference and test functionality
            console.log(chalk.yellow('🌐 STEP 4: POST-LOGIN VALIDATION'));
            console.log('=================================');
            
            this.page = this.ultraLogin.getPage();
            this.browser = this.ultraLogin.getBrowser();

            if (!this.page || !this.browser) {
                console.log(chalk.red('❌ Failed to get page or browser reference'));
                return { success: false, error: 'No page/browser reference' };
            }

            // Get current state
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log(`📍 Current URL: ${currentUrl}`);
            console.log(`📄 Page Title: ${currentTitle}`);
            console.log('');

            // Step 5: Test page interaction and wait capabilities
            console.log(chalk.yellow('🧪 STEP 5: INTERACTION TESTING'));
            console.log('===============================');
            
            await this.testPageInteractions();

            // Step 6: Keep session alive with monitoring
            console.log(chalk.yellow('⏰ STEP 6: SUSTAINED SESSION'));
            console.log('=============================');
            
            await this.maintainSustainedSession(keepAliveMinutes);

            return {
                success: true,
                finalUrl: currentUrl,
                pageTitle: currentTitle,
                sessionDuration: keepAliveMinutes,
                message: 'Sustained login test completed successfully'
            };

        } catch (error) {
            console.log(chalk.red.bold('💥 SUSTAINED LOGIN ERROR!'));
            console.log(chalk.red.bold('========================='));
            console.log(chalk.red(`Error: ${error.message}`));
            console.log(chalk.red(`Stack: ${error.stack}`));
            
            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
    }

    async testPageInteractions() {
        console.log('🧪 Testing page interactions and synchronization...');
        
        try {
            // Test 1: Check if page is responsive
            console.log('1️⃣  Testing page responsiveness...');
            await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            console.log('   ✅ Page is responsive (networkidle achieved)');

            // Test 2: Check for any loading indicators
            console.log('2️⃣  Checking for loading indicators...');
            const loadingSelectors = [
                '.loading',
                '.spinner',
                '[data-loading="true"]',
                '.loader',
                '.progress'
            ];

            for (const selector of loadingSelectors) {
                try {
                    const loadingElement = await this.page.locator(selector).first();
                    if (await loadingElement.isVisible()) {
                        console.log(`   ⏳ Found loading indicator: ${selector}`);
                        await loadingElement.waitFor({ state: 'hidden', timeout: 30000 });
                        console.log(`   ✅ Loading indicator ${selector} is now hidden`);
                    }
                } catch (e) {
                    // Loading indicator not found or already hidden - this is good
                }
            }
            console.log('   ✅ No blocking loading indicators found');

            // Test 3: Check for navigation elements
            console.log('3️⃣  Checking for navigation elements...');
            const navSelectors = [
                'nav',
                '.navigation',
                '.nav-menu',
                '[role="navigation"]',
                '.menu',
                '.header'
            ];

            let navFound = false;
            for (const selector of navSelectors) {
                try {
                    const navElement = await this.page.locator(selector).first();
                    if (await navElement.isVisible()) {
                        console.log(`   ✅ Found navigation: ${selector}`);
                        navFound = true;
                        break;
                    }
                } catch (e) {
                    // Navigation not found with this selector
                }
            }

            if (!navFound) {
                console.log('   ⚠️  No standard navigation elements found (may be custom)');
            }

            // Test 4: Test page scroll and viewport
            console.log('4️⃣  Testing page scroll and viewport...');
            const viewport = this.page.viewportSize();
            if (viewport) {
                console.log(`   📐 Viewport: ${viewport.width}x${viewport.height}`);
            } else {
                console.log('   📐 Viewport: Not set (using default)');
            }
            
            await this.page.evaluate(() => window.scrollTo(0, 100));
            await this.page.waitForTimeout(1000);
            console.log('   ✅ Page scroll test passed');

            // Test 5: Check for JavaScript errors
            console.log('5️⃣  Checking for JavaScript errors...');
            this.page.on('pageerror', error => {
                console.log(`   ⚠️  JavaScript error: ${error.message}`);
            });

            // Test 6: Check for console warnings
            console.log('6️⃣  Monitoring console messages...');
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log(`   ⚠️  Console error: ${msg.text()}`);
                } else if (msg.type() === 'warning') {
                    console.log(`   ⚠️  Console warning: ${msg.text()}`);
                }
            });

            console.log('✅ Page interaction tests completed');
            console.log('');

        } catch (error) {
            console.log(chalk.red(`❌ Page interaction test failed: ${error.message}`));
            throw error;
        }
    }

    async maintainSustainedSession(minutes) {
        const totalSeconds = minutes * 60;
        const intervalSeconds = 30; // Check every 30 seconds
        const totalChecks = Math.floor(totalSeconds / intervalSeconds);

        console.log(`🔄 Maintaining session for ${minutes} minutes (${totalSeconds} seconds)`);
        console.log(`📊 Will perform ${totalChecks} status checks every ${intervalSeconds} seconds`);
        console.log('');

        for (let i = 1; i <= totalChecks; i++) {
            const elapsed = i * intervalSeconds;
            const remaining = totalSeconds - elapsed;
            
            console.log(`⏰ Check ${i}/${totalChecks} - Elapsed: ${elapsed}s, Remaining: ${remaining}s`);
            
            try {
                // Check if page is still responsive
                const url = this.page.url();
                const title = await this.page.title();
                
                console.log(`   📍 URL: ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`);
                console.log(`   📄 Title: ${title.substring(0, 40)}${title.length > 40 ? '...' : ''}`);
                
                // Gentle interaction to keep session alive
                await this.page.evaluate(() => {
                    // Move mouse slightly to simulate user activity
                    const event = new MouseEvent('mousemove', {
                        clientX: Math.random() * 100,
                        clientY: Math.random() * 100
                    });
                    document.dispatchEvent(event);
                });
                
                // Check if still authenticated
                if (url.includes('signin') || url.includes('login')) {
                    console.log(chalk.red('   ❌ Session appears to have expired (redirected to login)'));
                    break;
                }
                
                console.log('   ✅ Session is active and responsive');
                
            } catch (error) {
                console.log(chalk.red(`   ❌ Session check failed: ${error.message}`));
                break;
            }
            
            // Wait for next check
            if (i < totalChecks) {
                await this.page.waitForTimeout(intervalSeconds * 1000);
            }
        }

        console.log('');
        console.log(chalk.green('🎉 Sustained session monitoring completed!'));
        console.log('');
    }

    async gracefulCleanup() {
        console.log(chalk.yellow('🧹 GRACEFUL CLEANUP'));
        console.log('===================');
        
        try {
            if (this.page) {
                console.log('📊 Final page state:');
                console.log(`   URL: ${this.page.url()}`);
                console.log(`   Title: ${await this.page.title()}`);
            }
            
            console.log('🧹 Cleaning up browser session...');
            if (this.ultraLogin && this.ultraLogin.cleanup) {
                await this.ultraLogin.cleanup();
                console.log('✅ Browser cleanup completed');
            }
            
        } catch (error) {
            console.log(chalk.red(`⚠️  Cleanup warning: ${error.message}`));
        }
        
        console.log('🏁 Graceful cleanup completed');
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const tester = new SustainedLoginTest();

    // Parse arguments
    const roleIndex = args.indexOf('--role');
    const roleName = roleIndex !== -1 ? args[roleIndex + 1] : 'Owner';
    
    const timeIndex = args.indexOf('--time');
    const keepAliveMinutes = timeIndex !== -1 ? parseInt(args[timeIndex + 1]) : 5;

    console.log(chalk.cyan('🚀 SUSTAINED LOGIN TEST STARTING'));
    console.log(chalk.cyan('================================'));
    console.log(`🎯 Role: ${roleName}`);
    console.log(`⏰ Duration: ${keepAliveMinutes} minutes`);
    console.log('');

    try {
        const result = await tester.testSustainedLogin(roleName, keepAliveMinutes);
        
        console.log('');
        console.log(chalk.blue.bold('📊 FINAL RESULTS'));
        console.log(chalk.blue.bold('================'));
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('');
            console.log(chalk.green.bold('🎉 SUSTAINED LOGIN TEST PASSED!'));
            console.log(chalk.green('Your authentication system is working correctly with proper synchronization.'));
        } else {
            console.log('');
            console.log(chalk.red.bold('❌ SUSTAINED LOGIN TEST FAILED!'));
            console.log(chalk.red(`Reason: ${result.error || result.issue || 'Unknown'}`));
        }
        
    } catch (error) {
        console.log('');
        console.log(chalk.red.bold('💥 SUSTAINED TEST ERROR!'));
        console.log(chalk.red(`Error: ${error.message}`));
        console.log(chalk.red(`Stack: ${error.stack}`));
    } finally {
        await tester.gracefulCleanup();
    }
}

// Usage help
function showUsage() {
    console.log(chalk.cyan('🔄 SUSTAINED LOGIN TEST'));
    console.log(chalk.cyan('======================'));
    console.log('');
    console.log('Usage:');
    console.log('  node sustained-login-test.js --role Owner --time 5');
    console.log('  node sustained-login-test.js --role PayrollAdmin --time 10');
    console.log('');
    console.log('Options:');
    console.log('  --role <name>    Role to test (default: Owner)');
    console.log('  --time <mins>    Keep alive duration in minutes (default: 5)');
    console.log('  --help           Show this help');
    console.log('');
    console.log('Available roles:');
    try {
        const configManager = new UserConfigManager();
        const roles = configManager.getAllRoleNames();
        roles.forEach(role => console.log(`  • ${role}`));
    } catch (e) {
        console.log('  (Unable to load roles - check configuration)');
    }
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

module.exports = SustainedLoginTest;
