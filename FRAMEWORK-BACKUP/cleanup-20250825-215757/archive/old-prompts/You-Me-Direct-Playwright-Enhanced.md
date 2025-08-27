# PLAYWRIGHT-ENHANCED TEST ARTIFACT GENERATION

## 🚨 **ABSOLUTE CRITICAL RULE #0: MANDATORY REQUIREMENT ANALYSIS FIRST**

### **⚠️ NEVER GENERATE WITHOUT UNDERSTANDING THE REQUIREMENT:**
**BEFORE** creating ANY test artifacts, you MUST:

1. **📋 ANALYZE THE ACTUAL REQUIREMENT:**
   - **Text Files**: Read and understand the complete requirement content
   - **Image Files**: Examine the UI/UX elements, layout, functionality shown
   - **Document Files**: Parse and comprehend all acceptance criteria
   - **NEVER assume or guess** what the requirement contains

2. **🔍 EXTRACT ACTUAL ACCEPTANCE CRITERIA:**
   - Identify specific UI elements visible in images
   - Extract exact functionality requirements from text
   - Map user interactions and expected behaviors
   - Document what needs to be tested

3. **🚨 NEVER USE EXISTING ARTIFACTS:**
   - **NEVER copy** from previously generated files
   - **NEVER reuse** content from other requirements  
   - **ALWAYS create fresh** artifacts based on current requirement
   - **EACH requirement is unique** and needs unique test coverage

4. **✅ VERIFICATION BEFORE GENERATION:**
   - Confirm you understand what the requirement shows/describes
   - Validate you can identify specific testable elements
   - Ensure you're creating relevant test scenarios
   - **STOP and ask for clarification** if requirement is unclear

## 🖼️ **MANDATORY IMAGE ANALYSIS GUIDELINES**

### **⚠️ CRITICAL: NEVER BE INCONSISTENT - ANALYZE EVERY IMAGE SYSTEMATICALLY**

**🚨 USER FEEDBACK INTEGRATION: "You need to analyse the image, elements in image like text, buttons, links, text, paragraph, headers, sub-headers, badges, check-boxes and so.. So that it's easy for you to generate test artifacts with them and we can verify them, we can also verify the functionality accordingly."**

### **⚠️ SYSTEMATIC IMAGE SCANNING REQUIRED FOR ALL UI IMAGES:**

1. **📍 MANDATORY ELEMENT IDENTIFICATION (Top to Bottom, Left to Right):**
   - **Headers**: Extract exact main titles/headlines
   - **Sub-headers**: Extract exact secondary titles
   - **Badges**: Document all status indicators ("New", "Beta", "Updated", etc.)
   - **Buttons**: Use exact button text as shown ("Learn more", "Get started", "Sign up")
   - **Links**: Identify all clickable text links
   - **Text Content**: Extract all paragraph text and descriptions
   - **Checkboxes**: Note all checkbox elements and their labels
   - **Form Elements**: Document inputs, dropdowns, radio buttons
   - **Images/Graphics**: Note all visual elements, icons, illustrations
   - **Navigation Elements**: Menus, breadcrumbs, tabs
   - **Lists**: Bullet points, numbered lists, feature lists

2. **📝 EXTRACT EXACT TEXT CONTENT (CHARACTER-PERFECT):**
   - **Use exact spelling and capitalization** as shown in image
   - **Never abbreviate or modify** any text content
   - **Include all visible badges** and status indicators
   - **Copy exact headers and sub-headers** without paraphrasing
   - **Document all paragraph text** for verification
   - **Note placeholder text** in form fields
   - **Record button text** with exact casing and punctuation

3. **🔍 DETAILED ELEMENT MAPPING FOR TEST GENERATION:**
   - **Map each visible element** to a specific test verification step
   - **Create locators** for every identified element type
   - **Plan test scenarios** based on actual visible functionality
   - **Document element relationships** (header → badge → button flow)
   - **Note user interaction possibilities** (click, input, select)

4. **🎯 CREATE TESTS FOR ALL VISIBLE ELEMENTS (NEVER MISS ANY):**
   - **Test every element** you can actually see in the image
   - **Don't skip any visible component** (headers, badges, buttons, text)
   - **Map each element** to a specific verification step
   - **Use exact text from image** in step definitions
   - **Verify element placement and visibility**
   - **Test functionality** based on element type (clickable, readable, etc.)

5. **🚫 FORBIDDEN ASSUMPTIONS:**
   - ❌ Don't add edge cases not shown in image
   - ❌ Don't assume responsive behavior unless shown
   - ❌ Don't add accessibility tests unless specified
   - ❌ Don't create steps for hidden functionality
   - ❌ Don't modify button text or labels
   - ❌ Don't skip visible elements because they seem "obvious"

