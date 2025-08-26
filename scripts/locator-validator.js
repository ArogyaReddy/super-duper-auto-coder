#!/usr/bin/env node

/**
 * 🔍 SMART LOCATOR VALIDATOR
 * 
 * Validates and heals broken locators in SBS_Automation framework
 */

const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

class LocatorValidator {
  constructor() {
    this.SBS_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/SBS_Automation/pages';
    this.AUTO_CODER_PAGES_PATH = '/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation/pages';
  }

  /**
   * 🩺 HEALTH CHECK ALL LOCATORS IN PAGE FILE
   */
  async validatePageLocators(pageFilePath, testUrl) {
    console.log(`🩺 Health checking: ${path.basename(pageFilePath)}`);
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto(testUrl, { waitUntil: 'networkidle' });
      
      const content = await fs.readFile(pageFilePath, 'utf8');
      const locators = this.extractLocatorsFromFile(content);
      
      const results = {};
      
      for (const [name, selector] of Object.entries(locators)) {
        console.log(`🔍 Testing: ${name}`);
        
        const isValid = await this.testLocator(page, selector);
        results[name] = {
          selector,
          isValid,
          elementCount: isValid ? await this.getElementCount(page, selector) : 0
        };
        
        if (!isValid) {
          console.log(`❌ BROKEN: ${name} -> ${selector}`);
        } else {
          console.log(`✅ WORKING: ${name}`);
        }
      }
      
      await browser.close();
      return results;
      
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * 🔧 AUTO-HEAL BROKEN LOCATORS
   */
  async healBrokenLocators(pageFilePath, testUrl, brokenLocators) {
    console.log(`🔧 Healing broken locators...`);
    
    const AutoLocatorManager = require('./locator-manager');
    const manager = new AutoLocatorManager();
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto(testUrl, { waitUntil: 'networkidle' });
      
      const healedLocators = {};
      
      for (const locatorName of brokenLocators) {
        console.log(`🔧 Healing: ${locatorName}`);
        
        // Try to find element using smart strategies
        const elementDescription = this.constantToDescription(locatorName);
        const newLocator = await manager.generateSmartLocator(page, elementDescription);
        
        healedLocators[locatorName] = newLocator;
        console.log(`✨ Healed: ${locatorName} -> ${newLocator}`);
      }
      
      await browser.close();
      return healedLocators;
      
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * 📊 GENERATE LOCATOR HEALTH REPORT
   */
  async generateHealthReport(validationResults) {
    const totalLocators = Object.keys(validationResults).length;
    const workingLocators = Object.values(validationResults).filter(r => r.isValid).length;
    const brokenLocators = totalLocators - workingLocators;
    
    const report = {
      summary: {
        total: totalLocators,
        working: workingLocators,
        broken: brokenLocators,
        healthScore: Math.round((workingLocators / totalLocators) * 100)
      },
      details: validationResults,
      recommendations: this.generateRecommendations(validationResults)
    };
    
    return report;
  }

  /**
   * 🎯 UTILITY METHODS
   */
  extractLocatorsFromFile(content) {
    const locators = {};
    
    // Match By.css, By.xpath, By.id patterns
    const patterns = [
      /const\s+([A-Z_]+)\s*=\s*By\.css\(['"`]([^'"`]+)['"`]\);/g,
      /const\s+([A-Z_]+)\s*=\s*By\.xpath\(['"`]([^'"`]+)['"`]\);/g,
      /const\s+([A-Z_]+)\s*=\s*By\.id\(['"`]([^'"`]+)['"`]\);/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        locators[match[1]] = match[2];
      }
    });
    
    return locators;
  }

  async testLocator(page, selector) {
    try {
      if (selector.startsWith('//')) {
        // XPath
        const elements = await page.locator(`xpath=${selector}`);
        return await elements.count() > 0;
      } else {
        // CSS
        const elements = await page.locator(selector);
        return await elements.count() > 0;
      }
    } catch {
      return false;
    }
  }

  async getElementCount(page, selector) {
    try {
      if (selector.startsWith('//')) {
        return await page.locator(`xpath=${selector}`).count();
      } else {
        return await page.locator(selector).count();
      }
    } catch {
      return 0;
    }
  }

  constantToDescription(constantName) {
    return constantName
      .split('_')
      .map(word => word.toLowerCase())
      .join(' ')
      .replace(/button|menu|header|page|field/g, '')
      .trim();
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    const brokenCount = Object.values(results).filter(r => !r.isValid).length;
    const multipleElements = Object.values(results).filter(r => r.elementCount > 1).length;
    
    if (brokenCount > 0) {
      recommendations.push(`🔧 ${brokenCount} locators need healing`);
    }
    
    if (multipleElements > 0) {
      recommendations.push(`⚠️ ${multipleElements} locators match multiple elements - consider making them more specific`);
    }
    
    if (brokenCount === 0) {
      recommendations.push(`🎉 All locators are healthy!`);
    }
    
    return recommendations;
  }
}

module.exports = LocatorValidator;
