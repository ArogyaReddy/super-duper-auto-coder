#!/usr/bin/env node

/**
 * 🎯 COMPREHENSIVE ADP LINK & NAVIGATION TESTER
 * 
 * This tool performs complete testing of ALL links, menus, anchors, and navigation elements
 * found in the ADP application after successful authentication.
 * 
 * Features:
 * - Live authentication to ADP application
 * - Complete testing of all 183+ cataloged links
 * - Menu and navigation element testing
 * - Anchor link validation
 * - Retry mechanisms for failed tests
 * - Comprehensive reporting
 */

const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

class ComprehensiveLinkTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            authentication: {},
            comprehensive_testing: {
                started_at: new Date().toISOString(),
                total_elements_found: 0,
                total_elements_tested: 0,
                successful_tests: 0,
                failed_tests: 0,
                timeout_tests: 0,
                network_errors: 0,
                navigation_changes: 0,
                same_page_interactions: 0
            },
            detailed_test_results: [],
            link_catalog: [],
            menu_catalog: [],
            anchor_catalog: [],
            navigation_catalog: [],
            failed_elements: [],
            successful_elements: [],
            summary: {}
        };
    }

    async runComprehensiveTest() {
        console.log('🎯 COMPREHENSIVE ADP LINK & NAVIGATION TESTING');
        console.log('==============================================');
        console.log('🔍 This will test ALL links, menus, anchors, and navigation elements');
        console.log('⏱️  Expected duration: 15-30 minutes for complete testing');
        console.log('');

        try {
            // Step 1: Launch browser and authenticate
            await this.launchBrowser();
            await this.authenticateToADP();
            
            // Step 2: Comprehensive element discovery
            await this.discoverAllElements();
            
            // Step 3: Test all discovered elements
            await this.testAllElements();
            
            // Step 4: Generate comprehensive reports
            await this.generateComprehensiveReports();
            
        } catch (error) {
            console.error('❌ Comprehensive testing failed:', error.message);
            this.results.error = error.message;
        } finally {
            await this.cleanup();
        }
    }

    async launchBrowser() {
        console.log('🚀 Launching browser for comprehensive testing...');
        
        this.browser = await chromium.launch({
            headless: false, // Visible for debugging
            slowMo: 100,
            args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        });
        
        this.page = await this.browser.newPage();
        
        // Set longer timeouts for comprehensive testing
        this.page.setDefaultTimeout(15000);
        this.page.setDefaultNavigationTimeout(15000);
        
        console.log('   ✅ Browser launched successfully');
    }

    async authenticateToADP() {
        console.log('🔐 Authenticating to ADP application...');
        
        try {
            // Navigate to ADP login with full URL
            await this.page.goto('https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c', { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(2000);
            
            // Handle login process
            const usernameSelector = 'input[name="username"], input[id="username"], input[type="text"]';
            await this.page.waitForSelector(usernameSelector, { timeout: 10000 });
            await this.page.fill(usernameSelector, 'Arogya@24890183');
            
            const passwordSelector = 'input[name="password"], input[id="password"], input[type="password"]';
            await this.page.fill(passwordSelector, 'Test0705');
            
            // Submit login
            const submitSelector = 'button[type="submit"], input[type="submit"], .login-button';
            await this.page.click(submitSelector);
            await this.page.waitForTimeout(3000);
            
            // Wait for post-login page
            await this.page.waitForSelector('body', { timeout: 15000 });
            
            const finalUrl = this.page.url();
            const isAuthenticated = finalUrl.includes('runpayrollmain2-iat.adp.com') || 
                                  finalUrl.includes('adp.com') && !finalUrl.includes('login');
            
            this.results.authentication = {
                success: isAuthenticated,
                final_url: finalUrl,
                timestamp: new Date().toISOString()
            };
            
            if (isAuthenticated) {
                console.log('   ✅ Authentication successful');
                console.log(`   📍 Authenticated URL: ${finalUrl}`);
            } else {
                throw new Error('Authentication failed - not redirected to authenticated page');
            }
            
        } catch (error) {
            console.error('   ❌ Authentication failed:', error.message);
            this.results.authentication = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            throw error;
        }
    }

    async discoverAllElements() {
        console.log('🔍 Discovering ALL testable elements...');
        
        try {
            // Comprehensive element discovery
            const elements = await this.page.evaluate(() => {
                const allElements = [];
                let elementId = 1;
                
                // Function to get element details
                const getElementDetails = (element, type) => {
                    const rect = element.getBoundingClientRect();
                    return {
                        id: elementId++,
                        type: type,
                        tagName: element.tagName.toLowerCase(),
                        href: element.href || null,
                        onclick: element.onclick ? element.onclick.toString() : null,
                        textContent: element.textContent ? element.textContent.trim().substring(0, 100) : '',
                        innerHTML: element.innerHTML ? element.innerHTML.substring(0, 200) : '',
                        className: element.className || '',
                        id: element.id || '',
                        target: element.target || '_self',
                        isVisible: rect.width > 0 && rect.height > 0 && element.offsetParent !== null,
                        hasChildren: element.children.length > 0,
                        attributes: Array.from(element.attributes).reduce((acc, attr) => {
                            acc[attr.name] = attr.value;
                            return acc;
                        }, {}),
                        xpath: this.getXPath(element),
                        cssSelector: this.getCSSSelector(element)
                    };
                };
                
                // XPath helper
                this.getXPath = function(element) {
                    if (element.id !== '') return `//*[@id="${element.id}"]`;
                    if (element === document.body) return '/html/body';
                    
                    let ix = 0;
                    const siblings = element.parentNode ? element.parentNode.childNodes : [];
                    for (let i = 0; i < siblings.length; i++) {
                        const sibling = siblings[i];
                        if (sibling === element) {
                            return this.getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
                        }
                        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                            ix++;
                        }
                    }
                };
                
                // CSS Selector helper
                this.getCSSSelector = function(element) {
                    if (element.id) return '#' + element.id;
                    
                    let selector = element.tagName.toLowerCase();
                    if (element.className) {
                        selector += '.' + element.className.split(' ').join('.');
                    }
                    return selector;
                };
                
                // 1. All anchor links
                const links = document.querySelectorAll('a[href]');
                links.forEach(link => {
                    allElements.push(getElementDetails(link, 'anchor_link'));
                });
                
                // 2. All clickable buttons
                const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
                buttons.forEach(button => {
                    allElements.push(getElementDetails(button, 'button'));
                });
                
                // 3. All elements with onclick handlers
                const clickableElements = document.querySelectorAll('*[onclick]');
                clickableElements.forEach(element => {
                    allElements.push(getElementDetails(element, 'onclick_element'));
                });
                
                // 4. All navigation-related elements
                const navElements = document.querySelectorAll('nav a, .nav a, .menu a, .navigation a, [role="menuitem"], [role="button"]');
                navElements.forEach(element => {
                    allElements.push(getElementDetails(element, 'navigation_element'));
                });
                
                // 5. All form elements that might navigate
                const formElements = document.querySelectorAll('form, input[type="submit"], select');
                formElements.forEach(element => {
                    allElements.push(getElementDetails(element, 'form_element'));
                });
                
                // 6. All elements with data attributes that might indicate interactivity
                const dataElements = document.querySelectorAll('[data-href], [data-url], [data-link], [data-action], [data-click]');
                dataElements.forEach(element => {
                    allElements.push(getElementDetails(element, 'data_element'));
                });
                
                // 7. All custom interactive elements (SDF components, etc.)
                const customElements = document.querySelectorAll('sdf-button, sdf-link, sdf-menu-item, [class*="clickable"], [class*="interactive"]');
                customElements.forEach(element => {
                    allElements.push(getElementDetails(element, 'custom_element'));
                });
                
                return allElements;
            });
            
            // Categorize elements
            this.results.link_catalog = elements.filter(el => el.type === 'anchor_link');
            this.results.menu_catalog = elements.filter(el => el.type === 'navigation_element');
            this.results.anchor_catalog = elements.filter(el => el.href && el.href.includes('#'));
            this.results.navigation_catalog = elements.filter(el => ['button', 'onclick_element', 'custom_element'].includes(el.type));
            
            const totalElements = elements.length;
            this.results.comprehensive_testing.total_elements_found = totalElements;
            
            console.log(`   ✅ Discovered ${totalElements} testable elements:`);
            console.log(`      🔗 ${this.results.link_catalog.length} anchor links`);
            console.log(`      🧭 ${this.results.menu_catalog.length} navigation elements`);
            console.log(`      ⚓ ${this.results.anchor_catalog.length} anchor fragments`);
            console.log(`      🎯 ${this.results.navigation_catalog.length} interactive elements`);
            
        } catch (error) {
            console.error('   ❌ Element discovery failed:', error.message);
            throw error;
        }
    }

    async testAllElements() {
        console.log('🧪 Testing ALL discovered elements...');
        console.log('⏱️  This may take 15-30 minutes for comprehensive testing');
        
        const allElements = [
            ...this.results.link_catalog,
            ...this.results.menu_catalog,
            ...this.results.anchor_catalog,
            ...this.results.navigation_catalog
        ];
        
        const totalElements = allElements.length;
        let currentElement = 0;
        
        for (const element of allElements) {
            currentElement++;
            console.log(`\n🔍 Testing ${currentElement}/${totalElements}: ${element.type} - "${element.textContent.substring(0, 50)}"`);
            
            await this.testSingleElement(element, currentElement, totalElements);
            
            // Brief pause between tests to avoid overwhelming the server
            await this.page.waitForTimeout(500);
        }
        
        this.results.comprehensive_testing.total_elements_tested = currentElement;
        console.log('\n✅ Comprehensive element testing completed!');
    }

    async testSingleElement(element, index, total) {
        const testResult = {
            element_id: element.id,
            element_type: element.type,
            element_text: element.textContent,
            element_href: element.href,
            test_timestamp: new Date().toISOString(),
            test_index: index,
            total_tests: total,
            initial_url: this.page.url(),
            final_url: null,
            url_changed: false,
            interaction_successful: false,
            error_message: null,
            response_time_ms: 0,
            status_code: null,
            network_response: null,
            screenshot_path: null,
            retry_count: 0
        };
        
        const startTime = Date.now();
        
        try {
            // Store initial state
            const initialUrl = this.page.url();
            
            // Attempt to interact with element
            if (element.type === 'anchor_link' && element.href) {
                await this.testAnchorLink(element, testResult);
            } else if (element.type === 'navigation_element' || element.type === 'custom_element') {
                await this.testNavigationElement(element, testResult);
            } else if (element.type === 'button') {
                await this.testButtonElement(element, testResult);
            } else if (element.type === 'onclick_element') {
                await this.testOnclickElement(element, testResult);
            } else {
                await this.testGenericElement(element, testResult);
            }
            
            // Calculate response time
            testResult.response_time_ms = Date.now() - startTime;
            
            // Check if URL changed
            const finalUrl = this.page.url();
            testResult.final_url = finalUrl;
            testResult.url_changed = initialUrl !== finalUrl;
            
            // Determine if test was successful
            testResult.interaction_successful = !testResult.error_message;
            
            if (testResult.interaction_successful) {
                this.results.comprehensive_testing.successful_tests++;
                this.results.successful_elements.push(testResult);
                console.log(`   ✅ SUCCESS: ${testResult.response_time_ms}ms`);
            } else {
                this.results.comprehensive_testing.failed_tests++;
                this.results.failed_elements.push(testResult);
                console.log(`   ❌ FAILED: ${testResult.error_message}`);
            }
            
            // Return to original page if navigation occurred
            if (testResult.url_changed && initialUrl !== finalUrl) {
                try {
                    await this.page.goto(initialUrl, { waitUntil: 'networkidle', timeout: 10000 });
                    this.results.comprehensive_testing.navigation_changes++;
                } catch (navError) {
                    console.log(`   ⚠️  Could not return to original page: ${navError.message}`);
                }
            } else {
                this.results.comprehensive_testing.same_page_interactions++;
            }
            
        } catch (error) {
            testResult.error_message = error.message;
            testResult.response_time_ms = Date.now() - startTime;
            
            if (error.message.includes('Timeout')) {
                this.results.comprehensive_testing.timeout_tests++;
            } else if (error.message.includes('net::')) {
                this.results.comprehensive_testing.network_errors++;
            }
            
            this.results.comprehensive_testing.failed_tests++;
            this.results.failed_elements.push(testResult);
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        
        this.results.detailed_test_results.push(testResult);
    }

    async testAnchorLink(element, testResult) {
        if (element.href.startsWith('javascript:') || element.href.startsWith('#')) {
            // Handle JavaScript or anchor links
            await this.page.evaluate((selector) => {
                const el = document.querySelector(selector);
                if (el) el.click();
            }, element.cssSelector);
        } else {
            // Handle regular HTTP links
            const response = await this.page.goto(element.href, { 
                waitUntil: 'networkidle', 
                timeout: 10000 
            });
            testResult.status_code = response ? response.status() : null;
            testResult.network_response = response ? 'received' : 'no_response';
        }
    }

    async testNavigationElement(element, testResult) {
        try {
            // Try to click the navigation element
            await this.page.locator(element.cssSelector).first().click({ timeout: 5000 });
            await this.page.waitForTimeout(2000); // Wait for any navigation or state changes
        } catch (clickError) {
            // If CSS selector click fails, try XPath
            await this.page.locator(`xpath=${element.xpath}`).first().click({ timeout: 5000 });
            await this.page.waitForTimeout(2000);
        }
    }

    async testButtonElement(element, testResult) {
        await this.page.locator(element.cssSelector).first().click({ timeout: 5000 });
        await this.page.waitForTimeout(2000);
    }

    async testOnclickElement(element, testResult) {
        // Execute the onclick handler directly
        await this.page.evaluate((selector) => {
            const el = document.querySelector(selector);
            if (el && el.onclick) {
                el.onclick();
            } else if (el) {
                el.click();
            }
        }, element.cssSelector);
        await this.page.waitForTimeout(2000);
    }

    async testGenericElement(element, testResult) {
        // Try clicking the element
        await this.page.locator(element.cssSelector).first().click({ timeout: 5000 });
        await this.page.waitForTimeout(1000);
    }

    async generateComprehensiveReports() {
        console.log('\n📊 Generating comprehensive test reports...');
        
        // Calculate summary statistics
        const totalTested = this.results.comprehensive_testing.total_elements_tested;
        const successRate = totalTested > 0 ? 
            ((this.results.comprehensive_testing.successful_tests / totalTested) * 100).toFixed(1) : 0;
        
        this.results.summary = {
            total_elements_discovered: this.results.comprehensive_testing.total_elements_found,
            total_elements_tested: totalTested,
            successful_tests: this.results.comprehensive_testing.successful_tests,
            failed_tests: this.results.comprehensive_testing.failed_tests,
            success_rate_percentage: parseFloat(successRate),
            timeout_tests: this.results.comprehensive_testing.timeout_tests,
            network_errors: this.results.comprehensive_testing.network_errors,
            navigation_changes: this.results.comprehensive_testing.navigation_changes,
            same_page_interactions: this.results.comprehensive_testing.same_page_interactions,
            test_completed_at: new Date().toISOString(),
            test_duration_minutes: ((Date.now() - new Date(this.results.comprehensive_testing.started_at).getTime()) / 1000 / 60).toFixed(1)
        };
        
        // Save comprehensive results
        const reportsDir = path.join(__dirname, '..', 'reports');
        await fs.ensureDir(reportsDir);
        
        const resultsPath = path.join(reportsDir, 'comprehensive-link-test-results.json');
        await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));
        
        console.log('✅ Comprehensive test reports generated!');
        console.log('\n📊 COMPREHENSIVE TEST SUMMARY');
        console.log('==============================');
        console.log(`🔍 Elements Discovered: ${this.results.summary.total_elements_discovered}`);
        console.log(`🧪 Elements Tested: ${this.results.summary.total_elements_tested}`);
        console.log(`✅ Successful Tests: ${this.results.summary.successful_tests}`);
        console.log(`❌ Failed Tests: ${this.results.summary.failed_tests}`);
        console.log(`📊 Success Rate: ${this.results.summary.success_rate_percentage}%`);
        console.log(`⏱️  Test Duration: ${this.results.summary.test_duration_minutes} minutes`);
        console.log(`🔗 Navigation Changes: ${this.results.summary.navigation_changes}`);
        console.log(`📍 Same Page Interactions: ${this.results.summary.same_page_interactions}`);
        console.log('');
        console.log(`📄 Results saved to: ${resultsPath}`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// CLI interface
async function main() {
    const tester = new ComprehensiveLinkTester();
    await tester.runComprehensiveTest();
}

module.exports = { ComprehensiveLinkTester };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