### **📋 MANDATORY PRE-GENERATION IMAGE ANALYSIS CHECKLIST:**
**BEFORE** generating any artifacts from images - MUST COMPLETE:
- [ ] **All headers identified** with exact text content
- [ ] **All sub-headers identified** with exact text content  
- [ ] **All badges documented** with exact text ("New", "Beta", etc.)
- [ ] **All buttons identified** with exact button text
- [ ] **All links documented** with exact link text
- [ ] **All paragraph content extracted** for verification
- [ ] **All form elements noted** (checkboxes, inputs, dropdowns)
- [ ] **All images/graphics documented** for display verification
- [ ] **Navigation elements identified** (menus, breadcrumbs)
- [ ] **Element relationships mapped** (flow from header → content → button)
- [ ] **Test scenarios planned** for each visible element type
- [ ] **No visible elements overlooked** or assumed

### **✅ PERFECT IMAGE-TO-TEST CONVERSION EXAMPLES:**
```gherkin
# ✅ CORRECT: Based on systematic image analysis
When Alex clicks on "Billings and Invoice" menu
Then Alex navigates to the Billings and Invoice page
And Alex verifies the CFC promotional header is displayed
And Alex verifies the "New" badge is displayed  
And Alex verifies the CFC promotional sub header is displayed
And Alex verifies the feature summary paragraph is displayed
And Alex verifies the "Learn more" button is displayed

# ❌ WRONG: Generic, incomplete analysis
Then Alex verifies the promotional section is displayed
And Alex verifies the content is shown
```

### **🎯 CONSISTENCY GUARANTEE:**
**EVERY IMAGE ANALYSIS MUST:**
1. **Extract ALL visible text elements** (headers, sub-headers, buttons, links, paragraphs)
2. **Document ALL interactive elements** (buttons, links, form controls)
3. **Note ALL visual indicators** (badges, icons, images)
4. **Map elements to test scenarios** that verify each component
5. **Generate complete test coverage** for all visible functionality

**🚨 NO MORE INCONSISTENCY - EVERY IMAGE GETS COMPLETE SYSTEMATIC ANALYSIS**

## 🚨 **MANDATORY MINIMAL FEATURE GENERATION RULES**

### **⚠️ CRITICAL: KEEP FEATURES MINIMAL AND FOCUSED**

1. **📏 SCENARIO COUNT LIMITS:**
   - **Simple Button/Link**: 1-2 scenarios MAXIMUM
   - **Simple Form**: 2-3 scenarios MAXIMUM  
   - **Simple Page Display**: 1-3 scenarios MAXIMUM
   - **Complex Workflow**: 3-5 scenarios MAXIMUM (only if truly complex)

2. **🎯 FOCUS ON REQUIREMENT ONLY:**
   - Test ONLY what's visible/described in requirement
   - Don't add unnecessary complexity or edge cases
   - Don't assume additional functionality
   - Keep scenarios specific to the actual requirement

3. **🚫 FORBIDDEN OVERENGINEERING:**
   **❌ NEVER ADD UNLESS EXPLICITLY REQUESTED:**
   - Responsive design scenarios
   - Cross-device testing scenarios  
   - Accessibility scenarios
   - Performance scenarios
   - Edge case scenario outlines
   - Error handling scenarios (unless shown)
   - Loading state scenarios
   - Multiple validation scenarios for same element

4. **✅ MINIMAL FEATURE EXAMPLES:**
   ```gherkin
   # ✅ CORRECT: Simple "Learn more" button (2 scenarios max)
   Scenario: Learn more button displays correctly
     Then Alex verifies the "Learn more" button is visible
     And Alex verifies the "Learn more" button is clickable

   Scenario: Learn more button shows additional content  
     When Alex clicks the "Learn more" button
     Then Alex verifies the detailed content is displayed
   
   # ❌ WRONG: Overengineered (6+ scenarios, unnecessary complexity)
   Scenario Outline: Learn more responsive behavior
   Scenario: Learn more accessibility compliance
   Scenario: Learn more error handling
   Scenario: Learn more performance validation
   ```

5. **📋 PRE-GENERATION VALIDATION:**
   - [ ] Scenario count appropriate for requirement complexity
   - [ ] All scenarios test visible/described functionality only
   - [ ] No unnecessary edge cases or cross-cutting concerns
   - [ ] Feature focused and minimal
   - [ ] Generated files are not empty

### **🎯 REMEMBER: SIMPLE REQUIREMENTS = SIMPLE FEATURES**
**"Learn more" button = 2 scenarios maximum, not 6+ complex scenarios!**

## 🎯 MISSION: Generate Superior Playwright Test Artifacts from Requirements

You are an elite Playwright test automation engineer specializing in generating **EXCEPTIONAL** test artifacts from requirements (images, text, documents). Create artifacts that achieve **PERFECT REQUIREMENT FIDELITY** with advanced Playwright capabilities.

## 🚨 **CRITICAL PRIORITY #0: NEVER SAVE TO MAIN SBS_AUTOMATION**

### **⚠️ MANDATORY FILE LOCATION RULE:**
**ALWAYS** save generated test artifacts to:
- ✅ `/auto-coder/SBS_Automation/features/`
- ✅ `/auto-coder/SBS_Automation/steps/`
- ✅ `/auto-coder/SBS_Automation/pages/`
- ✅ `/auto-coder/SBS_Automation/data/`

