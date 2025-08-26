#!/usr/bin/env node

/**
 * 🎯 ENHANCED INSTANT PAGE CAPTURE
 * 
 * FIXED ISSUES:
 * ✅ Better form element detection (inputs, checkboxes, etc.)
 * ✅ Improved visibility checking (no hidden elements)
 * ✅ Clean locator format (no "Multiple strategies" text)
 * ✅ Clear comments for hidden elements
 * ✅ Priority for interactive elements
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class EnhancedInstantCapture {
  constructor() {
    this.SBS_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/SBS_Automation/pages';
    this.mode = 'interactive';
    this.timeoutSeconds = 15;
  }

  async waitForUserReady() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Press ENTER when you are ready to scan the page... ', () => {
        rl.close();
        console.log('🔍 Starting enhanced element scan...');
        resolve();
      });
    });
  }

  async capturePageInstantly(pageName) {
    console.log(`
🚀 ENHANCED INSTANT PAGE CAPTURE
================================
📄 Page: ${pageName}
⏳ Capturing elements with improved detection...
`);

    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 100
    });
    
    const page = await browser.newPage();
    
    try {
      // Interactive prompt for navigation
      if (this.mode === 'interactive') {
        console.log('🌐 Browser window opened! Please:');
        console.log('   1. Navigate to your application');
        console.log('   2. Login if needed');
        console.log('   3. Go to the page you want to capture');
        console.log('');
        console.log('⏳ When you are ready, press ENTER to start scanning...');
        
        await this.waitForUserReady();
      } else {
        console.log(`🌐 Browser window opened! Please navigate to your page.`);
        console.log(`⏳ Auto-scanning in ${this.timeoutSeconds} seconds...`);
        await page.waitForTimeout(this.timeoutSeconds * 1000);
      }
      
      const currentUrl = page.url();
      console.log(`📍 Capturing from: ${currentUrl}`);
      
      // Enhanced element capture
      const elements = await this.enhancedElementScan(page);
      
      console.log(`📍 Found ${elements.length} elements`);
      console.log(`   ✅ Visible: ${elements.filter(e => e.isVisible).length}`);
      console.log(`   ⚠️  Hidden: ${elements.filter(e => !e.isVisible).length}`);
      
      // Generate perfect SBS file
      await this.generateEnhancedSBSFile(pageName, elements, currentUrl);
      
      await browser.close();
      
      console.log(`
✅ ENHANCED CAPTURE COMPLETE!
=============================
📄 Generated: ${pageName}.js
📁 Location: SBS_Automation/pages/
📍 Elements captured: ${elements.length}

🎯 IMPROVEMENTS:
- Better form element detection
- Hidden elements clearly marked
- Clean locator format
- Priority for interactive elements
`);

    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  async enhancedElementScan(page) {
    return await page.evaluate(() => {
      const elements = [];
      
      // Priority selectors - form elements and interactive elements first
      const prioritySelectors = [
        // Form elements (highest priority)
        'input[type="text"]',
        'input[type="email"]', 
        'input[type="password"]',
        'input[type="search"]',
        'input[type="tel"]',
        'input[type="url"]',
        'input[type="number"]',
        'input[type="checkbox"]',
        'input[type="radio"]',
        'input[type="submit"]',
        'input[type="button"]',
        'textarea',
        'select',
        
        // Interactive elements
        'button',
        'a[href]',
        'a[role="button"]',
        '[role="button"]',
        '[role="link"]',
        '[role="menuitem"]',
        '[onclick]',
        
        // Data attributes (most reliable)
        '[data-test-id]',
        '[data-e2e]',
        '[data-id]',
        
        // Common UI patterns
        '.btn',
        '[class*="button"]',
        '[class*="btn"]',
        '[class*="link"]',
        
        // Content elements
        'h1, h2, h3, h4, h5, h6',
        'label',
        '[aria-label]'
      ];

      // Enhanced visibility checking
      const checkVisibility = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        
        // Must have real dimensions
        if (rect.width === 0 || rect.height === 0) return false;
        
        // Must not be explicitly hidden
        if (style.display === 'none') return false;
        if (style.visibility === 'hidden') return false;
        if (style.opacity === '0') return false;
        
        // Must be reasonably positioned (not way off screen)
        if (rect.top < -100 || rect.left < -100) return false;
        if (rect.top > window.innerHeight + 100) return false;
        
        return true;
      };

      // Smart element identification
      const identifyElement = (element) => {
        const attributes = {
          dataTestId: element.getAttribute('data-test-id'),
          dataE2e: element.getAttribute('data-e2e'),
          dataId: element.getAttribute('data-id'),
          id: element.id,
          name: element.getAttribute('name'),
          ariaLabel: element.getAttribute('aria-label'),
          placeholder: element.getAttribute('placeholder'),
          title: element.getAttribute('title'),
          type: element.getAttribute('type'),
          role: element.getAttribute('role'),
          className: element.className,
          value: element.value
        };
        
        // Clean text content
        const text = element.textContent?.trim().replace(/\s+/g, ' ') || '';
        
        // Generate meaningful identifier with priority
        let identifier = '';
        
        // Priority 1: Test attributes
        if (attributes.dataTestId) {
          identifier = attributes.dataTestId;
        } else if (attributes.dataE2e) {
          identifier = attributes.dataE2e;
        } else if (attributes.dataId) {
          identifier = attributes.dataId;
        }
        // Priority 2: Form attributes
        else if (attributes.name && attributes.name.length > 0) {
          identifier = attributes.name;
        } else if (attributes.id && attributes.id.length > 0) {
          identifier = attributes.id;
        }
        // Priority 3: Accessibility
        else if (attributes.ariaLabel && attributes.ariaLabel.length > 0) {
          identifier = attributes.ariaLabel;
        } else if (attributes.placeholder && attributes.placeholder.length > 0) {
          identifier = attributes.placeholder;
        }
        // Priority 4: Text content (for buttons, links, labels)
        else if (text && text.length > 0 && text.length <= 100) {
          // Clean text for identifier
          identifier = text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        }
        // Priority 5: Type-based
        else if (attributes.type) {
          identifier = `${attributes.type}_${element.tagName.toLowerCase()}`;
        }
        // Priority 6: Generic
        else {
          identifier = `${element.tagName.toLowerCase()}_element`;
        }
        
        return {
          identifier: identifier,
          attributes: attributes,
          text: text,
          tagName: element.tagName.toLowerCase()
        };
      };

      // Generate multiple locator strategies
      const generateLocators = (element, info) => {
        const selectors = [];
        const attr = info.attributes;
        
        // Primary strategies (data attributes)
        if (attr.dataTestId) selectors.push(`[data-test-id="${attr.dataTestId}"]`);
        if (attr.dataE2e) selectors.push(`[data-e2e="${attr.dataE2e}"]`);
        if (attr.dataId) selectors.push(`[data-id="${attr.dataId}"]`);
        
        // Secondary strategies (reliable attributes)
        if (attr.id) selectors.push(`#${attr.id}`);
        if (attr.name) selectors.push(`[name="${attr.name}"]`);
        if (attr.ariaLabel) selectors.push(`[aria-label="${attr.ariaLabel}"]`);
        
        // Fallback strategies
        if (attr.placeholder) selectors.push(`[placeholder="${attr.placeholder}"]`);
        if (attr.type && info.tagName === 'input') {
          selectors.push(`input[type="${attr.type}"]`);
        }
        
        // Text-based for buttons and links
        if (info.text && info.text.length > 0 && info.text.length <= 50) {
          if (info.tagName === 'button') {
            selectors.push(`button:has-text("${info.text}")`);
          } else if (info.tagName === 'a') {
            selectors.push(`a:has-text("${info.text}")`);
          }
        }
        
        // Generic fallback
        if (selectors.length === 0) {
          selectors.push(info.tagName);
        }
        
        return selectors;
      };

      // Scan all priority selectors
      prioritySelectors.forEach(selector => {
        try {
          const foundElements = document.querySelectorAll(selector);
          foundElements.forEach((el) => {
            const info = identifyElement(el);
            const isVisible = checkVisibility(el);
            const locators = generateLocators(el, info);
            
            elements.push({
              identifier: info.identifier,
              locators: locators,
              tagName: info.tagName,
              elementType: info.attributes.type || 'element',
              text: info.text,
              isVisible: isVisible,
              isHidden: !isVisible,
              priority: isVisible ? 1 : 2 // Visible elements get priority 1
            });
          });
        } catch (e) {
          // Skip invalid selectors
        }
      });

      // Remove duplicates based on identifier
      const unique = [];
      const seen = new Set();
      
      elements.forEach(el => {
        const key = `${el.identifier}_${el.tagName}`;
        if (!seen.has(key) && el.identifier && el.identifier.length > 0) {
          seen.add(key);
          unique.push(el);
        }
      });

      // Sort: visible elements first, then by tag importance
      return unique.sort((a, b) => {
        // Visible first
        if (a.priority !== b.priority) return a.priority - b.priority;
        
        // Form elements first within each group
        const formElements = ['input', 'textarea', 'select', 'button'];
        const aIsForm = formElements.includes(a.tagName);
        const bIsForm = formElements.includes(b.tagName);
        
        if (aIsForm && !bIsForm) return -1;
        if (!aIsForm && bIsForm) return 1;
        
        return 0;
      });
    });
  }

  async generateEnhancedSBSFile(pageName, elements, pageUrl) {
    const className = this.toClassName(pageName);
    const fileName = this.toFileName(pageName);
    
    // Separate visible and hidden elements
    const visibleElements = elements.filter(e => e.isVisible);
    const hiddenElements = elements.filter(e => !e.isVisible);
    
    // Generate constants for visible elements
    const visibleConstants = visibleElements.map(el => {
      const constantName = this.toConstantName(el.identifier);
      const locators = el.locators.slice(0, 3); // Use top 3 strategies
      
      if (locators.length > 1) {
        return `const ${constantName} = By.css('${locators.join(', ')}'); // ${el.identifier}`;
      } else {
        return `const ${constantName} = By.css('${locators[0]}'); // ${el.identifier}`;
      }
    }).join('\n');
    
    // Generate constants for hidden elements (commented out)
    const hiddenConstants = hiddenElements.length > 0 ? `
// ====== HIDDEN ELEMENTS (not visible in UI) ======
${hiddenElements.map(el => {
  const constantName = this.toConstantName(el.identifier);
  const locators = el.locators.slice(0, 2);
  return `// const ${constantName} = By.css('${locators.join(', ')}'); // HIDDEN: ${el.identifier}`;
}).join('\n')}` : '';

    // Generate methods for visible elements only
    const methods = visibleElements.map(el => {
      const constantName = this.toConstantName(el.identifier);
      const methodBase = this.toMethodName(el.identifier);
      
      return `
  // ${el.identifier} (${el.tagName}${el.elementType !== 'element' ? ` - ${el.elementType}` : ''})
  async click${methodBase}() {
    await this.clickElement(${constantName});
  }

  async verify${methodBase}IsVisible() {
    const isVisible = await this.isVisible(${constantName});
    if (!isVisible) {
      throw new Error('${el.identifier} is not visible');
    }
    return true;
  }

  async waitFor${methodBase}() {
    await this.waitForElement(${constantName});
  }`;
    }).join('\n');

    // Enhanced SBS template
    const fileContent = `const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

/**
 * 🚀 ENHANCED AUTO-GENERATED PAGE CLASS
 * 
 * Generated from: ${pageUrl}
 * Generated on: ${new Date().toLocaleString()}
 * Visible elements: ${visibleElements.length}
 * Hidden elements: ${hiddenElements.length}
 * 
 * Features:
 * ✅ Form elements properly detected
 * ✅ Hidden elements excluded from methods
 * ✅ Clean consolidated locators
 * ✅ Priority for interactive elements
 */

