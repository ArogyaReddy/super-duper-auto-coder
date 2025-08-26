// 📖 USAGE EXAMPLE FOR TestPagePage

const TestPagePage = require('./pages/test-page');

// In your test file:
async function example(page) {
  const pageObj = new TestPagePage(page);
  
  // Verify page loaded
  await pageObj.verifyPageLoaded();
  
  // Example interactions:
    await pageObj.clickThisPageIsLoading(); // This page is loading
  
  // Check element visibility
    await pageObj.verifyThisPageIsLoadingIsVisible();
  
  // Get all element statuses
  const allStatuses = await pageObj.getAllVisibleElements();
  console.log('Page element statuses:', allStatuses);
}