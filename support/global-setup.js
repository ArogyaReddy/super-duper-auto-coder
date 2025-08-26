/**
 * Enhanced Global Setup for Auto-Coder Framework
 * This runs once before all tests start and sets up the enhanced reporting structure
 * Includes SBS_Automation configuration integration and authentication setup
 */

const fs = require('fs-extra');
const path = require('path');
const { chromium } = require('playwright');

// Import configuration loader
const ConfigLoader = require('./config-loader.js');

async function globalSetup() {
  console.log('🚀 Auto-Coder Global Setup - Initializing test environment...');
  
  // Load configuration with SBS_Automation integration
  const configLoader = new ConfigLoader();
  const config = configLoader.getConfig();
  
  try {
    // Create enhanced report directory structure
    const reportDirs = [
      'SBS_Automation/reports',
      'SBS_Automation/reports/playwright-report',
      'SBS_Automation/reports/artifacts',
      'SBS_Automation/reports/custom',
      'SBS_Automation/reports/screenshots',
      'SBS_Automation/reports/videos',
      'SBS_Automation/reports/traces'
    ];

    for (const dir of reportDirs) {
      const fullPath = path.join(__dirname, '..', dir);
      await fs.ensureDir(fullPath);
      console.log(`📁 Created directory: ${dir}`);
    }
    
    // Also ensure legacy test-results directory exists for compatibility
    const legacyDirs = [
      'test-results',
      'test-results/screenshots', 
      'test-results/videos',
      'test-results/traces'
    ];
    
    for (const dir of legacyDirs) {
      const fullPath = path.join(__dirname, '..', dir);
      await fs.ensureDir(fullPath);
    }
    
    // Set up environment variables for enhanced testing with SBS_Automation integration
    process.env.TEST_START_TIME = new Date().toISOString();
    process.env.AUTO_CODER_VERSION = '1.0.0';
    process.env.REPORT_ENHANCED = 'true';
    process.env.PW_TEST_HTML_REPORT_OPEN = 'never';  // Don't auto-open HTML reports
    process.env.AUTO_CODER_BASE_URL = configLoader.getBaseUrl();
    process.env.AUTO_CODER_ENVIRONMENT = config.environment;
    
    console.log('🌍 Environment variables configured for enhanced reporting');
    console.log(`🎯 Target Environment: ${config.environment}`);
    console.log(`🌐 Base URL: ${configLoader.getBaseUrl()}`);
    
    // Handle authentication setup if enabled
    const authConfig = configLoader.getAuthConfig();
    if (authConfig.enabled) {
      console.log('🔐 Authentication enabled - Setting up ADP login session...');
      
      try {
        // Launch browser for authentication setup
        const browser = await chromium.launch({ 
          headless: configLoader.isHeadless() 
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Navigate to ADP login page
        const loginUrl = configLoader.getBaseUrl();
        console.log(`🔑 Attempting to reach ADP login at: ${loginUrl}`);
        
        await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 60000 });
        
        // Save authentication state template for ADP
        const authFile = path.join(__dirname, '..', 'SBS_Automation/auth-state.json');
        
        // ADP-specific auth state template
        const authState = {
          baseUrl: configLoader.getBaseUrl(),
          loginUrl: loginUrl,
          username: authConfig.username || 'Arogya@24890183',
          environment: config.environment || 'iat',
          loginSetup: true,
          timestamp: new Date().toISOString(),
          platform: 'ADP',
          appId: 'RUN',
          productId: '7bf1242e-2ff0-e324-e053-37004b0bc98c'
        };
        
        await fs.writeJson(authFile, authState);
        console.log('✅ ADP authentication state template saved');
        
        // Take screenshot of login page for reference
        const screenshotPath = path.join(__dirname, '..', 'SBS_Automation/reports/screenshots/adp-login-page.png');
        await fs.ensureDir(path.dirname(screenshotPath));
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 ADP login page screenshot saved: ${screenshotPath}`);
        
        await browser.close();
        
      } catch (authError) {
        console.warn('⚠️  Authentication setup issue:', authError.message);
        console.log('📝 Tests will attempt authentication during execution');
        
        // Create fallback auth state
        const authFile = path.join(__dirname, '..', 'SBS_Automation/auth-state.json');
        const fallbackAuthState = {
          baseUrl: configLoader.getBaseUrl(),
          username: authConfig.username || 'Arogya@24890183',
          environment: config.environment || 'iat',
          loginSetup: false,
          setupError: authError.message,
          timestamp: new Date().toISOString(),
          platform: 'ADP'
        };
        
        await fs.writeJson(authFile, fallbackAuthState);
      }
    } else {
      console.log('🔓 Authentication disabled - tests will run without login');
    }
    
    // Create a test execution log
    const logPath = path.join(__dirname, '../SBS_Automation/reports/test-execution.log');
    await fs.writeFile(logPath, `Auto-Coder Test Execution Started: ${new Date().toISOString()}\n`);
    
    console.log('📝 Test execution log initialized');
    
    console.log('✅ Enhanced Global Setup completed successfully');
    console.log('💡 Note: Tests are expected to fail initially due to placeholder locators');
    console.log('   This is normal behavior and indicates real tests were generated');
    
  } catch (error) {
    console.error('❌ Error during global setup:', error);
    throw error;
  }
}

module.exports = globalSetup;
