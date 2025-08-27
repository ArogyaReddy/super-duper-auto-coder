# 🚀 YOU-ME DIRECT MODE - AI-ENHANCED GENERATION

## ⚠️ CRITICAL RULES: MANDATORY COMPLIANCE WITH MAIN SBS_AUTOMATION ⚠️

# CRITICAL GROUND RULES FOR AUTO-CODER FRAMEWORK

### 🚨 CRITICAL RULE #1: NEVER SAVE TO MAIN SBS_AUTOMATION 🚨
- **ALWAYS GENERATE IN**: `auto-coder/SBS_Automation/` directory ONLY
- **NEVER GENERATE IN**: main `SBS_Automation/` directory  
- **CORRECT PATHS**: 
  - Features: `/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation/features/`
  - Pages: `/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation/pages/`
  - Steps: `/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation/steps/`
- **DEPLOYMENT**: Users deploy using "3. 🚀 Deploy Artifacts to Main SBS" when ready
- **VIOLATION = IMMEDIATE FAILURE**

### 🚨 CRITICAL RULE #2: ANALYZE ACTUAL REQUIREMENT [IMAGES/TEXT/JIRA] 🚨
- **NEVER INVENT REQUIREMENTS** - Always analyze the actual requirement file
- **FOR IMAGES**: Look for actual UI elements like buttons, links, titles, forms
- **EXTRACT REAL ELEMENTS**: "Get started" button, "Learn more" link, page titles
- **MATCH EXACTLY**: Feature scenarios must match actual requirement content
- **EXAMPLE**: billing-invoices.png shows "Get started" button → Create step for that exact button

### 🚨 CRITICAL RULE #3: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #4: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #5: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #6: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #7: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #8: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #9: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #10: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #11: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #12: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #13: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #14: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #15: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #16: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #17: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #18: NO STATIC STRING COMPARISONS (MANDATORY) 🚨
- **NEVER USE** static if/else statements for dynamic elements
- **WRONG PATTERN**:
```javascript
// ❌ STATIC - NOT SCALABLE
async clickButton(buttonName) {
  if (buttonName === 'Get Started') {
    await this.clickElement(GET_STARTED_BUTTON);
  } else {
    await this.clickElement(BUTTON_ELEMENT(buttonName));
  }
}
```
- **CORRECT PATTERN**:
```javascript
// ✅ DYNAMIC - SCALABLE
async clickButton(buttonName) {
  await this.clickElement(BUTTON_ELEMENT(buttonName));
}
```
- **ALWAYS USE** parameterized locators for all dynamic elements

### 🚨 CRITICAL RULE #19: SBS IMPORT COMPATIBILITY (MANDATORY) 🚨
- **IMPORT PATHS** must match SBS_Automation exactly
- **WRONG**:
```javascript
const By = require('../../support/By.js');  // ❌ Has .js extension
const BasePage = require('../common/base-page');  // ❌ Wrong path
```
- **CORRECT**:
```javascript
const By = require('../../support/By');  // ✅ No .js extension
const BasePage = require('./base-page');  // ✅ Correct relative path
const helpers = require('../../support/helpers');  // ✅ Required for navigation
```

### 🚨 CRITICAL RULE #20: ASSERTION COMPATIBILITY (MANDATORY) 🚨
- **ALWAYS USE** chai.assert instead of throw Error
- **WRONG**:
```javascript
if (!isDisplayed) {
  throw new Error('Element not displayed');  // ❌ Not SBS pattern
}
```
- **CORRECT**:
```javascript
const { assert } = require('chai');
assert.isTrue(isDisplayed, 'Element should be displayed');  // ✅ SBS pattern
```

### 🚨 CRITICAL RULE #21: NAVIGATION METHOD COMPATIBILITY (MANDATORY) 🚨
- **USE CORRECT** navigation method that exists in SBS BasePage
- **WRONG**:
```javascript
async navigateToBillingInvoicesPage() {
  await this.navigateToPage('/billing-invoices');  // ❌ Method doesn't exist
}
```
- **CORRECT**:
```javascript
async navigateTo(url) {
  await helpers.retryGoto(this.page, url, { timeout: 300 * 1000 }, 2);  // ✅ SBS pattern
}
```

### 🚨 CRITICAL RULE #22: CLEAN PARAMETERIZED METHODS (MANDATORY) 🚨
- **ALL METHODS** must use parameterized locators without static checks
- **NO IF/ELSE** for handling specific element names
- **USE PARAMETERS** consistently across all methods
- **EXAMPLE**:
```javascript
// ✅ CLEAN PARAMETERIZED APPROACH
const TITLE_ELEMENT = (titleText) => By.xpath(`//h1[contains(text(), "${titleText}")] | //h2[contains(text(), "${titleText}")]`);

async isPageTitleDisplayed(expectedTitle) {
  return await this.isVisible(TITLE_ELEMENT(expectedTitle));
}
```

### 🚨 CRITICAL RULE #23: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #24: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #25: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #26: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #27: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #28: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #29: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #30: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #31: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #32: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #33: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #34: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #35: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #36: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #37: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #38: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #39: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #40: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #41: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #42: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #43: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #44: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #45: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #46: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #47: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #48: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #49: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #50: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #51: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #52: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #53: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #54: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #55: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #56: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #57: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #58: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #59: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #60: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #61: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #62: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #63: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #64: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #65: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #66: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #67: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #68: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #69: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #70: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #71: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #72: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #73: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #74: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #75: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #76: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #77: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #78: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #79: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #80: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #81: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #82: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #83: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #84: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #85: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #86: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #87: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #88: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #89: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #90: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #91: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #92: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #93: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #94: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #95: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #96: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #97: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #98: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #99: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #100: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #101: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #102: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #103: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #104: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #105: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #106: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #107: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #108: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #109: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #110: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #111: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #112: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #113: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #114: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #115: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #116: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #117: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #118: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #119: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #120: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #121: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #122: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #123: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #124: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #125: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #126: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #127: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #128: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #129: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #130: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #131: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #132: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #133: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #134: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #135: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #136: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #137: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #138: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #139: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #140: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #141: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #142: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```

