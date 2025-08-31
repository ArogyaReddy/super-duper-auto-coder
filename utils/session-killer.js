const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Session Killer - Aggressively cleans up any existing sessions
 * 
 * This utility ensures no leftover sessions interfere with fresh logins by:
 * 1. Closing all existing browser instances
 * 2. Cleaning up temporary user data directories
 * 3. Clearing system-level browser caches
 * 4. Forcing a completely fresh start
 */
class SessionKiller {
    constructor() {
        this.tempDirs = [
            '/tmp/playwright-*',
            '/tmp/chrome-*',
            '/var/folders/*/T/playwright-*'
        ];
    }

    async killAllSessions() {
        console.log('💥 SESSION KILLER - AGGRESSIVE CLEANUP');
        console.log('=====================================');
        console.log('🎯 Goal: Eliminate ALL existing sessions to prevent conflicts');
        console.log('');

        // Step 1: Close all browser processes
        await this.terminateBrowserProcesses();
        
        // Step 2: Clean temporary directories
        await this.cleanTempDirectories();
        
        // Step 3: Wait for system cleanup
        await this.waitForSystemCleanup();
        
        console.log('');
        console.log('✅ SESSION KILLER COMPLETED');
        console.log('===========================');
        console.log('🧹 All existing sessions have been terminated');
        console.log('🆕 System is ready for fresh session creation');
        console.log('');
    }

    async terminateBrowserProcesses() {
        console.log('🔪 TERMINATING BROWSER PROCESSES');
        console.log('=================================');
        
        try {
            // Kill Chrome/Chromium processes
            const { exec } = require('child_process');
            const util = require('util');
            const execAsync = util.promisify(exec);
            
            // Find and kill Chrome processes
            try {
                await execAsync('pkill -f "Chrome|chrome|chromium"');
                console.log('✅ Chrome processes terminated');
            } catch (error) {
                console.log('ℹ️  No Chrome processes found to terminate');
            }
            
            // Find and kill Playwright processes
            try {
                await execAsync('pkill -f "playwright"');
                console.log('✅ Playwright processes terminated');
            } catch (error) {
                console.log('ℹ️  No Playwright processes found to terminate');
            }
            
        } catch (error) {
            console.log(`⚠️  Process termination warning: ${error.message}`);
        }
    }

    async cleanTempDirectories() {
        console.log('🧹 CLEANING TEMPORARY DIRECTORIES');
        console.log('==================================');
        
        try {
            const { exec } = require('child_process');
            const util = require('util');
            const execAsync = util.promisify(exec);
            
            // Clean Playwright temp directories
            try {
                await execAsync('rm -rf /tmp/playwright-*');
                console.log('✅ Playwright temp directories cleaned');
            } catch (error) {
                console.log('ℹ️  No Playwright temp directories found');
            }
            
            // Clean Chrome temp directories
            try {
                await execAsync('rm -rf /tmp/chrome-*');
                console.log('✅ Chrome temp directories cleaned');
            } catch (error) {
                console.log('ℹ️  No Chrome temp directories found');
            }
            
            // Clean user-specific temp directories
            try {
                await execAsync('find /var/folders -name "playwright-*" -type d -exec rm -rf {} + 2>/dev/null || true');
                console.log('✅ User temp directories cleaned');
            } catch (error) {
                console.log('ℹ️  No user temp directories found');
            }
            
        } catch (error) {
            console.log(`⚠️  Directory cleanup warning: ${error.message}`);
        }
    }

    async waitForSystemCleanup() {
        console.log('⏳ WAITING FOR SYSTEM CLEANUP');
        console.log('==============================');
        console.log('Allowing 3 seconds for system to complete cleanup...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ System cleanup wait completed');
    }

