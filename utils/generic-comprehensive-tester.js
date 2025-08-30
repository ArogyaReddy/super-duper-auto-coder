#!/usr/bin/env node

/**
 * 🎯 ROBUST ADP COMPREHENSIVE TESTER
 * 
 * This tool performs comprehensive testing of ALL links with improved authentication
 * and better error handling for the ADP application.
 */

const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

class RobustADPTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.authenticated = false;
        this.baseUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
        this.credentials = {
            username: 'Arogya@24890183',
            password: 'Test0705'
        };
        this.results = {
            started_at: new Date().toISOString(),
            authentication: {},
            comprehensive_testing: {
                total_links_cataloged: 0,
                total_links_tested: 0,
                successful_tests: 0,
                failed_tests: 0,
                not_tested: 0,
                test_coverage_percentage: 0,
                success_rate_percentage: 0
            },
            detailed_results: [],
            summary: {}
        };
    }

    async runComprehensiveTesting() {
        console.log('🎯 ROBUST ADP COMPREHENSIVE TESTING');
        console.log('====================================');
        console.log('🔧 Using corrected ADP login URL');
        console.log('📊 Will test ALL 183 cataloged links');
        console.log('⚡ Improved authentication and error handling');
        console.log('');

        try {
            // Load existing catalog
            await this.loadExistingCatalog();
            
            // Setup browser with better configuration
            await this.setupBrowser();
            
            // Perform robust authentication
            await this.performRobustAuthentication();
            
            if (this.authenticated) {
                // Test all cataloged links
                await this.testAllCatalogedLinks();
                
                // Generate comprehensive reports
                await this.generateFinalReports();
            } else {
                console.error('❌ Cannot proceed without authentication');
            }
            
        } catch (error) {
            console.error('❌ Comprehensive testing failed:', error.message);
            this.results.error = error.message;
        } finally {
            await this.cleanup();
        }
    }

    async loadExistingCatalog() {
        console.log('📁 Loading existing link catalog...');
        
        const reportsDir = path.join(__dirname, '..', 'reports');
        const resultsPath = path.join(reportsDir, 'real-adp-test-results.json');
        
        if (await fs.pathExists(resultsPath)) {
            const existingResults = JSON.parse(await fs.readFile(resultsPath, 'utf8'));
            const links = existingResults.pageAnalysis?.links || [];
            
            this.linkCatalog = links.map((link, index) => ({
                id: index + 1,
                text: link.text || 'No display text',
                href: link.href,
                target: link.target || '_self',
                tagName: link.tagName || 'a',
                onclick: link.onclick || null,
                testId: link.testId || null,
                category: this.categorizeLink(link.href, link.text)
            }));
            
            this.results.comprehensive_testing.total_links_cataloged = this.linkCatalog.length;
            console.log(`   ✅ Loaded ${this.linkCatalog.length} links from catalog`);
            
        } else {
            throw new Error('No existing catalog found. Please run real-adp-tester.js first.');
        }
    }

    async setupBrowser() {
        console.log('🚀 Setting up browser with optimized configuration...');
        
        this.browser = await chromium.launch({
            headless: false, // Keep visible for debugging
            slowMo: 200,     // Slower interactions for reliability
            args: [
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-blink-features=AutomationControlled',
                '--no-first-run',
                '--disable-extensions-except=/Users/arog/auto/auto/qa_automation/auto-coder/utils',
                '--disable-extensions',
                '--disable-plugins'
            ]
        });
        
        this.page = await this.browser.newPage();
        
        // Configure page for better reliability
        await this.page.setViewportSize({ width: 1280, height: 720 });
        this.page.setDefaultTimeout(20000);
        this.page.setDefaultNavigationTimeout(30000);
        
        // Set user agent to avoid bot detection
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        console.log('   ✅ Browser configured for reliable testing');
    }

    async performRobustAuthentication() {
        console.log('🔐 Performing robust ADP authentication...');
        
        try {
            // Navigate to ADP login with full URL
            console.log(`   📍 Navigating to: ${this.baseUrl}`);
            await this.page.goto(this.baseUrl, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            // Wait for page to fully load
            await this.page.waitForTimeout(5000);
            
            // Take screenshot for debugging
            await this.page.screenshot({ 
                path: path.join(__dirname, '..', 'reports', 'login-page-screenshot.png'),
                fullPage: true 
            });
            console.log('   📸 Login page screenshot saved');
            
            // Try multiple strategies to find username field
            console.log('   🔍 Looking for username field...');
            const usernameField = await this.findUsernameField();
            
            if (usernameField) {
                console.log('   📝 Entering username...');
                await this.page.fill(usernameField, this.credentials.username);
                await this.page.waitForTimeout(1000);
                
                // Find and fill password field
                console.log('   🔍 Looking for password field...');
                const passwordField = await this.findPasswordField();
                
                if (passwordField) {
                    console.log('   🔒 Entering password...');
                    await this.page.fill(passwordField, this.credentials.password);
                    await this.page.waitForTimeout(1000);
                    
                    // Submit the form
                    console.log('   🚀 Submitting login form...');
                    await this.submitLoginForm();
                    
                    // Wait for authentication to complete
                    await this.waitForAuthentication();
                    
                } else {
                    throw new Error('Could not find password field');
                }
            } else {
                throw new Error('Could not find username field');
            }
            
        } catch (error) {
            console.error('   ❌ Authentication failed:', error.message);
            
            // Take error screenshot
            await this.page.screenshot({ 
                path: path.join(__dirname, '..', 'reports', 'auth-error-screenshot.png'),
                fullPage: true 
            });
            
            this.results.authentication = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            
            throw error;
        }
    }

    async findUsernameField() {
        const selectors = [
            'input[name="username"]',
            'input[id="username"]',
            'input[type="text"]',
            'input[placeholder*="username" i]',
            'input[placeholder*="user" i]',
            'input[placeholder*="email" i]',
            'input[aria-label*="username" i]',
            'input[aria-label*="user" i]',
            'input[data-testid*="username"]',
            'input[data-testid*="user"]',
            'form input[type="text"]:first-of-type',
            '.username input',
            '.user-input input',
            '#username',
            '#user',
            '#email'
        ];
        
        for (const selector of selectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 2000 });
                const isVisible = await this.page.isVisible(selector);
                if (isVisible) {
                    console.log(`   ✅ Found username field: ${selector}`);
                    return selector;
                }
            } catch (e) {
                continue;
            }
        }
        
        return null;
    }

    async findPasswordField() {
        const selectors = [
            'input[name="password"]',
            'input[id="password"]',
            'input[type="password"]',
            'input[placeholder*="password" i]',
            'input[aria-label*="password" i]',
            'input[data-testid*="password"]',
            '.password input',
            '#password',
            '#pwd'
        ];
        
        for (const selector of selectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 2000 });
                const isVisible = await this.page.isVisible(selector);
                if (isVisible) {
                    console.log(`   ✅ Found password field: ${selector}`);
                    return selector;
                }
            } catch (e) {
                continue;
            }
        }
        
        return null;
    }

    async submitLoginForm() {
        const submitSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Sign In")',
            'button:has-text("Log In")',
            'button:has-text("Login")',
            'button:has-text("Continue")',
            '.login-button',
            '.submit-button',
            '.btn-submit',
            'form button:last-of-type',
            '[data-testid*="submit"]',
            '[data-testid*="login"]'
        ];
        
        for (const selector of submitSelectors) {
            try {
                await this.page.waitForSelector(selector, { timeout: 2000 });
                const isVisible = await this.page.isVisible(selector);
                if (isVisible) {
                    console.log(`   🎯 Clicking submit button: ${selector}`);
                    await this.page.click(selector);
                    return;
                }
            } catch (e) {
                continue;
            }
        }
        
        // If no submit button found, try pressing Enter
        console.log('   ⌨️  No submit button found, trying Enter key...');
        await this.page.keyboard.press('Enter');
    }

    async waitForAuthentication() {
        console.log('   ⏳ Waiting for authentication to complete...');
        
        // Wait for either success or error indicators
        try {
            await this.page.waitForFunction(() => {
                const url = window.location.href;
                return url.includes('runpayrollmain') || 
                       url.includes('dashboard') || 
                       url.includes('home') ||
                       document.querySelector('.error') ||
                       document.querySelector('.alert');
            }, { timeout: 30000 });
            
            await this.page.waitForTimeout(3000);
            
            const finalUrl = this.page.url();
            console.log(`   📍 Final URL: ${finalUrl}`);
            
            if (finalUrl.includes('runpayrollmain') || 
                finalUrl.includes('dashboard') || 
                (finalUrl.includes('adp.com') && !finalUrl.includes('signin'))) {
                
                this.authenticated = true;
                this.results.authentication = {
                    success: true,
                    final_url: finalUrl,
                    timestamp: new Date().toISOString()
                };
                
                console.log('   ✅ Authentication successful!');
                
                // Take success screenshot
                await this.page.screenshot({ 
                    path: path.join(__dirname, '..', 'reports', 'auth-success-screenshot.png'),
                    fullPage: true 
                });
                
            } else {
                throw new Error(`Authentication failed - redirected to: ${finalUrl}`);
            }
            
        } catch (error) {
            throw new Error(`Authentication timeout or failed: ${error.message}`);
        }
    }

    async testAllCatalogedLinks() {
        console.log('🧪 Starting comprehensive link testing...');
        console.log(`📊 Testing ${this.linkCatalog.length} cataloged links`);
        
        let currentIndex = 0;
        
        for (const link of this.linkCatalog) {
            currentIndex++;
            console.log(`\n🔍 Testing ${currentIndex}/${this.linkCatalog.length}: "${link.text.substring(0, 50)}"`);
            console.log(`   🔗 URL: ${link.href}`);
            
            const testResult = await this.testSingleLink(link, currentIndex);
            this.results.detailed_results.push(testResult);
            
            // Update counters
            this.results.comprehensive_testing.total_links_tested = currentIndex;
            
            if (testResult.success) {
                this.results.comprehensive_testing.successful_tests++;
                console.log(`   ✅ SUCCESS (${testResult.response_time_ms}ms)`);
            } else {
                this.results.comprehensive_testing.failed_tests++;
                console.log(`   ❌ FAILED: ${testResult.error_message}`);
            }
            
            // Brief pause between tests
            await this.page.waitForTimeout(1000);
            
            // Save progress every 10 tests
            if (currentIndex % 10 === 0) {
                await this.saveProgressReport(currentIndex);
                console.log(`   💾 Progress saved (${currentIndex}/${this.linkCatalog.length})`);
            }
        }
        
        console.log(`\n✅ Comprehensive testing completed!`);
        console.log(`📊 Results: ${this.results.comprehensive_testing.successful_tests} passed, ${this.results.comprehensive_testing.failed_tests} failed`);
    }

    async testSingleLink(link, index) {
        const testResult = {
            id: link.id,
            index: index,
            link_text: link.text,
            link_href: link.href,
            link_category: link.category,
            test_timestamp: new Date().toISOString(),
            initial_url: this.page.url(),
            final_url: null,
            success: false,
            error_message: null,
            error_type: null,
            response_time_ms: 0,
            status_code: null,
            url_changed: false,
            navigation_successful: false
        };
        
        const startTime = Date.now();
        
        try {
            const initialUrl = this.page.url();
            
            if (link.href && link.href.startsWith('http')) {
                // Test HTTP links by navigation
                const response = await this.page.goto(link.href, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 10000 
                });
                
                testResult.status_code = response ? response.status() : null;
                testResult.navigation_successful = response && response.status() < 400;
                testResult.success = testResult.navigation_successful;
                
                if (!testResult.success) {
                    testResult.error_message = `HTTP ${testResult.status_code || 'No response'}`;
                    testResult.error_type = 'http_error';
                }
                
            } else if (link.href && link.href.startsWith('#')) {
                // Test anchor links
                try {
                    const anchorExists = await this.page.evaluate((href) => {
                        const target = document.querySelector(href) || 
                                      document.getElementById(href.substring(1));
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                            return true;
                        }
                        return false;
                    }, link.href);
                    
                    testResult.success = anchorExists;
                    if (!testResult.success) {
                        testResult.error_message = 'Anchor target not found';
                        testResult.error_type = 'anchor_error';
                    }
                } catch (anchorError) {
                    testResult.error_message = anchorError.message;
                    testResult.error_type = 'anchor_error';
                }
                
            } else {
                // Test by attempting to click the element
                try {
                    const clicked = await this.page.evaluate((linkData) => {
                        const elements = Array.from(document.querySelectorAll('a, button, [onclick]'));
                        const target = elements.find(el => 
                            (el.textContent && el.textContent.includes(linkData.text)) ||
                            el.href === linkData.href ||
                            (el.id && el.id === linkData.id)
                        );
                        
                        if (target) {
                            target.click();
                            return true;
                        }
                        return false;
                    }, link);
                    
                    if (clicked) {
                        await this.page.waitForTimeout(2000);
                        testResult.success = true;
                    } else {
                        testResult.error_message = 'Element not found for clicking';
                        testResult.error_type = 'element_not_found';
                    }
                } catch (genericError) {
                    testResult.error_message = genericError.message;
                    testResult.error_type = 'generic_error';
                }
            }
            
            // Record final state
            testResult.final_url = this.page.url();
            testResult.url_changed = initialUrl !== testResult.final_url;
            testResult.response_time_ms = Date.now() - startTime;
            
            // Return to authenticated page if navigation occurred
            if (testResult.url_changed && !testResult.final_url.includes('runpayrollmain')) {
                try {
                    await this.page.goBack({ timeout: 5000 });
                    await this.page.waitForTimeout(1000);
                } catch (navError) {
                    // If back doesn't work, re-authenticate
                    console.log(`   ⚠️  Re-authenticating after navigation...`);
                    await this.performRobustAuthentication();
                }
            }
            
        } catch (error) {
            testResult.error_message = error.message;
            testResult.response_time_ms = Date.now() - startTime;
            
            if (error.message.includes('Timeout')) {
                testResult.error_type = 'timeout';
            } else if (error.message.includes('net::')) {
                testResult.error_type = 'network';
            } else {
                testResult.error_type = 'unknown';
            }
        }
        
        return testResult;
    }

    categorizeLink(href, text) {
        const url = (href || '').toLowerCase();
        const linkText = (text || '').toLowerCase();
        
        if (url.includes('payroll') || linkText.includes('payroll')) return 'Payroll';
        if (url.includes('hr') || linkText.includes('hr') || linkText.includes('human')) return 'Human Resources';
        if (url.includes('report') || linkText.includes('report')) return 'Reports';
        if (url.includes('company') || linkText.includes('company')) return 'Company Settings';
        if (url.includes('tax') || linkText.includes('tax')) return 'Tax Management';
        if (url.includes('employee') || linkText.includes('employee')) return 'Employee Management';
        if (url.includes('time') || linkText.includes('time')) return 'Time Management';
        if (url.includes('billing') || linkText.includes('billing')) return 'Billing';
        if (url.includes('help') || linkText.includes('help') || linkText.includes('support')) return 'Support';
        return 'Other';
    }

    async saveProgressReport(currentIndex) {
        const progressReport = {
            progress: {
                current_index: currentIndex,
                total_links: this.linkCatalog.length,
                completion_percentage: ((currentIndex / this.linkCatalog.length) * 100).toFixed(1),
                timestamp: new Date().toISOString()
            },
            current_results: this.results
        };
        
        const progressPath = path.join(__dirname, '..', 'reports', 'comprehensive-testing-progress.json');
        await fs.writeFile(progressPath, JSON.stringify(progressReport, null, 2));
    }

    async generateFinalReports() {
        console.log('\n📊 Generating comprehensive final reports...');
        
        const totalTested = this.results.comprehensive_testing.total_links_tested;
        const successful = this.results.comprehensive_testing.successful_tests;
        const failed = this.results.comprehensive_testing.failed_tests;
        const notTested = this.results.comprehensive_testing.total_links_cataloged - totalTested;
        
        this.results.comprehensive_testing.not_tested = notTested;
        this.results.comprehensive_testing.test_coverage_percentage = 
            ((totalTested / this.results.comprehensive_testing.total_links_cataloged) * 100).toFixed(1);
        this.results.comprehensive_testing.success_rate_percentage = 
            totalTested > 0 ? ((successful / totalTested) * 100).toFixed(1) : 0;
        
        this.results.summary = {
            test_completed_at: new Date().toISOString(),
            test_duration_minutes: ((Date.now() - new Date(this.results.started_at).getTime()) / 1000 / 60).toFixed(1),
            total_links_cataloged: this.results.comprehensive_testing.total_links_cataloged,
            total_links_tested: totalTested,
            links_not_tested: notTested,
            successful_tests: successful,
            failed_tests: failed,
            test_coverage_percentage: parseFloat(this.results.comprehensive_testing.test_coverage_percentage),
            success_rate_percentage: parseFloat(this.results.comprehensive_testing.success_rate_percentage)
        };
        
        // Save comprehensive results
        const reportsDir = path.join(__dirname, '..', 'reports');
        const finalResultsPath = path.join(reportsDir, 'comprehensive-final-results.json');
        await fs.writeFile(finalResultsPath, JSON.stringify(this.results, null, 2));
        
        // Generate CSV for Excel
        const csvData = [
            ['ID', 'Link Text', 'Link URL', 'Category', 'Test Status', 'Error Message', 'Response Time (ms)', 'Status Code', 'URL Changed', 'Test Timestamp']
        ];
        
        this.results.detailed_results.forEach(result => {
            csvData.push([
                result.id,
                result.link_text.replace(/"/g, '""').substring(0, 100),
                result.link_href,
                result.link_category,
                result.success ? 'PASSED' : 'FAILED',
                (result.error_message || 'None').replace(/"/g, '""').substring(0, 200),
                result.response_time_ms,
                result.status_code || 'N/A',
                result.url_changed ? 'Yes' : 'No',
                result.test_timestamp
            ]);
        });
        
        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const csvPath = path.join(reportsDir, 'comprehensive-final-results.csv');
        await fs.writeFile(csvPath, csvContent);
        
        console.log('✅ Comprehensive final reports generated!');
        this.displayFinalSummary();
    }

    displayFinalSummary() {
        console.log('\n🎯 COMPREHENSIVE TESTING COMPLETE');
        console.log('==================================');
        console.log(`📊 Total Links Cataloged: ${this.results.summary.total_links_cataloged}`);
        console.log(`🧪 Total Links Tested: ${this.results.summary.total_links_tested}`);
        console.log(`❌ Links Not Tested: ${this.results.summary.links_not_tested}`);
        console.log(`✅ Successful Tests: ${this.results.summary.successful_tests}`);
        console.log(`🚨 Failed Tests: ${this.results.summary.failed_tests}`);
        console.log(`📈 Test Coverage: ${this.results.summary.test_coverage_percentage}%`);
        console.log(`💯 Success Rate: ${this.results.summary.success_rate_percentage}%`);
        console.log(`⏱️  Test Duration: ${this.results.summary.test_duration_minutes} minutes`);
        console.log('');
        console.log('📄 Reports Generated:');
        console.log('   📊 comprehensive-final-results.json - Complete data');
        console.log('   📋 comprehensive-final-results.csv - Excel ready');
        console.log('   📈 comprehensive-testing-progress.json - Progress tracking');
        console.log('');
        console.log('🎯 Ready for stakeholder review and action planning!');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// CLI interface
async function main() {
    const tester = new RobustADPTester();
    await tester.runComprehensiveTesting();
}

module.exports = { RobustADPTester };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
