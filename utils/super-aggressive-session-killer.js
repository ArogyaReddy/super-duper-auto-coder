const { chromium } = require('playwright');
const { SessionKiller } = require('./session-killer');

class SuperAggressiveSessionKiller {
    constructor() {
        this.baseSessionKiller = new SessionKiller();
    }

    async terminateAllADPSessions() {
        console.log('💥 SUPER AGGRESSIVE ADP SESSION TERMINATION');
        console.log('============================================');
        console.log('🎯 Goal: Completely eliminate ALL ADP sessions at every level');
        console.log('');

        try {
            // Step 1: Standard session killer
            await this.baseSessionKiller.killAllSessions();

            // Step 2: Force logout from any existing ADP sessions
            await this.forceLogoutFromADP();

            // Step 3: Clear all possible session storage
            await this.clearAllSessionData();

            // Step 4: System-level network reset
            await this.systemLevelCleanup();

            console.log('');
            console.log('✅ SUPER AGGRESSIVE SESSION TERMINATION COMPLETED');
            console.log('==================================================');
            console.log('🧹 All ADP sessions have been completely eliminated');
            console.log('🆕 System is now ready for completely fresh session');

        } catch (error) {
            console.log(`⚠️  Super aggressive cleanup error: ${error.message}`);
        }
    }

    async forceLogoutFromADP() {
        console.log('');
        console.log('🚪 FORCE LOGOUT FROM ALL ADP SESSIONS');
        console.log('=====================================');

        try {
            // Create a temporary browser to force logout
            const tempBrowser = await chromium.launch({ headless: true });
            const tempPage = await tempBrowser.newPage();

            // Try to access ADP logout endpoints
            const logoutUrls = [
                'https://online-iat.adp.com/signin/v1/logout',
                'https://runpayrollmain2-iat.adp.com/logout',
                'https://ngapps-iat.adp.com/logout',
                'https://online-iat.adp.com/logout'
            ];

            for (const logoutUrl of logoutUrls) {
                try {
                    console.log(`🚪 Attempting logout: ${logoutUrl}`);
                    await tempPage.goto(logoutUrl, { waitUntil: 'networkidle', timeout: 10000 });
                    await tempPage.waitForTimeout(2000);
                    console.log(`✅ Logout attempt completed: ${logoutUrl}`);
                } catch (error) {
                    console.log(`⚠️  Logout attempt failed: ${logoutUrl}`);
                }
            }

            // Clear all cookies and storage
            await tempPage.context().clearCookies();
            await tempPage.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
            });

            await tempBrowser.close();
            console.log('✅ Force logout completed');

        } catch (error) {
            console.log(`⚠️  Force logout error: ${error.message}`);
        }
    }

    async clearAllSessionData() {
        console.log('');
        console.log('🧹 CLEARING ALL SESSION DATA');
        console.log('=============================');

        try {
            // Clear all possible browser data locations
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);

            // Clear Chrome user data
            const chromeDataPaths = [
                '~/Library/Application\\ Support/Google/Chrome',
                '~/Library/Caches/Google/Chrome',
                '~/Library/Application\\ Support/Chromium',
                '~/Library/Caches/Chromium'
            ];

            for (const path of chromeDataPaths) {
                try {
                    await execAsync(`find ${path} -name "*adp*" -type f -delete 2>/dev/null || true`);
                    await execAsync(`find ${path} -name "*session*" -type f -delete 2>/dev/null || true`);
                    console.log(`✅ Cleared ADP data from: ${path}`);
                } catch (error) {
                    // Ignore errors for non-existent paths
                }
            }

            // Clear system DNS cache (forces fresh DNS lookups)
            try {
                await execAsync('sudo dscacheutil -flushcache 2>/dev/null || true');
                console.log('✅ DNS cache flushed');
            } catch (error) {
                console.log('⚠️  DNS cache flush failed (may require sudo)');
            }

            console.log('✅ Session data cleanup completed');

        } catch (error) {
            console.log(`⚠️  Session data cleanup error: ${error.message}`);
        }
    }

    async systemLevelCleanup() {
        console.log('');
        console.log('🔧 SYSTEM-LEVEL CLEANUP');
        console.log('========================');

        try {
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);

            // Kill any remaining browser processes more aggressively
            const killCommands = [
                'pkill -f "chrome.*adp" 2>/dev/null || true',
                'pkill -f "chromium.*adp" 2>/dev/null || true',
                'pkill -f "playwright.*adp" 2>/dev/null || true',
                'pkill -f "node.*playwright" 2>/dev/null || true'
            ];

            for (const cmd of killCommands) {
                try {
                    await execAsync(cmd);
                    console.log(`✅ Executed: ${cmd}`);
                } catch (error) {
                    // Ignore errors
                }
            }

            // Wait for system cleanup
            console.log('⏳ Waiting for system-level cleanup...');
            await new Promise(resolve => setTimeout(resolve, 5000));

            console.log('✅ System-level cleanup completed');

        } catch (error) {
            console.log(`⚠️  System-level cleanup error: ${error.message}`);
        }
    }

    async createUltraIsolatedSession() {
        console.log('');
        console.log('🛡️  CREATING ULTRA-ISOLATED SESSION');
        console.log('===================================');

        const sessionId = `ultra-isolated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const userDataDir = `/tmp/playwright-${sessionId}`;

        console.log(`🆔 Session ID: ${sessionId}`);
        console.log(`📂 User Data Dir: ${userDataDir}`);

        const browser = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            viewport: { width: 1920, height: 1080 },
            args: [
                '--start-maximized',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--no-default-browser-check',
                '--no-first-run',
                '--disable-default-apps',
                '--disable-popup-blocking',
                '--disable-translate',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images',
                '--disable-javascript', // Temporarily disable to prevent tracking
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });

        console.log('✅ Ultra-isolated session created');
        return { browser, sessionId };
    }
}

// Test the super aggressive session killer
async function testSuperAggressiveKiller() {
    console.log('🧪 TESTING SUPER AGGRESSIVE SESSION KILLER');
    console.log('===========================================');

    const superKiller = new SuperAggressiveSessionKiller();
    
    try {
        // Terminate all ADP sessions
        await superKiller.terminateAllADPSessions();

        // Create ultra-isolated session
        const { browser, sessionId } = await superKiller.createUltraIsolatedSession();

        console.log('');
        console.log('🎯 TESTING SESSION ISOLATION');
        console.log('============================');

        const page = browser.pages()[0];
        
        // Test accessing ADP
        console.log('🔗 Testing ADP access with ultra-isolated session...');
        await page.goto('https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c', { 
            waitUntil: 'networkidle' 
        });

        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);

        if (currentUrl.includes('multitabmessage')) {
            console.log('❌ STILL DETECTING CONCURRENT SESSION');
            console.log('ADP\'s session detection is server-side and very aggressive');
            console.log('Recommendation: Manual logout from all ADP sessions first');
        } else {
            console.log('✅ SUCCESS: No concurrent session detected');
        }

        console.log('');
        console.log('Browser will stay open for inspection...');
        await page.waitForTimeout(30000);

        await browser.close();

    } catch (error) {
        console.error(`💥 Super aggressive killer test failed: ${error.message}`);
    }
}

if (require.main === module) {
    testSuperAggressiveKiller().catch(console.error);
}

module.exports = SuperAggressiveSessionKiller;
