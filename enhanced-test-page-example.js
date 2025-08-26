// 📖 USAGE EXAMPLE FOR EnhancedTestPagePage

const EnhancedTestPagePage = require('./pages/enhanced-test-page');

// In your test file:
async function example(page) {
  const pageObj = new EnhancedTestPagePage(page);
  
  // Verify page loaded
  await pageObj.verifyPageLoaded();
  
  // Example interactions:
  
  
  // Check element visibility
  
  
  // Get all element statuses
  const allStatuses = await pageObj.getAllVisibleElements();
  console.log('Page element statuses:', allStatuses);
}