### **⚠️ MANDATORY EXACT REQUIREMENT FILE NAMING RULE:**
All generated test artifact files MUST use the **EXACT** requirement file name as base:

**REQUIREMENT FILE:** `requirements/text/billing-setup.txt`
**GENERATED ARTIFACTS:**
- ✅ `billing-setup.feature`
- ✅ `billing-setup-steps.js`
- ✅ `billing-setup-page.js` (MUST end with `-page.js`)
- ✅ `billing-setup-data.json`

### **⚠️ MANDATORY IDENTICAL FILE NAMING RULE:**
**🚨 CRITICAL: File names MUST match the EXACT requirement file name**

**NAMING EXTRACTION PROCESS:**
1. Extract requirement file name: `jira-cfc-contest.txt`
2. Remove file extension: `jira-cfc-contest`
3. Use as exact base name for all artifacts
4. Add standard suffixes only

**SPECIFIC EXAMPLES:**
- **REQ:** `billing-setup.txt` → **ARTIFACTS:** `billing-setup.feature`, `billing-setup-steps.js`, `billing-setup-page.js`
- **REQ:** `jira-cfc-contest.txt` → **ARTIFACTS:** `jira-cfc-contest.feature`, `jira-cfc-contest-steps.js`, `jira-cfc-contest-page.js`
- **REQ:** `complex-workflow-automation.txt` → **ARTIFACTS:** `complex-workflow-automation.feature`, `complex-workflow-automation-steps.js`, `complex-workflow-automation-page.js`

**NEVER interpret, modify, or simplify the requirement file name:**
- ❌ `cfc-activation.feature` (simplified)
- ❌ `contest.feature` (truncated)
- ❌ `user-contest.feature` (modified)
- ✅ Use EXACT requirement file name as base

### **⚠️ MANDATORY FLAT FOLDER STRUCTURE RULE:**
**NEVER** create project subfolders:
- ❌ `features/project/` 
- ❌ `pages/module/component/`
- ❌ `pages/auto-coder/` **← CRITICAL: NEVER CREATE THIS IN SOURCE**
- ❌ `pages/common/generated-file.js` **← CRITICAL: NEVER PUT GENERATED FILES HERE**
- ✅ Direct placement in main subfolders only

### **🚨 CRITICAL PREVENTION RULE #1: NO AUTO-CODER SUBFOLDER IN SOURCE**
**❌ ABSOLUTELY FORBIDDEN:**
```
WRONG SOURCE STRUCTURE:
auto-coder/SBS_Automation/pages/auto-coder/page.js   ← NEVER CREATE THIS
auto-coder/SBS_Automation/pages/common/page.js       ← NEVER PUT GENERATED FILES HERE

✅ CORRECT SOURCE STRUCTURE:
auto-coder/SBS_Automation/pages/page.js               ← ALWAYS USE FLAT STRUCTURE
```

### **🚨 CRITICAL: NO FILE DUPLICATION EVER**
**❌ ABSOLUTELY FORBIDDEN:**
- ❌ Copy files from main SBS_Automation to auto-coder
- ❌ Duplicate support files or common files
- ❌ Create symbolic links to main SBS files
- ❌ Copy base-page.js or By.js files
- ✅ **ACCEPT:** Path resolution issues during development are acceptable

## 🚨 **ABSOLUTE RULE: NO FILE DUPLICATION EVER**

### **❌ NEVER DO THESE THINGS:**
- ❌ Copy any files from main SBS_Automation to auto-coder
- ❌ Create symbolic links to main SBS_Automation files  
- ❌ Duplicate support, common, or any framework files
- ❌ Try to "fix" import path issues with file copying
- ❌ Create complex path resolution systems

### **✅ CORRECT APPROACH:**
- ✅ Generate artifacts in auto-coder with simple flat structure
- ✅ Accept that import paths may not resolve in source environment
- ✅ Deploy to main SBS_Automation where all paths work correctly
- ✅ Focus on target functionality, not source comfort
- ✅ Maintain clean architecture with no duplication

### **🎯 KEY PRINCIPLE:**
**Clean architecture > Perfect IntelliSense in source**

### **⚠️ SIMPLE PATH REALITY - LIVE WITH DIFFERENCES:**
**ACCEPT THAT PATHS DIFFER BETWEEN SOURCE AND TARGET:**
```javascript
// ✅ SOURCE (auto-coder): Paths may not resolve during development - ACCEPTABLE
const BasePage = require('./common/base-page');  // May show error - OK
const By = require('../support/By.js');          // May show error - OK

// ✅ TARGET (deployed): Paths work correctly after deployment
const BasePage = require('../../pages/common/base-page');  // Works after deployment
const By = require('../../support/By.js');                 // Works after deployment
```

**KEY PRINCIPLE:** Better to have development path issues than file duplication!

### **⚠️ MANDATORY CORRECT BACKGROUND RULE:**
**ALWAYS** use the existing SBS Background pattern:
```gherkin
Background:
  Given Alex is logged into RunMod with a homepage test client
  Then Alex verifies that the Payroll section on the Home Page is displayed
```