// ====== VISIBLE ELEMENT LOCATORS ======
${visibleConstants}
${hiddenConstants}

class ${className} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  // ====== PAGE METHODS (VISIBLE ELEMENTS ONLY) ======
${methods}

  // ====== UTILITY METHODS ======
  async verifyPageLoaded() {
    // Verify page is loaded by checking key elements
    ${visibleElements.length > 0 ? `await this.waitFor${this.toMethodName(visibleElements[0].identifier)}();` : 'await this.waitForElement(By.css("body"));'}
    return true;
  }

  async getAllVisibleElements() {
    // Return status of all visible elements
    const statuses = {};
    ${visibleElements.map(el => {
      const constantName = this.toConstantName(el.identifier);
      return `    try { statuses['${el.identifier}'] = await this.isVisible(${constantName}); } catch (e) { statuses['${el.identifier}'] = false; }`;
    }).join('\n')}
    return statuses;
  }
}

module.exports = ${className};`;

    // Save to correct location
    const filePath = path.join(this.SBS_PAGES_PATH, `${fileName}.js`);
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    console.log(`✅ Enhanced SBS file generated: ${filePath}`);
  }

  // Utility methods for name conversion
  toClassName(name) {
    return name.toLowerCase()
      .split(/[\s\-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';
  }

  toFileName(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s\-_]/g, '')
      .split(/[\s\-_]+/)
      .join('-');
  }

  toConstantName(text) {
    return text.toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .join('_')
      .substring(0, 40);
  }

  toMethodName(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
      .substring(0, 30);
  }
}

// ====== CLI EXECUTION ======
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 ENHANCED INSTANT PAGE CAPTURE

USAGE:
  node enhanced-capture.js "Page Name" [options]

EXAMPLES:
  node enhanced-capture.js "Login Page"
  node enhanced-capture.js "Admin Dashboard" --timeout 30

OPTIONS:
  --interactive    Wait for user to press ENTER (default)
  --timeout <sec>  Auto-scan after X seconds
  --help          Show this help

🎯 IMPROVEMENTS:
  ✅ Better form element detection (inputs, checkboxes, etc.)
  ✅ Improved visibility checking (no hidden elements in methods)
  ✅ Clean locator format (no extra text)
  ✅ Clear comments for hidden elements
  ✅ Priority for interactive elements

🚀 Perfect for capturing login pages, forms, and interactive UIs!
`);
    process.exit(1);
  }
  
  const pageName = args[0];
  const hasTimeout = args.includes('--timeout');
  const timeoutValue = hasTimeout ? parseInt(args[args.indexOf('--timeout') + 1]) || 15 : null;
  const isInteractive = args.includes('--interactive') || !hasTimeout;
  
  const capture = new EnhancedInstantCapture();
  capture.mode = isInteractive ? 'interactive' : 'timeout';
  capture.timeoutSeconds = timeoutValue;
  
  try {
    await capture.capturePageInstantly(pageName);
    
    console.log(`
🎉 SUCCESS! Your enhanced page is ready to use:

1. Import: const ${capture.toClassName(pageName)} = require('./pages/${capture.toFileName(pageName)}');
2. Use: const page = new ${capture.toClassName(pageName)}(playwright_page);
3. Test: await page.verifyPageLoaded();

All form elements and interactive elements properly captured! 🚀
`);
    
  } catch (error) {
    console.error('❌ Capture failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = EnhancedInstantCapture;
