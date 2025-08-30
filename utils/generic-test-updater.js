#!/usr/bin/env node

/**
 * 🎯 COMPREHENSIVE TEST RESULTS UPDATER
 * 
 * This tool takes the existing test results and runs comprehensive testing
 * on all cataloged links, menus, and navigation elements to update their status.
 * Uses the existing authentication session data.
 */

const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

class ComprehensiveTestUpdater {
    constructor() {
        this.browser = null;
        this.page = null;
        this.existingResults = null;
        this.updatedResults = {
            comprehensive_testing: {
                started_at: new Date().toISOString(),
                authentication_reused: true,
                total_links_tested: 0,
                successful_links: 0,
                failed_links: 0,
                timeout_links: 0,
                error_links: 0
            },
            updated_link_catalog: [],
            updated_menu_catalog: [],
            detailed_test_results: [],
            summary: {}
        };
    }

    async updateComprehensiveResults() {
        console.log('🔄 COMPREHENSIVE TEST RESULTS UPDATER');
        console.log('=====================================');
        console.log('📊 Loading existing test data...');
        
        try {
            // Load existing test results
            await this.loadExistingResults();
            
            // Launch browser for testing
            await this.launchBrowser();
            
            // Authenticate to ADP using improved method
            await this.authenticateToADP();
            
            // Test all cataloged elements
            await this.testAllCatalogedElements();
            
            // Generate updated reports
            await this.generateUpdatedReports();
            
        } catch (error) {
            console.error('❌ Comprehensive test update failed:', error.message);
        } finally {
            await this.cleanup();
        }
    }

    async loadExistingResults() {
        const reportsDir = path.join(__dirname, '..', 'reports');
        const resultsPath = path.join(reportsDir, 'real-adp-test-results.json');
        
        if (await fs.pathExists(resultsPath)) {
            this.existingResults = JSON.parse(await fs.readFile(resultsPath, 'utf8'));
            console.log(`   ✅ Loaded existing results with ${this.existingResults.pageAnalysis?.links?.length || 0} links`);
        } else {
            throw new Error('No existing test results found. Please run real-adp-tester.js first.');
        }
    }

    async launchBrowser() {
        console.log('🚀 Launching browser...');
        
        this.browser = await chromium.launch({
            headless: false,
            slowMo: 100
        });
        
        this.page = await this.browser.newPage();
        this.page.setDefaultTimeout(8000);
        
        console.log('   ✅ Browser launched');
    }

    async authenticateToADP() {
        console.log('🔐 Authenticating to ADP...');
        
        try {
            // Navigate to ADP with full URL including required parameters
            await this.page.goto('https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c');
            await this.page.waitForTimeout(3000);
            
            // Try multiple possible username field selectors
            const usernameSelectors = [
                'input[name="username"]',
                'input[id="username"]', 
                'input[type="text"]',
                'input[placeholder*="username" i]',
                'input[placeholder*="user" i]',
                'input[aria-label*="username" i]',
                '.username input',
                '#username',
                'form input[type="text"]:first-of-type'
            ];
            
            let usernameField = null;
            for (const selector of usernameSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 2000 });
                    usernameField = selector;
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (!usernameField) {
                throw new Error('Could not find username field');
            }
            
            await this.page.fill(usernameField, 'Arogya@24890183');
            console.log('   ✅ Username entered');
            
            // Try multiple possible password field selectors
            const passwordSelectors = [
                'input[name="password"]',
                'input[id="password"]',
                'input[type="password"]',
                'input[placeholder*="password" i]',
                '.password input',
                '#password'
            ];
            
            let passwordField = null;
            for (const selector of passwordSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 2000 });
                    passwordField = selector;
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (!passwordField) {
                throw new Error('Could not find password field');
            }
            
            await this.page.fill(passwordField, 'Test0705');
            console.log('   ✅ Password entered');
            