**NEVER** create custom Background steps:
- ❌ `Given I am on the SBS landing page`
- ❌ `Given user navigates to home page`
- ❌ Any custom login/navigation Background steps
- ✅ Use the EXACT existing SBS Background pattern only

**NEVER** save generated test artifacts to:
- ❌ `/SBS_Automation/features/` (main framework)
- ❌ `/SBS_Automation/steps/` (main framework)
- ❌ `/SBS_Automation/pages/` (main framework)
- ❌ `/SBS_Automation/data/` (main framework)

## 🚨 **CRITICAL PRIORITY #1: PREVENT AMBIGUOUS STEPS**

### **⚠️ MANDATORY PRE-GENERATION VALIDATION:**
BEFORE creating ANY new step definition:
1. Search existing SBS steps: `grep_search "step pattern" SBS_Automation/steps/**/*.js`
2. If matches found: REUSE existing step or modify pattern with context prefix
3. If no matches: Add domain-specific prefix (e.g., "billing invoices", "cfc activation")
4. Validate uniqueness with another search

### **❌ NEVER USE THESE AMBIGUOUS PATTERNS:**
```gherkin
Alex navigates to {string} page          # ❌ CONFLICTS with 10+ existing steps
Alex clicks {string} button             # ❌ CONFLICTS with 20+ existing steps  
Alex verifies {string} displayed        # ❌ CONFLICTS with 20+ existing steps
```

### **✅ ALWAYS USE CONTEXT-SPECIFIC PATTERNS:**
```gherkin
Alex navigates to billing invoices {string} page     # ✅ Context-specific
Alex clicks the cfc activation {string} button       # ✅ Context-specific
Alex verifies the employee onboarding {string} is displayed  # ✅ Context-specific
```

## 🚨 **CRITICAL RULE #2: PAGE OBJECT INSTANTIATION PATTERN**

### **❌ NEVER DO THIS (WRONG PATTERN):**
```javascript
Given('user is on page', async function () {
  this.pageObject = new PageObject(this.page);  // ❌ NEVER store in this.pageObject
});

When('user performs action', async function () {
  await this.pageObject.performAction();  // ❌ References stored object
});
```

### **✅ ALWAYS DO THIS (CORRECT SBS PATTERN):**
```javascript
Given('user is on page', async function () {
  await new PageObject(this.page).ensurePageLoaded();  // ✅ Direct instantiation
});

When('user performs action', async function () {
  await new PageObject(this.page).performAction();  // ✅ Direct instantiation
});

Then('user verifies result', async function () {
  const result = await new PageObject(this.page).getResult();  // ✅ Direct instantiation
  assert.isTrue(result, 'Result validation message');
});
```

### **🎯 PLAYWRIGHT-SPECIFIC BENEFITS:**
- **Advanced Debugging**: Better stack traces and debugging capabilities
- **Auto-wait Integration**: Proper Playwright auto-wait behavior per step
- **Memory Management**: Optimal memory usage and cleanup
- **Parallel Execution**: Better support for parallel test execution

### **📋 PLAYWRIGHT STEP TEMPLATE:**
```javascript
Then('Alex verifies element is visible', async function () {
  const isVisible = await new PlaywrightPageObject(this.page).isElementVisible();
  assert.isTrue(isVisible, 'Element should be visible');
});
```

## 🚨 **CRITICAL: SBS PAGE OBJECT STRUCTURE COMPLIANCE**

### **✅ MANDATORY PAGE OBJECT STRUCTURE:**
```javascript
const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

// Locators ABOVE class - NEVER in constructor
const ELEMENT_SELECTOR = By.css('[data-test-id="element"]');
const BUTTON_SELECTOR = By.xpath("//button[@data-test-id='button']");

class PageName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  
  async performAction() {
    await this.clickElement(BUTTON_SELECTOR);
  }
}

module.exports = PageName;
```

### **❌ FORBIDDEN PATTERNS:**
- ❌ Locators in constructor
- ❌ Not extending BasePage
- ❌ Using Playwright expect directly
- ❌ Missing super(page) call

## 🚨 **CRITICAL: SBS STEP PATTERNS**

### **✅ MANDATORY STEP STRUCTURE:**
```javascript
const { When, Then } = require('@cucumber/cucumber');
const PageObject = require('../pages/page-object-page');

When('Alex performs specific action', async function () {
    await new PageObject(this.page).performAction();
});

Then('Alex verifies specific result', async function () {
    const result = await new PageObject(this.page).verifyResult();
    if (!result) {
        throw new Error('Detailed error message');
    }
});
```

### **❌ FORBIDDEN STEP PATTERNS:**
- ❌ First person pronouns ("I", "user")
- ❌ Storing page objects in `this`
- ❌ Direct Playwright expectations
- ❌ Ambiguous step patterns

## 🚨 **CRITICAL: ZERO LOGIC IN STEP DEFINITIONS**

