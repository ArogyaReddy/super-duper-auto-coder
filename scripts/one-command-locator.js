#!/usr/bin/env node

/**
 * 🚀 ONE-COMMAND LOCATOR SOLUTION
 * 
 * The simplest way to capture, validate, and update locators
 */

const AutoLocatorManager = require('./locator-manager');
const LocatorValidator = require('./locator-validator');
const fs = require('fs').promises;
const path = require('path');

class OneCommandLocator {
  constructor() {
    this.manager = new AutoLocatorManager();
    this.validator = new LocatorValidator();
  }

  /**
   * 🎯 ONE COMMAND TO RULE THEM ALL
   * 
   * Usage: node one-command-locator.js <pageUrl> <pageFile> [elements.json]
   */
  async executeOneCommand(pageUrl, pageFile, elementsFile = null) {
    console.log(`
🚀 ONE-COMMAND LOCATOR SOLUTION
================================
🌐 Page URL: ${pageUrl}
📄 Page File: ${pageFile}
📝 Elements: ${elementsFile || 'Auto-detect from existing file'}
`);

    try {
      // STEP 1: Validate existing locators (if file exists)
      const pageFilePath = path.join(this.manager.AUTO_CODER_PAGES_PATH, pageFile);
      
      if (await this.fileExists(pageFilePath)) {
        console.log('🩺 STEP 1: Validating existing locators...');
        
        const validationResults = await this.validator.validatePageLocators(pageFilePath, pageUrl);
        const healthReport = await this.validator.generateHealthReport(validationResults);
        
        console.log(`📊 Health Score: ${healthReport.summary.healthScore}%`);
        console.log(`✅ Working: ${healthReport.summary.working}`);
        console.log(`❌ Broken: ${healthReport.summary.broken}`);
        
        // If health score is below 80%, auto-heal
        if (healthReport.summary.healthScore < 80) {
          console.log('🔧 STEP 2: Auto-healing broken locators...');
          
          const brokenLocators = Object.keys(healthReport.details)
            .filter(name => !healthReport.details[name].isValid);
          
          const healedLocators = await this.validator.healBrokenLocators(pageFilePath, pageUrl, brokenLocators);
          
          // Update the page file with healed locators
          await this.manager.updatePageLocators(pageFile, healedLocators);
          
          console.log(`✨ Healed ${Object.keys(healedLocators).length} locators`);
        }
        
      } else {
        // STEP 1: Capture new locators
        console.log('🔍 STEP 1: Capturing new locators...');
        
        if (!elementsFile) {
          throw new Error('Elements file required for new page capture');
        }
        
        const elements = JSON.parse(await fs.readFile(elementsFile, 'utf8'));
        const capturedLocators = await this.manager.captureLocators(pageUrl, elements);
        
        console.log(`📍 Captured ${Object.keys(capturedLocators).length} locators`);
        
        // Save captured locators
        const locatorsFile = pageFile.replace('.js', '-locators.json');
        await fs.writeFile(
          path.join(this.manager.AUTO_CODER_PAGES_PATH, locatorsFile), 
          JSON.stringify(capturedLocators, null, 2)
        );
        
        console.log(`💾 Saved locators to: ${locatorsFile}`);
      }
      
      // STEP 3: Final validation
      console.log('✅ STEP 3: Final validation...');
      
      const finalResults = await this.validator.validatePageLocators(pageFilePath, pageUrl);
      const finalReport = await this.validator.generateHealthReport(finalResults);
      
      console.log(`
🎉 FINAL RESULTS:
=================
📊 Health Score: ${finalReport.summary.healthScore}%
✅ Working Locators: ${finalReport.summary.working}
❌ Broken Locators: ${finalReport.summary.broken}

💡 Recommendations:
${finalReport.recommendations.map(r => `   ${r}`).join('\n')}
`);
      
      return finalReport;
      
    } catch (error) {
      console.error(`❌ One-command execution failed: ${error.message}`);
      throw error;
    }
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
 * 🚀 CLI EXECUTION
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
🚀 ONE-COMMAND LOCATOR SOLUTION

USAGE:
  node one-command-locator.js <pageUrl> <pageFile> [elements.json]

EXAMPLES:
  # Validate & heal existing page
  node one-command-locator.js "https://app.example.com/billing" "req-cfc-promo-page.js"
  
  # Capture new page locators  
  node one-command-locator.js "https://app.example.com/billing" "new-page.js" "elements.json"

FEATURES:
  ✅ Auto-validates existing locators
  🔧 Auto-heals broken locators  
  📍 Captures new locators intelligently
  📊 Provides health reports
  🚀 One command does everything!
`);
    process.exit(1);
  }
  
  const [pageUrl, pageFile, elementsFile] = args;
  
  const oneCommand = new OneCommandLocator();
  await oneCommand.executeOneCommand(pageUrl, pageFile, elementsFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = OneCommandLocator;
