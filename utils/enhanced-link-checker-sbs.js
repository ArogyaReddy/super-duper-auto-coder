#!/usr/bin/env node

/**
 * 🎯 ENHANCED BROKEN LINK CHECKER - INTEGRATED WITH SBS_AUTOMATION
 * 
 * This integrates the Enhanced Broken Link Checker with your existing
 * SBS_Automation framework's login functionality for seamless ADP authentication.
 * 
 * Features:
 * - Uses your existing PractitionerLogin class
 * - Leverages SBS_Automation's BasePage patterns
 * - Integrates with your test data and credential management
 * - Supports all ADP login flows (RUN, MAX, Digital Plus)
 * - Handles step-up authentication and 2FA
 */

const path = require('path');
const fs = require('fs-extra');
const { chromium } = require('playwright');

// Import SBS_Automation login components
const PractitionerLogin = require('../../SBS_Automation/pages/common/practitioner-login');

class EnhancedLinkCheckerWithSBS {
    constructor(options = {}) {
        this.options = {
            targetUrl: options.targetUrl || 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c',
            credentials: options.credentials || {
                username: 'Arogya@24890183',
                password: 'Test0705'
            },
            loginType: options.loginType || 'run', // 'run', 'max', 'dto', 'wfn'
            environment: options.environment || 'iat',
            headless: options.headless !== false,
            timeout: options.timeout || 60000,
            maxDepth: options.maxDepth || 3,
            enableShadowDOM: options.enableShadowDOM !== false,
            enableIframes: options.enableIframes !== false,
            ...options
        };
        
        this.browser = null;
        this.context = null;
        this.page = null;
        this.practitionerLogin = null;
        
        this.results = {
            startTime: new Date().toISOString(),
            authentication: {},
            navigation: [],
            links: [],
            shadowDom: [],
            iframes: [],
            broken: [],
            working: [],
            errors: [],
            summary: {}
        };
        
        this.visited = new Set();
        this.queue = [];
        
        // Set environment for SBS_Automation
        process.env.ADP_ENV = this.options.environment.toUpperCase();
    }