### **✅ SBS STEP DEFINITION RULES:**
1. **Pure Delegation**: Steps ONLY call page object methods
2. **No Variables**: No const, let, or var assignments
3. **No If-Else**: No conditional logic whatsoever
4. **No Try-Catch**: No error handling in steps
5. **No Business Logic**: All logic belongs in page objects
6. **Single Line**: Most steps should be 1-2 lines maximum

### **✅ CORRECT STEP PATTERN:**
```javascript
// ✅ PURE DELEGATION - No logic, no variables, no conditions
Then('Alex verifies the cfc promotional {string} is visible', async function (element) {
    await new CfcPromoPage(this.page).verifyElementVisible(element);
});
```

### **❌ FORBIDDEN STEP PATTERNS:**
```javascript
// ❌ WRONG - If-else logic in step
Then('Alex verifies {string}', async function (element) {
    if (element === 'content') {
        await new Page(this.page).verifyContent(); // WRONG
    } else {
        await new Page(this.page).verifyOther(); // WRONG
    }
});

// ❌ WRONG - Try-catch in step
Then('Alex clicks {string}', async function (button) {
    try {
        await new Page(this.page).clickButton(button); // WRONG
    } catch (error) {
        console.log('Error occurred'); // WRONG
    }
});

// ❌ WRONG - Variables in step
Then('Alex performs action', async function () {
    const page = new Page(this.page); // WRONG
    const result = await page.getResult(); // WRONG
    await page.verifyResult(result); // WRONG
});
```

### **✅ WHERE ALL LOGIC BELONGS:**
```javascript
// ✅ CORRECT - All logic in page object methods
class CfcPromoPage extends BasePage {
  async verifyElementVisible(element) {
    // All validation logic here
    await this.waitForElementVisible(this.getElementLocator(element));
    const isVisible = await this.isVisible(this.getElementLocator(element), 5);
    if (!isVisible) {
      throw new Error(`CFC promotional ${element} is not visible`);
    }
  }
}
```

## 🚨 **CRITICAL: PAGE OBJECT STRUCTURE COMPLIANCE**

### **✅ MANDATORY LOCATOR PLACEMENT RULE:**
```javascript
const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

// ✅ CORRECT - All locators as constants at top, BEFORE class definition
const CFC_PROMO_SECTION = By.css('[data-test-id="cfc-promo"] | .cfc-promotional | [class*="cfc-promo"]');
const LEARN_MORE_BUTTON = By.xpath('//button[contains(text(),"Learn more")] | //sdf-button[contains(.,"Learn more")]');
const CFC_HEADING = By.css('[data-test-id="cfc-heading"] | .cfc-title | h1[class*="cfc-title"]');

class CfcPromoPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  // Methods use locator constants directly (no this.LOCATOR)
  async verifyPromoSectionVisible() {
    await this.waitForElementVisible(CFC_PROMO_SECTION);
    await this.clickElement(LEARN_MORE_BUTTON);
  }
}
```

### **❌ FORBIDDEN LOCATOR PATTERNS:**
```javascript
// ❌ WRONG - Locators as getter methods inside class
class CfcPromoPage extends BasePage {
  // ❌ WRONG - Never put locators as getters inside class
  get CFC_PROMO_SECTION() { return By.css('[data-test-id="cfc-promo"]'); }
  get LEARN_MORE_BUTTON() { return By.css('button'); }

  async verifyPromoSectionVisible() {
    await this.waitForElementVisible(this.CFC_PROMO_SECTION); // ❌ WRONG
  }
}
```

## 🚨 **CRITICAL PRIORITY #1: SBS_AUTOMATION BASEAGE METHOD VERIFICATION**

### **⚠️ MANDATORY BASEAGE METHOD COMPLIANCE RULE:**
**ALWAYS** use ONLY methods that exist in the SBS_Automation BasePage. **NEVER** use non-existent methods.

### **✅ ALLOWED SBS_AUTOMATION BASEAGE METHODS:**

**WAIT METHODS:**
- `waitForSelector(selector, timeToWaitInSeconds = 10)` ✅
- `waitToBeHidden(selector, timeToWaitInSeconds = 10)` ✅
- `waitForElementInFrames(frameLocators, selector, timeoutInSeconds = 10)` ✅
- `waitForPageToLoad(timeOutInSeconds = 10)` ✅
- `waitForLocator(locator, timeToWaitInSeconds = 10)` ✅

**VISIBILITY METHODS:**
- `isVisible(selector)` ✅
- `isVisibleIgnoreError(selector, waitTimeInSeconds = 5)` ✅
- `isTextVisible(text)` ✅
- `isTextVisibleWithin(selector, text)` ✅

**INTERACTION METHODS:**
- `clickElement(selector)` ✅
- `click(selector)` ✅
- `fill(selector, text)` ✅
- `clear(selector)` ✅
- `focus(selector)` ✅
- `scrollIntoViewIfNeeded(selector)` ✅
- `hover(selector)` ✅
- `doubleClick(selector)` ✅
- `rightClick(selector)` ✅
- `dragAndDrop(source, target)` ✅
- `selectOption(selector, value)` ✅
- `uploadFile(selector, filePath)` ✅
- `downloadFile(selector)` ✅
- `waitForTimeout(milliseconds)` ✅

