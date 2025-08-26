// 📖 USAGE EXAMPLE FOR MyPage1Page

const MyPage1Page = require('./pages/my-page1');

// In your test file:
async function example(page) {
  const pageObj = new MyPage1Page(page);
  
  // Verify page loaded
  await pageObj.verifyPageLoaded();
  
  // Example interactions:
    await pageObj.clickSigninsecurepoptextbtnid(); // signin.securepopTextBtnId
  await pageObj.clickSigninremembercheckboxbtn(); // signin.remembercheckboxBtn
  await pageObj.clickForgotuidbtnsigninneedhelp(); // forgot_UID_Btn_signin.needHelp
  
  // Check element visibility
    await pageObj.verifySigninsecurepoptextbtnidIsVisible();
  await pageObj.verifySigninremembercheckboxbtnIsVisible();
  
  // Get all element statuses
  const allStatuses = await pageObj.getAllVisibleElements();
  console.log('Page element statuses:', allStatuses);
}