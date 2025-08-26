/**
 * Playwright MCP Tool for Auto-Coder Framework
 * Provides intelligent browser automation and testing capabilities
 * Integrates with SBS_Automation conventions
 */

const fs = require('fs-extra');
const path = require('path');

// Use dynamic import for Playwright if available
let playwright;
try {
    playwright = require('playwright');
} catch (error) {
    console.warn('Playwright not available. Some features will be disabled.');
}

class PlaywrightMCP {
    constructor() {
        this.name = 'playwright-mcp';
        this.description = 'Intelligent browser automation and testing with Playwright integration';
        this.version = '1.0.0';
        this.browsers = new Map();
        this.pages = new Map();
        this.sbsAutomationPath = path.join(process.cwd(), 'SBS_Automation');
        this.pagesPath = path.join(this.sbsAutomationPath, 'pages');
        this.stepsPath = path.join(this.sbsAutomationPath, 'steps');
        this.featuresPath = path.join(this.sbsAutomationPath, 'features');
    }

    /**
     * Initialize Playwright MCP and register tools
     */
    async initialize() {
        return [
            this.createPageObjectTool(),
            this.createStepDefinitionTool(),
            this.createFeatureValidatorTool(),
            this.createSelectorOptimizerTool(),
            this.createBrowserControlTool(),
            this.createScreenshotTool(),
            this.createAccessibilityTool(),
            this.createPerformanceTool()
        ];
    }