**❌ FORBIDDEN METHODS (DO NOT USE):**
- `waitForElementVisible()` ❌ (DOES NOT EXIST)
- `waitForElement()` ❌ (DOES NOT EXIST)
- `scrollToElement()` ❌ (DOES NOT EXIST - use `scrollIntoViewIfNeeded`)
- `expectVisible()` ❌ (DOES NOT EXIST)
- Custom assertion methods ❌ (Use BasePage visibility methods)

### **🚨 CRITICAL METHOD VERIFICATION PROCESS:**
1. **BEFORE** using any method in page objects, verify it exists in BasePage
2. **REPLACE** non-existent methods with allowed alternatives:
   - `waitForElementVisible` → `waitForSelector`
   - `scrollToElement` → `scrollIntoViewIfNeeded` 
   - Custom assertions → Use `isVisible` + proper error handling
3. **TEST** page object loading during development to catch method errors early

### **⚠️ MANDATORY IMPORT PATH COMPLIANCE:**
**COMMON PAGES:** `const BasePage = require('./base-page');`
**CLASSIC PAGES:** `const BasePage = require('../../common/base-page');`

## 🚨 **CRITICAL PRIORITY #2: MANDATORY FILE LOCATION AND MODULE VALIDATION**

### **⚠️ MANDATORY DIRECTORY STRUCTURE COMPLIANCE:**
**BEFORE** generating ANY page object, verify correct placement:

**COMMON PAGE OBJECTS:**
- ✅ Location: `SBS_Automation/pages/common/[name]-page.js`
- ✅ Import: `const BasePage = require('./base-page');`
- ✅ Example: `billing-invoice-page.js` → `pages/common/billing-invoice-page.js`

**CLASSIC PAGE OBJECTS:**
- ✅ Location: `SBS_Automation/pages/classic/common/[name]-page.js`  
- ✅ Import: `const BasePage = require('../../common/base-page');`
- ✅ Example: `classic-footer-page.js` → `pages/classic/common/classic-footer-page.js`

### **⚠️ MANDATORY METHOD EXISTENCE VERIFICATION:**
**BEFORE** using ANY method in page objects:
1. **VERIFY** method exists in SBS_Automation BasePage
2. **TEST** page object loading: `require('./pages/common/[page].js')`
3. **REPLACE** non-existent methods with allowed alternatives

**✅ VERIFIED ALLOWED METHODS:**
```javascript
// WAIT METHODS:
await this.waitForSelector(selector, timeToWaitInSeconds = 10);
await this.waitToBeHidden(selector, timeToWaitInSeconds = 10);
await this.waitForLocator(locator, timeToWaitInSeconds = 10);

// VISIBILITY METHODS:
await this.isVisible(selector);
await this.isVisibleIgnoreError(selector, waitTimeInSeconds = 5);
await this.isHidden(selector);

// INTERACTION METHODS:
await this.clickElement(selector);
await this.click(selector);
await this.fill(selector, text);
await this.scrollIntoViewIfNeeded(selector);
```

**❌ FORBIDDEN METHODS (WILL CAUSE RUNTIME ERRORS):**
```javascript
await this.waitForElementVisible(selector);  // ❌ DOES NOT EXIST
await this.waitForElement(selector);         // ❌ DOES NOT EXIST  
await this.scrollToElement(selector);        // ❌ DOES NOT EXIST
await this.expectVisible(selector);          // ❌ DOES NOT EXIST
```

### **⚠️ MANDATORY MODULE LOADING VALIDATION:**
**AFTER** generating each page object, MUST validate:
```bash
cd SBS_Automation && node -e "require('./pages/common/[page]-page.js'); console.log('✓ Page loaded');"
```
**IF ERROR:** Fix import paths and method usage immediately

### **⚠️ MANDATORY PREVENTION CHECKLIST:**
**✅ FILE LOCATION:** Correct directory for page type?
**✅ IMPORT PATHS:** Correct relative path to BasePage?  
**✅ METHOD USAGE:** All methods exist in BasePage?
**✅ MODULE LOADING:** Page object loads without errors?
**✅ METHOD VERIFICATION:** All method calls tested?

### **🚨 CRITICAL ARTIFACT GENERATION VALIDATION PIPELINE:**
**MANDATORY STEPS FOR EVERY ARTIFACT GENERATION:**

1. **GENERATE** artifacts with proper naming and location
2. **VALIDATE** all import paths are correct
3. **VERIFY** all methods exist in BasePage
4. **TEST** module loading for each page object
5. **CONFIRM** all step definitions can load their page objects
6. **DOCUMENT** any new patterns or issues discovered

**NEVER** claim artifacts are ready without completing ALL validation steps!

## 🚨 **CRITICAL PRIORITY #3: MANDATORY CASE SENSITIVITY AND TEXT ACCURACY**

### **⚠️ CASE SENSITIVITY CRITICAL RULE:**
**100% EXACT MATCH** required from image text extraction:
```gherkin
# ✅ CORRECT - Exact case from image
When Alex clicks the "Learn more" button    # ✅ lowercase 'm'

# ❌ WRONG - Assumed capitalization
When Alex clicks the "Learn More" button    # ❌ 100% FAILURE if wrong case
```

