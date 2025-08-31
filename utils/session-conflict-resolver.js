#!/usr/bin/env node

/**
 * 🔄 SESSION CONFLICT RESOLVER
 * 
 * Properly handles ADP's concurrent session detection
 * Resolves "multitabmessage" redirects and maintains proper login state
 */

const { SessionKiller } = require('./session-killer');
const { UltraFreshSmartLogin } = require('./ultra-fresh-smart-login');
const UserConfigManager = require('./user-config-manager');
const chalk = require('chalk');

class SessionConflictResolver {
    constructor() {
        this.configManager = new UserConfigManager();
        this.sessionKiller = new SessionKiller();
        this.maxRetryAttempts = 3;
        this.conflictResolutionWait = 10000; // 10 seconds
    }

    async resolveLoginWithConflictHandling(roleName = 'Owner', keepAliveMinutes = 5) {
        console.log(chalk.blue.bold('🔄 SESSION CONFLICT RESOLVER'));
        console.log(chalk.blue.bold('============================'));
        console.log(`🎯 Testing role: ${chalk.cyan(roleName)}`);
        console.log(`🔄 Max retry attempts: ${chalk.cyan(this.maxRetryAttempts)}`);
        console.log(`⏰ Keep alive duration: ${chalk.cyan(keepAliveMinutes)} minutes`);
        console.log('');

        let attempt = 1;
        let lastError = null;

        while (attempt <= this.maxRetryAttempts) {
            console.log(chalk.yellow(`🔄 ATTEMPT ${attempt}/${this.maxRetryAttempts}`));
            console.log('='.repeat(30));

            try {
                const result = await this.attemptLoginWithConflictResolution(roleName, keepAliveMinutes, attempt);
                
                if (result.success) {
                    console.log('');
                    console.log(chalk.green.bold(`🎉 SUCCESS ON ATTEMPT ${attempt}!`));
                    return result;
                }

                // Handle specific failure types
                if (result.issue === 'concurrent_session_detected') {
                    console.log(chalk.yellow(`⚠️  Concurrent session detected on attempt ${attempt}`));
                    console.log(chalk.yellow('🧹 Performing aggressive session cleanup...'));
                    
                    await this.performAggressiveSessionCleanup();
                    
                    if (attempt < this.maxRetryAttempts) {
                        console.log(chalk.yellow(`⏳ Waiting ${this.conflictResolutionWait/1000} seconds before retry...`));
                        await new Promise(resolve => setTimeout(resolve, this.conflictResolutionWait));
                    }
                } else {
                    console.log(chalk.red(`❌ Attempt ${attempt} failed: ${result.issue || result.error}`));
                    lastError = result;
                }

            } catch (error) {
                console.log(chalk.red(`💥 Attempt ${attempt} crashed: ${error.message}`));
                lastError = { error: error.message, stack: error.stack };
            }

            attempt++;
            console.log('');
        }

        // All attempts failed
        console.log(chalk.red.bold('❌ ALL ATTEMPTS FAILED!'));
        console.log(chalk.red.bold('======================='));
        console.log(chalk.red(`Tried ${this.maxRetryAttempts} times with aggressive session cleanup`));
        console.log(chalk.red('This indicates a persistent session conflict or system issue'));
        
        return {
            success: false,
            allAttemptsFailed: true,
            maxAttempts: this.maxRetryAttempts,
            lastError: lastError
        };
    }

