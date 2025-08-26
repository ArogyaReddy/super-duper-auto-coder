#!/usr/bin/env node

/**
 * 🚀 LOCATOR CAPTURE & UPDATE UTILITY
 * 
 * The simplest, most powerful locator management system for SBS_Automation
 * 
 * FEATURES:
 * - Intelligent element capture using multiple strategies
 * - Automatic fallback generation
 * - Smart locator updates in deployed artifacts
 * - SBS pattern compliance
 */

const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

class AutoLocatorManager {
  constructor() {
    this.SBS_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/SBS_Automation/pages';
    this.AUTO_CODER_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation/pages';
    
    // 🎯 SMART LOCATOR STRATEGIES (Ordered by reliability)
    this.LOCATOR_STRATEGIES = [
      'data-test-id',
      'data-e2e', 
      'data-testid',
      'data-cy',
      'id',
      'name',
      'aria-label',
      'role',
      'class',
      'tag+text',
      'xpath-text'
    ];
  }

  /**
   * 🔍 CAPTURE ELEMENT LOCATORS FROM LIVE PAGE
   * 
   * @param {string} pageUrl - The page URL to analyze
   * @param {Array} elementDescriptions - Array of element descriptions
   * @returns {Object} Generated locators
   */
  async captureLocators(pageUrl, elementDescriptions) {
    console.log('🔍 Starting intelligent locator capture...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle' });
      
      const capturedLocators = {};
      
      for (const description of elementDescriptions) {
        console.log(`📍 Capturing: ${description}`);
        
        const locator = await this.generateSmartLocator(page, description);
        capturedLocators[this.generateConstantName(description)] = locator;
      }
      
