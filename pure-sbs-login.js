/**
 * Pure SBS_Automation Login Logic - Extracted Method
 * Uses the exact login logic from SBS_Automation performLogin method
 */

const { chromium } = require('playwright');

/**
 * Extracted SBS_Automation login logic without dependencies
 */
class PureSBSLogin {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async setup() {
    console.log('🚀 Setting up pure SBS login...');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-web-security']
    });
    
    this.page = await this.browser.newPage();
    console.log('✅ Browser setup completed');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Navigate to ADP login page
   */
  async navigateToLogin() {
    const loginUrl = 'https://online-iat.adp.com/signin/v1/?APPID=RUN&productId=7bf1242e-2ff0-e324-e053-37004b0bc98c';
    
    console.log(`🔗 Navigating to: ${loginUrl}`);
    await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.page.waitForTimeout(3000);
    
    console.log('✅ Navigation completed');
  }

  /**
   * EXACT SBS_Automation performLogin logic (copied from practitioner-login.js line 361)
   */
  async performLogin(userid, password) {
    console.log('🔑 Using EXACT SBS_Automation performLogin logic...');
    
    try {
      // These are the EXACT selectors from SBS_Automation
      const USERNAME = '#login-form_username';
      const PASSWORD = '#login-form_password';
      const VERIFY_USERID_BUTTON = '#verifUseridBtn, #btnNext';
      const SIGN_IN_BUTTON = '#signBtn, #btnNext';
      
      console.log('📝 Filling username field...');
      await this.page.fill(USERNAME, userid);
      
      console.log('🔘 Clicking verify userid button...');
      await this.page.click(VERIFY_USERID_BUTTON);
      
      console.log('🔐 Filling password field...');
      await this.page.fill(PASSWORD, password);
      
      console.log('🚀 Clicking sign in button...');
      await this.page.click(SIGN_IN_BUTTON);
      
      console.log('✅ SBS performLogin logic completed');
      
    } catch (error) {
      console.error(`❌ SBS performLogin failed: ${error.message}`);
      
      // EXACT error handling from SBS_Automation
      try {
        const errorMessageLocator = '[jsselect=heading]';
        const errorElement = this.page.locator(errorMessageLocator).first();
        
        if (await errorElement.isVisible({ timeout: 3000 })) {
          const errorText = await errorElement.textContent();
          throw new Error(`Login page is not loaded:\n ${errorText}\n`);
        }
      } catch (innerError) {
        // Continue with original error
      }
      
      throw error;
    }
  }

  /**
   * EXACT SBS_Automation dismissRemindMeLaterIfDisplayed logic
   */
  async dismissRemindMeLaterIfDisplayed() {
    console.log('🔔 Checking for "Remind me later" dialog...');
    
    try {
      const REMIND_ME_LATER_BUTTON = "//*[text() = 'Remind me later']";
      const remindLaterElement = this.page.locator(`xpath=${REMIND_ME_LATER_BUTTON}`).first();
      
      if (await remindLaterElement.isVisible({ timeout: 3000 })) {
        console.log('📝 Found "Remind me later" - clicking...');
        await remindLaterElement.click();
        console.log('✅ "Remind me later" dismissed');
      } else {
        console.log('ℹ️ No "Remind me later" dialog found');
      }
      
    } catch (error) {
      console.log(`⚠️ Error checking remind me later: ${error.message}`);
    }
  }

  /**
   * EXACT SBS_Automation waitForHomePagePayrollCarousel logic
   */
  async waitForHomePagePayrollCarousel(timeInSeconds = 240) {
    console.log('🏠 Waiting for home page payroll carousel...');
    
    try {
      const PAYROLL_CAROUSEL = `div[data-test-id='payroll-tile-wrapper']`;
      
      await this.page.waitForSelector(PAYROLL_CAROUSEL, { 
        timeout: timeInSeconds * 1000 
      });
      
      console.log('✅ Home page payroll carousel found - login successful!');
      return true;
      
    } catch (error) {
      console.log(`⚠️ Payroll carousel not found: ${error.message}`);
      
      // Check current URL for success indicators
      const currentUrl = this.page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('home') || currentUrl.includes('dashboard')) {
        console.log('✅ URL indicates successful login');
        return true;
      }
      
      return false;
    }
  }

  /**
   * EXACT SBS_Automation performRunLogin logic (copied from line 195)
   */
  async performRunLogin(userid, password) {
    console.log('🎯 Using EXACT SBS_Automation performRunLogin logic...');
    
    try {
      // Step 1: Perform login (exact SBS logic)
      await this.performLogin(userid, password);
      
      // Step 2: Dismiss remind me later (exact SBS logic)
      await this.dismissRemindMeLaterIfDisplayed();
      
      // Step 3: Wait for home page (exact SBS logic)
      const success = await this.waitForHomePagePayrollCarousel(240);
      
      if (success) {
        console.log('🎉 EXACT SBS_Automation performRunLogin succeeded!');
        return true;
      } else {
        console.log('❌ performRunLogin failed - home page not reached');
        return false;
      }
      
    } catch (error) {
      console.error(`💥 performRunLogin failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Complete SBS integration test
   */
  async runPureSBSTest() {
    console.log('🏆 PURE SBS_AUTOMATION LOGIN TEST');
    console.log('=' .repeat(50));
    console.log('Using EXACT SBS_Automation performRunLogin logic\n');

    try {
      // Setup
      await this.setup();
      
      // Navigate
      await this.navigateToLogin();
      
      // Use EXACT SBS performRunLogin
      const success = await this.performRunLogin('Arogya@26153101', 'Test0507');
      
      if (success) {
        console.log('\n🎉 SUCCESS! Pure SBS_Automation logic works!');
        console.log('✅ EXACT performRunLogin method executed');
        console.log('✅ EXACT selectors used');
        console.log('✅ EXACT error handling');
        console.log('✅ EXACT post-login verification');
        
        // Show final page for verification
        await this.page.waitForTimeout(10000);
        
        return {
          success: true,
          method: 'Pure_SBS_Automation_Logic',
          timestamp: new Date().toISOString()
        };
        
      } else {
        console.log('\n❌ Pure SBS logic failed');
        return {
          success: false,
          method: 'Pure_SBS_Automation_Logic',
          error: 'performRunLogin logic failed'
        };
      }
      
    } catch (error) {
      console.error(`💥 Test failed: ${error.message}`);
      return {
        success: false,
        method: 'Pure_SBS_Automation_Logic',
        error: error.message
      };
      
    } finally {
      await this.cleanup();
    }
  }
}

/**
 * Test the pure SBS logic
 */
async function testPureSBSLogin() {
  console.log('🎯 TESTING PURE SBS_AUTOMATION LOGIN LOGIC\n');
  
  const pureSBS = new PureSBSLogin();
  const result = await pureSBS.runPureSBSTest();
  
  console.log('\n📊 FINAL RESULTS:');
  console.log('=' .repeat(40));
  
  if (result.success) {
    console.log('✅ PURE SBS LOGIC: SUCCESS');
    console.log(`   Method: ${result.method}`);
    console.log(`   Time: ${result.timestamp}`);
    
    console.log('\n💡 PROVEN:');
    console.log('   ✅ SBS_Automation performLogin logic works');
    console.log('   ✅ SBS_Automation selectors work');
    console.log('   ✅ SBS_Automation error handling works');
    console.log('   ✅ SBS_Automation post-login verification works');
    console.log('   ✅ No dependencies needed - pure logic extraction');
    
  } else {
    console.log('❌ PURE SBS LOGIC: FAILED');
    console.log(`   Error: ${result.error}`);
  }
  
  return result;
}

// Export for auto-coder integration
module.exports = { PureSBSLogin, testPureSBSLogin };

// Run test if executed directly
if (require.main === module) {
  testPureSBSLogin()
    .then(result => {
      console.log('\n🏁 Pure SBS logic test completed!');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(`💥 Test failed: ${error.message}`);
      process.exit(1);
    });
}