    /**
     * Main method to run the enhanced link checker
     */
    async run() {
        console.log('🚀 ENHANCED LINK CHECKER WITH SBS_AUTOMATION INTEGRATION');
        console.log('=========================================================');
        console.log(`🎯 Target: ${this.options.targetUrl}`);
        console.log(`👤 Username: ${this.options.credentials.username}`);
        console.log(`🔐 Login Type: ${this.options.loginType.toUpperCase()}`);
        console.log(`🌍 Environment: ${this.options.environment.toUpperCase()}`);
        console.log('');

        try {
            // Step 1: Initialize browser and authentication
            await this.initializeBrowser();
            await this.performAuthentication();
            
            // Step 2: Navigate to application and analyze
            await this.navigateToApplication();
            await this.analyzeApplication();
            
            // Step 3: Perform comprehensive link checking
            await this.performLinkChecking();
            
            // Step 4: Check advanced elements
            await this.checkAdvancedElements();
            
            // Step 5: Generate reports
            await this.generateReports();
            
            console.log('\n✅ Enhanced Link Checker completed successfully!');
            return this.results;
            
        } catch (error) {
            console.error(`❌ Link checker failed: ${error.message}`);
            this.results.errors.push({
                type: 'fatal',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    /**
     * Initialize browser with SBS_Automation compatible settings
     */
    async initializeBrowser() {
        console.log('🌐 Initializing browser...');
        
        this.browser = await chromium.launch({
            headless: this.options.headless,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            ignoreHTTPSErrors: true,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        
        this.page = await this.context.newPage();
        
        // Initialize SBS_Automation PractitionerLogin
        this.practitionerLogin = new PractitionerLogin(this.page);
        
        console.log('✅ Browser initialized with SBS_Automation integration');
    }

    /**
     * Perform authentication using SBS_Automation login methods
     */
    async performAuthentication() {
        console.log('🔐 Performing authentication using SBS_Automation...');
        
        try {
            // Navigate to login page
            await this.page.goto(this.options.targetUrl, { 
                waitUntil: 'networkidle', 
                timeout: this.options.timeout 
            });
            
            // Use appropriate SBS_Automation login method based on type
            const { username, password } = this.options.credentials;
            
            switch (this.options.loginType.toLowerCase()) {
                case 'run':
                    console.log('🏠 Using RUN login flow...');
                    await this.practitionerLogin.performRunLogin(username, password);
                    break;
                    
                case 'max':
                    console.log('🔧 Using MAX login flow...');
                    await this.practitionerLogin.performMAXLogin(username, password);
                    break;
                    
                case 'dto':
                    console.log('📋 Using DTO login flow...');
                    await this.practitionerLogin.performDtoLogin(username, password);
                    break;
                    
                case 'wfn':
                    console.log('💼 Using WorkforceNow login flow...');
                    await this.practitionerLogin.performWFNLogin(username, password);
                    break;
                    
                default:
                    console.log('🔑 Using standard login flow...');
                    await this.practitionerLogin.performLogin(username, password);
                    break;
            }
            
            // Wait for post-login page to load
            await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            
            this.results.authentication = {
                success: true,
                loginType: this.options.loginType,
                timestamp: new Date().toISOString(),
                postLoginUrl: this.page.url(),
                method: 'SBS_Automation_PractitionerLogin'
            };
            
            console.log('✅ Authentication successful using SBS_Automation');
            
        } catch (error) {
            console.error(`❌ Authentication failed: ${error.message}`);
            
            this.results.authentication = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
                method: 'SBS_Automation_PractitionerLogin'
            };
            
            // Take screenshot for debugging
            const errorScreenshot = path.join(__dirname, 'screenshots', 'auth-failure.png');
            await fs.ensureDir(path.dirname(errorScreenshot));
            await this.page.screenshot({ path: errorScreenshot, fullPage: true });
            console.log(`📸 Error screenshot saved: ${errorScreenshot}`);
            
            throw error;
        }
    }

    /**
     * Navigate to application and analyze initial state
     */
    async navigateToApplication() {
        console.log('🧭 Analyzing application structure...');
        
        const currentUrl = this.page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        // Take initial screenshot
        const screenshotPath = path.join(__dirname, 'screenshots', 'app-initial-state.png');
        await fs.ensureDir(path.dirname(screenshotPath));
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        
        // Analyze page structure
        const pageAnalysis = await this.analyzePageStructure();
        this.results.navigation.push({
            url: currentUrl,
            title: await this.page.title(),
            analysis: pageAnalysis,
            timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Application structure analyzed - Found ${pageAnalysis.navigationElements.length} navigation elements`);
    }

    /**
     * Analyze page structure and detect SPA patterns
     */
    async analyzePageStructure() {
        return await this.page.evaluate(() => {
            const analysis = {
                navigationElements: [],
                menuElements: [],
                linkElements: [],
                formElements: [],
                dynamicElements: [],
                framework: 'Unknown'
            };
            
            // Detect SPA framework
            if (window.angular || document.querySelector('[ng-app]') || document.querySelector('[data-ng-app]')) {
                analysis.framework = 'Angular';
            } else if (window.React || document.querySelector('[data-reactroot]')) {
                analysis.framework = 'React';
            } else if (window.Vue || document.querySelector('[data-v-]')) {
                analysis.framework = 'Vue';
            } else if (document.querySelector('[data-test-id]') || document.querySelector('.adp-') || document.querySelector('[class*="workforce"]')) {
                analysis.framework = 'ADP Custom';
            }
            
            // Find navigation elements
            const navSelectors = [
                'nav', '[role="navigation"]', '.nav', '.navigation',
                '[data-test-id*="nav"]', '[data-test-id*="menu"]',
                '.left-nav', '.side-nav', '.main-nav', '.primary-nav'
            ];
            
            navSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element, index) => {
                    analysis.navigationElements.push({
                        selector: selector,
                        index: index,
                        text: element.textContent?.substring(0, 100) || '',
                        attributes: Array.from(element.attributes).map(attr => ({
                            name: attr.name,
                            value: attr.value
                        }))
                    });
                });
            });
            
            // Find menu elements
            const menuSelectors = [
                '[data-test-id*="menu"]', '.menu-item', '.nav-item',
                'sdf-button', 'button[data-test-id]', '[role="menuitem"]'
            ];
            
            menuSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element, index) => {
                    if (element.textContent && element.textContent.trim()) {
                        analysis.menuElements.push({
                            selector: selector,
                            index: index,
                            text: element.textContent.trim(),
                            href: element.href || element.getAttribute('data-href') || null,
                            onclick: element.onclick ? 'function' : null
                        });
                    }
                });
            });
            
            // Find all links
            const links = document.querySelectorAll('a[href]');
            links.forEach((link, index) => {
                analysis.linkElements.push({
                    href: link.href,
                    text: link.textContent?.trim() || '',
                    index: index
                });
            });
            
            // Find forms
            const forms = document.querySelectorAll('form');
            forms.forEach((form, index) => {
                analysis.formElements.push({
                    action: form.action || '',
                    method: form.method || 'GET',
                    index: index
                });
            });
            
            // Find dynamic content indicators
            const dynamicSelectors = [
                '[ng-repeat]', '[ng-if]', '[v-for]', '[v-if]',
                '[data-bind]', '[data-loading]', '.loading'
            ];
            
            dynamicSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                analysis.dynamicElements.push({
                    selector: selector,
                    count: elements.length
                });
            });
            
            return analysis;
        });
    }

    /**
     * Analyze complete application using SBS patterns
     */
    async analyzeApplication() {
        console.log('🔍 Performing comprehensive application analysis...');
        
        // Wait for any dynamic content to load
        await this.page.waitForTimeout(3000);
        
        // Check for common SBS/ADP elements
        await this.checkForSBSElements();
        
        // Check for payroll carousel (RUN specific)
        if (this.options.loginType === 'run') {
            await this.checkForPayrollCarousel();
        }
        
        // Look for navigation patterns
        await this.discoverNavigationPatterns();
        
        console.log('✅ Application analysis completed');
    }

    /**
     * Check for SBS_Automation/ADP specific elements
     */
    async checkForSBSElements() {
        const sbsElements = await this.page.evaluate(() => {
            const elements = [];
            
            // Common SBS/ADP selectors
            const selectors = [
                '[data-test-id]',
                '.payroll-tile-wrapper',
                '.todos-wrapper',
                'sdf-button',
                '.left-nav',
                '.main-content',
                '[role="main"]'
            ];
            
            selectors.forEach(selector => {
                const found = document.querySelectorAll(selector);
                if (found.length > 0) {
                    elements.push({
                        selector: selector,
                        count: found.length,
                        samples: Array.from(found).slice(0, 3).map(el => ({
                            text: el.textContent?.substring(0, 50) || '',
                            id: el.id || '',
                            className: el.className || ''
                        }))
                    });
                }
            });
            
            return elements;
        });
        
        console.log(`🎯 Found ${sbsElements.length} SBS/ADP element types`);
        this.results.sbsElements = sbsElements;
    }

    /**
     * Check for payroll carousel (RUN specific)
     */
    async checkForPayrollCarousel() {
        try {
            const carouselExists = await this.page.isVisible('div[data-test-id="payroll-tile-wrapper"]', { timeout: 5000 });
            if (carouselExists) {
                console.log('✅ Payroll carousel detected - RUN login successful');
                this.results.authentication.payrollCarouselDetected = true;
            }
        } catch (error) {
            console.log('ℹ️  Payroll carousel not found - may be different application area');
            this.results.authentication.payrollCarouselDetected = false;
        }
    }

    /**
     * Discover navigation patterns in the application
     */
    async discoverNavigationPatterns() {
        const patterns = await this.page.evaluate(() => {
            const navigationPatterns = [];
            
            // Look for clickable elements that might be navigation
            const clickableSelectors = [
                'button[data-test-id]',
                'a[data-test-id]',
                '[role="button"]',
                '[role="menuitem"]',
                '.nav-link',
                '.menu-item'
            ];
            
            clickableSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element, index) => {
                    if (element.textContent && element.textContent.trim()) {
                        navigationPatterns.push({
                            type: 'clickable',
                            selector: selector,
                            text: element.textContent.trim(),
                            testId: element.getAttribute('data-test-id'),
                            onclick: !!element.onclick,
                            href: element.href || null
                        });
                    }
                });
            });
            
            return navigationPatterns.slice(0, 20); // Limit to first 20 patterns
        });
        
        this.results.navigationPatterns = patterns;
        console.log(`🧭 Discovered ${patterns.length} navigation patterns`);
    }

    /**
     * Perform comprehensive link checking
     */
    async performLinkChecking() {
        console.log('🔗 Starting comprehensive link checking...');
        
        // Get all links from the current page
        const links = await this.extractAllLinks();
        console.log(`📊 Found ${links.length} links to check`);
        
        // Check each link
        for (const link of links) {
            await this.checkLink(link);
        }
        
        // Test navigation patterns
        await this.testNavigationPatterns();
        
        console.log(`✅ Link checking completed - ${this.results.working.length} working, ${this.results.broken.length} broken`);
    }

    /**
     * Extract all links from the current page
     */
    async extractAllLinks() {
        return await this.page.evaluate(() => {
            const links = [];
            
            // Standard links
            const aElements = document.querySelectorAll('a[href]');
            aElements.forEach((element, index) => {
                links.push({
                    type: 'link',
                    href: element.href,
                    text: element.textContent?.trim() || '',
                    selector: `a:nth-of-type(${index + 1})`,
                    testId: element.getAttribute('data-test-id'),
                    target: element.target || '_self'
                });
            });
            
            // Button elements with navigation
            const buttonElements = document.querySelectorAll('button[data-test-id], sdf-button');
            buttonElements.forEach((element, index) => {
                if (element.textContent && element.textContent.trim()) {
                    links.push({
                        type: 'button',
                        text: element.textContent.trim(),
                        selector: element.tagName.toLowerCase() + `[data-test-id="${element.getAttribute('data-test-id')}"]`,
                        testId: element.getAttribute('data-test-id'),
                        onclick: !!element.onclick
                    });
                }
            });
            
            return links;
        });
    }

    /**
     * Check individual link
     */
    async checkLink(link) {
        try {
            if (link.type === 'link' && link.href) {
                // Check HTTP links
                const response = await this.page.goto(link.href, { 
                    waitUntil: 'networkidle',
                    timeout: 10000
                });
                
                if (response && response.ok()) {
                    this.results.working.push({
                        ...link,
                        status: response.status(),
                        timestamp: new Date().toISOString()
                    });
                } else {
                    this.results.broken.push({
                        ...link,
                        status: response ? response.status() : 'No response',
                        error: 'Failed to load',
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Navigate back
                await this.page.goBack({ waitUntil: 'networkidle' });
                
            } else if (link.type === 'button') {
                // Test button navigation
                await this.testButtonNavigation(link);
            }
            
        } catch (error) {
            this.results.broken.push({
                ...link,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Test button navigation patterns
     */
    async testButtonNavigation(button) {
        try {
            const initialUrl = this.page.url();
            
            // Click button and wait for potential navigation
            await this.page.click(button.selector);
            await this.page.waitForTimeout(2000);
            
            const newUrl = this.page.url();
            const urlChanged = newUrl !== initialUrl;
            
            // Check if page content changed (for SPA navigation)
            const contentChanged = await this.page.evaluate(() => {
                return document.body.innerHTML !== window.previousBodyHTML;
            });
            
            if (urlChanged || contentChanged) {
                this.results.working.push({
                    ...button,
                    navigationWorking: true,
                    urlChanged: urlChanged,
                    contentChanged: contentChanged,
                    timestamp: new Date().toISOString()
                });
            } else {
                this.results.broken.push({
                    ...button,
                    error: 'No navigation occurred',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Navigate back if URL changed
            if (urlChanged) {
                await this.page.goBack({ waitUntil: 'networkidle' });
            }
            
        } catch (error) {
            this.results.broken.push({
                ...button,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Test discovered navigation patterns
     */
    async testNavigationPatterns() {
        console.log('🧪 Testing navigation patterns...');
        
        for (const pattern of this.results.navigationPatterns || []) {
            try {
                if (pattern.testId) {
                    const element = await this.page.locator(`[data-test-id="${pattern.testId}"]`);
                    if (await element.isVisible()) {
                        // Test if element is clickable
                        await element.click({ trial: true });
                        
                        this.results.working.push({
                            type: 'navigation_pattern',
                            pattern: pattern,
                            working: true,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            } catch (error) {
                this.results.broken.push({
                    type: 'navigation_pattern',
                    pattern: pattern,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    /**
     * Check advanced elements (Shadow DOM, iframes)
     */
    async checkAdvancedElements() {
        console.log('🔍 Checking advanced elements...');
        
        // Check Shadow DOM elements
        if (this.options.enableShadowDOM) {
            await this.checkShadowDOM();
        }
        
        // Check iframes
        if (this.options.enableIframes) {
            await this.checkIframes();
        }
    }

    /**
     * Check Shadow DOM elements
     */
    async checkShadowDOM() {
        const shadowElements = await this.page.evaluate(() => {
            const elements = [];
            
            // Find elements with shadow roots
            const allElements = document.querySelectorAll('*');
            allElements.forEach((element, index) => {
                if (element.shadowRoot) {
                    elements.push({
                        tagName: element.tagName.toLowerCase(),
                        shadowRootMode: element.shadowRoot.mode,
                        children: element.shadowRoot.children.length,
                        index: index
                    });
                }
            });
            
            // Check for custom elements (likely to have shadow DOM)
            const customElements = document.querySelectorAll('*[is], *[data-*]:not([data-test-id])');
            customElements.forEach((element, index) => {
                if (element.tagName.includes('-')) {
                    elements.push({
                        type: 'custom_element',
                        tagName: element.tagName.toLowerCase(),
                        attributes: Array.from(element.attributes).map(attr => attr.name),
                        index: index
                    });
                }
            });
            
            return elements;
        });
        
        this.results.shadowDom = shadowElements;
        console.log(`🌐 Found ${shadowElements.length} Shadow DOM elements`);
    }

    /**
     * Check iframes
     */
    async checkIframes() {
        const iframes = await this.page.evaluate(() => {
            const frames = [];
            const iframeElements = document.querySelectorAll('iframe');
            
            iframeElements.forEach((iframe, index) => {
                frames.push({
                    src: iframe.src || 'about:blank',
                    name: iframe.name || '',
                    id: iframe.id || '',
                    width: iframe.width || '',
                    height: iframe.height || '',
                    index: index
                });
            });
            
            return frames;
        });
        
        // Test accessibility of each iframe
        for (const iframe of iframes) {
            try {
                if (iframe.src && iframe.src !== 'about:blank' && !iframe.src.startsWith('javascript:')) {
                    const response = await this.page.goto(iframe.src, { 
                        waitUntil: 'networkidle',
                        timeout: 10000
                    });
                    
                    iframe.accessible = response && response.ok();
                    iframe.status = response ? response.status() : 'No response';
                }
            } catch (error) {
                iframe.accessible = false;
                iframe.error = error.message;
            }
        }
        
        this.results.iframes = iframes;
        console.log(`🖼️ Found ${iframes.length} iframes`);
    }

    /**
     * Generate comprehensive reports
     */
    async generateReports() {
        console.log('📊 Generating reports...');
        
        // Calculate summary
        this.results.summary = {
            timestamp: new Date().toISOString(),
            duration: Date.now() - new Date(this.results.startTime).getTime(),
            authentication: {
                successful: this.results.authentication.success,
                method: 'SBS_Automation',
                loginType: this.options.loginType
            },
            links: {
                total: this.results.working.length + this.results.broken.length,
                working: this.results.working.length,
                broken: this.results.broken.length,
                successRate: this.results.working.length + this.results.broken.length > 0 
                    ? ((this.results.working.length / (this.results.working.length + this.results.broken.length)) * 100).toFixed(1)
                    : 0
            },
            navigation: {
                patterns: this.results.navigationPatterns?.length || 0,
                elements: this.results.navigation.length
            },
            advanced: {
                shadowDom: this.results.shadowDom.length,
                iframes: this.results.iframes.length,
                sbsElements: this.results.sbsElements?.length || 0
            }
        };
        
        // Generate HTML report
        await this.generateHTMLReport();
        
        // Generate JSON report
        await this.generateJSONReport();
        
        // Display summary
        this.displaySummary();
    }

    /**
     * Generate HTML report
     */
    async generateHTMLReport() {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Link Checker Report - SBS Integration</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f7fa; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: #2c3e50; margin-bottom: 10px; font-size: 2.5em; }
        .header .subtitle { color: #7f8c8d; font-size: 1.2em; margin-bottom: 20px; }
        .header .url { background: #ecf0f1; padding: 15px; border-radius: 8px; font-family: monospace; word-break: break-all; }
        .section { margin-bottom: 30px; padding: 25px; background: #f8f9fa; border-radius: 10px; border-left: 5px solid #3498db; }
        .section h2 { margin-top: 0; color: #2c3e50; font-size: 1.8em; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { text-align: center; padding: 25px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2.5em; font-weight: bold; margin-bottom: 8px; }
        .metric-label { font-size: 14px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; }
        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        .info { color: #3498db; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .status-success { background: #27ae60; }
        .status-error { background: #e74c3c; }
        .status-warning { background: #f39c12; }
        .list-item { padding: 15px; margin: 8px 0; background: white; border-radius: 8px; border-left: 4px solid #3498db; }
        .list-item.error { border-left-color: #e74c3c; }
        .list-item.success { border-left-color: #27ae60; }
        .conclusion { background: #d4edda; border: 2px solid #c3e6cb; color: #155724; padding: 25px; border-radius: 10px; margin-top: 30px; }
        .conclusion h3 { margin-top: 0; font-size: 1.5em; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        .highlight { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ffc107; }
        .code { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0; }
        .sbs-badge { background: #3498db; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8em; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Enhanced Link Checker Report</h1>
            <div class="subtitle">SBS_Automation Integration <span class="sbs-badge">SBS Framework</span></div>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <div class="url">${this.options.targetUrl}</div>
        </div>

        <div class="grid">
            <div class="metric">
                <div class="metric-value ${this.results.authentication.success ? 'success' : 'error'}">
                    ${this.results.authentication.success ? '✅' : '❌'}
                </div>
                <div class="metric-label">SBS Authentication</div>
            </div>
            <div class="metric">
                <div class="metric-value info">${this.results.summary.links.total}</div>
                <div class="metric-label">Total Links</div>
            </div>
            <div class="metric">
                <div class="metric-value success">${this.results.summary.links.working}</div>
                <div class="metric-label">Working Links</div>
            </div>
            <div class="metric">
                <div class="metric-value error">${this.results.summary.links.broken}</div>
                <div class="metric-label">Broken Links</div>
            </div>
            <div class="metric">
                <div class="metric-value info">${this.results.summary.links.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>

        <div class="section">
            <h2>🔐 SBS_Automation Authentication</h2>
            <table>
                <tr>
                    <td><span class="status-indicator ${this.results.authentication.success ? 'status-success' : 'status-error'}"></span>Authentication Status</td>
                    <td>${this.results.authentication.success ? 'Successful' : 'Failed'}</td>
                </tr>
                <tr>
                    <td><span class="status-indicator status-success"></span>Login Type</td>
                    <td>${this.options.loginType.toUpperCase()} via SBS_Automation PractitionerLogin</td>
                </tr>
                <tr>
                    <td><span class="status-indicator status-success"></span>Environment</td>
                    <td>${this.options.environment.toUpperCase()}</td>
                </tr>
                ${this.results.authentication.payrollCarouselDetected !== undefined ? `
                <tr>
                    <td><span class="status-indicator ${this.results.authentication.payrollCarouselDetected ? 'status-success' : 'status-warning'}"></span>Payroll Carousel</td>
                    <td>${this.results.authentication.payrollCarouselDetected ? 'Detected' : 'Not Found'}</td>
                </tr>
                ` : ''}
                <tr>
                    <td><span class="status-indicator status-success"></span>Post-Login URL</td>
                    <td class="code">${this.results.authentication.postLoginUrl || 'N/A'}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2>🧭 Application Analysis</h2>
            <div class="highlight">
                <strong>Framework Integration:</strong> Successfully integrated with SBS_Automation framework using PractitionerLogin class
            </div>
            
            <h3>Navigation Patterns (${this.results.navigationPatterns?.length || 0})</h3>
            ${(this.results.navigationPatterns || []).slice(0, 10).map(pattern => `
                <div class="list-item">
                    <strong>Type:</strong> ${pattern.type}<br>
                    <strong>Text:</strong> ${pattern.text}<br>
                    <strong>Test ID:</strong> ${pattern.testId || 'None'}<br>
                    <strong>Selector:</strong> <code>${pattern.selector}</code>
                </div>
            `).join('')}

            <h3>SBS Elements (${this.results.sbsElements?.length || 0})</h3>
            ${(this.results.sbsElements || []).map(element => `
                <div class="list-item">
                    <strong>Selector:</strong> <code>${element.selector}</code><br>
                    <strong>Count:</strong> ${element.count}<br>
                    <strong>Samples:</strong> ${element.samples.map(s => s.text.substring(0, 30)).join(', ')}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>🔗 Link Check Results</h2>
            
            <h3>✅ Working Links (${this.results.working.length})</h3>
            ${this.results.working.slice(0, 10).map(link => `
                <div class="list-item success">
                    <strong>${link.type}:</strong> ${link.text || link.href}<br>
                    ${link.href ? `<strong>URL:</strong> ${link.href}<br>` : ''}
                    ${link.status ? `<strong>Status:</strong> ${link.status}<br>` : ''}
                    ${link.testId ? `<strong>Test ID:</strong> ${link.testId}` : ''}
                </div>
            `).join('')}

            <h3>❌ Broken Links (${this.results.broken.length})</h3>
            ${this.results.broken.slice(0, 10).map(link => `
                <div class="list-item error">
                    <strong>${link.type}:</strong> ${link.text || link.href}<br>
                    ${link.href ? `<strong>URL:</strong> ${link.href}<br>` : ''}
                    <strong>Error:</strong> ${link.error}<br>
                    ${link.testId ? `<strong>Test ID:</strong> ${link.testId}` : ''}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>🔍 Advanced Elements</h2>
            <table>
                <tr>
                    <td>Shadow DOM Elements</td>
                    <td>${this.results.shadowDom.length}</td>
                </tr>
                <tr>
                    <td>iframes Found</td>
                    <td>${this.results.iframes.length}</td>
                </tr>
                <tr>
                    <td>SBS Framework Elements</td>
                    <td>${this.results.sbsElements?.length || 0}</td>
                </tr>
            </table>
        </div>

        <div class="conclusion">
            <h3>🎯 Summary & Recommendations</h3>
            <p><strong>✅ SBS_Automation Integration Successful!</strong></p>
            
            <h4>Key Achievements:</h4>
            <ul>
                <li><strong>Authentication:</strong> Successfully integrated with SBS_Automation PractitionerLogin</li>
                <li><strong>Framework Integration:</strong> Leveraged existing ${this.options.loginType.toUpperCase()} login flow</li>
                <li><strong>Link Testing:</strong> Checked ${this.results.summary.links.total} links with ${this.results.summary.links.successRate}% success rate</li>
                <li><strong>Advanced Analysis:</strong> Detected ${this.results.shadowDom.length} Shadow DOM elements and ${this.results.iframes.length} iframes</li>
                <li><strong>SBS Compatibility:</strong> Found ${this.results.sbsElements?.length || 0} SBS framework elements</li>
            </ul>
            
            <h4>🚀 Next Steps:</h4>
            <ul>
                <li>Integrate with your existing SBS_Automation test suites</li>
                <li>Add to CI/CD pipeline for continuous link monitoring</li>
                <li>Extend to test additional application areas post-login</li>
                <li>Configure automated alerts for broken links</li>
            </ul>
            
            <p><strong>The Enhanced Link Checker is now fully integrated with your SBS_Automation framework!</strong></p>
        </div>
    </div>
</body>
</html>`;
        
        const reportPath = path.join(__dirname, 'sbs-enhanced-link-checker-report.html');
        await fs.writeFile(reportPath, html);
        console.log(`📄 HTML report generated: ${reportPath}`);
    }

    /**
     * Generate JSON report
     */
    async generateJSONReport() {
        const reportPath = path.join(__dirname, 'sbs-enhanced-link-checker-results.json');
        await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`📋 JSON report generated: ${reportPath}`);
    }

    /**
     * Display summary in console
     */
    displaySummary() {
        console.log('\n🎯 ENHANCED LINK CHECKER - SBS INTEGRATION SUMMARY');
        console.log('==================================================');
        
        console.log('\n🔐 SBS_AUTOMATION AUTHENTICATION:');
        console.log(`   ✅ Method: ${this.results.authentication.method}`);
        console.log(`   🔑 Login Type: ${this.options.loginType.toUpperCase()}`);
        console.log(`   🌍 Environment: ${this.options.environment.toUpperCase()}`);
        console.log(`   📊 Status: ${this.results.authentication.success ? 'Successful' : 'Failed'}`);
        
        console.log('\n🔗 LINK TESTING RESULTS:');
        console.log(`   📊 Total Links: ${this.results.summary.links.total}`);
        console.log(`   ✅ Working: ${this.results.summary.links.working}`);
        console.log(`   ❌ Broken: ${this.results.summary.links.broken}`);
        console.log(`   📈 Success Rate: ${this.results.summary.links.successRate}%`);
        
        console.log('\n🧭 APPLICATION ANALYSIS:');
        console.log(`   🎯 Navigation Patterns: ${this.results.summary.navigation.patterns}`);
        console.log(`   🔍 SBS Elements: ${this.results.summary.advanced.sbsElements}`);
        console.log(`   🌐 Shadow DOM: ${this.results.summary.advanced.shadowDom}`);
        console.log(`   🖼️ iframes: ${this.results.summary.advanced.iframes}`);
        
        console.log('\n⏱️ PERFORMANCE:');
        console.log(`   Duration: ${(this.results.summary.duration / 1000).toFixed(1)}s`);
        
        console.log('\n📁 REPORTS GENERATED:');
        console.log('   📄 sbs-enhanced-link-checker-report.html');
        console.log('   📋 sbs-enhanced-link-checker-results.json');
        
        console.log('\n🎉 SBS_Automation integration successful!');
    }

    /**
     * Cleanup browser resources
     */
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// CLI interface
async function main() {
    const options = {
        targetUrl: process.argv[2] || 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c',
        credentials: {
            username: process.argv[3] || 'Arogya@24890183',
            password: process.argv[4] || 'Test0705'
        },
        loginType: process.argv[5] || 'run',
        environment: process.argv[6] || 'iat',
        headless: process.argv.includes('--headless')
    };
    
    const checker = new EnhancedLinkCheckerWithSBS(options);
    
    try {
        const results = await checker.run();
        return results;
    } catch (error) {
        console.error('❌ Enhanced Link Checker failed:', error.message);
        process.exit(1);
    }
}

module.exports = { EnhancedLinkCheckerWithSBS };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