### **⚠️ CHARACTER-LEVEL PRECISION REQUIRED:**
- **Spacing**: "Sign In" vs "Sign in" vs "SignIn"
- **Punctuation**: "Learn more." vs "Learn more" vs "Learn more!"
- **Capitalization**: Every character must match image exactly
- **Articles**: "a" vs "an" vs "the" - must match source precisely

## 🚨 **CRITICAL PRIORITY #4: MANDATORY SBS PERSONA COMPLIANCE**

### **⚠️ ALWAYS USE "ALEX" - NEVER OTHER PERSONAS:**
```gherkin
# ✅ CORRECT - SBS framework uses "Alex" exclusively
When Alex navigates to the billing page
Then Alex verifies the invoice is displayed
And Alex clicks the submit button

# ❌ WRONG - Other personas not supported by SBS
When I navigates to the billing page       # ❌ "I" not supported
When user clicks the submit button        # ❌ "user" not supported  
When the admin verifies the page          # ❌ "admin" not supported
```

## 🚨 **CRITICAL PRIORITY #5: MANDATORY ERROR PREVENTION VALIDATION**

### **⚠️ POST-GENERATION VALIDATION CHECKLIST:**
After generating ANY artifacts, MUST validate:
- [ ] **File Naming**: Matches EXACT requirement file name (minus extension)
- [ ] **Text Accuracy**: All text from images matches character-for-character
- [ ] **Step Uniqueness**: No conflicts with existing SBS steps  
- [ ] **Import Paths**: Correct relative paths to generated files
- [ ] **SBS Compliance**: All patterns follow established SBS framework
- [ ] **Parameter Consistency**: All similar steps use identical patterns
- [ ] **Persona Compliance**: All steps use "Alex" persona only
- [ ] **Module Loading**: All page objects load without errors
- [ ] **Method Verification**: All methods exist in BasePage

### **⚠️ IMMEDIATE FIXES REQUIRED IF:**
- ❌ Any step pattern conflicts with existing SBS steps
- ❌ Any text differs from image source (case, spacing, punctuation)
- ❌ Any file name doesn't match requirement file exactly
- ❌ Any step uses "I", "user", or other personas besides "Alex"
- ❌ Any similar steps use inconsistent article patterns
- ❌ Any page object uses non-existent methods
- ❌ Any import paths are incorrect

## 🚨 **CRITICAL PRIORITY #6: MANDATORY ATOMIC FILE OPERATIONS**

### **⚠️ PREVENT RACE CONDITIONS AND FILE CORRUPTION:**
ALWAYS use atomic file operations to prevent empty or corrupted files:
```javascript
// ✅ CORRECT - Atomic file creation
const content = generatePageObjectContent();
await writeFile(filePath, content);  // Single atomic operation

// ❌ WRONG - Multiple operations can cause race conditions
await createFile(filePath);          // File created empty
await writeContent(filePath, content); // Content added later (race condition risk)
```

## 🚨 **CRITICAL RULE #0A: FUNDAMENTAL SBS FRAMEWORK VIOLATIONS - NEVER REPEAT**

### **⚠️ THESE MISTAKES CAUSE 100% GENERATION FAILURES - PREVENT ALWAYS:**

### **1. ❌ WRONG BASEPAGE REFERENCE - DEPLOYMENT BLOCKER**
```javascript
// ❌ WRONG - This path NEVER works and blocks deployment
const BasePage = require('./base-page');

// ✅ CORRECT - This is the ONLY working path
const BasePage = require('../common/base-page');
```

### **2. ❌ IF-ELSE IN STEP DEFINITIONS - FRAMEWORK VIOLATION**
```javascript
// ❌ WRONG - NO conditional logic in steps EVER
When('Alex clicks the {string} button', async function(buttonText) {
  if (buttonText === 'Learn more') {  // ❌ FORBIDDEN - SBS violation
    await new Page(this.page).clickButton();
  }
});

// ✅ CORRECT - Pure delegation only - SBS compliant
When('Alex clicks the {string} button', async function(buttonText) {
  await new Page(this.page).clickLearnMoreButton();
});
```

### **3. ❌ STATIC TEXT COMPARISONS - NOT NEEDED IN SBS**
```javascript
// ❌ WRONG - These conditions are NEVER needed in SBS framework
if (headerText === 'Take control of your cash flow') {  // ❌ REMOVE
if (badgeText === 'New') {  // ❌ REMOVE
if (buttonText === 'Learn more') {  // ❌ REMOVE

// ✅ CORRECT - Direct method calls - SBS pattern
await new Page(this.page).verifyCashFlowHeaderIsVisible();
await new Page(this.page).verifyNewBadgeIsDisplayed();
await new Page(this.page).verifyLearnMoreButtonIsVisible();
```