    async createUltraFreshSession() {
        console.log('');
        console.log('🚀 CREATING ULTRA-FRESH SESSION');
        console.log('===============================');
        
        // Kill all existing sessions first
        await this.killAllSessions();
        
        // Create unique session ID
        const sessionId = `ultra-fresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const userDataDir = `/tmp/playwright-${sessionId}`;
        
        console.log(`🆔 Session ID: ${sessionId}`);
        console.log(`📂 User Data Dir: ${userDataDir}`);
        console.log('');
        
        // Launch with maximum isolation
        const browser = await chromium.launchPersistentContext(userDataDir, {
            headless: false,
            viewport: null,
            ignoreHTTPSErrors: true,
            userAgent: this.generateUltraFreshUserAgent(),
            permissions: [],
            locale: 'en-US',
            timezoneId: 'America/New_York',
            args: [
                '--start-maximized',
                '--no-default-browser-check',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--no-service-autorun',
                '--password-store=basic',
                '--use-mock-keychain',
                // Additional isolation flags
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding',
                '--disable-backgrounding-occluded-windows',
                '--disable-restore-session-state',
                '--disable-ipc-flooding-protection',
                '--disable-session-storage'
            ],
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        // Get the page
        const pages = browser.pages();
        const page = pages.length > 0 ? pages[0] : await browser.newPage();
        
        // Ultra-aggressive storage clearing
        await browser.clearCookies();
        await page.addInitScript(() => {
            // Clear all possible storage
            if (window.localStorage) window.localStorage.clear();
            if (window.sessionStorage) window.sessionStorage.clear();
            if (window.indexedDB) {
                try {
                    window.indexedDB.databases().then(databases => {
                        databases.forEach(db => window.indexedDB.deleteDatabase(db.name));
                    });
                } catch (e) {}
            }
            if ('caches' in window) {
                try {
                    caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                    });
                } catch (e) {}
            }
            
            // Hide automation indicators
            delete navigator.__proto__.webdriver;
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', length: 1 },
                    { name: 'Chromium PDF Plugin', length: 1 },
                    { name: 'Chrome PDF Viewer', length: 1 }
                ]
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
        });
        
        console.log('✅ Ultra-fresh session created with maximum isolation');
        
        return {
            browser,
            page,
            sessionId,
            userDataDir
        };
    }

    generateUltraFreshUserAgent() {
        const versions = [
            '120.0.0.0',
            '119.0.0.0', 
            '121.0.0.0',
            '118.0.0.0',
            '122.0.0.0'
        ];
        const version = versions[Math.floor(Math.random() * versions.length)];
        const build = Math.floor(Math.random() * 9999) + 1000;
        
        return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36/${build}`;
    }
}

// Test the session killer
async function testSessionKiller() {
    console.log('🧪 TESTING SESSION KILLER');
    console.log('=========================');
    
    const killer = new SessionKiller();
    
    try {
        const { browser, page, sessionId } = await killer.createUltraFreshSession();
        
        console.log('');
        console.log('🎯 ULTRA-FRESH SESSION TEST');
        console.log('===========================');
        console.log(`✅ Session created: ${sessionId}`);
        console.log(`✅ Browser ready: ${!!browser}`);
        console.log(`✅ Page ready: ${!!page}`);
        
        // Test navigation
        await page.goto('https://www.google.com');
        const title = await page.title();
        console.log(`✅ Navigation test: ${title}`);
        
        console.log('');
        console.log('🎉 SESSION KILLER TEST COMPLETED SUCCESSFULLY!');
        console.log('===============================================');
        console.log('The ultra-fresh session is ready for ADP login testing.');
        
        // Keep open for 30 seconds for inspection
        console.log('Browser will stay open for 30 seconds for inspection...');
        await page.waitForTimeout(30000);
        
        await browser.close();
        
    } catch (error) {
        console.error(`💥 Session killer test failed: ${error.message}`);
    }
}

// Export for use in other modules
module.exports = { SessionKiller };

// Run test if executed directly
if (require.main === module) {
    testSessionKiller().catch(console.error);
}