    async attemptLoginWithConflictResolution(roleName, keepAliveMinutes, attemptNumber) {
        console.log(`📋 Loading user configuration for: ${roleName}`);
        
        const user = this.configManager.getUserByRole(roleName);
        console.log(`👤 Username: ${user.username}`);
        console.log(`🏢 Client ID: ${user.clientIID}`);
        console.log('');

        // Create ultra-fresh login instance for this attempt
        const ultraLogin = new UltraFreshSmartLogin();
        
        try {
            console.log('🚀 Starting ultra-fresh login...');
            const baseUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
            
            const loginResult = await ultraLogin.performUltraFreshLogin(
                baseUrl,
                user.username,
                user.password
            );

            console.log('');
            console.log('📊 Login Result Analysis:');
            console.log(`   Success: ${loginResult.success}`);
            console.log(`   Method: ${loginResult.method || loginResult.issue || 'N/A'}`);
            
            if (loginResult.finalUrl) {
                console.log(`   Final URL: ${loginResult.finalUrl}`);
            }

            // Check for concurrent session detection
            if (loginResult.finalUrl && loginResult.finalUrl.includes('multitabmessage')) {
                console.log(chalk.yellow('🚨 CONCURRENT SESSION DETECTED!'));
                console.log(chalk.yellow('================================'));
                console.log('ADP has detected another active session');
                console.log('This commonly happens when:');
                console.log('• Another browser tab/window is logged in');
                console.log('• Previous session was not properly closed');
                console.log('• Multiple automation scripts are running');
                console.log('');

                // Try to resolve the conflict
                const page = ultraLogin.getPage();
                if (page) {
                    console.log('🔧 Attempting to resolve session conflict...');
                    
                    // Look for "Continue" or "End Other Session" buttons
                    const conflictButtons = [
                        'button:has-text("Continue")',
                        'button:has-text("End Other Session")',
                        'button:has-text("Continue Here")',
                        'input[type="button"][value*="Continue"]',
                        'input[type="submit"][value*="Continue"]',
                        '.btn:has-text("Continue")',
                        '[data-automation-id*="continue"]'
                    ];

                    let resolved = false;
                    for (const buttonSelector of conflictButtons) {
                        try {
                            const button = page.locator(buttonSelector).first();
                            if (await button.isVisible({ timeout: 3000 })) {
                                console.log(`   ✅ Found conflict resolution button: ${buttonSelector}`);
                                await button.click();
                                await page.waitForTimeout(5000);
                                
                                const newUrl = page.url();
                                console.log(`   🔗 After click URL: ${newUrl}`);
                                
                                if (!newUrl.includes('multitabmessage')) {
                                    console.log('   🎉 Session conflict resolved!');
                                    resolved = true;
                                    break;
                                }
                            }
                        } catch (e) {
                            // Button not found or not clickable
                        }
                    }

                    if (!resolved) {
                        console.log('   ❌ Could not automatically resolve session conflict');
                        return {
                            success: false,
                            issue: 'concurrent_session_detected',
                            finalUrl: loginResult.finalUrl,
                            message: 'ADP detected concurrent session and auto-resolution failed',
                            attemptNumber: attemptNumber
                        };
                    } else {
                        // Update the login result since we resolved the conflict
                        const finalUrl = page.url();
                        const finalTitle = await page.title();
                        
                        console.log('✅ Session conflict resolved, continuing with sustained session...');
                        return await this.maintainResolvedSession(ultraLogin, finalUrl, finalTitle, keepAliveMinutes);
                    }
                }
            }

            if (loginResult.success && loginResult.readyForAutomation) {
                console.log('✅ Direct login success, starting sustained session...');
                const page = ultraLogin.getPage();
                const finalUrl = page.url();
                const finalTitle = await page.title();
                
                return await this.maintainResolvedSession(ultraLogin, finalUrl, finalTitle, keepAliveMinutes);
            }

            return loginResult;

        } catch (error) {
            console.log(chalk.red(`💥 Login attempt failed: ${error.message}`));
            return {
                success: false,
                error: error.message,
                stack: error.stack,
                attemptNumber: attemptNumber
            };
        } finally {
            // Always cleanup the ultra-login instance
            try {
                if (ultraLogin && ultraLogin.cleanup) {
                    await ultraLogin.cleanup();
                }
            } catch (e) {
                console.log(chalk.yellow(`⚠️  Cleanup warning: ${e.message}`));
            }
        }
    }

    async maintainResolvedSession(ultraLogin, finalUrl, finalTitle, keepAliveMinutes) {
        console.log('');
        console.log(chalk.green('🎯 SUSTAINED SESSION MONITORING'));
        console.log(chalk.green('==============================='));
        console.log(`📍 URL: ${finalUrl}`);
        console.log(`📄 Title: ${finalTitle}`);
        console.log(`⏰ Duration: ${keepAliveMinutes} minutes`);
        console.log('');

        const page = ultraLogin.getPage();
        const totalSeconds = keepAliveMinutes * 60;
        const intervalSeconds = 30;
        const totalChecks = Math.floor(totalSeconds / intervalSeconds);

        console.log(`🔄 Will perform ${totalChecks} status checks every ${intervalSeconds} seconds`);
        console.log('');

        let sessionActive = true;
        let checksCompleted = 0;

        for (let i = 1; i <= totalChecks && sessionActive; i++) {
            const elapsed = i * intervalSeconds;
            const remaining = totalSeconds - elapsed;
            
            console.log(`⏰ Check ${i}/${totalChecks} - Elapsed: ${elapsed}s, Remaining: ${remaining}s`);
            
            try {
                // Check current state
                const currentUrl = page.url();
                const currentTitle = await page.title();
                
                console.log(`   📍 URL: ${currentUrl.substring(0, 80)}${currentUrl.length > 80 ? '...' : ''}`);
                console.log(`   📄 Title: ${currentTitle.substring(0, 50)}${currentTitle.length > 50 ? '...' : ''}`);
                
                // Check for session loss indicators
                if (currentUrl.includes('signin') || currentUrl.includes('login') || currentUrl.includes('expired')) {
                    console.log(chalk.red('   ❌ Session expired (redirected to login)'));
                    sessionActive = false;
                    break;
                }

                if (currentUrl.includes('multitabmessage')) {
                    console.log(chalk.yellow('   ⚠️  New session conflict detected'));
                    sessionActive = false;
                    break;
                }

                // Gentle activity to keep session alive
                await page.evaluate(() => {
                    // Simulate minimal user activity
                    document.dispatchEvent(new Event('mousemove'));
                    // Touch the page timestamp if needed
                    if (window.performance) {
                        window.performance.mark('session-keepalive-' + Date.now());
                    }
                });
                
                console.log('   ✅ Session active and responsive');
                checksCompleted = i;
                
                // Wait for next check
                if (i < totalChecks) {
                    await page.waitForTimeout(intervalSeconds * 1000);
                }
                
            } catch (error) {
                console.log(chalk.red(`   ❌ Session check failed: ${error.message}`));
                sessionActive = false;
                break;
            }
        }

        console.log('');
        if (sessionActive && checksCompleted === totalChecks) {
            console.log(chalk.green.bold('🎉 SUSTAINED SESSION COMPLETED SUCCESSFULLY!'));
            console.log(chalk.green(`✅ Maintained active session for full ${keepAliveMinutes} minutes`));
            console.log(chalk.green(`✅ Completed ${checksCompleted}/${totalChecks} status checks`));
            console.log(chalk.green('✅ No session conflicts or timeouts detected'));
        } else {
            console.log(chalk.yellow.bold('⚠️  SESSION ENDED EARLY'));
            console.log(chalk.yellow(`⏱️  Completed ${checksCompleted}/${totalChecks} checks`));
            console.log(chalk.yellow('Session may have expired or conflict occurred'));
        }

        return {
            success: sessionActive && checksCompleted === totalChecks,
            finalUrl: finalUrl,
            pageTitle: finalTitle,
            sessionDuration: keepAliveMinutes,
            checksCompleted: checksCompleted,
            totalChecks: totalChecks,
            sessionActive: sessionActive,
            message: sessionActive ? 'Session maintained successfully' : 'Session ended early'
        };
    }

