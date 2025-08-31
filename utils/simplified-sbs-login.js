#!/usr/bin/env node

/**
 * 🎯 SIMPLIFIED SBS-STYLE LOGIN
 * 
 * Mimics the exact SBS_Automation login flow without dependencies
 * Uses the same selectors, waits, and logic as the working SBS framework
 */

const { chromium } = require('playwright');
const chalk = require('chalk');

class SimplifiedSbsLogin {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        
        // SBS-style selectors (from practitioner-login.js)
        this.selectors = {
            USERNAME: '#login-form_username',
            VERIFY_USERID_BUTTON: '#verifUseridBtn',
            PASSWORD: '#login-form_password',
            SIGN_IN_BUTTON: '#signBtn',
            REMIND_ME_LATER_BUTTON: '[data-automation-id="remind-later-button"]',
            GET_STARTED_BUTTON: '[data-automation-id="get-started-button"]',
            PAYROLL_CAROUSEL: '[data-automation-id="payroll-carousel"]',
            HOME_PAGE_INDICATORS: [
                '[data-automation-id="payroll-carousel"]',
                '[data-automation-id="home-page"]',
                'h1:has-text("Good morning")',
                'h1:has-text("Good afternoon")',
                'h1:has-text("Good evening")'
            ]
        };
    }

    async createSbsBrowserContext() {
        console.log('🚀 Creating SBS-style browser context...');
        
        // Use SBS-style browser configuration
        this.browser = await chromium.launch({
            headless: false,
            args: [
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        });

        // Create context with SBS-style settings
        this.context = await this.browser.newContext({
            viewport: { width: 1366, height: 768 },
            ignoreHTTPSErrors: true,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        this.page = await this.context.newPage();
        
        console.log('✅ Browser context created');
        return { browser: this.browser, context: this.context, page: this.page };
    }

    async navigateTo(url) {
        console.log(`🌐 Navigating to: ${url}`);
        await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        console.log('✅ Navigation completed');
    }

    async performLogin(username, password) {
        console.log('🔐 Performing SBS-style login...');
        
        try {
            // Step 1: Fill username (SDF component handling)
            console.log('   📝 Filling username...');
            await this.page.waitForSelector(this.selectors.USERNAME, { timeout: 30000 });
            
            // Handle SDF component - fill the inner input
            await this.page.evaluate(({ selector, value }) => {
                const sdfInput = document.querySelector(selector);
                if (sdfInput) {
                    const innerInput = sdfInput.querySelector('input') || sdfInput;
                    innerInput.value = value;
                    innerInput.dispatchEvent(new Event('input', { bubbles: true }));
                    innerInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, { selector: this.selectors.USERNAME, value: username });
            
            console.log('   ✅ Username filled');

            // Step 2: Click Next/Verify button
            console.log('   🔘 Clicking Next button...');
            await this.page.waitForSelector(this.selectors.VERIFY_USERID_BUTTON, { timeout: 15000 });
            
            // Wait for button to be enabled
            await this.page.waitForFunction(({ selector }) => {
                const button = document.querySelector(selector);
                return button && !button.disabled;
            }, { selector: this.selectors.VERIFY_USERID_BUTTON });
            
            await this.page.click(this.selectors.VERIFY_USERID_BUTTON);
            console.log('   ✅ Next button clicked');

            // Step 3: Wait for password field and fill it
            console.log('   🔑 Filling password...');
            await this.page.waitForSelector(this.selectors.PASSWORD, { timeout: 15000 });
            
            // Handle SDF component for password
            await this.page.evaluate(({ selector, value }) => {
                const sdfInput = document.querySelector(selector);
                if (sdfInput) {
                    const innerInput = sdfInput.querySelector('input') || sdfInput;
                    innerInput.value = value;
                    innerInput.dispatchEvent(new Event('input', { bubbles: true }));
                    innerInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, { selector: this.selectors.PASSWORD, value: password });
            
            console.log('   ✅ Password filled');

            // Step 4: Click Sign In button
            console.log('   🔘 Clicking Sign In button...');
            await this.page.waitForSelector(this.selectors.SIGN_IN_BUTTON, { timeout: 15000 });
            
            // Wait for sign in button to be enabled
            await this.page.waitForFunction(({ selector }) => {
                const button = document.querySelector(selector);
                return button && !button.disabled;
            }, { selector: this.selectors.SIGN_IN_BUTTON });
            
            await this.page.click(this.selectors.SIGN_IN_BUTTON);
            console.log('   ✅ Sign In button clicked');

            console.log('✅ Login process completed');

        } catch (error) {
            console.log(chalk.red(`❌ Login failed: ${error.message}`));
            throw error;
        }
    }

    async dismissRemindMeLaterIfDisplayed() {
        console.log('🔍 Checking for "Remind Me Later" popup...');
        
        try {
            const remindButton = this.page.locator(this.selectors.REMIND_ME_LATER_BUTTON);
            
            if (await remindButton.isVisible({ timeout: 5000 })) {
                console.log('   📋 "Remind Me Later" popup found, dismissing...');
                await remindButton.click();
                console.log('   ✅ Popup dismissed');
            } else {
                console.log('   ℹ️  No "Remind Me Later" popup found');
            }
        } catch (error) {
            console.log('   ℹ️  No "Remind Me Later" popup to dismiss');
        }
    }

    async waitForHomePagePayrollCarousel(timeout = 120000) {
        console.log('⏳ Waiting for home page to load...');
        
        try {
            // Wait for any of the home page indicators
            const homePageLoaded = await Promise.race([
                ...this.selectors.HOME_PAGE_INDICATORS.map(selector => 
                    this.page.waitForSelector(selector, { timeout }).catch(() => null)
                )
            ]);

            if (homePageLoaded) {
                console.log('✅ Home page loaded successfully');
                return true;
            } else {
                console.log('⚠️  Home page indicators not found, checking current state...');
                return false;
            }
            
        } catch (error) {
            console.log(chalk.yellow(`⚠️  Home page wait timeout: ${error.message}`));
            return false;
        }
    }

    async performRunLogin(username, password) {
        console.log(chalk.blue('🎯 Performing SBS-style RUN login...'));
        
        try {
            // Step 1: Perform login
            await this.performLogin(username, password);
            
            // Step 2: Handle popups
            await this.dismissRemindMeLaterIfDisplayed();
            
            // Step 3: Wait for home page
            const homePageLoaded = await this.waitForHomePagePayrollCarousel(240000);
            
            // Step 4: Check final state
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log('');
            console.log('📊 Login Results:');
            console.log(`   📍 URL: ${currentUrl}`);
            console.log(`   📄 Title: ${currentTitle}`);
            console.log(`   🏠 Home page loaded: ${homePageLoaded}`);
            
            const isSuccessful = homePageLoaded || 
                               currentUrl.includes('runpayrollmain') || 
                               currentTitle.includes('RUN');
            
            if (currentUrl.includes('multitabmessage')) {
                console.log(chalk.yellow('⚠️  Session conflict detected'));
                console.log(chalk.yellow('   This indicates successful login but concurrent session'));
                return {
                    success: true,
                    issue: 'session_conflict',
                    currentUrl,
                    currentTitle,
                    message: 'Login successful but session conflict detected'
                };
            } else if (isSuccessful) {
                console.log(chalk.green('✅ Login successful and home page loaded'));
                return {
                    success: true,
                    currentUrl,
                    currentTitle,
                    homePageLoaded,
                    message: 'Login completed successfully'
                };
            } else {
                console.log(chalk.yellow('⚠️  Login completed but home page not detected'));
                return {
                    success: false,
                    currentUrl,
                    currentTitle,
                    homePageLoaded,
                    message: 'Login process completed but home page not confirmed'
                };
            }
            
        } catch (error) {
            console.log(chalk.red(`❌ SBS-style login failed: ${error.message}`));
            return {
                success: false,
                error: error.message,
                currentUrl: this.page?.url(),
                currentTitle: await this.page?.title().catch(() => 'Unknown')
            };
        }
    }

    async maintainSession(minutes = 5) {
        console.log(chalk.blue(`⏰ Maintaining session for ${minutes} minutes...`));
        
        const totalChecks = minutes * 2; // Check every 30 seconds
        
        for (let i = 1; i <= totalChecks; i++) {
            const elapsed = i * 0.5;
            const remaining = minutes - elapsed;
            
            console.log(`📊 Check ${i}/${totalChecks} - Elapsed: ${elapsed}min, Remaining: ${remaining}min`);
            
            try {
                const currentUrl = this.page.url();
                const currentTitle = await this.page.title();
                
                console.log(`   📍 URL: ${currentUrl.substring(0, 80)}${currentUrl.length > 80 ? '...' : ''}`);
                console.log(`   📄 Title: ${currentTitle.substring(0, 50)}${currentTitle.length > 50 ? '...' : ''}`);
                
                // Check for session issues
                if (currentUrl.includes('signin') || currentUrl.includes('login')) {
                    console.log(chalk.red('   ❌ Session expired - redirected to login'));
                    break;
                } else if (currentUrl.includes('multitabmessage')) {
                    console.log(chalk.yellow('   ⚠️  Session conflict - multitabmessage'));
                } else {
                    console.log(chalk.green('   ✅ Session active'));
                }
                
                // Gentle activity to keep session alive
                await this.page.evaluate(() => {
                    document.dispatchEvent(new Event('mousemove'));
                });
                
                // Wait 30 seconds before next check
                if (i < totalChecks) {
                    await this.page.waitForTimeout(30000);
                }
                
            } catch (error) {
                console.log(chalk.red(`   ❌ Session check failed: ${error.message}`));
                break;
            }
        }
        
        console.log(chalk.green('✅ Session maintenance completed'));
    }

    async cleanup() {
        console.log('🧹 Cleaning up...');
        
        try {
            if (this.context) {
                await this.context.close();
                console.log('   ✅ Context closed');
            }
            
            if (this.browser) {
                await this.browser.close();
                console.log('   ✅ Browser closed');
            }
            
        } catch (error) {
            console.log(chalk.yellow(`⚠️  Cleanup warning: ${error.message}`));
        }
    }
}

// Main test function
async function testSbsStyleLogin(username = 'Arogya@26153101', password = 'Test0507', maintainMinutes = 5) {
    console.log(chalk.blue.bold('🎯 SBS-STYLE LOGIN TEST'));
    console.log(chalk.blue.bold('======================'));
    console.log(`👤 Username: ${chalk.cyan(username)}`);
    console.log(`🔑 Password: ${chalk.cyan('*'.repeat(password.length))}`);
    console.log(`⏰ Maintain: ${chalk.cyan(maintainMinutes)} minutes`);
    console.log('');

    const sbsLogin = new SimplifiedSbsLogin();
    
    try {
        // Step 1: Create browser context
        console.log('1️⃣  Creating browser context...');
        await sbsLogin.createSbsBrowserContext();
        console.log('');

        // Step 2: Navigate to login page
        console.log('2️⃣  Navigating to login page...');
        const loginUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        await sbsLogin.navigateTo(loginUrl);
        console.log('');

        // Step 3: Perform login
        console.log('3️⃣  Performing login...');
        const loginResult = await sbsLogin.performRunLogin(username, password);
        console.log('');

        // Step 4: Display results
        console.log('4️⃣  Login Results:');
        console.log(JSON.stringify(loginResult, null, 2));
        console.log('');

        // Step 5: Maintain session if successful
        if (loginResult.success && maintainMinutes > 0) {
            console.log('5️⃣  Maintaining session...');
            await sbsLogin.maintainSession(maintainMinutes);
        }

        console.log('');
        console.log(chalk.green.bold('🎉 SBS-STYLE LOGIN TEST COMPLETED'));
        
        return loginResult;

    } catch (error) {
        console.log('');
        console.log(chalk.red.bold('💥 SBS-STYLE LOGIN TEST FAILED'));
        console.log(chalk.red(`Error: ${error.message}`));
        
        return {
            success: false,
            error: error.message
        };
        
    } finally {
        await sbsLogin.cleanup();
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    const usernameIndex = args.indexOf('--username');
    const username = usernameIndex !== -1 ? args[usernameIndex + 1] : 'Arogya@26153101';
    
    const passwordIndex = args.indexOf('--password');
    const password = passwordIndex !== -1 ? args[passwordIndex + 1] : 'Test0507';
    
    const timeIndex = args.indexOf('--time');
    const maintainMinutes = timeIndex !== -1 ? parseInt(args[timeIndex + 1]) : 5;

    await testSbsStyleLogin(username, password, maintainMinutes);
}

// Usage help
function showUsage() {
    console.log(chalk.cyan('🎯 SIMPLIFIED SBS-STYLE LOGIN'));
    console.log(chalk.cyan('============================='));
    console.log('');
    console.log('Usage:');
    console.log('  node simplified-sbs-login.js');
    console.log('  node simplified-sbs-login.js --username Arogya@26153101 --password Test0507');
    console.log('  node simplified-sbs-login.js --time 10');
    console.log('');
    console.log('Options:');
    console.log('  --username <name>  Username (default: Arogya@26153101)');
    console.log('  --password <pass>  Password (default: Test0507)');
    console.log('  --time <mins>      Session maintenance time (default: 5)');
    console.log('  --help            Show this help');
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

module.exports = SimplifiedSbsLogin;
