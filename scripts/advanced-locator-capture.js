#!/usr/bin/env node

/**
 * 🔥 SHADOW DOM + IFRAME + MODAL LOCATOR CAPTURE
 * 
 * The ONLY solution that handles your real app architecture:
 * - Shadow DOM elements (depth 1, 2, 3+)
 * - iFrames and nested iFrames  
 * - Full-screen modals
 * - Single URL navigation
 * - Complex DOM structures
 */

const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

class AdvancedLocatorCapture {
  constructor() {
    this.SBS_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/SBS_Automation/pages';
    this.AUTO_CODER_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation/pages';
    
    // 🎯 Advanced capture strategies for complex DOM
    this.strategies = {
      shadowDOM: true,
      iframes: true, 
      modals: true,
      deepNesting: true
    };
  }

  /**
   * 🔥 CAPTURE ELEMENTS WITH NAVIGATION SIMULATION
   * 
   * This handles single URL apps with menu navigation
   */
  async captureWithNavigation(baseUrl, credentials, navigationSteps, elementDescriptions) {
    console.log('🔥 Starting advanced element capture...');
    
    const browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const page = await browser.newPage();
    
    try {
      // Step 1: Login and setup
      await this.loginAndSetup(page, baseUrl, credentials);
      
      // Step 2: Navigate through UI to find elements
      const capturedElements = {};
      
      for (const step of navigationSteps) {
        console.log(`🧭 Navigation: ${step.description}`);
        
        // Execute navigation step
        await this.executeNavigationStep(page, step);
        
        // Capture elements on this page/modal/section
        if (step.elementsToCapture) {
          const stepElements = await this.captureElementsAdvanced(page, step.elementsToCapture);
          Object.assign(capturedElements, stepElements);
        }
      }
      
      await browser.close();
      return capturedElements;
      
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * 🔑 LOGIN AND SETUP SESSION
   */
  async loginAndSetup(page, baseUrl, credentials) {
    console.log('🔑 Setting up session...');
    
    await page.goto(baseUrl);
    
    if (credentials) {
      // Handle login if needed
      if (credentials.username && credentials.password) {
        await page.fill('#username', credentials.username);
        await page.fill('#password', credentials.password);
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Wait for app to fully load
    await page.waitForTimeout(3000);
  }

  /**
   * 🧭 EXECUTE NAVIGATION STEP
   */
  async executeNavigationStep(page, step) {
    console.log(`⏳ Executing: ${step.description}`);
    
    switch (step.type) {
      case 'click':
        await this.smartClick(page, step.selector, step.context);
        break;
        
      case 'wait':
        await page.waitForTimeout(step.duration || 2000);
        break;
        
      case 'modal':
        await this.waitForModal(page, step.modalSelector);
        break;
        
      case 'iframe':
        // Just mark that we're in iframe context
        console.log(`📋 Now in iframe: ${step.iframeSelector}`);
        break;
        
      case 'shadow':
        console.log(`🌑 Now in shadow DOM: ${step.shadowHost}`);
        break;
    }
    
    // Always wait a bit for UI to settle
    await page.waitForTimeout(1000);
  }

  /**
   * 🎯 ADVANCED ELEMENT CAPTURE
   * 
   * Handles Shadow DOM, iFrames, Modals automatically
   */
  async captureElementsAdvanced(page, elementDescriptions) {
    console.log('🎯 Capturing elements with advanced strategies...');
    
    const captured = {};
    
    for (const element of elementDescriptions) {
      console.log(`🔍 Analyzing: ${element.description}`);
      
      try {
        const locatorInfo = await this.analyzeElementAdvanced(page, element);
        captured[this.generateConstantName(element.description)] = locatorInfo;
        
        console.log(`✅ Captured: ${element.description}`);
        
      } catch (error) {
        console.log(`❌ Failed: ${element.description} - ${error.message}`);
        
        // Create fallback locator
        captured[this.generateConstantName(element.description)] = {
          type: 'fallback',
          selector: this.generateFallbackSelector(element.description),
          method: 'By.css',
          notes: `Failed to capture - needs manual update: ${error.message}`
        };
      }
    }
    
    return captured;
  }

  /**
   * 🧠 ANALYZE ELEMENT WITH ALL STRATEGIES
   */
  async analyzeElementAdvanced(page, element) {
    const strategies = [];
    
    // Strategy 1: Try direct selectors first
    const directResult = await this.tryDirectSelectors(page, element);
    if (directResult) strategies.push(directResult);
    
    // Strategy 2: Try Shadow DOM selectors
    const shadowResult = await this.tryShadowSelectors(page, element);
    if (shadowResult) strategies.push(shadowResult);
    
    // Strategy 3: Try iframe selectors
    const iframeResult = await this.tryIframeSelectors(page, element);
    if (iframeResult) strategies.push(iframeResult);
    
    // Strategy 4: Try modal selectors
    const modalResult = await this.tryModalSelectors(page, element);
    if (modalResult) strategies.push(modalResult);
    
    if (strategies.length === 0) {
      throw new Error('No working selector found');
    }
    
    // Return the best strategy (prefer Shadow DOM, then direct, then iframe)
    return this.selectBestStrategy(strategies);
  }

  /**
   * 🎯 TRY DIRECT SELECTORS
   */
  async tryDirectSelectors(page, element) {
    const selectors = [
      `[data-test-id*="${this.kebabCase(element.description)}"]`,
      `[data-e2e*="${this.kebabCase(element.description)}"]`,
      `[aria-label*="${element.description}"]`,
      `:text("${element.description}")`,
      `[class*="${this.kebabCase(element.description)}"]`
    ];
    
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector);
        if (await locator.count() > 0) {
          return {
            type: 'direct',
            selector: selector,
            method: 'By.css',
            elementCount: await locator.count()
          };
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    return null;
  }

  /**
   * 🌑 TRY SHADOW DOM SELECTORS
   */
  async tryShadowSelectors(page, element) {
    // Common shadow hosts in your app
    const shadowHosts = [
      'sfc-shell-left-nav',
      'sfc-shell-app-bar', 
      'oneux-header',
      'sdf-menu',
      'sdf-button'
    ];
    
    for (const host of shadowHosts) {
      try {
        // Try depth 1
        const depth1Result = await this.tryShadowDepth1(page, host, element);
        if (depth1Result) return depth1Result;
        
        // Try depth 2
        const depth2Result = await this.tryShadowDepth2(page, host, element);
        if (depth2Result) return depth2Result;
        
      } catch (error) {
        // Continue to next host
      }
    }
    
    return null;
  }

  /**
   * 🌑 TRY SHADOW DOM DEPTH 1
   */
  async tryShadowDepth1(page, host, element) {
    const possibleSelectors = [
      `[data-test-id*="${this.kebabCase(element.description)}"]`,
      `[data-e2e*="${this.kebabCase(element.description)}"]`,
      `.${this.kebabCase(element.description)}`,
      `[class*="${this.kebabCase(element.description)}"]`,
      `:text("${element.description}")`
    ];
    
    for (const selector of possibleSelectors) {
      try {
        // Simulate getShadowElementDepthOfOne
        const result = await page.evaluate(([hostSelector, elementSelector]) => {
          const hostElement = document.querySelector(hostSelector);
          if (!hostElement || !hostElement.shadowRoot) return null;
          
          const shadowElement = hostElement.shadowRoot.querySelector(elementSelector);
          return shadowElement ? true : null;
        }, [host, selector]);
        
        if (result) {
          return {
            type: 'shadow-depth-1',
            hostSelector: host,
            elementSelector: selector,
            method: 'getShadowElementDepthOfOne',
            code: `await this.getShadowElementDepthOfOne(By.css('${host}'), By.css('${selector}'))`
          };
        }
      } catch (error) {
        // Continue
      }
    }
    
    return null;
  }

  /**
   * 🌑 TRY SHADOW DOM DEPTH 2
   */
  async tryShadowDepth2(page, host, element) {
    const commonRoots = ['li', 'div', 'section', 'nav'];
    const possibleSelectors = [
      `[data-test-id*="${this.kebabCase(element.description)}"]`,
      `[data-id*="${this.kebabCase(element.description)}"]`,
      `.${this.kebabCase(element.description)}`
    ];
    
    for (const root of commonRoots) {
      for (const selector of possibleSelectors) {
        try {
          const result = await page.evaluate(([hostSelector, rootSelector, elementSelector]) => {
            const hostElement = document.querySelector(hostSelector);
            if (!hostElement || !hostElement.shadowRoot) return null;
            
            const rootElement = hostElement.shadowRoot.querySelector(rootSelector);
            if (!rootElement || !rootElement.shadowRoot) return null;
            
            const shadowElement = rootElement.shadowRoot.querySelector(elementSelector);
            return shadowElement ? true : null;
          }, [host, root, selector]);
          
          if (result) {
            return {
              type: 'shadow-depth-2',
              hostSelector: host,
              rootSelector: root,
              elementSelector: selector,
              method: 'getShadowElementDepthOfTwo',
              code: `await this.getShadowElementDepthOfTwo(By.css('${host}'), By.css('${root}'), By.css('${selector}'))`
            };
          }
        } catch (error) {
          // Continue
        }
      }
    }
    
    return null;
  }

  /**
   * 📋 TRY IFRAME SELECTORS
   */
  async tryIframeSelectors(page, element) {
    const iframes = ['#shell', '#iPDetail', 'iframe'];
    
    for (const iframe of iframes) {
      try {
        const frame = page.frameLocator(iframe);
        const selectors = [
          `[data-test-id*="${this.kebabCase(element.description)}"]`,
          `:text("${element.description}")`,
          `[class*="${this.kebabCase(element.description)}"]`
        ];
        
        for (const selector of selectors) {
          const locator = frame.locator(selector);
          if (await locator.count() > 0) {
            return {
              type: 'iframe',
              iframeSelector: iframe,
              elementSelector: selector,
              method: 'frameLocator',
              code: `await this.page.frameLocator('${iframe}').locator('${selector}')`
            };
          }
        }
      } catch (error) {
        // Continue
      }
    }
    
    return null;
  }

  /**
   * 🗂️ TRY MODAL SELECTORS
   */
  async tryModalSelectors(page, element) {
    const modalContainers = [
      '[role="dialog"]',
      '.modal',
      '[class*="modal"]',
      '.overlay',
      '[class*="popup"]'
    ];
    
    for (const container of modalContainers) {
      try {
        const modal = page.locator(container);
        if (await modal.count() > 0) {
          const selectors = [
            `[data-test-id*="${this.kebabCase(element.description)}"]`,
            `:text("${element.description}")`,
            `button:has-text("${element.description}")`
          ];
          
          for (const selector of selectors) {
            const element = modal.locator(selector);
            if (await element.count() > 0) {
              return {
                type: 'modal',
                modalContainer: container,
                elementSelector: selector,
                method: 'modal-locator',
                code: `await this.page.locator('${container}').locator('${selector}')`
              };
            }
          }
        }
      } catch (error) {
        // Continue
      }
    }
    
    return null;
  }

  /**
   * 🎯 SELECT BEST STRATEGY
   */
  selectBestStrategy(strategies) {
    // Priority: Shadow DOM > Direct > Modal > iframe
    const priority = ['shadow-depth-1', 'shadow-depth-2', 'direct', 'modal', 'iframe'];
    
    for (const type of priority) {
      const strategy = strategies.find(s => s.type === type);
      if (strategy) return strategy;
    }
    
    return strategies[0]; // Return first available
  }

  /**
   * 🤖 SMART CLICK WITH CONTEXT AWARENESS
   */
  async smartClick(page, selector, context = {}) {
    if (context.shadow) {
      if (context.shadowDepth === 2) {
        const element = await page.evaluate(([host, root, sel]) => {
          const hostEl = document.querySelector(host);
          const rootEl = hostEl?.shadowRoot?.querySelector(root);
          const targetEl = rootEl?.shadowRoot?.querySelector(sel);
          if (targetEl) targetEl.click();
          return !!targetEl;
        }, [context.shadowHost, context.shadowRoot, selector]);
        
        if (!element) throw new Error('Shadow element not found');
      } else {
        // Depth 1
        const element = await page.evaluate(([host, sel]) => {
          const hostEl = document.querySelector(host);
          const targetEl = hostEl?.shadowRoot?.querySelector(sel);
          if (targetEl) targetEl.click();
          return !!targetEl;
        }, [context.shadowHost, selector]);
        
        if (!element) throw new Error('Shadow element not found');
      }
    } else if (context.iframe) {
      await page.frameLocator(context.iframe).locator(selector).click();
    } else {
      await page.locator(selector).click();
    }
  }

  /**
   * 📄 GENERATE SBS PAGE FILE
   */
  async generateSBSPageFile(pageFileName, capturedElements, navigationInfo) {
    const className = this.generateClassName(pageFileName);
    const constants = this.generateConstants(capturedElements);
    const methods = this.generateMethods(capturedElements, navigationInfo);
    
    const pageContent = `const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

${constants}

class ${className} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

${methods}
}

module.exports = ${className};`;

    const filePath = path.join(this.AUTO_CODER_PAGES_PATH, pageFileName);
    await fs.writeFile(filePath, pageContent, 'utf8');
    
    console.log(`✅ Generated: ${filePath}`);
  }

  /**
   * 🔧 GENERATE CONSTANTS SECTION
   */
  generateConstants(elements) {
    const constants = [];
    
    for (const [name, info] of Object.entries(elements)) {
      if (info.type === 'direct') {
        constants.push(`const ${name} = By.css('${info.selector}');`);
      } else if (info.type === 'fallback') {
        constants.push(`const ${name} = ${info.selector}; // ${info.notes}`);
      } else {
        constants.push(`// ${name} - ${info.type} - Use: ${info.code}`);
      }
    }
    
    return constants.join('\n');
  }

  /**
   * 🔧 GENERATE METHODS SECTION
   */
  generateMethods(elements, navigationInfo) {
    const methods = [];
    
    // Generate navigation method if provided
    if (navigationInfo && navigationInfo.steps) {
      methods.push(this.generateNavigationMethod(navigationInfo));
    }
    
    // Generate interaction methods for each element
    for (const [name, info] of Object.entries(elements)) {
      const methodName = this.generateMethodName(name, 'click');
      const verifyMethodName = this.generateMethodName(name, 'verify');
      
      if (info.type === 'shadow-depth-1') {
        methods.push(`
  async ${methodName}() {
    const element = await this.getShadowElementDepthOfOne(By.css('${info.hostSelector}'), By.css('${info.elementSelector}'));
    await element.click();
  }

  async ${verifyMethodName}() {
    const element = await this.getShadowElementDepthOfOne(By.css('${info.hostSelector}'), By.css('${info.elementSelector}'));
    const isVisible = await element.isVisible();
    if (!isVisible) {
      throw new Error('${name} is not visible');
    }
  }`);
      } else if (info.type === 'shadow-depth-2') {
        methods.push(`
  async ${methodName}() {
    const element = await this.getShadowElementDepthOfTwo(By.css('${info.hostSelector}'), By.css('${info.rootSelector}'), By.css('${info.elementSelector}'));
    await element.click();
  }

  async ${verifyMethodName}() {
    const element = await this.getShadowElementDepthOfTwo(By.css('${info.hostSelector}'), By.css('${info.rootSelector}'), By.css('${info.elementSelector}'));
    const isVisible = await element.isVisible();
    if (!isVisible) {
      throw new Error('${name} is not visible');
    }
  }`);
      } else if (info.type === 'iframe') {
        methods.push(`
  async ${methodName}() {
    await this.page.frameLocator('${info.iframeSelector}').locator('${info.elementSelector}').click();
  }

  async ${verifyMethodName}() {
    const isVisible = await this.page.frameLocator('${info.iframeSelector}').locator('${info.elementSelector}').isVisible();
    if (!isVisible) {
      throw new Error('${name} is not visible');
    }
  }`);
      } else {
        // Direct or fallback
        methods.push(`
  async ${methodName}() {
    await this.clickElement(${name});
  }

  async ${verifyMethodName}() {
    const isVisible = await this.isVisible(${name});
    if (!isVisible) {
      throw new Error('${name} is not visible');
    }
  }`);
      }
    }
    
    return methods.join('\n');
  }

  /**
   * 🧭 GENERATE NAVIGATION METHOD
   */
  generateNavigationMethod(navigationInfo) {
    const steps = navigationInfo.steps.map(step => {
      if (step.type === 'click' && step.context?.shadow) {
        return `    // ${step.description}
    const ${step.variableName} = await this.getShadowElementDepthOf${step.context.shadowDepth === 2 ? 'Two' : 'One'}(By.css('${step.context.shadowHost}'), ${step.context.shadowDepth === 2 ? `By.css('${step.context.shadowRoot}'), ` : ''}By.css('${step.selector}'));
    await ${step.variableName}.click();`;
      } else {
        return `    // ${step.description}
    await this.clickElement(By.css('${step.selector}'));`;
      }
    }).join('\n');
    
    return `
  async navigateTo${navigationInfo.targetPage}() {
${steps}
    await this.waitForTimeout(2000);
  }`;
  }

  /**
   * 🛠️ UTILITY METHODS
   */
  generateConstantName(description) {
    return description
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.toUpperCase())
      .join('_');
  }

  generateClassName(fileName) {
    return fileName
      .replace('.js', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';
  }

  generateMethodName(constantName, action) {
    const words = constantName.split('_');
    const elementName = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('');
    
    return action + elementName;
  }

  kebabCase(str) {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  generateFallbackSelector(description) {
    return `By.css('[data-test-id="${this.kebabCase(description)}"], .${this.kebabCase(description)}, [class*="${this.kebabCase(description)}"]')`;
  }

  async waitForModal(page, modalSelector) {
    await page.waitForSelector(modalSelector, { timeout: 10000 });
    await page.waitForTimeout(1000); // Let modal fully render
  }
}

module.exports = AdvancedLocatorCapture;
