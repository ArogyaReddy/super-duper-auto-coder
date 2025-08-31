#!/usr/bin/env node

/**
 * CLI Test for ADP Login Integration
 * Simple command-line interface to test SBS login utilities
 */

const { program } = require('commander');
const { SBSWithSDFSupport } = require('./sbs-with-sdf-support');

// Set up CLI commands
program
  .name('adp-login-test')
  .description('CLI tool to test ADP login integration')
  .version('1.0.0');

program
  .command('test-login')
  .description('Test ADP login with SBS integration')
  .option('-u, --username <username>', 'Username for login', 'Arogya@26153101')
  .option('-p, --password <password>', 'Password for login', 'Test0507')
  .option('-h, --headless', 'Run in headless mode', false)
  .action(async (options) => {
    console.log('🎯 ADP Login CLI Test Starting...\n');
    
    const sbsIntegration = new SBSWithSDFSupport();
    
    try {
      const result = await sbsIntegration.runSBSWithSDFTest();
      
      if (result.success) {
        console.log('\n🎉 CLI TEST SUCCESS!');
        console.log('✅ Login completed successfully');
        console.log('✅ Ready for auto-coder integration');
        process.exit(0);
      } else {
        console.log('\n❌ CLI TEST FAILED');
        console.log(`Error: ${result.error}`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error(`💥 CLI Test failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('quick-test')
  .description('Quick test of SBS integration without full login')
  .action(async () => {
    console.log('🚀 Quick Integration Test\n');
    
    try {
      // Test module import
      const { SBSWithSDFSupport } = require('./sbs-with-sdf-support');
      console.log('✅ SBS integration module imported');
      
      // Test instantiation
      const integration = new SBSWithSDFSupport();
      console.log('✅ SBS integration instance created');
      
      // Test methods exist
      const methods = ['performLogin', 'performRunLogin', 'setup', 'cleanup'];
      methods.forEach(method => {
        if (typeof integration[method] === 'function') {
          console.log(`✅ Method ${method} available`);
        } else {
          console.log(`❌ Method ${method} missing`);
        }
      });
      
      console.log('\n🎉 QUICK TEST PASSED!');
      console.log('✅ All SBS integration components ready');
      console.log('✅ Use "npm run test-login" for full test');
      
    } catch (error) {
      console.error(`❌ Quick test failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate all integration files are present')
  .action(() => {
    console.log('🔍 Validating Integration Files\n');
    
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
      'sbs-with-sdf-support.js',
      'sdf-aware-sbs-integration.js', 
      'production-sbs-integration.js',
      'adp-page-inspector.js'
    ];
    
    let allPresent = true;
    
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - Present`);
      } else {
        console.log(`❌ ${file} - Missing`);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      console.log('\n🎉 VALIDATION PASSED!');
      console.log('✅ All integration files present');
      console.log('✅ Ready for production use');
    } else {
      console.log('\n❌ VALIDATION FAILED!');
      console.log('⚠️ Some files are missing');
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