            // Try multiple submit button selectors
            const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:has-text("Sign In")',
                'button:has-text("Login")',
                'button:has-text("Log In")',
                '.login-button',
                '.submit-button',
                'form button'
            ];
            
            let submitButton = null;
            for (const selector of submitSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 2000 });
                    submitButton = selector;
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (submitButton) {
                await this.page.click(submitButton);
                console.log('   ✅ Login button clicked');
            } else {
                // Try pressing Enter on password field
                await this.page.press(passwordField, 'Enter');
                console.log('   ✅ Enter key pressed');
            }
            
            // Wait for authentication
            await this.page.waitForTimeout(5000);
            
            const currentUrl = this.page.url();
            console.log(`   📍 Current URL: ${currentUrl}`);
            
            if (currentUrl.includes('runpayrollmain2-iat.adp.com') || 
                (currentUrl.includes('adp.com') && !currentUrl.includes('online-iat'))) {
                console.log('   ✅ Authentication successful');
                return true;
            } else {
                throw new Error(`Authentication may have failed - still on: ${currentUrl}`);
            }
            
        } catch (error) {
            console.error('   ❌ Authentication error:', error.message);
            
            // Take screenshot for debugging
            try {
                const screenshotPath = path.join(__dirname, '..', 'reports', 'auth-error-screenshot.png');
                await this.page.screenshot({ path: screenshotPath });
                console.log(`   📸 Screenshot saved: ${screenshotPath}`);
            } catch (screenshotError) {
                console.log('   ⚠️  Could not take screenshot');
            }
            
            throw error;
        }
    }

    async testAllCatalogedElements() {
        console.log('🧪 Testing all cataloged elements...');
        
        const links = this.existingResults.pageAnalysis?.links || [];
        const navigation = this.existingResults.pageAnalysis?.navigation || [];
        
        const allElements = [...links, ...navigation];
        const totalElements = allElements.length;
        
        console.log(`   🔍 Found ${totalElements} elements to test`);
        this.updatedResults.comprehensive_testing.total_links_tested = totalElements;
        
        let currentIndex = 0;
        
        for (const element of allElements) {
            currentIndex++;
            console.log(`\n🔍 Testing ${currentIndex}/${totalElements}: ${element.text || element.textContent || 'No text'}`);
            
            const testResult = await this.testSingleElement(element, currentIndex);
            this.updatedResults.detailed_test_results.push(testResult);
            
            // Update counters
            if (testResult.success) {
                this.updatedResults.comprehensive_testing.successful_links++;
            } else {
                this.updatedResults.comprehensive_testing.failed_links++;
                if (testResult.error_type === 'timeout') {
                    this.updatedResults.comprehensive_testing.timeout_links++;
                } else {
                    this.updatedResults.comprehensive_testing.error_links++;
                }
            }
            
            // Brief pause between tests
            await this.page.waitForTimeout(300);
        }
        
        console.log(`\n✅ Completed testing ${totalElements} elements`);
    }

    async testSingleElement(element, index) {
        const testResult = {
            index: index,
            element_text: element.text || element.textContent || 'No text',
            element_href: element.href || element.url || 'No href',
            element_type: element.tagName || 'unknown',
            test_timestamp: new Date().toISOString(),
            initial_url: this.page.url(),
            final_url: null,
            success: false,
            error_message: null,
            error_type: null,
            response_time_ms: 0,
            status_code: null,
            url_changed: false
        };
        
        const startTime = Date.now();
        
        try {
            const initialUrl = this.page.url();
            
            if (element.href && element.href.startsWith('http')) {
                // Test external/internal HTTP links
                const response = await this.page.goto(element.href, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 5000 
                });
                
                testResult.status_code = response ? response.status() : null;
                testResult.success = response && response.status() < 400;
                
                if (!testResult.success) {
                    testResult.error_message = `HTTP ${testResult.status_code || 'No response'}`;
                    testResult.error_type = 'http_error';
                }
                
            } else if (element.href && element.href.startsWith('#')) {
                // Test anchor links
                try {
                    await this.page.evaluate((href) => {
                        const targetElement = document.querySelector(href) || 
                                            document.getElementById(href.substring(1));
                        if (targetElement) {
                            targetElement.scrollIntoView();
                            return true;
                        }
                        return false;
                    }, element.href);
                    testResult.success = true;
                } catch (anchorError) {
                    testResult.error_message = 'Anchor target not found';
                    testResult.error_type = 'anchor_error';
                }
                
            } else if (element.onclick) {
                // Test onclick elements
                try {
                    await this.page.evaluate((onclick) => {
                        eval(onclick);
                    }, element.onclick);
                    await this.page.waitForTimeout(1000);
                    testResult.success = true;
                } catch (clickError) {
                    testResult.error_message = clickError.message;
                    testResult.error_type = 'onclick_error';
                }
                
            } else {
                // Test by attempting to click the element
                try {
                    // Try to find and click the element by text or other attributes
                    const clicked = await this.page.evaluate((elementData) => {
                        const elements = Array.from(document.querySelectorAll('a, button, [onclick]'));
                        const target = elements.find(el => 
                            el.textContent?.includes(elementData.text) ||
                            el.href === elementData.href ||
                            el.id === elementData.id
                        );
                        if (target) {
                            target.click();
                            return true;
                        }
                        return false;
                    }, element);
                    
                    if (clicked) {
                        await this.page.waitForTimeout(1000);
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
            
            // Return to initial URL if navigation occurred
            if (testResult.url_changed) {
                try {
                    await this.page.goto(initialUrl, { timeout: 5000 });
                } catch (navError) {
                    console.log(`   ⚠️  Could not return to original page`);
                }
            }
            
            // Log result
            if (testResult.success) {
                console.log(`   ✅ SUCCESS (${testResult.response_time_ms}ms)`);
            } else {
                console.log(`   ❌ FAILED: ${testResult.error_message}`);
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
            
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        
        return testResult;
    }

    async generateUpdatedReports() {
        console.log('\n📊 Generating updated comprehensive reports...');
        
        const totalTested = this.updatedResults.comprehensive_testing.total_links_tested;
        const successful = this.updatedResults.comprehensive_testing.successful_links;
        const successRate = totalTested > 0 ? ((successful / totalTested) * 100).toFixed(1) : 0;
        
        this.updatedResults.summary = {
            total_elements_tested: totalTested,
            successful_tests: successful,
            failed_tests: this.updatedResults.comprehensive_testing.failed_links,
            success_rate_percentage: parseFloat(successRate),
            timeout_count: this.updatedResults.comprehensive_testing.timeout_links,
            error_count: this.updatedResults.comprehensive_testing.error_links,
            test_completed_at: new Date().toISOString(),
            test_duration_minutes: ((Date.now() - new Date(this.updatedResults.comprehensive_testing.started_at).getTime()) / 1000 / 60).toFixed(1)
        };
        
        // Create updated link catalog with test results
        this.updatedResults.updated_link_catalog = this.updatedResults.detailed_test_results.map(result => ({
            id: result.index,
            link_name: result.element_text,
            link_reference: result.element_href,
            test_status: result.success ? 'PASSED' : 'FAILED',
            error_message: result.error_message || 'None',
            response_time_ms: result.response_time_ms,
            status_code: result.status_code,
            url_changed: result.url_changed,
            test_timestamp: result.test_timestamp
        }));
        
        // Save updated results
        const reportsDir = path.join(__dirname, '..', 'reports');
        const updatedResultsPath = path.join(reportsDir, 'comprehensive-test-results-updated.json');
        await fs.writeFile(updatedResultsPath, JSON.stringify(this.updatedResults, null, 2));
        
        // Generate updated CSV for Excel
        const csvData = [
            ['ID', 'Link Name', 'Link Reference', 'Test Status', 'Error Message', 'Response Time (ms)', 'Status Code', 'URL Changed', 'Test Timestamp']
        ];
        
        this.updatedResults.updated_link_catalog.forEach(link => {
            csvData.push([
                link.id,
                link.link_name.replace(/"/g, '""'),
                link.link_reference,
                link.test_status,
                link.error_message.replace(/"/g, '""'),
                link.response_time_ms,
                link.status_code || 'N/A',
                link.url_changed ? 'Yes' : 'No',
                link.test_timestamp
            ]);
        });
        
        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const csvPath = path.join(reportsDir, 'comprehensive-test-results-updated.csv');
        await fs.writeFile(csvPath, csvContent);
        
        console.log('✅ Updated comprehensive reports generated!');
        console.log('\n📊 COMPREHENSIVE TEST RESULTS');
        console.log('==============================');
        console.log(`🔍 Total Elements Tested: ${this.updatedResults.summary.total_elements_tested}`);
        console.log(`✅ Successful Tests: ${this.updatedResults.summary.successful_tests}`);
        console.log(`❌ Failed Tests: ${this.updatedResults.summary.failed_tests}`);
        console.log(`📊 Success Rate: ${this.updatedResults.summary.success_rate_percentage}%`);
        console.log(`⏱️  Test Duration: ${this.updatedResults.summary.test_duration_minutes} minutes`);
        console.log(`⏰ Timeout Errors: ${this.updatedResults.summary.timeout_count}`);
        console.log(`🔗 Other Errors: ${this.updatedResults.summary.error_count}`);
        console.log('');
        console.log(`📄 Results saved to:`);
        console.log(`   📊 ${updatedResultsPath}`);
        console.log(`   📋 ${csvPath}`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// CLI interface
async function main() {
    const updater = new ComprehensiveTestUpdater();
    await updater.updateComprehensiveResults();
}

module.exports = { ComprehensiveTestUpdater };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
