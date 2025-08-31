const { Given, Then } = require('@cucumber/cucumber');
const SBSDirectIntegration = require('../sbs-direct-integration');

// Step definitions for auto-coder integration with SBS_Automation

Then('login should be successful for auto-coder integration', async function() {
  // Verification step after SBS login
  const sbsIntegration = new SBSDirectIntegration(this.page);
  const loginConfirmed = await sbsIntegration.waitForLoginSuccess();
  
  if (loginConfirmed) {
    console.log('✅ Auto-coder: SBS_Automation login integration successful');
    // Store session info for auto-coder use
    this.autoCoderSession = {
      loginMethod: 'SBS_Automation',
      timestamp: new Date().toISOString(),
      status: 'authenticated'
    };
  } else {
    throw new Error('Auto-coder: Login integration failed');
  }
});

Then('login should be successful for auto-coder service integration', async function() {
  // Verification step for service user login
  const sbsIntegration = new SBSDirectIntegration(this.page);
  const loginConfirmed = await sbsIntegration.waitForLoginSuccess();
  
  if (loginConfirmed) {
    console.log('✅ Auto-coder: SBS_Automation service user integration successful');
    this.autoCoderServiceSession = {
      loginMethod: 'SBS_Automation_Service',
      timestamp: new Date().toISOString(),
      status: 'authenticated'
    };
  } else {
    throw new Error('Auto-coder: Service user login integration failed');
  }
});