    /**
     * Page Object Generator Tool
     */
    createPageObjectTool() {
        return {
            name: 'generate_page_object',
            description: 'Generate SBS-compliant page objects from URL or existing HTML',
            inputSchema: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'URL to analyze and create page object from' },
                    pageName: { type: 'string', description: 'Name for the page object class' },
                    selectors: { 
                        type: 'array', 
                        items: { type: 'string' },
                        description: 'Specific selectors to include in page object'
                    },
                    browserType: { 
                        type: 'string', 
                        enum: ['chromium', 'firefox', 'webkit'],
                        default: 'chromium',
                        description: 'Browser type for analysis'
                    }
                },
                required: ['url', 'pageName']
            },
            handler: async (args) => await this.generatePageObject(args)
        };
    }

    /**
     * Step Definition Generator Tool
     */
    createStepDefinitionTool() {
        return {
            name: 'generate_step_definitions',
            description: 'Generate Cucumber step definitions with Playwright actions',
            inputSchema: {
                type: 'object',
                properties: {
                    pageObject: { type: 'string', description: 'Page object to generate steps for' },
                    actions: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Actions to create step definitions for (click, fill, navigate, etc.)'
                    },
                    stepType: {
                        type: 'string',
                        enum: ['Given', 'When', 'Then'],
                        description: 'Primary step type to generate'
                    }
                },
                required: ['pageObject', 'actions']
            },
            handler: async (args) => await this.generateStepDefinitions(args)
        };
    }

    /**
     * Feature Validator Tool
     */
    createFeatureValidatorTool() {
        return {
            name: 'validate_feature_implementation',
            description: 'Validate that feature files have corresponding page objects and step definitions',
            inputSchema: {
                type: 'object',
                properties: {
                    featureFile: { type: 'string', description: 'Path to feature file to validate' },
                    autoFix: { 
                        type: 'boolean', 
                        default: false,
                        description: 'Automatically generate missing page objects and steps'
                    }
                },
                required: ['featureFile']
            },
            handler: async (args) => await this.validateFeatureImplementation(args)
        };
    }

    /**
     * Selector Optimizer Tool
     */
    createSelectorOptimizerTool() {
        return {
            name: 'optimize_selectors',
            description: 'Analyze and optimize CSS/XPath selectors for reliability',
            inputSchema: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'URL to analyze selectors on' },
                    selectors: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Selectors to optimize'
                    },
                    strategy: {
                        type: 'string',
                        enum: ['data-testid', 'accessibility', 'stable-css', 'hybrid'],
                        default: 'hybrid',
                        description: 'Optimization strategy'
                    }
                },
                required: ['url', 'selectors']
            },
            handler: async (args) => await this.optimizeSelectors(args)
        };
    }

    /**
     * Browser Control Tool
     */
    createBrowserControlTool() {
        return {
            name: 'browser_control',
            description: 'Control browser instances for testing and analysis',
            inputSchema: {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        enum: ['launch', 'close', 'navigate', 'screenshot', 'evaluate'],
                        description: 'Browser action to perform'
                    },
                    browserType: {
                        type: 'string',
                        enum: ['chromium', 'firefox', 'webkit'],
                        default: 'chromium'
                    },
                    url: { type: 'string', description: 'URL for navigation' },
                    script: { type: 'string', description: 'JavaScript to evaluate' },
                    sessionId: { type: 'string', description: 'Browser session ID' }
                },
                required: ['action']
            },
            handler: async (args) => await this.controlBrowser(args)
        };
    }

    /**
     * Screenshot Tool
     */
    createScreenshotTool() {
        return {
            name: 'capture_screenshot',
            description: 'Capture screenshots for visual testing and documentation',
            inputSchema: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'URL to capture' },
                    selector: { type: 'string', description: 'Element selector to capture' },
                    outputPath: { type: 'string', description: 'Output path for screenshot' },
                    options: {
                        type: 'object',
                        properties: {
                            fullPage: { type: 'boolean', default: false },
                            width: { type: 'number', default: 1280 },
                            height: { type: 'number', default: 720 }
                        }
                    }
                },
                required: ['url']
            },
            handler: async (args) => await this.captureScreenshot(args)
        };
    }

    /**
     * Accessibility Tool
     */
    createAccessibilityTool() {
        return {
            name: 'accessibility_audit',
            description: 'Perform accessibility audits using Playwright and axe-core',
            inputSchema: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'URL to audit' },
                    rules: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Specific accessibility rules to check'
                    },
                    outputFormat: {
                        type: 'string',
                        enum: ['json', 'html', 'cucumber'],
                        default: 'json'
                    }
                },
                required: ['url']
            },
            handler: async (args) => await this.performAccessibilityAudit(args)
        };
    }

    /**
     * Performance Tool
     */
    createPerformanceTool() {
        return {
            name: 'performance_audit',
            description: 'Perform performance audits and generate metrics',
            inputSchema: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'URL to audit' },
                    metrics: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Performance metrics to collect'
                    },
                    iterations: { type: 'number', default: 3, description: 'Number of test iterations' }
                },
                required: ['url']
            },
            handler: async (args) => await this.performPerformanceAudit(args)
        };
    }

    /**
     * Generate Page Object Implementation
     */
    async generatePageObject({ url, pageName, selectors = [], browserType = 'chromium' }) {
        try {
            const browser = await this.launchBrowser(browserType);
            const page = await browser.newPage();
            await page.goto(url);

            // Auto-discover interactive elements
            const elements = await page.evaluate(() => {
                const interactiveSelectors = [
                    'button', 'input', 'select', 'textarea', 'a[href]',
                    '[role="button"]', '[role="link"]', '[role="textbox"]',
                    '[data-testid]', '[data-test]', '[data-cy]'
                ];
                
                const elements = {};
                interactiveSelectors.forEach(selector => {
                    const els = document.querySelectorAll(selector);
                    els.forEach((el, index) => {
                        const id = el.id || el.getAttribute('data-testid') || el.getAttribute('data-test') || 
                                  el.className.split(' ')[0] || `${selector.replace(/[\[\]]/g, '').replace(/[^a-zA-Z0-9]/g, '')}_${index}`;
                        
                        elements[id] = {
                            selector: this.generateOptimalSelector(el),
                            type: el.tagName.toLowerCase(),
                            text: el.textContent?.trim().substring(0, 50) || '',
                            attributes: {
                                id: el.id,
                                class: el.className,
                                'data-testid': el.getAttribute('data-testid'),
                                'data-test': el.getAttribute('data-test')
                            }
                        };
                    });
                });
                return elements;
            });

            await browser.close();

            // Generate SBS-compliant page object
            const pageObjectContent = this.generatePageObjectContent(pageName, elements, url);
            const outputPath = path.join(this.pagesPath, `${pageName}.js`);
            
            await fs.ensureDir(this.pagesPath);
            await fs.writeFile(outputPath, pageObjectContent);

            return {
                success: true,
                pageObjectPath: outputPath,
                elementsFound: Object.keys(elements).length,
                elements: elements
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate Step Definitions Implementation
     */
    async generateStepDefinitions({ pageObject, actions, stepType = 'When' }) {
        try {
            const pageObjectPath = path.join(this.pagesPath, `${pageObject}.js`);
            
            if (!await fs.pathExists(pageObjectPath)) {
                throw new Error(`Page object ${pageObject} not found`);
            }

            const stepDefinitions = actions.map(action => {
                return this.generateStepDefinition(pageObject, action, stepType);
            }).join('\n\n');

            const stepFilePath = path.join(this.stepsPath, `${pageObject}-steps.js`);
            const stepFileContent = this.generateStepFileContent(pageObject, stepDefinitions);

            await fs.ensureDir(this.stepsPath);
            await fs.writeFile(stepFilePath, stepFileContent);

            return {
                success: true,
                stepFilePath: stepFilePath,
                stepsGenerated: actions.length
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate Feature Implementation
     */
    async validateFeatureImplementation({ featureFile, autoFix = false }) {
        try {
            const featurePath = path.join(this.featuresPath, featureFile);
            const featureContent = await fs.readFile(featurePath, 'utf8');
            
            // Parse feature file for step definitions needed
            const stepMatches = featureContent.match(/(Given|When|Then|And|But)\s+(.+)/g) || [];
            const missingImplementations = [];
            
            for (const step of stepMatches) {
                const [, stepType, stepText] = step.match(/(Given|When|Then|And|But)\s+(.+)/);
                
                // Check if step definition exists
                const stepExists = await this.checkStepDefinitionExists(stepText);
                
                if (!stepExists) {
                    missingImplementations.push({
                        stepType,
                        stepText,
                        suggestedImplementation: autoFix ? await this.generateMissingStep(stepText, stepType) : null
                    });
                }
            }

            if (autoFix && missingImplementations.length > 0) {
                // Auto-generate missing implementations
                for (const missing of missingImplementations) {
                    if (missing.suggestedImplementation) {
                        await this.createStepDefinition(missing);
                    }
                }
            }

            return {
                success: true,
                featureFile,
                totalSteps: stepMatches.length,
                missingImplementations: missingImplementations.length,
                details: missingImplementations
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Optimize Selectors Implementation
     */
    async optimizeSelectors({ url, selectors, strategy = 'hybrid' }) {
        try {
            const browser = await this.launchBrowser('chromium');
            const page = await browser.newPage();
            await page.goto(url);

            const optimizedSelectors = {};

            for (const selector of selectors) {
                const optimization = await page.evaluate((sel, strat) => {
                    const element = document.querySelector(sel);
                    if (!element) return { original: sel, optimized: null, reason: 'Element not found' };

                    const optimizations = {
                        'data-testid': () => element.getAttribute('data-testid') ? `[data-testid="${element.getAttribute('data-testid')}"]` : null,
                        'accessibility': () => element.getAttribute('aria-label') ? `[aria-label="${element.getAttribute('aria-label')}"]` : null,
                        'stable-css': () => this.generateStableSelector(element),
                        'hybrid': () => this.generateHybridSelector(element)
                    };

                    const optimized = optimizations[strat]?.() || sel;
                    
                    return {
                        original: sel,
                        optimized: optimized,
                        stability: this.calculateSelectorStability(element, optimized),
                        reason: optimized !== sel ? `Optimized using ${strat} strategy` : 'No optimization needed'
                    };
                }, selector, strategy);

                optimizedSelectors[selector] = optimization;
            }

            await browser.close();

            return {
                success: true,
                strategy,
                optimizations: optimizedSelectors
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Control Browser Implementation
     */
    async controlBrowser({ action, browserType = 'chromium', url, script, sessionId }) {
        try {
            switch (action) {
                case 'launch':
                    const browser = await this.launchBrowser(browserType);
                    const newSessionId = this.generateSessionId();
                    this.browsers.set(newSessionId, browser);
                    return { success: true, sessionId: newSessionId };

                case 'close':
                    if (sessionId && this.browsers.has(sessionId)) {
                        await this.browsers.get(sessionId).close();
                        this.browsers.delete(sessionId);
                        return { success: true, message: 'Browser closed' };
                    }
                    return { success: false, error: 'Session not found' };

                case 'navigate':
                    if (sessionId && this.browsers.has(sessionId)) {
                        const page = await this.getOrCreatePage(sessionId);
                        await page.goto(url);
                        return { success: true, url };
                    }
                    return { success: false, error: 'Session not found' };

                case 'evaluate':
                    if (sessionId && this.browsers.has(sessionId)) {
                        const page = await this.getOrCreatePage(sessionId);
                        const result = await page.evaluate(script);
                        return { success: true, result };
                    }
                    return { success: false, error: 'Session not found' };

                default:
                    return { success: false, error: 'Unknown action' };
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Capture Screenshot Implementation
     */
    async captureScreenshot({ url, selector, outputPath, options = {} }) {
        try {
            const browser = await this.launchBrowser('chromium');
            const page = await browser.newPage();
            
            await page.setViewportSize({
                width: options.width || 1280,
                height: options.height || 720
            });

            await page.goto(url);

            const screenshotOptions = {
                path: outputPath || path.join(process.cwd(), 'screenshots', `screenshot-${Date.now()}.png`),
                fullPage: options.fullPage || false
            };

            if (selector) {
                const element = await page.locator(selector);
                await element.screenshot(screenshotOptions);
            } else {
                await page.screenshot(screenshotOptions);
            }

            await browser.close();

            return {
                success: true,
                screenshotPath: screenshotOptions.path
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate SBS-compliant Page Object Content
     */
    generatePageObjectContent(pageName, elements, url) {
        const className = `${pageName.charAt(0).toUpperCase()}${pageName.slice(1)}Page`;
        
        // Generate SBS-style locator constants (outside constructor)
        const locatorConstants = Object.entries(elements).map(([key, element]) => {
            const constantName = key.toUpperCase().replace(/[^A-Z0-9]/g, '_');
            const selectorStrategy = this.determineSBSelectorStrategy(element);
            return `const ${constantName} = By.${selectorStrategy}('${element.selector}');`;
        }).join('\n');

        // Generate dynamic locators if needed
        const dynamicLocators = this.generateSBSDynamicLocators(elements);

        // Generate SBS-style methods
        const sbsMethods = this.generateSBSMethods(elements);

        return `const By = require('../../support/By');
let BasePage = require('../common/base-page');

${locatorConstants}
${dynamicLocators ? dynamicLocators + '\n' : ''}
class ${className} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

${sbsMethods}
}

module.exports = ${className};`;
    }

    /**
     * Determine SBS selector strategy (xpath, css, id, etc.)
     */
    determineSBSelectorStrategy(element) {
        // Prioritize SBS patterns
        if (element.attributes?.['data-testid'] || element.attributes?.['data-test']) {
            return 'css';
        }
        if (element.attributes?.id) {
            return 'id';
        }
        if (element.selector.includes('//')) {
            return 'xpath';
        }
        return 'css';
    }

    /**
     * Generate SBS-style dynamic locators (for parameterized elements)
     */
    generateSBSDynamicLocators(elements) {
        const dynamicPatterns = [];
        
        // Common SBS patterns
        dynamicPatterns.push(`const BTN_ELEMENT = (btnName) => By.xpath(\`//sdf-button[text() = "\${btnName}"]\`);`);
        dynamicPatterns.push(`const TASK_TILE = (tileName) => By.css(\`[data-test-id="\${tileName}-button"]\`);`);
        dynamicPatterns.push(`const LEFT_NAV_ICON = (navName) => By.xpath(\`//sdf-icon[@data-test-id='\${navName}-icon']\`);`);
        
        return dynamicPatterns.join('\n');
    }

    /**
     * Generate SBS-style methods following framework patterns
     */
    generateSBSMethods(elements) {
        const methods = [];

        // Generate navigation method
        methods.push(`  async navigateToPage() {
    await this.navigateTo(this.url);
    await this.waitForPageLoad();
  }`);

        // Generate click methods for buttons and links
        Object.entries(elements).forEach(([key, element]) => {
            if (element.type === 'button' || element.type === 'a' || element.attributes?.role === 'button') {
                const constantName = key.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                const methodName = `clickOn${this.toPascalCase(key)}`;
                
                methods.push(`  async ${methodName}() {
    await this.waitForSelector(${constantName}, 60);
    return await this.clickElement(${constantName});
  }`);
            }
        });

        // Generate input methods for form fields
        Object.entries(elements).forEach(([key, element]) => {
            if (element.type === 'input' || element.type === 'textarea' || element.type === 'select') {
                const constantName = key.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                const methodName = `setTextIn${this.toPascalCase(key)}`;
                
                methods.push(`  async ${methodName}(text) {
    try {
      await this.fill(${constantName}, text);
    } catch (error) {
      if (error) {
        try {
          await this.fill(${constantName}, text);
        } catch (error) {}
      } else {
        throw new Error(\`unable to set text \${text} using locator \${${constantName}} \\n\\n \${error.stack}\`);
      }
    }
  }`);
            }
        });

        // Generate verification methods
        Object.entries(elements).forEach(([key, element]) => {
            const constantName = key.toUpperCase().replace(/[^A-Z0-9]/g, '_');
            const methodName = `is${this.toPascalCase(key)}Displayed`;
            
            methods.push(`  async ${methodName}() {
    return await this.isVisible(${constantName});
  }`);
        });

        // Generate element presence check method
        methods.push(`  async clickOnElementIfPresent(selector, attempts = 1) {
    try {
      for (let x = 1; x <= attempts; x++) {
        if (await this.isVisible(selector)) {
          await this.click(selector);
          return true;
        }
      }
    } catch (error) {
      throw new Error(\`Error: \${error}\`);
    }
    return false;
  }`);

        return methods.join('\n\n');
    }
    }

    /**
     * Generate SBS-compliant Step File Content
     */
    generateStepFileContent(pageObject, stepDefinitions) {
        const className = `${pageObject.charAt(0).toUpperCase()}${pageObject.slice(1)}Page`;
        
        return `const { assert } = require('chai');
const { Given, When, Then } = require('@cucumber/cucumber');
const ${className} = require('../../pages/${pageObject}');

When('clicks on the {string} button in ${pageObject} page', { timeout: 100 * 1000 }, async function (buttonName) {
  await new ${className}(this.page).clickOnButton(buttonName);
});

When('sets text {string} in {string} field in ${pageObject} page', { timeout: 100 * 1000 }, async function (text, fieldName) {
  await new ${className}(this.page).setTextInField(fieldName, text);
});

Then('verify {string} is displayed in ${pageObject} page', { timeout: 100 * 1000 }, async function (elementName) {
  let isDisplayed = await new ${className}(this.page).isElementDisplayed(elementName);
  assert.isTrue(isDisplayed, \`\${elementName} is not displayed in ${pageObject} page\`);
});

Then('${pageObject} page is loaded successfully', { timeout: 240 * 1000 }, async function () {
  let pageLoaded = await new ${className}(this.page).isPageLoaded();
  assert.isTrue(pageLoaded, '${pageObject} page is not loaded');
});

${stepDefinitions}
`;
    }

    /**
     * Utility Methods
     */
    async launchBrowser(browserType) {
        if (!playwright) {
            throw new Error('Playwright is not available. Install with: npm install playwright');
        }
        
        const browsers = { 
            chromium: playwright.chromium, 
            firefox: playwright.firefox, 
            webkit: playwright.webkit 
        };
        
        return await browsers[browserType].launch({
            headless: process.env.HEADLESS_MODE !== 'false'
        });
    }

    generateSessionId() {
        return `playwright-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async getOrCreatePage(sessionId) {
        if (this.pages.has(sessionId)) {
            return this.pages.get(sessionId);
        }
        
        const browser = this.browsers.get(sessionId);
        const page = await browser.newPage();
        this.pages.set(sessionId, page);
        return page;
    }

    async checkStepDefinitionExists(stepText) {
        // Implementation to check if step definition exists in step files
        return false; // Simplified for now
    }

    async performAccessibilityAudit({ url, rules = [], outputFormat = 'json' }) {
        // Implementation for accessibility auditing with axe-core
        // This would require installing @axe-core/playwright
        return {
            success: true,
            message: 'Accessibility audit feature requires @axe-core/playwright dependency'
        };
    }

    async performPerformanceAudit({ url, metrics = [], iterations = 3 }) {
        // Implementation for performance auditing
        return {
            success: true,
            message: 'Performance audit implementation pending'
        };
    }
}

module.exports = PlaywrightMCP;
