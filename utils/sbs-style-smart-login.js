/**
 * 🎯 SBS-STYLE SMART LOGIN
 * 
 * Adopts the proven approach from SBS_Automation framework
 * Fixes session management and browser handling issues
 */

const { chromium } = require('playwright');
const UserConfigManager = require('./user-config-manager');
const chalk = require('chalk');

class SbsStyleSmartLogin {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.sessionId = null;
        this.isInitialized = false;
        this.configManager = new UserConfigManager();
    }

    async performSbsStyleLogin(roleName = 'Owner') {
        console.log(chalk.blue.bold('🎯 SBS-STYLE SMART LOGIN'));
        console.log(chalk.blue.bold('========================'));
        console.log('🔧 Using proven SBS_Automation approach');
        console.log('');

        try {
            // Step 1: Load user configuration
            const user = this.configManager.getUserByRole(roleName);
            console.log(`👤 Username: ${user.username}`);
            console.log(`🏢 Client ID: ${user.clientIID}`);
            console.log(`🌐 Environment: ${user.environment}`);
            console.log('');

            // Step 2: Create browser with SBS-style configuration
            await this.createSbsStyleBrowser();

            // Step 3: Perform login with SBS approach
            const loginResult = await this.performSbsLogin(user.username, user.password);

            return loginResult;

        } catch (error) {
            console.log(chalk.red(`💥 SBS-style login error: ${error.message}`));
            return {
                success: false,
                error: error.message,
                sessionId: this.sessionId
            };
        }
    }

    async createSbsStyleBrowser() {
        console.log('🚀 Creating SBS-style browser...');

        // Use SBS_Automation browser configuration
        const windowSize = [1920, 1020];
        const args = [
            `--window-size=${windowSize[0]},${windowSize[1]}`,
            '--disable-extensions',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-setuid-sandbox',
            '--proxy-auto-detect',
            '--disable-notifications',
            '--disk-cache-size=0',
            '--proxy-bypass-list=*.paascloud.oneadp.com,*.adp.com,*.oneadp.com,*js.driftt.com',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36',
            '--disable-cache',
            '--ignore-certificate-errors',
            '--disable-popup-blocking',
            '--disable-default-apps',
            '--disable-application-cache',
            '--disable-gpu-program-cache',
            '--aggressive-cache-discard',
            '--dns-prefetch-disable',
            '--disable-web-security',
        ];

        // Launch browser with SBS configuration
        this.browser = await chromium.launch({
            headless: false, // Same as SBS for visibility
            args: args,
        });

        // Create context with SBS settings
        this.context = await this.browser.newContext({
            viewport: { width: windowSize[0], height: windowSize[1] },
            acceptDownloads: true,
            ignoreHTTPSErrors: true,
            bypassCSP: true,
            javaScriptEnabled: true,
        });

        // Create page
        this.page = await this.context.newPage();

        // Set SBS-style timeouts
        await this.page.setDefaultTimeout(60000); // 60 seconds like SBS
        await this.page.setDefaultNavigationTimeout(60000);

        this.sessionId = `sbs-style-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.isInitialized = true;

        console.log(`✅ SBS-style browser created with session: ${this.sessionId}`);
        console.log(`📐 Viewport: ${windowSize[0]}x${windowSize[1]}`);
        console.log('');
    }

    async performSbsLogin(username, password) {
        console.log('🔐 SBS-STYLE LOGIN PROCESS');
        console.log('==========================');

        const targetUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        
        console.log(`🔗 Navigating to: ${targetUrl}`);
        
        // Navigate with SBS-style waiting
        await this.page.goto(targetUrl, { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });

        console.log('✅ Login page loaded');

        // Username entry with SBS-style selectors and waiting
        console.log('📝 Entering username...');
        const usernameSelector = '#login-form_username';
        await this.page.waitForSelector(usernameSelector, { timeout: 30000 });
        await this.page.fill(usernameSelector, username);
        
        // Click Next button with SBS-style selector
        const nextButtonSelector = '#verifUseridBtn, #btnNext';
        await this.page.waitForSelector(nextButtonSelector, { timeout: 30000 });
        await this.page.click(nextButtonSelector);
        
        console.log('✅ Username submitted');

        // Wait for password field to appear
        const passwordSelector = '#login-form_password';
        await this.page.waitForSelector(passwordSelector, { timeout: 30000 });
        
        // Password entry
        console.log('🔑 Entering password...');
        await this.page.fill(passwordSelector, password);
        
        // Click Sign In button
        const signInButtonSelector = '#signBtn, #btnNext';
        await this.page.waitForSelector(signInButtonSelector, { timeout: 30000 });
        await this.page.click(signInButtonSelector);
        
        console.log('✅ Password submitted');

        // Wait for navigation and check result
        console.log('⏳ Waiting for authentication result...');
        
        // Wait for either success or redirect
        await this.page.waitForLoadState('networkidle', { timeout: 60000 });
        
        // Give additional time for any redirects
        await this.page.waitForTimeout(5000);

        const currentUrl = this.page.url();
        const currentTitle = await this.page.title();

        console.log('');
        console.log('🔍 SBS-STYLE LOGIN ANALYSIS');
        console.log('============================');
        console.log(`📍 Final URL: ${currentUrl}`);
        console.log(`📄 Page Title: ${currentTitle}`);
        console.log('');

        // Analyze result using SBS-style logic
        if (currentUrl.includes('multitabmessage')) {
            console.log(chalk.yellow('⚠️  SESSION CONFLICT DETECTED'));
            console.log(chalk.yellow('ADP detected another active session'));
            console.log(chalk.yellow('This is a server-side session management issue'));
            
            return {
                success: false,
                issue: 'concurrent_session_detected',
                finalUrl: currentUrl,
                message: 'ADP detected concurrent session',
                sessionId: this.sessionId,
                needsManualCleanup: true
            };

        } else if (this.isHomePage(currentUrl, currentTitle)) {
            console.log(chalk.green('🎉 LOGIN SUCCESS!'));
            console.log(chalk.green('========================'));
            console.log('✅ Successfully reached ADP homepage');
            console.log('✅ Session is ready for automation');
            console.log('✅ Browser context maintained');
            
            return {
                success: true,
                method: 'sbs_style_login',
                finalUrl: currentUrl,
                pageTitle: currentTitle,
                securityStepRequired: false,
                readyForAutomation: true,
                sessionId: this.sessionId,
                browserMaintained: true
            };

        } else if (currentUrl.includes('step-up') || currentUrl.includes('verification')) {
            console.log(chalk.yellow('🛡️  SECURITY STEP DETECTED'));
            console.log('Additional verification required');
            
            return {
                success: false,
                issue: 'security_step_required',
                finalUrl: currentUrl,
                message: 'Security verification required',
                sessionId: this.sessionId,
                requiresManualIntervention: true
            };

        } else {
            console.log(chalk.red('❓ UNEXPECTED STATE'));
            console.log('Login completed but not in expected state');
            
            return {
                success: false,
                issue: 'unexpected_state',
                finalUrl: currentUrl,
                finalTitle: currentTitle,
                message: 'Login completed but unexpected result',
                sessionId: this.sessionId
            };
        }
    }

    isHomePage(url, title) {
        // SBS-style homepage detection
        const homePageIndicators = [
            'runpayrollmain2-iat.adp.com',
            'RUN powered by ADP',
            'Good morning',
            'payroll'
        ];

        return homePageIndicators.some(indicator => 
            url.toLowerCase().includes(indicator.toLowerCase()) || 
            title.toLowerCase().includes(indicator.toLowerCase())
        );
    }

    async maintainSession(minutes = 10) {
        if (!this.isInitialized || !this.page) {
            throw new Error('Session not initialized');
        }

        console.log('');
        console.log(chalk.blue('🔄 SBS-STYLE SESSION MAINTENANCE'));
        console.log(chalk.blue('================================='));
        console.log(`⏰ Maintaining session for ${minutes} minutes`);
        console.log('📊 Using SBS-style session management');
        console.log('');

        const totalSeconds = minutes * 60;
        const intervalSeconds = 30;
        const totalChecks = Math.floor(totalSeconds / intervalSeconds);

        for (let i = 1; i <= totalChecks; i++) {
            const elapsed = i * intervalSeconds;
            const remaining = totalSeconds - elapsed;
            
            console.log(`⏰ Check ${i}/${totalChecks} - Elapsed: ${elapsed}s, Remaining: ${remaining}s`);
            
            try {
                // Check current state
                const currentUrl = this.page.url();
                const currentTitle = await this.page.title();
                
                console.log(`   📍 URL: ${currentUrl.substring(0, 80)}${currentUrl.length > 80 ? '...' : ''}`);
                console.log(`   📄 Title: ${currentTitle.substring(0, 50)}${currentTitle.length > 50 ? '...' : ''}`);
                
                // Check for session issues
                if (currentUrl.includes('multitabmessage')) {
                    console.log(chalk.yellow('   ⚠️  Session conflict detected'));
                    return {
                        success: false,
                        issue: 'session_conflict',
                        checksCompleted: i,
                        totalChecks: totalChecks
                    };
                }

                if (currentUrl.includes('signin') || currentUrl.includes('login')) {
                    console.log(chalk.red('   ❌ Session expired'));
                    return {
                        success: false,
                        issue: 'session_expired',
                        checksCompleted: i,
                        totalChecks: totalChecks
                    };
                }

                // Gentle activity simulation (SBS-style)
                await this.page.evaluate(() => {
                    // Minimal activity to maintain session
                    document.dispatchEvent(new MouseEvent('mousemove', {
                        clientX: Math.random() * 100,
                        clientY: Math.random() * 100
                    }));
                });
                
                console.log(chalk.green('   ✅ Session active and stable'));
                
                // Wait for next check
                if (i < totalChecks) {
                    await this.page.waitForTimeout(intervalSeconds * 1000);
                }
                
            } catch (error) {
                console.log(chalk.red(`   ❌ Session check failed: ${error.message}`));
                return {
                    success: false,
                    issue: 'session_check_error',
                    error: error.message,
                    checksCompleted: i,
                    totalChecks: totalChecks
                };
            }
        }

        console.log('');
        console.log(chalk.green.bold('🎉 SESSION MAINTENANCE COMPLETED'));
        console.log(chalk.green(`✅ Successfully maintained session for ${minutes} minutes`));
        console.log(chalk.green('✅ Browser context preserved'));
        console.log('');

        return {
            success: true,
            sessionDuration: minutes,
            checksCompleted: totalChecks,
            totalChecks: totalChecks,
            message: 'Session maintained successfully with SBS-style approach'
        };
    }

    async getPage() {
        return this.page;
    }

    async getBrowser() {
        return this.browser;
    }

    async getContext() {
        return this.context;
    }

    getSessionId() {
        return this.sessionId;
    }

    isSessionActive() {
        return this.isInitialized && this.page && !this.page.isClosed();
    }

    async gracefulCleanup() {
        console.log('');
        console.log(chalk.yellow('🧹 SBS-STYLE GRACEFUL CLEANUP'));
        console.log(chalk.yellow('=============================='));
        
        try {
            if (this.page && !this.page.isClosed()) {
                console.log('📊 Final session state:');
                console.log(`   URL: ${this.page.url()}`);
                console.log(`   Title: ${await this.page.title()}`);
                console.log(`   Session ID: ${this.sessionId}`);
                
                await this.page.close();
                console.log('✅ Page closed');
            }
            
            if (this.context) {
                await this.context.close();
                console.log('✅ Context closed');
            }
            
            if (this.browser) {
                await this.browser.close();
                console.log('✅ Browser closed');
            }
            
            this.isInitialized = false;
            console.log('✅ SBS-style cleanup completed');
            
        } catch (error) {
            console.log(chalk.yellow(`⚠️  Cleanup warning: ${error.message}`));
        }
        
        console.log('🏁 Session cleanup finished');
    }

    // Keep session alive without cleanup (for utilities testing)
    async keepAliveForTesting() {
        console.log('');
        console.log(chalk.cyan('🔧 KEEPING SESSION ALIVE FOR TESTING'));
        console.log(chalk.cyan('===================================='));
        console.log('Browser will remain open for utility testing');
        console.log('Use .gracefulCleanup() when finished');
        console.log('');
        
        return {
            page: this.page,
            browser: this.browser,
            context: this.context,
            sessionId: this.sessionId,
            ready: this.isSessionActive()
        };
    }
}

module.exports = { SbsStyleSmartLogin };
