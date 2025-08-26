/**
 * Playwright MCP Tool for Auto-Coder Framework
 * Generates SBS_Automation compliant page objects and step definitions
 * Follows exact SBS patterns and structure
 */

const fs = require('fs-extra');
const path = require('path');

// Dynamic import for Playwright
let playwright;
(async () => {
    try {
        playwright = await import('playwright');
    } catch (error) {
        console.warn('Playwright not available. Install with: npm install playwright');
    }
})();

class PlaywrightMCP {
    constructor() {
        this.initialized = false;
        this.sessions = new Map();
        this.pagesPath = path.join(process.cwd(), 'SBS_Automation', 'pages');
        this.stepsPath = path.join(process.cwd(), 'SBS_Automation', 'steps');
    }

    async initialize() {
        if (this.initialized) return;

        try {
            await fs.ensureDir(this.pagesPath);
            await fs.ensureDir(this.stepsPath);
            this.initialized = true;
            console.log('[HybridEngine] MCP tool playwright initialized successfully');
        } catch (error) {
            console.error('[HybridEngine] Failed to initialize Playwright MCP:', error.message);
            throw error;
        }
    }

    getTools() {
        return [
            this.createPageObjectTool(),
            this.createStepDefinitionTool(),
            this.createTestExecutorTool(),
            this.createElementAnalyzerTool(),
            this.createSelectorOptimizerTool(),
            this.createTestValidatorTool(),
            this.createAccessibilityAuditorTool(),
            this.createPerformanceAuditorTool()
        ];
    }

