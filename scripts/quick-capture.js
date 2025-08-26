#!/usr/bin/env node

/**
 * 🎯 ONE-CLICK PAGE CAPTURE
 * 
 * SIMPLEST USAGE:
 * 1. Login and navigate to your page manually
 * 2. Run: node quick-capture.js
 * 3. Done! Perfect page file generated.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function captureCurrentPage() {
  console.log(`
🎯 ONE-CLICK PAGE CAPTURE
=========================
⏳ Connecting to your browser...
`);

  // Connect to existing browser (if you have one open)
  let browser;
  let page;
  
  try {
    // Try to connect to existing browser first
    browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    page = contexts[0].pages()[0];
    console.log('✅ Connected to existing browser session');
  } catch {
    // Launch new browser if connection fails
    browser = await chromium.launch({ 
      headless: false,
      args: ['--remote-debugging-port=9222']
    });
    page = await browser.newPage();
    console.log('🚀 Launched new browser - please navigate to your page and run again');
    await browser.close();
    return;
  }

  try {
    // Get current page info
    const currentUrl = page.url();
    const title = await page.title();
    
    console.log(`
📍 SCANNING CURRENT PAGE:
URL: ${currentUrl}
Title: ${title}
`);

    // Auto-generate page name from URL
    const pageName = generatePageName(currentUrl);
    
    console.log(`🔍 Scanning all elements on: ${pageName}`);
    
    // Quick scan for all interactive elements
    const elements = await quickScanElements(page);
    
    console.log(`📍 Found ${elements.length} interactive elements`);
    
    // Generate SBS page file
    await generateQuickPageFile(pageName, elements, currentUrl);
    
    console.log(`
✅ CAPTURE COMPLETE!
====================
📄 Generated: ${pageName}.js
📍 Elements: ${elements.length}
🚀 Ready to use in your tests!

📁 Location: SBS_Automation/pages/${pageName}.js
`);

  } catch (error) {
    console.error('❌ Error during capture:', error.message);
  } finally {
    // Don't close browser - user might want to continue
    // await browser.close();
  }
}

async function quickScanElements(page) {
  return await page.evaluate(() => {
    const elements = [];
    
    // Quick selectors for common interactive elements
    const selectors = [
      'button:visible',
      'a[href]:visible', 
      'input:visible',
      'select:visible',
      '[data-test-id]:visible',
      '[data-e2e]:visible',
      '[data-id]:visible',
      '[role="button"]:visible',
      '[onclick]:visible',
      '.btn:visible',
      '[class*="button"]:visible'
    ];

    // Function to get best identifier
    const getBestId = (el) => {
      return el.getAttribute('data-test-id') ||
             el.getAttribute('data-e2e') ||
             el.getAttribute('data-id') ||
             el.id ||
             el.getAttribute('aria-label') ||
             el.textContent?.trim().substring(0, 30) ||
             `${el.tagName.toLowerCase()}-element`;
    };

    // Function to get best selector
    const getBestSelector = (el) => {
      const dataTestId = el.getAttribute('data-test-id');
      if (dataTestId) return `[data-test-id="${dataTestId}"]`;
      
      const dataE2e = el.getAttribute('data-e2e');
      if (dataE2e) return `[data-e2e="${dataE2e}"]`;
      
      const dataId = el.getAttribute('data-id');
      if (dataId) return `[data-id="${dataId}"]`;
      
      if (el.id) return `#${el.id}`;
      
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) return `[aria-label="${ariaLabel}"]`;
      
      // For buttons/links with text
      const text = el.textContent?.trim();
      if (text && text.length > 0 && text.length < 50) {
        if (el.tagName === 'BUTTON') return `button:has-text("${text}")`;
        if (el.tagName === 'A') return `a:has-text("${text}")`;
      }
      
      return el.tagName.toLowerCase();
    };

    // Scan all interactive elements
    selectors.forEach(selector => {
      try {
        const foundElements = document.querySelectorAll(selector);
        foundElements.forEach(el => {
          // Check if visible
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return;
          
          elements.push({
            id: getBestId(el),
            selector: getBestSelector(el),
            tagName: el.tagName.toLowerCase(),
            type: el.type || 'element'
          });
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });

    // Remove duplicates
    const unique = [];
    const seen = new Set();
    
    elements.forEach(el => {
      const key = el.selector + el.id;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(el);
      }
    });

    return unique;
  });
}

async function generateQuickPageFile(pageName, elements, pageUrl) {
  const className = generateClassName(pageName);
  
  // Generate constants
  const constants = elements.map(el => {
    const constantName = generateConstantName(el.id);
    return `const ${constantName} = By.css('${el.selector}'); // ${el.id}`;
  }).join('\n');

  // Generate methods
  const methods = elements.map(el => {
    const constantName = generateConstantName(el.id);
    const methodName = generateMethodName(el.id);
    
    return `
  async click${methodName}() {
    // Click: ${el.id}
    await this.clickElement(${constantName});
  }

  async verify${methodName}IsVisible() {
    // Verify: ${el.id}
    const isVisible = await this.isVisible(${constantName});
    if (!isVisible) {
      throw new Error('${el.id} is not visible');
    }
  }`;
  }).join('\n');

  const pageContent = `const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

// 🎯 AUTO-GENERATED PAGE FILE
// Generated from: ${pageUrl}
// Date: ${new Date().toISOString()}
// Elements found: ${elements.length}

${constants}

class ${className} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
${methods}
}

module.exports = ${className};`;

  // Save to SBS_Automation/pages directory
  const pagesDir = '/Users/gadea/auto/auto/qa_automation/SBS_Automation/pages';
  const filePath = path.join(pagesDir, `${pageName}.js`);
  
  await fs.writeFile(filePath, pageContent, 'utf8');
  
  console.log(`✅ Generated: ${filePath}`);
}

function generatePageName(url) {
  // Extract meaningful page name from URL
  const urlObj = new URL(url);
  let pageName = urlObj.pathname
    .split('/')
    .filter(segment => segment && segment !== '')
    .pop() || 'home';
  
  // Clean up the name
  pageName = pageName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return pageName || 'captured-page';
}

function generateClassName(pageName) {
  return pageName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Page';
}

function generateConstantName(id) {
  return id
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map(word => word.toUpperCase())
    .join('_')
    .substring(0, 40);
}

function generateMethodName(id) {
  return id
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((word, index) => 
      index === 0 ? word.toLowerCase() : 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('')
    .substring(0, 30);
}

// Run if called directly
if (require.main === module) {
  captureCurrentPage().catch(console.error);
}

module.exports = { captureCurrentPage };