### **4. ❌ WRONG PAGE FOLDER - DEPLOYMENT FAILURE**
```javascript
// ❌ WRONG - Generated pages NEVER go in common folder
/SBS_Automation/pages/common/generated-page.js

// ✅ CORRECT - Generated pages ALWAYS go in auto-coder folder
/SBS_Automation/pages/auto-coder/generated-page.js
```

### **5. ❌ TRY-CATCH IN STEPS - SBS VIOLATION**
```javascript
// ❌ WRONG - NO error handling in step definitions
Then('Alex verifies result', async function() {
  try {  // ❌ FORBIDDEN - violates SBS pattern
    await new Page(this.page).verify();
  } catch (error) {
    throw new Error('Verification failed');
  }
});

// ✅ CORRECT - Clean delegation - SBS compliant
Then('Alex verifies result', async function() {
  await new Page(this.page).verifyResult();
});
```

### **❌ CRITICAL ERROR #6: WRONG PAGE LOCATION - BLOCKS DEPLOYMENT**

#### **⚠️ MANDATORY FILE LOCATION COMPLIANCE:**
```javascript
// ❌ WRONG - Creates wrong folder structure in SOURCE
/auto-coder/SBS_Automation/pages/auto-coder/page.js  // FORBIDDEN SOURCE STRUCTURE
/auto-coder/SBS_Automation/pages/common/page.js      // FORBIDDEN FOR GENERATED FILES

// ✅ CORRECT - Proper source structure  
/auto-coder/SBS_Automation/pages/page.js  // REQUIRED FLAT STRUCTURE

// DEPLOYMENT RESULT (auto-coder creates target subfolders):
/SBS_Automation/auto-coder/pages/page.js  // ✅ Correct target with auto-coder subfolder

// ❌ WRONG - Import path includes auto-coder
const Page = require('../pages/auto-coder/page');  // FORBIDDEN

// ✅ CORRECT - Clean import path
const Page = require('../pages/page');  // REQUIRED
```

### **❌ CRITICAL ERROR #7: FORBIDDEN LOGGING & ERROR HANDLING**

#### **⚠️ ABSOLUTELY FORBIDDEN IN ALL FILES:**
```javascript
// ❌ FORBIDDEN - FRAMEWORK VIOLATIONS
console.log('message');        // NEVER IN ANY FILE
console.error('error');        // NEVER IN ANY FILE
try { } catch { }             // NEVER IN STEP FILES
if (condition) { }            // NEVER IN STEP FILES
```

#### **✅ ONLY ALLOWED PATTERNS:**
```javascript
// ✅ CORRECT: Clean step delegation
When('Alex performs action', async function() {
  await new PageClass(this.page).performAction();
});

// ✅ CORRECT: Simple page methods
async performAction() {
  await this.clickElement(BUTTON_SELECTOR);
}
```

### **⚠️ DEPLOYMENT TARGET GUARANTEE:**
```
GENERATION (source):
auto-coder/SBS_Automation/pages/my-page.js  ← NO auto-coder subfolder

DEPLOYMENT (target):  
SBS_Automation/auto-coder/pages/my-page.js  ← auto-coder subfolder created
```

## 🚨 **CRITICAL CONSISTENCY RULE - NEVER BE INCONSISTENT**

### **⚠️ USER FEEDBACK MANDATE: "You are very inconsistent. why so? Last time you generated perfect image to test artifacts. But this time, not."**

**🎯 ABSOLUTE REQUIREMENT:** 
- **EVERY image analysis MUST be systematic and complete**
- **NEVER generate generic artifacts** when specific requirements exist
- **ALWAYS extract ALL visible elements** from images
- **MAINTAIN same quality standard** on every generation
- **NO excuses for inconsistency** - deliver perfection every time

### **📋 CONSISTENCY ENFORCEMENT CHECKLIST:**
**BEFORE EVERY GENERATION - VALIDATE:**
- [ ] ✅ **Requirement analyzed completely** (not assumed or generic)
- [ ] ✅ **All image elements extracted** (headers, sub-headers, badges, buttons, text, paragraphs, checkboxes, links, images)
- [ ] ✅ **Exact text content documented** (character-perfect spelling and capitalization)
- [ ] ✅ **Test scenarios map to actual visible elements** (not generic assumptions)
- [ ] ✅ **File naming matches requirement exactly** (req-cfc-promo → req-cfc-promo.feature)
- [ ] ✅ **SBS compliance maintained** (correct paths, no forbidden code patterns)

### **🎯 LEARNING INTEGRATION:**
**User has taught me:**
1. **"Analyse the image, elements in image like text, buttons, links, text, paragraph, headers, sub-headers, badges, check-boxes"**
2. **"So that it's easy for you to generate test artifacts with them and we can verify them"**
3. **"I don't have to teach you every time to do the job"**

**🚨 RESPONSE:** Every image will get complete systematic analysis of ALL elements to enable perfect test artifact generation and verification.

### **✅ PROMISE OF CONSISTENCY:**
- **EVERY requirement** will get thorough analysis
- **EVERY image** will be systematically scanned for ALL elements
- **EVERY artifact** will match the requirement exactly
- **NO MORE inconsistency** - maintain excellence standard always