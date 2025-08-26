#!/usr/bin/env node

/**
 * 🎯 LIVE PAGE ELEMENT SCANNER
 * 
 * The SIMPLEST approach:
 * 1. You manually navigate to your page
 * 2. Run this script
 * 3. It scans and captures ALL elements automatically
 * 4. Generates perfect SBS page file
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class LivePageScanner {
  constructor() {
    this.AUTO_CODER_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation/pages';
  }

  /**
   * 🔍 SCAN LIVE PAGE FOR ALL ELEMENTS
   * 
   * Usage: node live-page-scanner.js <pageUrl> <pageName>
   */
  async scanLivePage(pageUrl, pageName) {
    console.log(`
🔍 LIVE PAGE ELEMENT SCANNER
============================
🌐 Scanning: ${pageUrl}
📄 Page Name: ${pageName}
⏳ Please wait while we scan all elements...
`);

    const browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security']
    });
    
    const page = await browser.newPage();
    
    try {
      // Go to the page (user should already be logged in)
      await page.goto(pageUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000); // Let page settle
      
      console.log('🔍 Scanning all interactive elements...');
      
      // Scan for all elements using multiple strategies
      const scannedElements = await this.scanAllElements(page);
      
      console.log(`📍 Found ${scannedElements.length} interactive elements`);
      
      // Generate locators for all found elements
      const generatedLocators = await this.generateLocators(page, scannedElements);
      
      // Generate SBS page file
      await this.generateSBSPageFile(pageName, generatedLocators, pageUrl);
      
      // Generate elements report
      await this.generateElementsReport(pageName, scannedElements, generatedLocators);
      
      await browser.close();
      
      console.log(`
✅ SCAN COMPLETE!
=================
📄 Generated: ${pageName}.js
📊 Report: ${pageName}-elements-report.json
📍 Elements found: ${scannedElements.length}
🎯 Locators generated: ${Object.keys(generatedLocators).length}

🚀 NEXT STEPS:
1. Review the generated page file
2. Check the elements report
3. Use in your test artifacts
`);

      return { scannedElements, generatedLocators };
      
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * 🔍 SCAN ALL INTERACTIVE ELEMENTS ON PAGE
   */
  async scanAllElements(page) {
    console.log('🔍 Phase 1: Scanning direct elements...');
    
    const elements = await page.evaluate(() => {
      const found = [];
      
      // Function to get element description
      const getElementDescription = (el) => {
        // Try different ways to get meaningful description
        const text = el.textContent?.trim().substring(0, 50);
        const ariaLabel = el.getAttribute('aria-label');
        const title = el.getAttribute('title');
        const placeholder = el.getAttribute('placeholder');
        const dataTestId = el.getAttribute('data-test-id');
        const dataE2e = el.getAttribute('data-e2e');
        const dataId = el.getAttribute('data-id');
        const id = el.id;
        const name = el.getAttribute('name');
        
        if (dataTestId) return `Element with data-test-id: ${dataTestId}`;
        if (dataE2e) return `Element with data-e2e: ${dataE2e}`;
        if (dataId) return `Element with data-id: ${dataId}`;
        if (ariaLabel) return ariaLabel;
        if (title) return title;
        if (placeholder) return `Input: ${placeholder}`;
        if (text && text.length > 3) return text;
        if (id) return `Element with id: ${id}`;
        if (name) return `Input: ${name}`;
        
        return `${el.tagName.toLowerCase()} element`;
      };

      // Function to generate selector for element
      const generateSelector = (el) => {
        const selectors = [];
        
        // Priority 1: data-test-id
        const dataTestId = el.getAttribute('data-test-id');
        if (dataTestId) selectors.push(`[data-test-id="${dataTestId}"]`);
        
        // Priority 2: data-e2e
        const dataE2e = el.getAttribute('data-e2e');
        if (dataE2e) selectors.push(`[data-e2e="${dataE2e}"]`);
        
        // Priority 3: data-id
        const dataId = el.getAttribute('data-id');
        if (dataId) selectors.push(`[data-id="${dataId}"]`);
        
        // Priority 4: ID
        if (el.id) selectors.push(`#${el.id}`);
        
        // Priority 5: aria-label
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel) selectors.push(`[aria-label="${ariaLabel}"]`);
        
        // Priority 6: name attribute
        const name = el.getAttribute('name');
        if (name) selectors.push(`[name="${name}"]`);
        
        // Priority 7: class-based (if unique)
        const className = el.className;
        if (className && typeof className === 'string') {
          const classes = className.split(' ').filter(c => c && !c.includes('ng-') && !c.includes('mat-'));
          if (classes.length > 0) {
            selectors.push(`.${classes[0]}`);
          }
        }
        
        // Priority 8: text-based for buttons/links
        const text = el.textContent?.trim();
        if (text && text.length > 0 && text.length < 50) {
          if (el.tagName === 'BUTTON' || el.tagName === 'A') {
            selectors.push(`${el.tagName.toLowerCase()}:has-text("${text}")`);
          }
        }
        
        return selectors.length > 0 ? selectors : [`${el.tagName.toLowerCase()}`];
      };

      // Scan for interactive elements
      const interactiveSelectors = [
        'button',
        'a[href]',
        'input',
        'select', 
        'textarea',
        '[role="button"]',
        '[role="link"]',
        '[role="menuitem"]',
        '[onclick]',
        '[data-test-id]',
        '[data-e2e]',
        '[data-id]',
        '.btn',
        '[class*="button"]',
        '[class*="menu"]',
        'h1, h2, h3, h4, h5, h6',
        '[aria-label]'
      ];

      interactiveSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          // Skip if element is not visible
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          
          // Skip if element is hidden
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return;
          
          const description = getElementDescription(el);
          const selectors = generateSelector(el);
          
          found.push({
            description: description,
            tagName: el.tagName.toLowerCase(),
            selectors: selectors,
            location: {
              x: Math.round(rect.left),
              y: Math.round(rect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            isVisible: true,
            context: 'direct'
          });
        });
      });

      return found;
    });

    console.log(`📍 Found ${elements.length} direct elements`);

    // Phase 2: Scan Shadow DOM elements
    console.log('🌑 Phase 2: Scanning Shadow DOM elements...');
    const shadowElements = await this.scanShadowElements(page);
    
    // Phase 3: Scan iframe elements  
    console.log('📋 Phase 3: Scanning iframe elements...');
    const iframeElements = await this.scanIframeElements(page);

    // Combine all elements
    const allElements = [...elements, ...shadowElements, ...iframeElements];
    
    // Remove duplicates based on description
    const uniqueElements = this.removeDuplicates(allElements);
    
    return uniqueElements;
  }

  /**
   * 🌑 SCAN SHADOW DOM ELEMENTS
   */
  async scanShadowElements(page) {
    const shadowElements = await page.evaluate(() => {
      const found = [];
      
      // Common shadow hosts in the app
      const shadowHosts = [
        'sfc-shell-left-nav',
        'sfc-shell-app-bar',
        'oneux-header',
        'sdf-menu',
        'sdf-button',
        'sdf-input'
      ];

      shadowHosts.forEach(hostSelector => {
        const hosts = document.querySelectorAll(hostSelector);
        hosts.forEach(host => {
          if (host.shadowRoot) {
            // Scan depth 1
            const shadowElements = host.shadowRoot.querySelectorAll('*');
            shadowElements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) return;
              
              // Check if interactive
              const isInteractive = el.tagName === 'BUTTON' || 
                                  el.tagName === 'A' ||
                                  el.getAttribute('role') === 'button' ||
                                  el.getAttribute('data-id') ||
                                  el.getAttribute('data-test-id') ||
                                  el.onclick ||
                                  el.classList.contains('clickable');

              if (isInteractive) {
                const text = el.textContent?.trim().substring(0, 50);
                const dataId = el.getAttribute('data-id');
                const description = dataId || text || `${el.tagName.toLowerCase()} in ${hostSelector}`;

                found.push({
                  description: description,
                  tagName: el.tagName.toLowerCase(),
                  shadowHost: hostSelector,
                  shadowDepth: 1,
                  selector: el.getAttribute('data-id') ? `[data-id="${el.getAttribute('data-id')}"]` : el.tagName.toLowerCase(),
                  context: 'shadow-depth-1',
                  isVisible: true
                });
              }
            });

            // Check for nested shadow roots (depth 2)
            shadowElements.forEach(el => {
              if (el.shadowRoot) {
                const nestedElements = el.shadowRoot.querySelectorAll('*');
                nestedElements.forEach(nested => {
                  const rect = nested.getBoundingClientRect();
                  if (rect.width === 0 || rect.height === 0) return;

                  const isInteractive = nested.tagName === 'BUTTON' || 
                                       nested.tagName === 'A' ||
                                       nested.getAttribute('role') === 'button' ||
                                       nested.getAttribute('data-id');

                  if (isInteractive) {
                    const text = nested.textContent?.trim().substring(0, 50);
                    const dataId = nested.getAttribute('data-id');
                    const description = dataId || text || `${nested.tagName.toLowerCase()} in ${hostSelector} (nested)`;

                    found.push({
                      description: description,
                      tagName: nested.tagName.toLowerCase(),
                      shadowHost: hostSelector,
                      shadowRoot: el.tagName.toLowerCase(),
                      shadowDepth: 2,
                      selector: nested.getAttribute('data-id') ? `[data-id="${nested.getAttribute('data-id')}"]` : nested.tagName.toLowerCase(),
                      context: 'shadow-depth-2',
                      isVisible: true
                    });
                  }
                });
              }
            });
          }
        });
      });

      return found;
    });

    console.log(`🌑 Found ${shadowElements.length} Shadow DOM elements`);
    return shadowElements;
  }

  /**
   * 📋 SCAN IFRAME ELEMENTS
   */
  async scanIframeElements(page) {
    const iframeElements = [];
    
    try {
      const iframes = ['#shell', '#iPDetail', 'iframe'];
      
      for (const iframeSelector of iframes) {
        try {
          const frameCount = await page.locator(iframeSelector).count();
          if (frameCount > 0) {
            console.log(`📋 Scanning iframe: ${iframeSelector}`);
            
            const frame = page.frameLocator(iframeSelector);
            
            // Scan for interactive elements in iframe
            const elements = await frame.evaluate(() => {
              const found = [];
              const interactiveElements = document.querySelectorAll('button, a[href], input, [data-test-id], [data-e2e], [role="button"]');
              
              interactiveElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                
                const text = el.textContent?.trim().substring(0, 50);
                const dataTestId = el.getAttribute('data-test-id');
                const description = dataTestId || text || `${el.tagName.toLowerCase()} in iframe`;
                
                found.push({
                  description: description,
                  tagName: el.tagName.toLowerCase(),
                  selector: dataTestId ? `[data-test-id="${dataTestId}"]` : el.tagName.toLowerCase(),
                  context: 'iframe',
                  iframeSelector: '${iframeSelector}',
                  isVisible: true
                });
              });
              
              return found;
            });
            
            iframeElements.push(...elements);
          }
        } catch (error) {
          // Continue with next iframe
        }
      }
    } catch (error) {
      console.log('📋 No iframes found or accessible');
    }

    console.log(`📋 Found ${iframeElements.length} iframe elements`);
    return iframeElements;
  }

  /**
   * 🎯 GENERATE LOCATORS FOR ALL ELEMENTS
   */
  async generateLocators(page, elements) {
    const locators = {};
    
    for (const element of elements) {
      const constantName = this.generateConstantName(element.description);
      
      if (element.context === 'shadow-depth-1') {
        locators[constantName] = {
          type: 'shadow-depth-1',
          description: element.description,
          hostSelector: element.shadowHost,
          elementSelector: element.selector,
          code: `await this.getShadowElementDepthOfOne(By.css('${element.shadowHost}'), By.css('${element.selector}'))`
        };
      } else if (element.context === 'shadow-depth-2') {
        locators[constantName] = {
          type: 'shadow-depth-2',
          description: element.description,
          hostSelector: element.shadowHost,
          rootSelector: element.shadowRoot,
          elementSelector: element.selector,
          code: `await this.getShadowElementDepthOfTwo(By.css('${element.shadowHost}'), By.css('${element.shadowRoot}'), By.css('${element.selector}'))`
        };
      } else if (element.context === 'iframe') {
        locators[constantName] = {
          type: 'iframe',
          description: element.description,
          iframeSelector: element.iframeSelector,
          elementSelector: element.selector,
          code: `await this.page.frameLocator('${element.iframeSelector}').locator('${element.selector}')`
        };
      } else {
        // Direct element
        const bestSelector = element.selectors ? element.selectors[0] : element.selector;
        locators[constantName] = {
          type: 'direct',
          description: element.description,
          selector: bestSelector,
          code: `await this.clickElement(${constantName})`
        };
      }
    }
    
    return locators;
  }

  /**
   * 📄 GENERATE SBS PAGE FILE
   */
  async generateSBSPageFile(pageName, locators, pageUrl) {
    const className = this.generateClassName(pageName);
    const constants = this.generateConstants(locators);
    const methods = this.generateMethods(locators);
    
    const pageContent = `const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

// Auto-generated locators from live page scan
// Page URL: ${pageUrl}
// Generated: ${new Date().toISOString()}

${constants}

class ${className} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

${methods}
}

module.exports = ${className};`;

    const filePath = path.join(this.AUTO_CODER_PAGES_PATH, `${pageName}.js`);
    await fs.writeFile(filePath, pageContent, 'utf8');
    
    console.log(`✅ Generated: ${filePath}`);
  }

  /**
   * 📊 GENERATE ELEMENTS REPORT
   */
  async generateElementsReport(pageName, elements, locators) {
    const report = {
      scanInfo: {
        pageName: pageName,
        scanDate: new Date().toISOString(),
        totalElements: elements.length,
        locatorsGenerated: Object.keys(locators).length
      },
      summary: {
        directElements: elements.filter(e => e.context === 'direct').length,
        shadowElements: elements.filter(e => e.context.includes('shadow')).length,
        iframeElements: elements.filter(e => e.context === 'iframe').length
      },
      elements: elements,
      generatedLocators: locators
    };

    const reportPath = `${pageName}-elements-report.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Report saved: ${reportPath}`);
  }

  /**
   * 🛠️ UTILITY METHODS
   */
  generateConstantName(description) {
    return description
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .map(word => word.toUpperCase())
      .join('_')
      .substring(0, 50); // Limit length
  }

  generateClassName(pageName) {
    return pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';
  }

  generateConstants(locators) {
    const constants = [];
    
    for (const [name, info] of Object.entries(locators)) {
      if (info.type === 'direct') {
        constants.push(`const ${name} = By.css('${info.selector}'); // ${info.description}`);
      } else {
        constants.push(`// ${name} - ${info.type} - ${info.description}`);
      }
    }
    
    return constants.join('\n');
  }

  generateMethods(locators) {
    const methods = [];
    
    for (const [name, info] of Object.entries(locators)) {
      const clickMethod = this.generateMethodName(name, 'click');
      const verifyMethod = this.generateMethodName(name, 'verify');
      
      if (info.type === 'shadow-depth-1') {
        methods.push(`
  async ${clickMethod}() {
    // ${info.description}
    const element = await this.getShadowElementDepthOfOne(By.css('${info.hostSelector}'), By.css('${info.elementSelector}'));
    await element.click();
  }

  async ${verifyMethod}() {
    const element = await this.getShadowElementDepthOfOne(By.css('${info.hostSelector}'), By.css('${info.elementSelector}'));
    const isVisible = await element.isVisible();
    if (!isVisible) {
      throw new Error('${info.description} is not visible');
    }
  }`);
      } else if (info.type === 'shadow-depth-2') {
        methods.push(`
  async ${clickMethod}() {
    // ${info.description}
    const element = await this.getShadowElementDepthOfTwo(By.css('${info.hostSelector}'), By.css('${info.rootSelector}'), By.css('${info.elementSelector}'));
    await element.click();
  }

  async ${verifyMethod}() {
    const element = await this.getShadowElementDepthOfTwo(By.css('${info.hostSelector}'), By.css('${info.rootSelector}'), By.css('${info.elementSelector}'));
    const isVisible = await element.isVisible();
    if (!isVisible) {
      throw new Error('${info.description} is not visible');
    }
  }`);
      } else if (info.type === 'iframe') {
        methods.push(`
  async ${clickMethod}() {
    // ${info.description}
    await this.page.frameLocator('${info.iframeSelector}').locator('${info.elementSelector}').click();
  }

  async ${verifyMethod}() {
    const isVisible = await this.page.frameLocator('${info.iframeSelector}').locator('${info.elementSelector}').isVisible();
    if (!isVisible) {
      throw new Error('${info.description} is not visible');
    }
  }`);
      } else {
        methods.push(`
  async ${clickMethod}() {
    // ${info.description}
    await this.clickElement(${name});
  }

  async ${verifyMethod}() {
    const isVisible = await this.isVisible(${name});
    if (!isVisible) {
      throw new Error('${info.description} is not visible');
    }
  }`);
      }
    }
    
    return methods.join('\n');
  }

  generateMethodName(constantName, action) {
    const words = constantName.split('_');
    const elementName = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('');
    
    return action + elementName;
  }

  removeDuplicates(elements) {
    const seen = new Set();
    return elements.filter(element => {
      const key = element.description + element.context;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

/**
 * 🚀 CLI EXECUTION
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
🔍 LIVE PAGE ELEMENT SCANNER

USAGE:
  node live-page-scanner.js <pageUrl> <pageName>

EXAMPLES:
  node live-page-scanner.js "https://runmod.com/billing" "billing-page"
  node live-page-scanner.js "https://runmod.com/admin" "admin-page"

WORKFLOW:
  1. Login to your app manually
  2. Navigate to the page you want to scan
  3. Run this command with the current page URL
  4. Script will scan ALL elements automatically
  5. Perfect SBS page file generated!

FEATURES:
  ✅ Scans ALL visible elements automatically
  🌑 Detects Shadow DOM elements (depth 1 & 2)
  📋 Finds iframe elements
  🎯 Generates SBS-compliant page files
  📊 Provides detailed scan reports
`);
    process.exit(1);
  }
  
  const [pageUrl, pageName] = args;
  
  const scanner = new LivePageScanner();
  await scanner.scanLivePage(pageUrl, pageName);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = LivePageScanner;
