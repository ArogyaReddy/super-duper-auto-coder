/**
 * Direct SBS_Automation Integration - NO NEW CODE
 * Simply imports and uses the existing SBS_Automation login exactly as-is
 */

// Import the EXACT SBS_Automation login class
const PractitionerLogin = require('../SBS_Automation/pages/common/practitioner-login');
const { chromium } = require('playwright');

/**
 * Direct wrapper that uses SBS_Automation performRunLogin method exactly as-is
 */
class DirectSBSWrapper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.practitionerLogin = null;
  }

  async setup() {
    console.log('🚀 Setting up direct SBS_Automation integration...');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-web-security']
    });
    
    this.page = await this.browser.newPage();
    
    // Create the EXACT SBS_Automation login instance
    this.practitionerLogin = new PractitionerLogin(this.page);
    
    console.log('✅ SBS_Automation PractitionerLogin instance created');
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
    
    console.log('✅ Navigation completed');
  }

  /**
   * Use the EXACT SBS_Automation performRunLogin method
   */
  async performSBSLogin(username = 'Arogya@26153101', password = 'Test0507') {
    console.log('🔑 Using SBS_Automation performRunLogin method...');
    
    try {
      // Call the EXACT method from SBS_Automation
      await this.practitionerLogin.performRunLogin(username, password);
      
      console.log('✅ SBS_Automation performRunLogin completed successfully!');
      return true;
      
    } catch (error) {
      console.error(`❌ SBS_Automation performRunLogin failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Complete integration using pure SBS_Automation methods
   */
  async runDirectSBSIntegration() {
    console.log('🎯 DIRECT SBS_AUTOMATION INTEGRATION');
    console.log('=' .repeat(50));
    console.log('Using the EXACT SBS_Automation code without modifications\n');

    try {
      // Setup
      await this.setup();
      
      // Navigate
      await this.navigateToLogin();
      
      // Use EXACT SBS_Automation login
      const loginResult = await this.performSBSLogin();
      
      if (loginResult) {
        console.log('\n🎉 SUCCESS! SBS_Automation integration works perfectly!');
        console.log('✅ performRunLogin method executed successfully');
        console.log('✅ No new code required - using existing SBS framework');
        console.log('✅ Ready for auto-coder integration');
        
        // Wait to see results
        await this.page.waitForTimeout(10000);
        
        return {
          success: true,
          method: 'Direct_SBS_Automation',
          integration: 'performRunLogin',
          timestamp: new Date().toISOString()
        };
        
      } else {
        console.log('\n❌ Login attempt failed - need to check credentials or page structure');
        return {
          success: false,
          method: 'Direct_SBS_Automation',
          error: 'performRunLogin failed'
        };
      }
      
    } catch (error) {
      console.error(`💥 Integration failed: ${error.message}`);
      return {
        success: false,
        method: 'Direct_SBS_Automation',
        error: error.message
      };
      
    } finally {
      await this.cleanup();
    }
  }
}

/**
 * Test function to prove direct SBS_Automation integration
 */
async function testDirectSBSIntegration() {
  console.log('🏆 TESTING DIRECT SBS_AUTOMATION INTEGRATION\n');
  
  const directSBS = new DirectSBSWrapper();
  const result = await directSBS.runDirectSBSIntegration();
  
  console.log('\n📊 FINAL RESULTS:');
  console.log('=' .repeat(40));
  
  if (result.success) {
    console.log('✅ DIRECT SBS INTEGRATION: SUCCESS');
    console.log(`   Method: ${result.method}`);
    console.log(`   Integration: ${result.integration}`);
    console.log(`   Time: ${result.timestamp}`);
    
    console.log('\n💡 PROVEN:');
    console.log('   ✅ SBS_Automation PractitionerLogin class works');
    console.log('   ✅ performRunLogin method executes');
    console.log('   ✅ No custom code needed');
    console.log('   ✅ Direct reference to existing framework');
    
  } else {
    console.log('❌ DIRECT SBS INTEGRATION: FAILED');
    console.log(`   Error: ${result.error}`);
  }
  
  return result;
}

// Export for use in auto-coder
module.exports = { DirectSBSWrapper, testDirectSBSIntegration };

// Run test if executed directly
if (require.main === module) {
  testDirectSBSIntegration()
    .then(result => {
      console.log('\n🏁 Direct SBS integration test completed!');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(`💥 Test failed: ${error.message}`);
      process.exit(1);
    });
}
