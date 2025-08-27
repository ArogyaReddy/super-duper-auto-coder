// 📖 USAGE EXAMPLE FOR TestPageDemoPage

const TestPageDemoPage = require('./pages/test-page-demo');

// In your test file:
async function example(page) {
  const pageObj = new TestPageDemoPage(page);
  
  // Verify page loaded
  await pageObj.verifyPageLoaded();
  
  // Example interactions:
    await pageObj.clickSranavbtn(); // sra-nav-btn
  await pageObj.clickHelpcenternavbtn(); // help-center-nav-btn
  await pageObj.clickSettingsnavbtn(); // settings-nav-btn
  
  // Check element visibility
    await pageObj.verifySranavbtnIsVisible();
  await pageObj.verifyHelpcenternavbtnIsVisible();
  
  // Get all element statuses
  const allStatuses = await pageObj.getAllVisibleElements();
  console.log('Page element statuses:', allStatuses);
}