    async performAggressiveSessionCleanup() {
        console.log('🧹 AGGRESSIVE SESSION CLEANUP');
        console.log('=============================');
        
        try {
            // Use the session killer for aggressive cleanup
            await this.sessionKiller.killAllSessions();
            
            console.log('✅ Aggressive session cleanup completed');
            
            // Additional wait for system to fully clean up
            console.log('⏳ Allowing extra time for complete system cleanup...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
        } catch (error) {
            console.log(chalk.yellow(`⚠️  Aggressive cleanup warning: ${error.message}`));
        }
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const resolver = new SessionConflictResolver();

    // Parse arguments
    const roleIndex = args.indexOf('--role');
    const roleName = roleIndex !== -1 ? args[roleIndex + 1] : 'Owner';
    
    const timeIndex = args.indexOf('--time');
    const keepAliveMinutes = timeIndex !== -1 ? parseInt(args[timeIndex + 1]) : 5;

    console.log(chalk.cyan('🔄 SESSION CONFLICT RESOLVER STARTING'));
    console.log(chalk.cyan('====================================='));
    console.log(`🎯 Role: ${roleName}`);
    console.log(`⏰ Duration: ${keepAliveMinutes} minutes`);
    console.log('');

    try {
        const result = await resolver.resolveLoginWithConflictHandling(roleName, keepAliveMinutes);
        
        console.log('');
        console.log(chalk.blue.bold('📊 FINAL RESOLUTION RESULTS'));
        console.log(chalk.blue.bold('==========================='));
        
        if (result.success) {
            console.log(chalk.green('✅ SUCCESS: Session conflict resolved and sustained'));
            console.log(`   📊 Checks completed: ${result.checksCompleted}/${result.totalChecks}`);
            console.log(`   ⏰ Session duration: ${result.sessionDuration} minutes`);
            console.log(`   🌐 Final URL: ${result.finalUrl}`);
            console.log(`   📄 Page title: ${result.pageTitle}`);
        } else if (result.allAttemptsFailed) {
            console.log(chalk.red('❌ FAILURE: All attempts failed'));
            console.log(`   🔄 Attempts made: ${result.maxAttempts}`);
            console.log(`   💥 Last error: ${result.lastError?.error || result.lastError?.issue || 'Unknown'}`);
        } else {
            console.log(chalk.yellow('⚠️  PARTIAL: Session established but ended early'));
            console.log(`   📊 Checks completed: ${result.checksCompleted || 0}/${result.totalChecks || 0}`);
            console.log(`   💬 Message: ${result.message || 'No details'}`);
        }
        
    } catch (error) {
        console.log('');
        console.log(chalk.red.bold('💥 RESOLVER ERROR!'));
        console.log(chalk.red(`Error: ${error.message}`));
        console.log(chalk.red(`Stack: ${error.stack}`));
    }
}

// Usage help
function showUsage() {
    console.log(chalk.cyan('🔄 SESSION CONFLICT RESOLVER'));
    console.log(chalk.cyan('============================'));
    console.log('');
    console.log('Handles ADP concurrent session conflicts and maintains sustained login');
    console.log('');
    console.log('Usage:');
    console.log('  node session-conflict-resolver.js --role Owner --time 5');
    console.log('  node session-conflict-resolver.js --role PayrollAdmin --time 10');
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

module.exports = SessionConflictResolver;