    /**
     * Page Object Generator Tool - SBS Compliant
     */
    createPageObjectTool() {
        return {
            name: 'generate_page_object',
            description: 'Generate SBS-compliant page objects from URL analysis',
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
            description: 'Generate SBS-compliant Cucumber step definitions',
            inputSchema: {
                type: 'object',
                properties: {
                    pageObject: { type: 'string', description: 'Page object to generate steps for' },
                    actions: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Actions to create step definitions for'
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
     * Generate SBS-compliant page object
     */
    async generatePageObject({ url, pageName, selectors = [], browserType = 'chromium' }) {
        try {
            if (!playwright) {
                throw new Error('Playwright is not available. Install with: npm install playwright');
            }

            // Validate URL and provide fallback for demo URLs
            if (url === 'https://example.com' || url === 'http://example.com') {
                console.log('⚠️ Example.com is not accessible. Using demo mode...');
                return this.generateDemoPageObject(pageName);
            }

            const browser = await playwright[browserType].launch({
                headless: process.env.HEADLESS_MODE !== 'false'
            });
            
            const page = await browser.newPage();
            
            // Set a reasonable timeout and add error handling
            page.setDefaultTimeout(10000); // 10 second timeout
            
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            } catch (error) {
                await browser.close();
                console.log(`⚠️ Failed to load ${url}: ${error.message}`);
                console.log('🎯 Generating demo page object instead...');
                return this.generateDemoPageObject(pageName);
            }

            // Auto-discover interactive elements following SBS patterns
            const elements = await page.evaluate(() => {
                const sbsSelectors = [
                    '[data-testid]', '[data-test]', '[data-test-id]',
                    'sdf-button', 'sdf-input', 'sdf-icon',
                    'button', 'input', 'select', 'textarea', 'a[href]',
                    '[role="button"]', '[role="link"]', '[role="textbox"]'
                ];
                
                const discoveredElements = {};
                
                sbsSelectors.forEach(selector => {
                    const els = document.querySelectorAll(selector);
                    els.forEach((el, index) => {
                        const testId = el.getAttribute('data-testid') || 
                                      el.getAttribute('data-test') || 
                                      el.getAttribute('data-test-id');
                        
                        const elementName = testId || 
                                          el.id || 
                                          el.textContent?.trim().substring(0, 20).replace(/\s+/g, '_') || 
                                          `${el.tagName.toLowerCase()}_${index}`;
                        
                        const selectorValue = testId ? `[data-test-id="${testId}"]` : 
                                            el.id ? `#${el.id}` :
                                            el.className ? `.${el.className.split(' ')[0]}` :
                                            el.tagName.toLowerCase();

                        discoveredElements[elementName] = {
                            selector: selectorValue,
                            type: el.tagName.toLowerCase(),
                            text: el.textContent?.trim().substring(0, 50) || '',
                            attributes: {
                                id: el.id,
                                class: el.className,
                                'data-testid': testId,
                                'data-test': el.getAttribute('data-test'),
                                'data-test-id': el.getAttribute('data-test-id')
                            }
                        };
                    });
                });
                
                return discoveredElements;
            });

            await browser.close();

            // Generate SBS-compliant page object
            const pageObjectContent = this.generateSBSPageObjectContent(pageName, elements, url);
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
     * Generate SBS-compliant Page Object Content
     */
    generateSBSPageObjectContent(pageName, elements, url) {
        const className = `${pageName.charAt(0).toUpperCase()}${pageName.slice(1)}Page`;
        
        // Generate SBS-style locator constants (outside constructor)
        const locatorConstants = Object.entries(elements).map(([key, element]) => {
            const constantName = key.toUpperCase().replace(/[^A-Z0-9]/g, '_');
            const selectorStrategy = this.determineSBSelectorStrategy(element);
            return `const ${constantName} = By.${selectorStrategy}('${element.selector}');`;
        }).join('\n');

        // Generate common SBS dynamic locators
        const dynamicLocators = `const BTN_ELEMENT = (btnName) => By.xpath(\`//sdf-button[text() = "\${btnName}"]\`);
const TASK_TILE = (tileName) => By.css(\`[data-test-id="\${tileName}-button"]\`);
const LEFT_NAV_ICON = (navName) => By.xpath(\`//sdf-icon[@data-test-id='\${navName}-icon']\`);`;

        // Generate SBS-style methods
        const sbsMethods = this.generateSBSMethods(elements);

        return `const By = require('../../support/By');
let BasePage = require('../common/base-page');

${locatorConstants}
${dynamicLocators}

class ${className} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async navigateToPage() {
    await this.navigateTo('${url}');
    await this.waitForPageLoad();
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
            return 'css';
        }
        if (element.selector.includes('//')) {
            return 'xpath';
        }
        return 'css';
    }

    /**
     * Generate SBS-style methods following framework patterns
     */
    generateSBSMethods(elements) {
        const methods = [];

        // Generate click methods for buttons and links
        Object.entries(elements).forEach(([key, element]) => {
            if (element.type === 'button' || element.type === 'a' || element.attributes?.role === 'button' || element.type === 'sdf-button') {
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
            if (element.type === 'input' || element.type === 'textarea' || element.type === 'select' || element.type === 'sdf-input') {
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

        // Generate SBS-style element interaction method
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

    /**
     * Generate SBS-compliant step definitions
     */
    async generateStepDefinitions({ pageObject, actions, stepType = 'When' }) {
        try {
            const pageObjectPath = path.join(this.pagesPath, `${pageObject}.js`);
            
            if (!await fs.pathExists(pageObjectPath)) {
                throw new Error(`Page object ${pageObject} not found`);
            }

            const stepDefinitions = actions.map(action => {
                return this.generateSBSStepDefinition(pageObject, action, stepType);
            }).join('\n\n');

            const stepFilePath = path.join(this.stepsPath, `${pageObject}-steps.js`);
            const stepFileContent = this.generateSBSStepFileContent(pageObject, stepDefinitions);

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
     * Generate SBS-compliant Step File Content
     */
    generateSBSStepFileContent(pageObject, stepDefinitions) {
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
     * Generate individual SBS step definition
     */
    generateSBSStepDefinition(pageObject, action, stepType) {
        const className = `${pageObject.charAt(0).toUpperCase()}${pageObject.slice(1)}Page`;
        
        return `${stepType}('user ${action} in ${pageObject} page', { timeout: 100 * 1000 }, async function () {
  await new ${className}(this.page).${action}();
});`;
    }

    /**
     * Utility method to convert to PascalCase
     */
    toPascalCase(str) {
        return str.replace(/(?:^|_)([a-z])/g, (match, letter) => letter.toUpperCase())
                  .replace(/_/g, '');
    }

    // Create other tool placeholders to maintain interface
    createTestExecutorTool() {
        return {
            name: 'execute_test',
            description: 'Execute generated test with SBS framework',
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => ({ success: true, message: 'Test execution placeholder' })
        };
    }

    createElementAnalyzerTool() {
        return {
            name: 'analyze_elements',
            description: 'Analyze page elements for optimal selectors',
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => ({ success: true, message: 'Element analysis placeholder' })
        };
    }

    createSelectorOptimizerTool() {
        return {
            name: 'optimize_selectors',
            description: 'Optimize selectors for SBS patterns',
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => ({ success: true, message: 'Selector optimization placeholder' })
        };
    }

    createTestValidatorTool() {
        return {
            name: 'validate_test',
            description: 'Validate test artifacts against SBS standards',
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => ({ success: true, message: 'Test validation placeholder' })
        };
    }

    createAccessibilityAuditorTool() {
        return {
            name: 'audit_accessibility',
            description: 'Perform accessibility audit on page',
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => ({ success: true, message: 'Accessibility audit placeholder' })
        };
    }

    createPerformanceAuditorTool() {
        return {
            name: 'audit_performance',
            description: 'Perform performance audit on page',
            inputSchema: { type: 'object', properties: {}, required: [] },
            handler: async () => ({ success: true, message: 'Performance audit placeholder' })
        };
    }

    /**
     * Generate demo page object when URL is not accessible
     */
    generateDemoPageObject(pageName) {
        const demoElements = {
            loginButton: {
                selector: '[data-test-id="login-submit"]',
                type: 'button',
                text: 'Login',
                attributes: {
                    'data-testid': 'login-submit',
                    'data-test-id': 'login-submit'
                }
            },
            usernameField: {
                selector: '#username',
                type: 'input',
                text: '',
                attributes: {
                    id: 'username',
                    type: 'text'
                }
            },
            passwordField: {
                selector: '#password',
                type: 'input',
                text: '',
                attributes: {
                    id: 'password',
                    type: 'password'
                }
            },
            dashboardLink: {
                selector: '[data-test-id="dashboard-nav"]',
                type: 'a',
                text: 'Dashboard',
                attributes: {
                    'data-test-id': 'dashboard-nav'
                }
            },
            submitButton: {
                selector: 'button[type="submit"]',
                type: 'button',
                text: 'Submit',
                attributes: {
                    type: 'submit'
                }
            }
        };

        // Generate SBS-compliant page object
        const pageObjectContent = this.generateSBSPageObjectContent(pageName, demoElements, 'https://demo-page.example.com');
        const outputPath = path.join(this.pagesPath, `${pageName}.js`);
        
        // Ensure directory exists and write file
        fs.ensureDirSync(this.pagesPath);
        fs.writeFileSync(outputPath, pageObjectContent);

        return {
            success: true,
            pageObjectPath: outputPath,
            elementsFound: Object.keys(demoElements).length,
            elements: demoElements,
            mode: 'demo',
            message: 'Generated demo page object with common SBS elements'
        };
    }
}

module.exports = PlaywrightMCP;
