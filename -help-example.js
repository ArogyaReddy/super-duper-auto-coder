// 📖 USAGE EXAMPLE FOR HelpPage

const HelpPage = require('./pages/-help');

// In your test file:
async function example(page) {
  const pageObj = new HelpPage(page);
  
  // Verify page loaded
  await pageObj.verifyPageLoaded();
  
  // Example interactions:
    await pageObj.clickBtnfloatingchat(); // btnFloatingChat
  await pageObj.clickSkipToMainContent(); // Skip to main content
  await pageObj.clickModalcontainer(); // modal-container
  
  // Check element visibility
    await pageObj.verifyBtnfloatingchatIsVisible();
  await pageObj.verifySkipToMainContentIsVisible();
  
  // Get all element statuses
  const allStatuses = await pageObj.getAllVisibleElements();
  console.log('Page element statuses:', allStatuses);
}