### 🚨 CRITICAL RULE #143: LOCATORS AT TOP BEFORE CLASS (MANDATORY) 🚨
- **LOCATORS MUST BE** defined at the top of page file, BEFORE the class declaration
- **FOLLOW SBS PATTERN** exactly as shown in main SBS_Automation/pages/common/home-page.js
- **CORRECT PATTERN**:
```javascript
const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators at top BEFORE class
const PAGE_TITLE = By.css('[data-test-id="page-title"]');
const GET_STARTED_BUTTON = By.xpath('//button[contains(text(), "Get started")]');
const LEARN_MORE_LINK = By.xpath('//a[contains(text(), "Learn more")]');

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // methods...
}
```

### 🚨 CRITICAL RULE #144: CORRECT IMPORT PATHS (MANDATORY) 🚨
- **By.js IMPORT**: `const By = require('../../support/By.js');` (NO destructuring)
- **BasePage IMPORT**: `const BasePage = require('../common/base-page');`
- **Steps Import**: `const PageClass = require('../../pages/auto-coder/page-name-page');`
- **WRONG DESTRUCTURING**: `const { By } = require('../../support/By.js');` (CAUSES CRASHES)

### 🚨 CRITICAL RULE #145: LOCATOR STANDARDS (MANDATORY) 🚨
- **PREFER By.css()** with single quotes when possible
- **SINGLE QUOTES ONLY**: `By.css('[data-test-id="element"]')` 
- **NO DOUBLE QUOTES**: Never use `By.css("[data-test-id='element']")`
- **COMBINED LOCATORS**: Use XPath OR operator for fallbacks:
```javascript
const GET_STARTED_BUTTON = By.xpath('//button[@data-test-id="get-started"] | //button[contains(text(), "Get started")] | //sdf-button[contains(text(), "Get started")]');
```

### 🚨 CRITICAL RULE #146: PARAMETERIZED LOCATORS (MANDATORY) 🚨
- **USE PARAMETERS** for dynamic elements referenced in feature files
- **MATCH FEATURE STEPS** exactly with locator parameters
- **EXAMPLE**: Feature says `Alex clicks on "Learn More" link` → Use:
```javascript
const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"] | //button[contains(text(), "${btnName}")]`);
const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(), "${linkText}")]`);
```

### 🚨 CRITICAL RULE #147: NO UNUSED PARAMETERS (MANDATORY) 🚨
- **DO NOT** add parameters to methods if they're not used in the method body
- **WRONG**: `async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }`
- **CORRECT**: `async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }`

### 🚨 CRITICAL RULE #148: ONLY USE EXISTING BASE PAGE METHODS 🚨
- **NEVER** use `await this.waitForPageLoad()` - does not exist in BasePage
- **ONLY** use methods that exist in main SBS_Automation BasePage:
  - `this.isVisible()`
  - `this.isEnabled()`
  - `this.clickElement()`
  - `this.navigateToPage()`
  - `this.scrollToElement()`
- **VERIFY** all method calls exist in `../../../SBS_Automation/pages/common/base-page.js`

### 🚨 CRITICAL RULE #149: PROPER CONSTRUCTOR PATTERN (MANDATORY) 🚨
- **CORRECT CONSTRUCTOR** following main SBS_Automation pattern:
```javascript
class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  // NO locators in constructor
}
```
- **WRONG**: Adding locators or selectors in constructor

### 🚨 CRITICAL RULE #150: CLEAN PRODUCTION CODE (MANDATORY) 🚨
- **NO RULE COMMENTS** in generated files
- **NO CONSOLE.LOG** statements anywhere
- **REMOVE**: `// ✅ CRITICAL RULE #X` comments from generated code
- **REMOVE**: `// Following CRITICAL PRODUCTION RULES` comments

### 🚨 CRITICAL RULE #151: MANDATORY FILE HEADERS (MANDATORY) 🚨
- **ALL GENERATED FILES** must include comprehensive header with review instructions
- **STANDARD HEADER PATTERN**:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments below)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

### 🚨 CRITICAL RULE #152: PATH UPDATE INSTRUCTIONS (MANDATORY) 🚨
- **INLINE COMMENTS** for all import statements with migration instructions
- **CLEAR GUIDANCE** for moving from auto-coder to main SBS_Automation
- **EXAMPLE PATTERN**:
```javascript
// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../support/By.js')
// Main framework: require('../../support/By.js') (same)
const By = require('../../support/By.js');

// 🔄 PATH UPDATE INSTRUCTIONS:  
// Current (auto-coder): require('../common/base-page')
// Main framework: require('../common/base-page') (same)
const BasePage = require('../common/base-page');

// 🔄 PATH UPDATE INSTRUCTIONS:
// Current (auto-coder): require('../../pages/auto-coder/page-name-page')
// Main framework: require('../pages/page-name-page')
const PageClass = require('../../pages/auto-coder/page-name-page');
```