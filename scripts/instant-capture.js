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
 * ✅ Modal detection and focus
 * ✅ Proper quote escaping
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class InstantCapture {
  constructor() {
    this.SBS_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/SBS_Automation/pages/auto-coder';
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
      slowMo: 100,
      args: [
        '--start-maximized',
        '--window-size=1920,1080',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-first-run',
        '--disable-default-apps'
      ]
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      screen: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Ensure full screen dimensions are applied
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    try {
      // Interactive prompt for navigation
      if (this.mode === 'interactive') {
        console.log('🌐 Browser window opened in FULL SCREEN mode! Please:');
        console.log('   📏 Viewport: 1920x1080 (Full HD)');
        console.log('   1. Navigate to your application');
        console.log('   2. Login if needed');
        console.log('   3. Go to the page you want to capture');
        console.log('');
        console.log('⏳ When you are ready, press ENTER to start scanning...');
        
        await this.waitForUserReady();
      } else {
        console.log(`🌐 Browser window opened in FULL SCREEN mode! Please navigate to your page.`);
        console.log(`📏 Viewport: 1920x1080 (Full HD)`);
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
      
      // Generate perfect SBS file with error handling
      try {
        await this.generateEnhancedSBSFile(pageName, elements, currentUrl);
        console.log(`✅ Page file generated successfully!`);
      } catch (error) {
        console.error(`❌ Failed to generate page file: ${error.message}`);
        console.error(`📁 Target directory: ${this.SBS_PAGES_PATH}`);
        throw error;
      }
      
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
      
      // Priority selectors - ALL ELEMENTS including text, headers, badges
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
        
        // Headers and text content (CRITICAL - must capture)
        'h1, h2, h3, h4, h5, h6',
        'p',
        'span',
        'div[class*="title"]',
        'div[class*="header"]',
        'div[class*="heading"]',
        'div[class*="text"]',
        'div[class*="content"]',
        'div[class*="description"]',
        'div[class*="summary"]',
        'div[class*="subtitle"]',
        'div[class*="caption"]',
        
        // Badges, labels, indicators
        'div[class*="badge"]',
        'span[class*="badge"]',
        'div[class*="label"]',
        'span[class*="label"]',
        'div[class*="tag"]',
        'span[class*="tag"]',
        'div[class*="indicator"]',
        'div[class*="status"]',
        'div[class*="new"]',
        '[class*="badge"]',
        '[class*="label"]',
        '[class*="tag"]',
        
        // Common UI patterns
        '.btn',
        '[class*="button"]',
        '[class*="btn"]',
        '[class*="link"]',
        
        // Content elements
        'label',
        '[aria-label]',
        
        // Structural elements that might contain text
        'div',
        'section',
        'article',
        'main',
        'header',
        'footer',
        'nav'
      ];

      // Enhanced visibility checking (improved for small links and Shadow DOM elements)
      const checkVisibility = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        
        // Must not be explicitly hidden
        if (style.display === 'none') return false;
        if (style.visibility === 'hidden') return false;
        
        // Allow small elements (links can be tiny)
        if (rect.width === 0 && rect.height === 0) return false;
        
        // More lenient opacity check (allow fade-in elements)
        if (style.opacity === '0' && element.textContent.trim() === '') return false;
        
        // More lenient positioning (allow elements slightly off-screen)
        if (rect.top < -500 || rect.left < -500) return false;
        if (rect.top > window.innerHeight + 500) return false;
        
        // Special case for links and buttons - they're often small but important
        const tagName = element.tagName.toLowerCase();
        const isInteractive = ['a', 'button', 'input'].includes(tagName) || 
                             element.getAttribute('role') === 'button' ||
                             element.getAttribute('role') === 'link';
        
        if (isInteractive && rect.width > 0 && rect.height > 0) {
          return true; // Interactive elements with any size are considered visible
        }
        
        return rect.width > 1 && rect.height > 1; // Non-interactive elements need reasonable size
      };

      // Smart element identification (Enhanced for ALL content types)
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
        
        // Clean text content (enhanced for headers and text)
        const text = element.textContent?.trim().replace(/\s+/g, ' ') || '';
        const directText = Array.from(element.childNodes)
          .filter(node => node.nodeType === 3) // Text nodes only
          .map(node => node.textContent.trim())
          .join(' ')
          .replace(/\s+/g, ' ');
        
        // Determine element category for better identification
        const tagName = element.tagName.toLowerCase();
        const isHeader = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
        const isTextElement = ['p', 'span', 'div'].includes(tagName) && text.length > 0;
        const isBadge = element.className && (
          element.className.includes('badge') || 
          element.className.includes('label') || 
          element.className.includes('tag') ||
          element.className.includes('new')
        );
        
        // Generate meaningful identifier with enhanced priority
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
        // Priority 4: Headers and significant text content
        else if (isHeader && text && text.length > 0) {
          identifier = `header_${text.replace(/[^a-zA-Z0-9\s&]/g, '').trim().toLowerCase().replace(/\s+/g, '_')}`;
        } else if (isBadge && text && text.length > 0) {
          identifier = `badge_${text.replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase().replace(/\s+/g, '_')}`;
        } else if (isTextElement && text && text.length > 0 && text.length <= 200) {
          // For text elements, create meaningful identifiers
          const cleanText = text.replace(/[^a-zA-Z0-9\s&]/g, '').trim();
          if (cleanText.length <= 50) {
            identifier = `text_${cleanText.toLowerCase().replace(/\s+/g, '_')}`;
          } else {
            // For longer text, use first few words
            const words = cleanText.split(' ').slice(0, 5).join('_').toLowerCase();
            identifier = `text_${words}`;
          }
        }
        // Priority 5: Interactive elements text content
        else if (text && text.length > 0 && text.length <= 100) {
          identifier = text.replace(/[^a-zA-Z0-9\s&]/g, '').trim();
        }
        // Priority 6: Type-based
        else if (attributes.type) {
          identifier = `${attributes.type}_${tagName}`;
        }
        // Priority 7: Generic with context
        else {
          if (isHeader) {
            identifier = `${tagName}_header`;
          } else if (isBadge) {
            identifier = `badge_element`;
          } else if (isTextElement) {
            identifier = `text_content`;
          } else {
            identifier = `${tagName}_element`;
          }
        }
        
        return {
          identifier: identifier,
          attributes: attributes,
          text: text,
          directText: directText,
          tagName: tagName,
          isHeader: isHeader,
          isTextElement: isTextElement,
          isBadge: isBadge
        };
      };

      // Generate PRIMARY/SECONDARY/FALLBACK locator strategies (SBS Enhanced Format)
      const generateMultiStrategyLocators = (element, info) => {
        const strategies = {
          primary: [],
          secondary: [],
          fallback: []
        };
        const attr = info.attributes;
        
        // Utility to escape quotes properly
        const escapeForCSS = (value) => value.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const escapeForXPath = (value) => value.replace(/'/g, "\\'");
        
        // PRIMARY STRATEGIES (Most reliable - CSS preferred, XPath when needed)
        if (attr.dataTestId) {
          strategies.primary.push(`[data-test-id="${escapeForCSS(attr.dataTestId)}"]`);
          if (info.tagName) {
            strategies.primary.push(`${info.tagName}[@data-test-id='${escapeForXPath(attr.dataTestId)}']`);
          }
        }
        
        if (attr.dataE2e) {
          strategies.primary.push(`[data-e2e="${escapeForCSS(attr.dataE2e)}"]`);
        }
        
        if (attr.id) {
          strategies.primary.push(`#${attr.id}`);
          strategies.primary.push(`//*[@id='${escapeForXPath(attr.id)}']`);
        }
        
        // SECONDARY STRATEGIES (Reliable fallbacks)
        if (attr.name) {
          strategies.secondary.push(`[name="${escapeForCSS(attr.name)}"]`);
          strategies.secondary.push(`//*[@name='${escapeForXPath(attr.name)}']`);
        }
        
        if (attr.ariaLabel) {
          strategies.secondary.push(`[aria-label="${escapeForCSS(attr.ariaLabel)}"]`);
          strategies.secondary.push(`//*[@aria-label='${escapeForXPath(attr.ariaLabel)}']`);
        }
        
        if (attr.className && attr.className.length > 0) {
          // Use first meaningful class
          const meaningfulClass = attr.className.split(' ').find(cls => 
            cls.length > 3 && !cls.match(/^(btn|ui|js|css)/));
          if (meaningfulClass) {
            strategies.secondary.push(`.${meaningfulClass}`);
          }
        }
        
        // FALLBACK STRATEGIES (Last resort)
        if (info.text && info.text.length > 0 && info.text.length <= 50) {
          const escapedText = escapeForXPath(info.text);
          if (info.tagName === 'button') {
            strategies.fallback.push(`button:has-text("${escapeForCSS(info.text)}")`);
            strategies.fallback.push(`//button[normalize-space()='${escapedText}']`);
          } else if (info.tagName === 'a') {
            strategies.fallback.push(`a:has-text("${escapeForCSS(info.text)}")`);
            strategies.fallback.push(`//a[normalize-space()='${escapedText}']`);
          }
        }
        
        if (attr.type && info.tagName === 'input') {
          strategies.fallback.push(`input[type="${escapeForCSS(attr.type)}"]`);
        }
        
        if (attr.placeholder) {
          strategies.fallback.push(`[placeholder="${escapeForCSS(attr.placeholder)}"]`);
        }
        
        // Ensure we have at least a basic fallback
        if (strategies.primary.length === 0 && strategies.secondary.length === 0 && strategies.fallback.length === 0) {
          strategies.fallback.push(info.tagName);
        }
        
        return strategies;
      };

      // Utility function to escape quotes in attribute values
      const escapeQuotes = (value) => {
        if (!value) return value;
        return value.replace(/'/g, "\\'").replace(/"/g, '\\"');
      };

      // Enhanced element scanning with Shadow DOM support and Modal focus
      const scanElementsWithShadowDOM = (rootElement, selector) => {
        const elements = [];
        
        // First check if there's an active modal - prioritize modal content
        const modals = rootElement.querySelectorAll('[role="dialog"], .modal, [data-test-id*="modal"], [aria-modal="true"]');
        let scanRoot = rootElement;
        
        if (modals.length > 0) {
          // Focus on the first visible modal instead of the entire page
          const visibleModal = Array.from(modals).find(modal => {
            const rect = modal.getBoundingClientRect();
            const style = getComputedStyle(modal);
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          });
          
          if (visibleModal) {
            console.log('🎯 Modal detected! Focusing scan on modal content only...');
            scanRoot = visibleModal; // Only scan within the modal
          }
        }
        
        // Scan regular DOM
        try {
          const foundElements = scanRoot.querySelectorAll(selector);
          foundElements.forEach(el => elements.push(el));
        } catch (e) {
          // Skip invalid selectors
        }
        
        // Scan Shadow DOM roots (only if not already focused on modal)
        if (scanRoot === rootElement) {
          const allElements = scanRoot.querySelectorAll('*');
          allElements.forEach(el => {
            if (el.shadowRoot) {
              // Recursively scan shadow root
              const shadowElements = scanElementsWithShadowDOM(el.shadowRoot, selector);
              elements.push(...shadowElements);
            }
          });
        }
        
        return elements;
      };

      // Scan all priority selectors with Shadow DOM support
      prioritySelectors.forEach(selector => {
        try {
          const foundElements = scanElementsWithShadowDOM(document, selector);
          foundElements.forEach((el) => {
            const info = identifyElement(el);
            const isVisible = checkVisibility(el);
            const locatorStrategies = generateMultiStrategyLocators(el, info);
            
            elements.push({
              identifier: info.identifier,
              strategies: locatorStrategies, // Store all three strategy levels
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
    
    // Generate constants for visible elements with PRIMARY/SECONDARY/FALLBACK strategies
    const visibleConstants = visibleElements.map(el => {
      const constantName = this.toConstantName(el.identifier);
      const strategies = el.strategies;
      
      // Combine all strategies with comments
      const allLocators = [
        ...strategies.primary,
        ...strategies.secondary,
        ...strategies.fallback
      ].slice(0, 4); // Limit to top 4 strategies
      
      // Separate CSS and XPath locators
      const cssLocators = allLocators.filter(loc => !loc.startsWith('//') && !loc.startsWith('//*'));
      const xpathLocators = allLocators.filter(loc => loc.startsWith('//') || loc.startsWith('//*'));
      
      // Generate primary locator (prefer CSS, fallback to XPath)
      let primaryLocator;
      if (cssLocators.length > 0) {
        primaryLocator = `const ${constantName} = By.css(\`${cssLocators.join(', ')}\`);`;
      } else if (xpathLocators.length > 0) {
        primaryLocator = `const ${constantName} = By.xpath(\`${xpathLocators[0]}\`);`;
      } else {
        primaryLocator = `const ${constantName} = By.css(\`${el.tagName}\`);`;
      }
      
      // NO STRATEGY COMMENTS - Clean output as requested
      return primaryLocator;
    }).join('\n'); // NO EMPTY LINES between constants
    
    // Generate constants for hidden elements (commented out) with strategies
    const hiddenConstants = hiddenElements.length > 0 ? `
// ====== HIDDEN ELEMENTS (not visible in UI) ======
${hiddenElements.map(el => {
  const constantName = this.toConstantName(el.identifier);
  const strategies = el.strategies;
  const primaryStrategy = [...strategies.primary, ...strategies.secondary, ...strategies.fallback][0] || el.tagName;
  
  if (primaryStrategy.startsWith('//') || primaryStrategy.startsWith('//*')) {
    return `// const ${constantName} = By.xpath(\`${primaryStrategy}\`); // HIDDEN: ${el.identifier}`;
  } else {
    return `// const ${constantName} = By.css(\`${primaryStrategy}\`); // HIDDEN: ${el.identifier}`;
  }
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
      throw new Error('${el.identifier.replace(/'/g, "\\'")} is not visible');
    }
    return true;
  }

  async waitFor${methodBase}() {
    await this.waitForElement(${constantName});
  }`;
    }).join('\n');

    // Enhanced SBS template with multi-strategy locators and correct references
    const fileContent = `const By = require('./../../../support/By.js');
const BasePage = require('./../../../common/base-page');

/**
 * 🚀 SBS_Automation ENHANCED PAGE CLASS
 * 
 * Generated from: ${pageUrl}
 * Generated on: ${new Date().toLocaleString()}
 * Visible elements: ${visibleElements.length}
 * Hidden elements: ${hiddenElements.length}
 */

// ====== ELEMENT LOCATORS (Multi-Strategy Enhanced) ======
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

    // Save to correct location with directory creation
    const filePath = path.join(this.SBS_PAGES_PATH, `${fileName}.js`);
    const targetDir = path.dirname(filePath);
    
    // Ensure directory exists before writing file
    console.log(`📁 Target directory: ${targetDir}`);
    try {
      await fs.mkdir(targetDir, { recursive: true });
      console.log(`✅ Directory ready`);
    } catch (dirError) {
      console.error(`❌ Failed to create directory: ${dirError.message}`);
      throw new Error(`Cannot create target directory: ${targetDir}`);
    }
    
    console.log(`📝 Writing file: ${filePath}`);
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
    // Handle camelCase and special cases properly
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase: txtPassword -> txt Password
      .replace(/[^a-z0-9\s]/g, ' ') // Replace special chars with spaces
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map((word, index) => {
        // First word lowercase, rest capitalize
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('')
      .substring(0, 40); // Increase length limit for longer names
  }
}

// ====== CLI EXECUTION ======
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 INSTANT PAGE CAPTURE (ENHANCED)

USAGE:
  node instant-capture.js "Page Name" [options]

EXAMPLES:
  node instant-capture.js "Login Page"
  node instant-capture.js "Admin Dashboard" --timeout 30

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
  
  const capture = new InstantCapture();
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

module.exports = InstantCapture;