      await browser.close();
      return capturedLocators;
      
    } catch (error) {
      await browser.close();
      throw new Error(`Locator capture failed: ${error.message}`);
    }
  }

  /**
   * 🧠 GENERATE SMART LOCATOR WITH FALLBACKS
   * 
   * Uses AI-like intelligence to find the best locator strategy
   */
  async generateSmartLocator(page, elementDescription) {
    console.log(`🧠 Analyzing element: "${elementDescription}"`);
    
    // Try to find element by various strategies
    const strategies = await this.analyzeElementStrategies(page, elementDescription);
    
    if (strategies.length === 0) {
      throw new Error(`Could not find element: ${elementDescription}`);
    }
    
    // Generate SBS-compliant fallback selector
    return this.buildSBSCompliantSelector(strategies);
  }

  /**
   * 🔬 ANALYZE ELEMENT WITH MULTIPLE STRATEGIES
   */
  async analyzeElementStrategies(page, description) {
    const strategies = [];
    
    // Strategy 1: data-test-id (preferred)
    const dataTestId = await page.locator(`[data-test-id*="${this.kebabCase(description)}"]`).first();
    if (await dataTestId.count() > 0) {
      const attr = await dataTestId.getAttribute('data-test-id');
      strategies.push(`[data-test-id="${attr}"]`);
    }
    
    // Strategy 2: data-e2e 
    const dataE2e = await page.locator(`[data-e2e*="${this.kebabCase(description)}"]`).first();
    if (await dataE2e.count() > 0) {
      const attr = await dataE2e.getAttribute('data-e2e');
      strategies.push(`[data-e2e="${attr}"]`);
    }
    
    // Strategy 3: ID
    const byId = await page.locator(`[id*="${this.kebabCase(description)}"]`).first();
    if (await byId.count() > 0) {
      const id = await byId.getAttribute('id');
      strategies.push(`#${id}`);
    }
    
    // Strategy 4: Text-based (buttons, links)
    const textElements = await page.locator(`:text("${description}")`);
    if (await textElements.count() > 0) {
      const element = textElements.first();
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      
      if (['button', 'a', 'span', 'div'].includes(tagName)) {
        strategies.push(`//button[text()="${description}"] | //a[text()="${description}"] | //*[@role="button"][text()="${description}"]`);
      }
    }
    
    // Strategy 5: Class-based partial matching
    const classMatch = await page.locator(`[class*="${this.kebabCase(description)}"]`).first();
    if (await classMatch.count() > 0) {
      strategies.push(`[class*="${this.kebabCase(description)}"]`);
    }
    
    return strategies;
  }

  /**
   * 🏗️ BUILD SBS-COMPLIANT SELECTOR
   */
  buildSBSCompliantSelector(strategies) {
    if (strategies.length === 1) {
      return strategies[0];
    }
    
    // Create fallback selector in SBS style
    const cssStrategies = strategies.filter(s => !s.startsWith('//'));
    const xpathStrategies = strategies.filter(s => s.startsWith('//'));
    
    if (cssStrategies.length > 0 && xpathStrategies.length === 0) {
      return cssStrategies.join(', ');
    }
    
    if (xpathStrategies.length > 0 && cssStrategies.length === 0) {
      return xpathStrategies.join(' | ');
    }
    
    // Mixed: Use CSS with xpath comment
    return cssStrategies.join(', ') + ' /* XPath fallback: ' + xpathStrategies.join(' | ') + ' */';
  }

  /**
   * 🔄 UPDATE LOCATORS IN DEPLOYED PAGE FILES
   * 
   * @param {string} pageFileName - The page file to update
   * @param {Object} newLocators - The new locators to apply
   */
  async updatePageLocators(pageFileName, newLocators) {
    console.log(`🔄 Updating locators in: ${pageFileName}`);
    
    const autoCoderFilePath = path.join(this.AUTO_CODER_PAGES_PATH, pageFileName);
    const sbsFilePath = path.join(this.SBS_PAGES_PATH, 'auto-coder', pageFileName);
    
    // Update both auto-coder and main SBS files
    await this.updateFileLocators(autoCoderFilePath, newLocators);
    
    if (await this.fileExists(sbsFilePath)) {
      await this.updateFileLocators(sbsFilePath, newLocators);
    }
  }

  /**
   * ✏️ UPDATE LOCATORS IN SPECIFIC FILE
   */
  async updateFileLocators(filePath, newLocators) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      let updatedContent = content;
      
      for (const [constantName, newLocator] of Object.entries(newLocators)) {
        // Find and replace the locator constant
        const pattern = new RegExp(`const ${constantName} = By\\.(css|xpath|id)\\([^)]+\\);`, 'g');
        
        const replacement = this.formatLocatorDeclaration(constantName, newLocator);
        updatedContent = updatedContent.replace(pattern, replacement);
      }
      
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to update ${filePath}: ${error.message}`);
    }
  }

  /**
   * 📝 FORMAT LOCATOR DECLARATION
   */
  formatLocatorDeclaration(constantName, locator) {
    if (locator.startsWith('//')) {
      return `const ${constantName} = By.xpath('${locator}');`;
    } else if (locator.startsWith('#')) {
      return `const ${constantName} = By.id('${locator.substring(1)}');`;
    } else {
      return `const ${constantName} = By.css('${locator}');`;
    }
  }

  /**
   * 🛠️ UTILITY METHODS
   */
  generateConstantName(description) {
    return description
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map((word, index) => 
        index === 0 ? word.toUpperCase() : 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('_');
  }

  kebabCase(str) {
    return str
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 🚀 CLI INTERFACE
 */
async function main() {
  const manager = new AutoLocatorManager();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'capture') {
    const pageUrl = args[1];
    const elementsFile = args[2];
    
    if (!pageUrl || !elementsFile) {
      console.log('Usage: node locator-manager.js capture <pageUrl> <elementsFile>');
      process.exit(1);
    }
    
    const elements = JSON.parse(await fs.readFile(elementsFile, 'utf8'));
    const locators = await manager.captureLocators(pageUrl, elements);
    
    console.log('🎯 Captured Locators:');
    console.log(JSON.stringify(locators, null, 2));
    
  } else if (command === 'update') {
    const pageFile = args[1];
    const locatorsFile = args[2];
    
    if (!pageFile || !locatorsFile) {
      console.log('Usage: node locator-manager.js update <pageFile> <locatorsFile>');
      process.exit(1);
    }
    
    const locators = JSON.parse(await fs.readFile(locatorsFile, 'utf8'));
    await manager.updatePageLocators(pageFile, locators);
    
  } else {
    console.log(`
🚀 AUTO-LOCATOR MANAGER

COMMANDS:
  capture <pageUrl> <elementsFile>  - Capture locators from live page
  update <pageFile> <locatorsFile>  - Update locators in page files

EXAMPLES:
  node locator-manager.js capture "https://app.example.com/billing" elements.json
  node locator-manager.js update "req-cfc-promo-page.js" locators.json
    `);
  }
}

module.exports = AutoLocatorManager;

if (require.main === module) {
  main().catch(console.error);
}
