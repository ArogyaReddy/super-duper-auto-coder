#!/usr/bin/env node
/**
 * Auto-Coder Test Runner
 * Runs deployed artifacts in main SBS_Automation with enhanced reporting
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoCoderTestRunner {
  constructor() {
    this.mainSBSPath = '/Users/gadea/auto/auto/qa_automation/SBS_Automation';
    this.reportsPath = `${this.mainSBSPath}/reports/auto-coder`;
  }

  /**
   * Run specific feature in IAT environment
   */
  async runFeature(featureName, environment = 'iat_can', browser = 'chrome') {
    console.log(`🚀 Running feature: ${featureName} in ${environment.toUpperCase()}`);
    
    // Ensure reports directory exists
    this.ensureReportsDirectory();
    
    const featurePath = `features/auto-coder/${featureName}.feature`;
    const fullFeaturePath = `${this.mainSBSPath}/${featurePath}`;
    
    if (!fs.existsSync(fullFeaturePath)) {
      throw new Error(`❌ Feature not found: ${fullFeaturePath}`);
    }
    
    // Build command
    const command = this.buildRunCommand(featurePath, environment, browser);
    
    return new Promise((resolve, reject) => {
      const process = spawn('node', command.split(' '), {
        cwd: this.mainSBSPath,
        env: { 
          ...process.env, 
          ADP_ENV: environment,
          AUTO_CODER_RUN: 'true'
        },
        stdio: 'pipe'
      });
      
      let output = '';
      let errors = '';
      
      process.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(text);
        output += text;
      });
      
      process.stderr.on('data', (data) => {
        const text = data.toString();
        console.error(text);
        errors += text;
      });
      
      process.on('close', (code) => {
        const result = {
          exitCode: code,
          output,
          errors,
          success: code === 0,
          featureName,
          environment,
          browser,
          timestamp: new Date().toISOString()
        };
        
        this.saveTestReport(result);
        
        if (code === 0) {
          console.log(`✅ Feature ${featureName} completed successfully!`);
          resolve(result);
        } else {
          console.log(`❌ Feature ${featureName} failed with exit code ${code}`);
          reject(result);
        }
      });
    });
  }

  /**
   * Build the command to run the feature
   */
  buildRunCommand(featurePath, environment, browser) {
    return `index.js --environment ${environment} --featureFiles ${featurePath} --browser ${browser} --tagExpression "@regression"`;
  }

  /**
   * Run feature with dry-run to validate step definitions
   */
  async validateFeature(featureName, environment = 'iat_can') {
    console.log(`🔍 Validating feature: ${featureName}`);
    
    const featurePath = `features/auto-coder/${featureName}.feature`;
    
    return new Promise((resolve, reject) => {
      // Include auto-coder steps, common steps, and payroll home steps for complete validation
      const command = `npx cucumber-js ${featurePath} --dry-run --require 'steps/auto-coder/**/*.js' --require 'steps/common/login-step.js' --require 'steps/common/payroll-home-steps.js'`;
      
      exec(command, { 
        cwd: this.mainSBSPath,
        env: { 
          ...process.env, 
          ADP_ENV: environment // Set ADP_ENV for validation
        }
      }, (error, stdout, stderr) => {
        const result = {
          valid: !error,
          output: stdout,
          errors: stderr,
          featureName
        };
        
        if (error) {
          console.log(`❌ Validation failed for ${featureName}`);
          console.log(stderr);
          reject(result);
        } else {
          console.log(`✅ Feature ${featureName} is valid!`);
          resolve(result);
        }
      });
    });
  }

  /**
   * Enhanced test runner with pre-validation
   */
  async runFeatureWithValidation(featureName, environment = 'iat_can', browser = 'chrome') {
    try {
      // Step 1: Validate feature
      console.log('📋 Step 1: Validating feature...');
      await this.validateFeature(featureName, environment); // Pass environment to validation
      
      // Step 2: Run feature
      console.log('🚀 Step 2: Executing feature...');
      const result = await this.runFeature(featureName, environment, browser);
      
      return result;
    } catch (error) {
      console.error('💥 Test execution failed:', error);
      throw error;
    }
  }

  /**
   * Ensure reports directory exists
   */
  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsPath)) {
      fs.mkdirSync(this.reportsPath, { recursive: true });
    }
  }

  /**
   * Save detailed test report
   */
  saveTestReport(result) {
    const reportFile = `${this.reportsPath}/${result.featureName}-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(result, null, 2));
    
    // Also create a summary report
    this.updateSummaryReport(result);
  }

  /**
   * Update summary report with latest results
   */
  updateSummaryReport(result) {
    const summaryFile = `${this.reportsPath}/summary.json`;
    let summary = [];
    
    if (fs.existsSync(summaryFile)) {
      summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    }
    
    summary.push({
      feature: result.featureName,
      success: result.success,
      environment: result.environment,
      browser: result.browser,
      timestamp: result.timestamp,
      exitCode: result.exitCode
    });
    
    // Keep only last 50 runs
    if (summary.length > 50) {
      summary = summary.slice(-50);
    }
    
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  }

  /**
   * List all available auto-coder features
   */
  listAvailableFeatures() {
    const featuresDir = `${this.mainSBSPath}/features/auto-coder`;
    
    if (!fs.existsSync(featuresDir)) {
      console.log('📋 No auto-coder features found. Run deployment first.');
      return [];
    }
    
    const features = fs.readdirSync(featuresDir)
      .filter(f => f.endsWith('.feature'))
      .map(f => f.replace('.feature', ''));
    
    console.log('📋 Available auto-coder features:');
    features.forEach(feature => {
      console.log(`   • ${feature}`);
    });
    
    return features;
  }
}

// CLI interface
if (require.main === module) {
  const runner = new AutoCoderTestRunner();
  const command = process.argv[2];
  const featureName = process.argv[3];
  const environment = process.argv[4] || 'iat_can';
  const browser = process.argv[5] || 'chrome';
  
  if (command === 'run' && featureName) {
    runner.runFeatureWithValidation(featureName, environment, browser)
      .then(result => {
        console.log(`🎉 Test completed for ${featureName}`);
        process.exit(0);
      })
      .catch(error => {
        console.error(`💥 Test failed for ${featureName}`);
        process.exit(1);
      });
  } else if (command === 'validate' && featureName) {
    const environment = process.argv[4] || 'iat_can'; // Add environment parameter for validation
    runner.validateFeature(featureName, environment)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (command === 'list') {
    runner.listAvailableFeatures();
  } else {
    console.log(`
🚀 Auto-Coder Test Runner

Usage:
  node run-tests.js run <feature-name> [environment] [browser]    # Run feature with validation
  node run-tests.js validate <feature-name> [environment]        # Validate feature only
  node run-tests.js list                                         # List available features

Examples:
  node run-tests.js run billing-invoices iat_can chrome
  node run-tests.js validate billing-invoices iat_can
  node run-tests.js list

Environments: iat_can, fit, dev
Browsers: chrome, firefox, edge
    `);
  }
}

module.exports = AutoCoderTestRunner;
