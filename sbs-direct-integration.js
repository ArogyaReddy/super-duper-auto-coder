/**
 * SBS_Automation Direct Integration
 * Imports and uses proven login methods from main SBS_Automation framework
 */

// Import SBS_Automation core classes
const LoginPage = require('../SBS_Automation/pages/common/practitioner-login');
const CredentialsManager = require('../SBS_Automation/support/credentials-manager');

// Import configuration from SBS_Automation
const sbsConfig = require('../SBS_Automation/web.config.json');

class SBSDirectIntegration {
  constructor(page) {
    this.page = page;
    this.config = sbsConfig;
    this.loginPage = new LoginPage(page);
    this.credentialsManager = new CredentialsManager(this.config);
  }

  /**
   * Performs login using SBS_Automation's proven method
   * @param {string} clientType - Type of client (e.g., 'homepage_test_client', 'smoke_tests')
   * @param {string} iid - Optional specific IID, otherwise uses default from config
   */
  async performSBSLogin(clientType = 'homepage_test_client', iid = null) {
    try {
      // Navigate to login page using SBS method
      await this.loginPage.navigateTo(this.config.url);
      
      // Get credentials using SBS CredentialsManager
      const targetIid = iid || this.getDefaultIid(clientType);
      console.log(`🔑 Using SBS_Automation login for IID: ${targetIid}`);
      
      const userCredentials = await this.credentialsManager.getOwnerDetails(targetIid);
      
      // Perform login using proven SBS method
      await this.loginPage.performRunLogin(userCredentials.ADP_USER_ID, userCredentials.Password);
      
      console.log(`✅ SBS_Automation login successful for user: ${userCredentials.ADP_USER_ID}`);
      
      return {
        success: true,
        username: userCredentials.ADP_USER_ID,
        iid: targetIid,
        method: 'SBS_Automation_Direct'
      };
      
    } catch (error) {
      console.error(`❌ SBS_Automation login failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        method: 'SBS_Automation_Direct'
      };
    }
  }

  /**
   * Login with your specific user credentials using SBS methods
   */
  async performUserLogin(username = 'Arogya@26153101', password = 'Test0507') {
    try {
      console.log(`🔑 Using SBS_Automation direct login for user: ${username}`);
      
      // Navigate using SBS method
      await this.loginPage.navigateTo(this.config.url);
      
      // Login using proven SBS method
      await this.loginPage.performRunLogin(username, password);
      
      console.log(`✅ SBS_Automation direct login successful`);
      
      return {
        success: true,
        username: username,
        method: 'SBS_Automation_Direct_User'
      };
      
    } catch (error) {
      console.error(`❌ SBS_Automation direct login failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        method: 'SBS_Automation_Direct_User'
      };
    }
  }

  /**
   * Service user login using SBS methods
   */
  async performServiceUserLogin() {
    try {
      console.log(`🔑 Using SBS_Automation service user login`);
      
      // Get service user credentials from SBS data
      // This would use ATP or other service user credential retrieval
      const serviceCredentials = await this.getServiceUserCredentials();
      
      await this.loginPage.navigateTo(this.config.url);
      await this.loginPage.performRunLogin(serviceCredentials.username, serviceCredentials.password);
      
      console.log(`✅ SBS_Automation service user login successful`);
      
      return {
        success: true,
        username: serviceCredentials.username,
        method: 'SBS_Automation_Service_User'
      };
      
    } catch (error) {
      console.error(`❌ SBS_Automation service user login failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        method: 'SBS_Automation_Service_User'
      };
    }
  }

  /**
   * Get default IID based on client type
   */
  getDefaultIid(clientType) {
    // Map to SBS_Automation data structure - you'd import the actual data files
    const iidMappings = {
      'homepage_test_client': '26153101', // Your working client ID
      'smoke_tests': '26153101',
      'payroll_tests': '26153101'
    };
    
    return iidMappings[clientType] || '26153101';
  }

  /**
   * Get service user credentials (placeholder - implement based on SBS approach)
   */
  async getServiceUserCredentials() {
    // This would integrate with SBS_Automation's actual service user mechanism
    // For now, return test credentials
    return {
      username: 'service.user@example.com',
      password: 'ServicePassword123'
    };
  }

  /**
   * Wait for successful login confirmation using SBS patterns
   */
  async waitForLoginSuccess() {
    try {
      // Use SBS_Automation's homepage detection methods
      // This would import and use HomePage class from SBS_Automation
      await this.page.waitForSelector('[data-automation-id="payroll-carousel"]', { timeout: 30000 });
      console.log(`✅ Login confirmed - homepage elements detected`);
      return true;
    } catch (error) {
      console.log(`⚠️ Login confirmation timeout - may need manual verification`);
      return false;
    }
  }
}

module.exports = SBSDirectIntegration;
