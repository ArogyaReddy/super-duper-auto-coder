#!/usr/bin/env node

// 🚨 PATH VALIDATION UTILITY - Prevents saving to wrong directories
// Usage: Validate file paths before generation

const path = require('path');

class PathValidator {
  static validateGenerationPaths(featurePath, stepsPath, pagePath) {
    const errors = [];
    
    // Check feature file path
    if (!this.isValidAutoCoderPath(featurePath, 'features')) {
      errors.push(`🚨 INVALID FEATURE PATH: ${featurePath}`);
      errors.push(`✅ SHOULD BE: auto-coder/SBS_Automation/features/`);
    }
    
    // Check steps file path
    if (!this.isValidAutoCoderPath(stepsPath, 'steps')) {
      errors.push(`🚨 INVALID STEPS PATH: ${stepsPath}`);
      errors.push(`✅ SHOULD BE: auto-coder/SBS_Automation/steps/`);
    }
    
    // Check page file path
    if (!this.isValidAutoCoderPath(pagePath, 'pages')) {
      errors.push(`🚨 INVALID PAGE PATH: ${pagePath}`);
      errors.push(`✅ SHOULD BE: auto-coder/SBS_Automation/pages/`);
    }
    
    if (errors.length > 0) {
      console.error('\n🚨 CRITICAL PATH VALIDATION ERRORS:');
      errors.forEach(error => console.error(error));
      console.error('\n❌ GENERATION BLOCKED - Fix paths before proceeding\n');
      return false;
    }
    
    console.log('✅ All paths validated - generation can proceed');
    return true;
  }
  
  static isValidAutoCoderPath(filePath, expectedFolder) {
    // Must contain auto-coder/SBS_Automation/
    if (!filePath.includes('/auto-coder/SBS_Automation/')) {
      return false;
    }
    
    // Must NOT contain main SBS_Automation without auto-coder prefix
    if (filePath.includes('/SBS_Automation/') && !filePath.includes('/auto-coder/SBS_Automation/')) {
      return false;
    }
    
    // Must contain the expected folder
    if (!filePath.includes(`/auto-coder/SBS_Automation/${expectedFolder}/`)) {
      return false;
    }
    
    return true;
  }
  
  static getCorrectPaths(baseName) {
    const baseDir = path.resolve(__dirname, '..');
    return {
      feature: path.join(baseDir, 'SBS_Automation', 'features', `${baseName}.feature`),
      steps: path.join(baseDir, 'SBS_Automation', 'steps', `${baseName}-steps.js`),
      page: path.join(baseDir, 'SBS_Automation', 'pages', `${baseName}-page.js`)
    };
  }
}

module.exports = PathValidator;

// Example usage validation
if (require.main === module) {
  console.log('🔍 Path Validator - Testing Examples');
  
  // Test correct paths
  const correctPaths = PathValidator.getCorrectPaths('example');
  console.log('\n✅ Testing CORRECT paths:');
  PathValidator.validateGenerationPaths(
    correctPaths.feature,
    correctPaths.steps,
    correctPaths.page
  );
  
  // Test wrong paths
  console.log('\n❌ Testing WRONG paths:');
  PathValidator.validateGenerationPaths(
    '/Users/gadea/auto/auto/qa_automation/SBS_Automation/features/auto-coder/example.feature',
    '/Users/gadea/auto/auto/qa_automation/SBS_Automation/steps/auto-coder/example-steps.js',
    '/Users/gadea/auto/auto/qa_automation/SBS_Automation/pages/auto-coder/example-page.js'
  );
}
