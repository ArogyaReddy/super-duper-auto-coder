#!/usr/bin/env node

/**
 * 🚀 ONE-COMMAND ADVANCED LOCATOR SOLUTION
 * 
 * Perfect for single URL apps with Shadow DOM, iFrames, and Modals
 */

const AdvancedLocatorCapture = require('./advanced-locator-capture');
const fs = require('fs').promises;
const path = require('path');

class OneCommandAdvanced {
  constructor() {
    this.capture = new AdvancedLocatorCapture();
  }

  /**
   * 🎯 MAIN COMMAND - DOES EVERYTHING
   * 
   * Usage: node one-command-advanced.js <configFile>
   */
  async execute(configFile) {
    console.log(`
🚀 ONE-COMMAND ADVANCED LOCATOR SOLUTION
========================================
📄 Config: ${configFile}
`);

    try {
      // Load configuration
      const config = JSON.parse(await fs.readFile(configFile, 'utf8'));
      
      console.log(`🌐 App URL: ${config.baseUrl}`);
      console.log(`📄 Target Page: ${config.pageFileName}`);
      console.log(`🧭 Navigation Steps: ${config.navigationSteps.length}`);
      
      // Execute capture with navigation
      const capturedElements = await this.capture.captureWithNavigation(
        config.baseUrl,
        config.credentials,
        config.navigationSteps,
        config.elementsToCapture
      );
      
      console.log(`📍 Captured ${Object.keys(capturedElements).length} elements`);
      
      // Generate SBS page file
      await this.capture.generateSBSPageFile(
        config.pageFileName,
        capturedElements,
        config.navigationInfo
      );
      
      // Generate summary report
      const report = this.generateReport(capturedElements, config);
      
      const reportFile = config.pageFileName.replace('.js', '-capture-report.json');
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
      
      console.log(`
🎉 CAPTURE COMPLETE!
====================
📄 Generated: ${config.pageFileName}
📊 Report: ${reportFile}

📊 SUMMARY:
✅ Shadow DOM Elements: ${report.summary.shadowElements}
📋 iFrame Elements: ${report.summary.iframeElements}  
🗂️ Modal Elements: ${report.summary.modalElements}
🎯 Direct Elements: ${report.summary.directElements}
❌ Failed Elements: ${report.summary.failedElements}

💡 RECOMMENDATIONS:
${report.recommendations.map(r => `   ${r}`).join('\n')}
`);
      
      return report;
      
    } catch (error) {
      console.error(`❌ Execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 📊 GENERATE COMPREHENSIVE REPORT
   */
  generateReport(capturedElements, config) {
    const summary = {
      shadowElements: 0,
      iframeElements: 0,
      modalElements: 0,
      directElements: 0,
      failedElements: 0
    };
    
    const details = {};
    const recommendations = [];
    
    for (const [name, info] of Object.entries(capturedElements)) {
      details[name] = info;
      
      if (info.type === 'shadow-depth-1' || info.type === 'shadow-depth-2') {
        summary.shadowElements++;
      } else if (info.type === 'iframe') {
        summary.iframeElements++;
      } else if (info.type === 'modal') {
        summary.modalElements++;
      } else if (info.type === 'direct') {
        summary.directElements++;
      } else if (info.type === 'fallback') {
        summary.failedElements++;
      }
    }
    
    // Generate recommendations
    if (summary.shadowElements > 0) {
      recommendations.push(`🌑 ${summary.shadowElements} Shadow DOM elements captured - excellent!`);
    }
    
    if (summary.failedElements > 0) {
      recommendations.push(`❌ ${summary.failedElements} elements failed - need manual inspection`);
    }
    
    if (summary.directElements === Object.keys(capturedElements).length) {
      recommendations.push(`🎉 All elements captured directly - very stable!`);
    }
    
    const successRate = Math.round(((Object.keys(capturedElements).length - summary.failedElements) / Object.keys(capturedElements).length) * 100);
    
    if (successRate >= 80) {
      recommendations.push(`🚀 ${successRate}% success rate - ready for deployment!`);
    } else {
      recommendations.push(`⚠️ ${successRate}% success rate - needs improvement`);
    }
    
    return {
      summary,
      details,
      recommendations,
      config: {
        baseUrl: config.baseUrl,
        pageFileName: config.pageFileName,
        captureDate: new Date().toISOString()
      }
    };
  }
}

/**
 * 🚀 CLI EXECUTION
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
🚀 ONE-COMMAND ADVANCED LOCATOR SOLUTION

USAGE:
  node one-command-advanced.js <config.json>

EXAMPLE:
  node one-command-advanced.js cfc-promo-config.json

CONFIG FILE FORMAT:
{
  "baseUrl": "https://your-app.com",
  "credentials": {
    "username": "test@example.com",
    "password": "password"
  },
  "pageFileName": "cfc-promo-page.js",
  "navigationSteps": [
    {
      "type": "click",
      "description": "Click Billings menu",
      "selector": "[data-id='billing']",
      "context": {
        "shadow": true,
        "shadowHost": "sfc-shell-left-nav",
        "shadowDepth": 1
      }
    },
    {
      "type": "modal",
      "description": "Wait for CFC modal",
      "modalSelector": "[role='dialog']"
    }
  ],
  "elementsToCapture": [
    { "description": "CFC promotional header" },
    { "description": "Learn more button" },
    { "description": "New badge" }
  ]
}

FEATURES:
  ✅ Handles Shadow DOM (depth 1, 2, 3+)
  📋 Captures iframe elements
  🗂️ Works with modals and overlays
  🧭 Simulates navigation in single URL apps
  🎯 Generates SBS-compliant page files
  📊 Provides detailed capture reports
`);
    process.exit(1);
  }
  
  const configFile = args[0];
  
  const oneCommand = new OneCommandAdvanced();
  await oneCommand.execute(configFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = OneCommandAdvanced;
