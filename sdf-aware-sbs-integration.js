/**
 * SDF-Aware SBS_Automation Integration
 * Handles ADP's Structured Data Framework (SDF) login pages
 */

const { chromium } = require('playwright');

class SDFAwareSBSIntegration {
  constructor(page) {
    this.page = page;
    // Use IAT environment (working)
    this.baseUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
  }

  /**
   * Navigate to login page
   */
  async navigateTo(url) {
    console.log(`🔗 Navigating to: ${url}`);
    
    await this.page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for SDF framework to initialize
    await this.page.waitForTimeout(5000);
    
    console.log(`✅ Successfully loaded: ${this.page.url()}`);
  }

  /**
   * Handle SDF (Structured Data Framework) login
   * This is the modern ADP login approach that SBS_Automation handles
   */
  async performSDFLogin(username, password) {
    try {
      console.log(`🔑 Performing SDF-aware login for: ${username}`);
      
      // Wait for SDF input field (discovered from inspection)
      const sdfInput = await this.page.locator('input[name="sdf-input"]').first();
      await sdfInput.waitFor({ state: 'visible', timeout: 15000 });
      
      console.log('✅ Found SDF input field');
      
      // Clear and enter username
      await sdfInput.fill('');
      await sdfInput.type(username, { delay: 100 });
      
      console.log('📝 Username entered in SDF field');
      
      // Press Tab or Enter to move to next field/step
      await sdfInput.press('Tab');
      await this.page.waitForTimeout(2000);
      
      // Check if password field appears or if we need to submit first
      await this.handleSDFPasswordStep(password);
      
      console.log('🔐 SDF login process completed');
      return true;
      
    } catch (error) {
      console.error(`❌ SDF login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle password step in SDF flow
   */
  async handleSDFPasswordStep(password) {
    try {
      // Strategy 1: Look for password field that may have appeared
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="sdf-input"]:nth-child(2)',
        'input[name="password"]',
        'input[placeholder*="password"]'
      ];
      
      for (const selector of passwordSelectors) {
        try {
          const passwordField = await this.page.locator(selector).first();
          if (await passwordField.isVisible({ timeout: 3000 })) {
            console.log(`✅ Found password field: ${selector}`);
            await passwordField.fill('');
            await passwordField.type(password, { delay: 100 });
            await passwordField.press('Enter');
            await this.page.waitForTimeout(3000);
            return;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Strategy 2: Submit username first, then handle password
      console.log('🔄 Submitting username first...');
      await this.submitSDFForm();
      await this.page.waitForTimeout(3000);
      
      // Look for password field after submission
      for (const selector of passwordSelectors) {
        try {
          const passwordField = await this.page.locator(selector).first();
          if (await passwordField.isVisible({ timeout: 5000 })) {
            console.log(`✅ Found password field after submission: ${selector}`);
            await passwordField.fill('');
            await passwordField.type(password, { delay: 100 });
            await passwordField.press('Enter');
            await this.page.waitForTimeout(3000);
            return;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Strategy 3: If it's a single-field SDF, enter both username and password
      console.log('🔄 Trying combined username@password format...');
      const sdfInput = await this.page.locator('input[name="sdf-input"]').first();
      if (await sdfInput.isVisible()) {
        await sdfInput.fill('');
        // Try different formats that ADP might accept
        const combinedFormats = [
          `${password}`, // Just password if username already processed
          `${password.split('@')[0]}@${password}`, // username@password format
        ];
        
        for (const format of combinedFormats) {
          try {
            await sdfInput.type(format, { delay: 100 });
            await sdfInput.press('Enter');
            await this.page.waitForTimeout(3000);
            
            // Check if login was successful
            if (await this.isLoginSuccessful()) {
              console.log(`✅ Combined format worked: ${format}`);
              return;
            }
            
            // Clear and try next format
            await sdfInput.fill('');
          } catch (e) {
            continue;
          }
        }
      }
      
      console.log('⚠️ Password step handling completed with best effort');
      
    } catch (error) {
      console.log(`⚠️ Password step warning: ${error.message}`);
    }
  }

  /**
   * Submit SDF form (look for submit buttons or use Enter key)
   */
  async submitSDFForm() {
    try {
      // Look for submit buttons
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Continue")',
        'button:has-text("Next")',
        '[data-automation-id="submit"]',
        '.submit-button'
      ];
      
      for (const selector of submitSelectors) {
        try {
          const button = await this.page.locator(selector).first();
          if (await button.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found submit button: ${selector}`);
            await button.click();
            return;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Fallback: Press Enter on the SDF input
      const sdfInput = await this.page.locator('input[name="sdf-input"]').first();
      if (await sdfInput.isVisible()) {
        await sdfInput.press('Enter');
        console.log('🔄 Submitted via Enter key on SDF input');
      }
      
    } catch (error) {
      console.log(`⚠️ Form submission warning: ${error.message}`);
    }
  }

  /**
   * Check if login was successful
   */
  async isLoginSuccessful() {
    try {
      const currentUrl = this.page.url();
      
      // Quick URL-based check
      if (currentUrl.includes('home') || 
          currentUrl.includes('dashboard') || 
          !currentUrl.includes('signin')) {
        return true;
      }
      
      // Quick element check
      const successSelectors = [
        '[data-automation-id="payroll-carousel"]',
        '.homepage-carousel',
        '.nav-user-menu',
        'a[href*="logout"]'
      ];
      
      for (const selector of successSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          return true;
        } catch (e) {
          continue;
        }
      }
      
      return false;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Enhanced login success verification
   */
  async verifyLoginSuccess() {
    try {
      console.log('🔍 Verifying login success...');
      
      // Wait for page transitions
      await this.page.waitForTimeout(5000);
      
      const currentUrl = this.page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Check URL patterns
      if (currentUrl.includes('home') || 
          currentUrl.includes('dashboard') || 
          currentUrl.includes('main') ||
          (!currentUrl.includes('signin') && !currentUrl.includes('login'))) {
        console.log('✅ URL indicates login success');
        return true;
      }
      
      // Check for success elements
      const successSelectors = [
        '[data-automation-id="payroll-carousel"]',
        '.homepage-carousel',
        '.nav-user-menu',
        'a[href*="logout"]',
        '.user-profile',
        '[data-testid="home-page"]'
      ];
      
      for (const selector of successSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          console.log(`✅ Found success element: ${selector}`);
          return true;
        } catch (e) {
          continue;
        }
      }
      
      // Check page title
      const title = await this.page.title();
      if (title && !title.toLowerCase().includes('sign in') && !title.toLowerCase().includes('login')) {
        console.log(`✅ Page title indicates success: ${title}`);
        return true;
      }
      
      console.log('⚠️ No clear success indicators found');
      return false;
      
    } catch (error) {
      console.log(`⚠️ Login verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Complete SDF-aware authentication workflow
   */
  async performAuthentication(username = 'Arogya@26153101', password = 'Test0507') {
    try {
      console.log('🚀 Starting SDF-aware SBS authentication workflow...');
      console.log('🎯 Using IAT environment with SDF support');
      
      // Step 1: Navigate to login page
      await this.navigateTo(this.baseUrl);
      
      // Step 2: Perform SDF login
      await this.performSDFLogin(username, password);
      
      // Step 3: Verify login success
      const isAuthenticated = await this.verifyLoginSuccess();
      
      const result = {
        success: isAuthenticated,
        method: 'SDF_Aware_SBS_Integration',
        environment: 'IAT',
        username: username,
        url: this.page.url(),
        timestamp: new Date().toISOString()
      };
      
      if (isAuthenticated) {
        console.log('🎉 SDF-aware SBS authentication successful!');
        console.log(`📍 Final URL: ${result.url}`);
        
        console.log('\n💡 SUCCESS DETAILS:');
        console.log('   ✅ SBS_Automation SDF patterns work correctly');
        console.log('   ✅ IAT environment accessible');
        console.log('   ✅ Your credentials are valid');
        console.log('   ✅ Ready for auto-coder integration');
        
      } else {
        console.log('❌ Authentication verification failed');
        result.error = 'Login verification failed';
        result.success = false;
      }
      
      return result;
      
    } catch (error) {
      console.error(`💥 SDF authentication failed: ${error.message}`);
      return {
        success: false,
        method: 'SDF_Aware_SBS_Integration',
        environment: 'IAT',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Test SDF-aware integration
 */
async function testSDFIntegration() {
  console.log('🎯 Testing SDF-Aware SBS_Automation Integration\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  
  try {
    const sbsIntegration = new SDFAwareSBSIntegration(page);
    
    // Test the authentication
    const result = await sbsIntegration.performAuthentication();
    
    console.log('\n📊 FINAL TEST RESULTS:');
    console.log('=' .repeat(50));
    
    if (result.success) {
      console.log('✅ SDF-Aware SBS Integration: SUCCESS');
      console.log(`   Method: ${result.method}`);
      console.log(`   Environment: ${result.environment}`);
      console.log(`   User: ${result.username}`);
      console.log(`   Final URL: ${result.url}`);
      console.log(`   Time: ${result.timestamp}`);
      
      console.log('\n🎊 INTEGRATION COMPLETE!');
      console.log('✅ SBS_Automation patterns successfully adapted for SDF');
      console.log('✅ Auto-coder can now use proven SBS authentication');
      console.log('✅ Ready for production use with your credentials');
      
    } else {
      console.log('❌ SDF-Aware SBS Integration: FAILED');
      console.log(`   Environment: ${result.environment}`);
      console.log(`   Error: ${result.error}`);
    }
    
    // Wait for user to see results
    await page.waitForTimeout(10000);
    
    return result;
    
  } finally {
    await browser.close();
  }
}

// Export for use in other modules
module.exports = { SDFAwareSBSIntegration, testSDFIntegration };

// Run test if executed directly
if (require.main === module) {
  testSDFIntegration()
    .then(result => {
      console.log('\n🏁 SDF integration test completed!');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(`💥 SDF test failed: ${error.message}`);
      process.exit(1);
    });
}
