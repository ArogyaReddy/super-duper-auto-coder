# 🚨 **ABSOLUTE CRITICAL RULE #0: MANDATORY REQUIREMENT ANALYSIS FIRST**

## **⚠️ NEVER GENERATE WITHOUT UNDERSTANDING THE REQUIREMENT:**
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

## 🖼️ **CRITICAL IMAGE ANALYSIS GUIDELINES**

### **⚠️ MANDATORY SYSTEMATIC IMAGE SCANNING:**

1. **📍 SCAN ALL VISIBLE ELEMENTS (Top→Bottom, Left→Right):**
   - **Exact Headers/Titles**: "Take control of your cash flow" (not "cash flow header")
   - **Exact Button Text**: "Learn more" (not "learnmore" or "learn_more") 
   - **Status Badges**: "New", "Beta", "Coming Soon" (include all visible)
   - **Content Text**: Descriptive paragraphs and explanations
   - **Visual Elements**: Images, graphics, icons, previews
   - **Interactive Elements**: Links, buttons, form fields

2. **📝 EXACT TEXT EXTRACTION MANDATORY:**
   - **Copy text exactly** as shown - no paraphrasing or abbreviation
   - **Preserve capitalization** and spacing ("Learn more" not "learnmore")
   - **Include all badges** and status indicators visible
   - **Document exact wording** of headers and descriptions
   - **Note placeholder text** in inputs and fields

3. **🎯 TEST ONLY WHAT'S VISIBLE:**
   - Create steps for elements actually shown in image
   - Don't assume functionality not visible
   - Use exact text from image in test steps
   - Map visible interactions to test scenarios
   - Verify layout and positioning as shown

4. **🚫 FORBIDDEN IMAGE ANALYSIS MISTAKES:**
   - ❌ Modifying button text ("learnmore" instead of "Learn more")
   - ❌ Adding responsive scenarios not shown
   - ❌ Assuming edge cases not visible
   - ❌ Creating generic validation steps
   - ❌ Ignoring visible badges or status indicators

### **📋 IMAGE SCANNING CHECKLIST:**
- [ ] All visible text copied exactly (spelling, capitalization, spacing)
- [ ] All buttons/links identified with exact labels
- [ ] All badges/status indicators documented
- [ ] All visual elements (images, graphics) noted
- [ ] Test steps use exact text from image
- [ ] No assumptions about non-visible functionality

### **✅ PROPER IMAGE-TO-FEATURE CONVERSION:**
```gherkin
# ✅ CORRECT: Matches actual image content
Scenario: CFC promotional section displays correctly
  Then Alex verifies the "New" badge is displayed
  And Alex verifies the "Take control of your cash flow" header is visible
  And Alex verifies the "Learn more" button is visible
  And Alex verifies the invoice preview image is displayed

# ❌ WRONG: Modified text and assumptions  
Scenario: CFC promo section works across devices
  Then Alex verifies the learnmore button is clickable
  And Alex verifies responsive design is optimal
  And Alex verifies accessibility compliance
```

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

---

# 🚨 **CRITICAL LESSONS FROM 4-HOUR INTENSIVE SESSION**

## **TOP 5 MOST CRITICAL ISSUES THAT CAUSED 100% FAILURES:**

### **1. ⚠️ CASE SENSITIVITY (100% FAILURE)**
- **Issue**: Generated "Learn More" but image showed "Learn more"
- **Impact**: ALL locators fail, ALL button clicks fail
- **Fix**: Character-level OCR precision for image text extraction

### **2. ⚠️ AMBIGUOUS STEPS (100% CONFLICT)**  
- **Issue**: Created `Alex navigates to {string} page` conflicting with 10+ SBS steps
- **Impact**: Ambiguous step definitions, test execution failures
- **Fix**: Context-specific prefixes: `Alex verifies the billing invoices {string}`

### **3. ⚠️ WRONG FILE NAMING (100% TRACEABILITY LOSS)**
- **Issue**: Created `cfc-activation-consent.feature` instead of `jira-cfc-contest.feature`
- **Impact**: Cannot map requirements to test files
- **Fix**: Use EXACT requirement file name (minus extension)

### **4. ⚠️ INCONSISTENT PARAMETERS (UNDEFINED STEPS)**
- **Issue**: Mixed "an Accept" vs "a Decline" causing undefined steps
- **Impact**: Step definitions not found, test execution stops
- **Fix**: ALL similar steps must use IDENTICAL article patterns

### **5. ⚠️ WRONG PERSONA (FRAMEWORK VIOLATIONS)**
- **Issue**: Used "I" instead of "Alex" - SBS only supports "Alex"
- **Impact**: Step definitions not found in SBS framework
- **Fix**: ALWAYS use "Alex" persona exclusively

### **6. ⚠️ IF-ELSE LOGIC IN STEPS (FRAMEWORK VIOLATION)**
- **Issue**: Added if-else, try-catch, or business logic in step definitions
- **Impact**: Violates SBS pattern - steps must be pure delegation only
- **Fix**: Steps delegate to page methods, ALL logic goes in page objects

### **7. ⚠️ WRONG LOCATOR PLACEMENT (PATTERN VIOLATION)**
- **Issue**: Put locators as getter methods inside class instead of constants before class
- **Impact**: Violates SBS page object pattern and structure
- **Fix**: All locators as constants at top of file, BEFORE class definition

## **PREVENTION STRATEGY:**
✅ **Every generation MUST validate these 7 critical points before proceeding**  
✅ **Use prevention checklist: `/docs/PREVENTION-CHECKLIST-FUTURE-SESSIONS.md`**  
✅ **Reference complete registry: `/docs/CRITICAL-ISSUES-REGISTRY-4-HOUR-SESSION.md`**

---

# REQUIREMENT-DRIVEN TEST ARTIFACT GENERATION

## 🎯 MISSION: Generate Perfect Test Artifacts from Requirements

You are an expert test automation engineer specializing in generating **PRECISE** test artifacts from requirements (text, images, documents). Your goal is to create test artifacts that match **EXACTLY** what is specified in the requirements with **ZERO ASSUMPTIONS**.

## 🚨 **CRITICAL PRIORITY #0: NEVER SAVE TO MAIN SBS_AUTOMATION**

### **⚠️ MANDATORY FILE LOCATION RULE:**
**ALWAYS** save generated test artifacts to:
- ✅ `/auto-coder/SBS_Automation/features/`
- ✅ `/auto-coder/SBS_Automation/steps/`
- ✅ `/auto-coder/SBS_Automation/pages/`
- ✅ `/auto-coder/SBS_Automation/data/`

**NEVER** save generated test artifacts to:
- ❌ `/SBS_Automation/features/` (main framework)
- ❌ `/SBS_Automation/steps/` (main framework)
- ❌ `/SBS_Automation/pages/` (main framework)
- ❌ `/SBS_Automation/data/` (main framework)

### **⚠️ MANDATORY IDENTICAL FILE NAMING RULE:**
**🚨 CRITICAL: File names MUST match the EXACT requirement file name**

All generated test artifact files MUST use the **EXACT** requirement file name as base:

**REQUIREMENT FILE:** `auto-coder/requirements/text/jira-cfc-contest.txt`
**GENERATED ARTIFACTS:**
- ✅ `jira-cfc-contest.feature`
- ✅ `jira-cfc-contest-steps.js`
- ✅ `jira-cfc-contest-page.js` (MUST end with `-page.js`)
- ✅ `jira-cfc-contest-data.json`

**FILE NAMING EXTRACTION PROCESS:**
1. Take requirement file name: `jira-cfc-contest.txt`
2. Remove file extension: `jira-cfc-contest`
3. Use as exact base name for all artifacts
4. Add appropriate suffixes: `-steps.js`, `-page.js`, `-data.json`

**MORE EXAMPLES:**
- **REQ:** `billing-invoices-setup.txt` → **ARTIFACTS:** `billing-invoices-setup.feature`, `billing-invoices-setup-steps.js`, `billing-invoices-setup-page.js`
- **REQ:** `user-login-validation.txt` → **ARTIFACTS:** `user-login-validation.feature`, `user-login-validation-steps.js`, `user-login-validation-page.js`
- **REQ:** `payroll-calculation.txt` → **ARTIFACTS:** `payroll-calculation.feature`, `payroll-calculation-steps.js`, `payroll-calculation-page.js`
- **REQ:** `complex-business-workflow.txt` → **ARTIFACTS:** `complex-business-workflow.feature`, `complex-business-workflow-steps.js`, `complex-business-workflow-page.js`

**NEVER interpret, modify, or simplify the requirement file name:**
- ❌ `cfc-activation-consent.feature` (interpreted name)
- ❌ `user-authentication.feature` (modified name)
- ❌ `simplified-name.feature` (shortened name)
- ❌ `contest.feature` (truncated name)
- ✅ Use the EXACT requirement file name (without extension) as base

### **⚠️ MANDATORY FLAT FOLDER STRUCTURE RULE:**
**NEVER** create project subfolders:
- ❌ `features/cfc/` (no project folders)
- ❌ `pages/runMod/modal/` (no nested folders)
- ❌ `steps/project-name/` (no project folders)
- ✅ Direct placement in main subfolders only

### **⚠️ MANDATORY CORRECT BACKGROUND RULE:**
**ALWAYS** use the existing SBS Background pattern:
```gherkin
Background:
  Given Alex is logged into RunMod with a homepage test client
  Then Alex verifies that the Payroll section on the Home Page is displayed
```

**NEVER** create custom Background steps:
- ❌ `Given I am on the SBS landing page`
- ❌ `Given user logs in with valid credentials`
- ❌ Any custom login/navigation Background steps
- ✅ Use the EXACT existing SBS Background pattern only

## 🚨 **CRITICAL RULE #1: SBS PAGE OBJECT STRUCTURE COMPLIANCE**

### **✅ MANDATORY PAGE OBJECT STRUCTURE - MATCH EXACTLY:**
```javascript
const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

// Locators ABOVE the class - NEVER in constructor
const ELEMENT_SELECTOR = By.css('[data-test-id="element"]');
const BUTTON_SELECTOR = By.xpath("//button[@data-test-id='button']");
const INPUT_FIELD = By.id('input-field');

class PageObjectName extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async performAction() {
    await this.clickElement(BUTTON_SELECTOR);
  }

  async verifyResult() {
    return await this.isVisible(ELEMENT_SELECTOR, 5);
  }
}

module.exports = PageObjectName;
```

### **❌ FORBIDDEN PAGE OBJECT PATTERNS:**
```javascript
// WRONG - locators in constructor
class PageObject {
    constructor(page) {
        this.page = page;
        this.elementSelector = '[data-testid="element"]'; // WRONG
    }
}

// WRONG - not extending BasePage
class PageObject {
    constructor(page) {
        this.page = page; // WRONG - missing super(page)
    }
}

// WRONG - using Playwright expect directly
const { expect } = require('@playwright/test'); // WRONG - use BasePage methods
```

## 🚨 **CRITICAL RULE #2: SBS STEP DEFINITION PATTERNS**

### **✅ MANDATORY STEP PATTERNS - MATCH EXACTLY:**
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const PageObject = require('../pages/page-object-page');

When('Alex performs some specific action', async function () {
    await new PageObject(this.page).performAction();
});

Then('Alex verifies some specific result', async function () {
    const result = await new PageObject(this.page).verifyResult();
    if (!result) {
        throw new Error('Detailed verification failed message');
    }
});
```

### **❌ FORBIDDEN STEP PATTERNS:**
```javascript
// WRONG - First person pronouns
When('I perform some action', async function () { // WRONG - use "Alex"

// WRONG - storing page objects
this.pageObject = new PageObject(this.page); // WRONG - direct instantiation only

// WRONG - direct Playwright expectations
await expect(this.page.locator('selector')).toBeVisible(); // WRONG - use BasePage methods
```

## 🚨 **CRITICAL RULE #3: DIRECT PAGE OBJECT INSTANTIATION**

### **✅ CORRECT PATTERN - ALWAYS USE THIS:**
```javascript
// In every step definition - direct instantiation
When('Alex performs an action', async function () {
    await new PageObject(this.page).performAction();
});

Then('Alex verifies something', async function () {
    const result = await new PageObject(this.page).verifyResult();
    if (!result) {
        throw new Error('Verification failed');
    }
});
```

### **❌ FORBIDDEN PATTERNS - NEVER USE:**
```javascript
// WRONG - storing in this.pageObject
When('Alex performs an action', async function () {
    this.pageObject = new PageObject(this.page);
    await this.pageObject.performAction();
});

// WRONG - reusing stored instances
Then('Alex verifies something', async function () {
    await this.pageObject.verifyResult();
});
```

## 🚨 **CRITICAL RULE #2A: RESILIENT LOCATOR STRATEGY**

### **✅ MANDATORY RESILIENT LOCATOR PATTERNS - ALWAYS USE COMBINED STRATEGIES:**

```javascript
// ✅ RESILIENT STATIC LOCATORS - Primary | Secondary | Fallback
const PAGE_TITLE = By.css('[data-test-id="page-title"] | h1.page-title | .title-header');
const SUBMIT_BUTTON = By.xpath('//button[@data-test-id="submit"] | //input[@type="submit"] | //button[contains(text(),"Submit")]');
const MODAL_CONTAINER = By.css('[data-test-id="modal"] | .modal-dialog | [role="dialog"]');

// ✅ RESILIENT PARAMETERIZED LOCATORS - Multiple fallback strategies  
const BUTTON_ELEMENT = (btnName) => By.xpath(`//sdf-button[text()="${btnName}"] | //button[contains(text(),"${btnName}")] | //*[@aria-label="${btnName}"]`);
const LEFT_NAV_ICON = (leftNavName) => By.xpath(`//sdf-icon[@data-test-id='${leftNavName}-icon'] | //button[@data-test-id='${leftNavName}-btn'] | //*[@title='${leftNavName}']`);
const SUBMISSION_BUTTON = (submissionButton) => By.xpath(`//sdf-button[contains(.,"${submissionButton}")] | //button[contains(.,"${submissionButton}")] | //*[@value="${submissionButton}"]`);
const MODAL_HEADER = (headerText) => By.xpath(`//sdf-focus-pane[@heading="${headerText}"] | //h1[contains(text(),"${headerText}")] | //*[@data-test-id="${headerText}-header"]`);
const SDF_MODAL_BUTTON = (buttonText) => By.css(`[aria-label*='${buttonText}'] | [title*='${buttonText}'] | button:contains('${buttonText}')`);
```

### **✅ RESILIENT LOCATOR BENEFITS:**
- **Higher Success Rate**: If primary locator fails, secondary/fallback still work
- **Reduced Maintenance**: One locator handles multiple selector strategies
- **Better Reporting**: Clear failure indication with all attempted strategies
- **SDF Compliance**: Matches SDF framework patterns from main SBS_Automation

### **❌ FORBIDDEN SINGLE-STRATEGY LOCATORS:**
```javascript
// WRONG - Single strategy (not resilient)
const BUTTON_SELECTOR = By.css('[data-test-id="button"]'); // WRONG - no fallback
const INPUT_FIELD = By.id('input-field'); // WRONG - no alternatives

// WRONG - Separate constants for same element
const PRIMARY_BUTTON = By.css('[data-test-id="button"]'); // WRONG
const SECONDARY_BUTTON = By.xpath('//button[@id="button"]'); // WRONG  
const FALLBACK_BUTTON = By.css('.button-class'); // WRONG
```

## 🚨 **CRITICAL RULE #4: EXTREME IMAGE TEXT ANALYSIS ACCURACY**

### **⚠️ MANDATORY CHARACTER-LEVEL TEXT EXTRACTION:**
When generating from images, MUST analyze text with **OCR-LEVEL PRECISION**:
- **Case Sensitivity**: "Learn More" vs "Learn more" = **100% TEST FAILURE**
- **Spacing Accuracy**: "Log In" vs "Login" = **100% TEST FAILURE**  
- **Punctuation Precision**: "Submit!" vs "Submit" = **100% TEST FAILURE**
- **Article Consistency**: "an Accept" vs "a Accept" = **UNDEFINED STEP**

### **✅ MANDATORY IMAGE ANALYSIS PROCESS:**
1. **Character-by-Character Extraction**: Analyze every pixel for exact text
2. **Case Verification**: Preserve exact capitalization from image
3. **Spacing Verification**: Count spaces between words precisely
4. **Punctuation Verification**: Include all visible punctuation marks
5. **Cross-Reference Validation**: Compare multiple UI elements for consistency

### **❌ FORBIDDEN ASSUMPTIONS:**
```gherkin
# WRONG - Assuming standard capitalization
When Alex clicks the "Learn More" button  # ❌ Image shows "Learn more"

# WRONG - Adding articles without verification  
And Alex should see a "Decline" button    # ❌ Step pattern doesn't match "Accept"

# WRONG - Generic text patterns
Alex verifies {string} displayed          # ❌ CONFLICTS with 20+ existing steps
```

### **✅ CORRECT PRECISION PATTERNS:**
```gherkin
# CORRECT - Exact case from image
When Alex clicks the "Learn more" button  # ✅ Matches image exactly

# CORRECT - Consistent article patterns
And Alex should see an "Accept" button    # ✅ Both use "an"
And Alex should see an "Decline" button   # ✅ Consistent pattern

# CORRECT - Context-specific to avoid conflicts
Alex verifies the billing invoices {string} is displayed  # ✅ Unique context
```

## 🚨 **CRITICAL RULE #5: MANDATORY AMBIGOUS STEP PREVENTION**

### **⚠️ BEFORE CREATING ANY STEP - MANDATORY VALIDATION:**
```bash
# MUST run these searches BEFORE writing step definitions:
grep_search "Alex navigates to.*page" SBS_Automation/steps/**/*.js
grep_search "Alex clicks.*button" SBS_Automation/steps/**/*.js  
grep_search "Alex verifies.*displayed" SBS_Automation/steps/**/*.js
```

### **❌ FORBIDDEN AMBIGOUS PATTERNS - NEVER USE:**
```gherkin
# ❌ CONFLICTS with 10+ existing SBS steps
When Alex navigates to {string} page

# ❌ CONFLICTS with 20+ existing SBS steps  
When Alex clicks {string} button

# ❌ CONFLICTS with 20+ existing SBS steps
Then Alex verifies {string} displayed

# ❌ CONFLICTS with multiple SBS steps
Then {string} page title is displayed
```

### **✅ MANDATORY SAFE PATTERNS - ALWAYS USE:**
```gherkin
# ✅ Context-specific - billing invoices
When Alex verifies the billing invoices {string} exists and is clickable

# ✅ Context-specific - cfc activation  
When Alex clicks the cfc activation {string} button

# ✅ Context-specific - employee onboarding
Then Alex verifies the employee onboarding {string} is displayed

# ✅ Reuse existing SBS steps
When Alex navigates to Billing Home page  # ✅ Already exists in SBS
```

## 🚨 **CRITICAL RULE #6: MANDATORY EXISTING SBS STEP REUSE**

### **⚠️ SEARCH AND REUSE EXISTING SBS STEPS FIRST:**
BEFORE creating any step definition, MUST search for existing SBS patterns:

```bash
# Search existing navigation steps
grep_search "Alex navigates to" SBS_Automation/steps/**/*.js

# Search existing verification steps  
grep_search "should be displayed" SBS_Automation/steps/**/*.js

# Search existing action steps
grep_search "Alex clicks" SBS_Automation/steps/**/*.js
```

### **✅ PROVEN EXISTING SBS STEPS TO REUSE:**
```gherkin
# ✅ Navigation - Use existing SBS steps
When Alex navigates to Billing Home page              # EXISTS in SBS
When Alex navigates to State Tax page                 # EXISTS in SBS  
When Alex navigates to Historical Payroll page        # EXISTS in SBS

# ✅ Verification - Use existing SBS steps
Then Billing Homepage should be displayed             # EXISTS in SBS
Then Billing & Invoices page is displayed            # EXISTS in SBS
Then State Tax page should be displayed              # EXISTS in SBS

# ✅ Menu Navigation - Use existing SBS methods
this.leftNav.navigateToPayroll()                     # EXISTS in SBS
this.leftNav.navigateToStateAndLocalTax()           # EXISTS in SBS
```

### **❌ NEVER CREATE WHEN SBS VERSION EXISTS:**
```gherkin
# WRONG - Creating new when SBS version exists
When Alex navigates to the billing page              # ❌ Use: "Alex navigates to Billing Home page"
Then billing page should be displayed                # ❌ Use: "Billing Homepage should be displayed"
```

## 🚨 **CRITICAL RULE #7: MANDATORY PARAMETER CONSISTENCY**

### **⚠️ ARTICLE PATTERN CONSISTENCY:**
ALL parameterized steps with similar patterns MUST use IDENTICAL articles:

```gherkin
# ✅ CORRECT - Consistent "an {string}" pattern
And Alex should see an "Accept" button
And Alex should see an "Decline" button  
And Alex should see an "Submit" button

# ❌ WRONG - Mixed article patterns
And Alex should see an "Accept" button    # Uses "an"
And Alex should see a "Decline" button    # Uses "a" - INCONSISTENT
```

### **⚠️ PARAMETER VERIFICATION CHECKLIST:**
- [ ] All similar steps use same article ("a" or "an")
- [ ] All similar steps use same parameter position  
- [ ] All similar steps use same parameter name
- [ ] All similar steps have corresponding step definitions

## 🚨 **CRITICAL RULE #8: MANDATORY SBS PERSONA COMPLIANCE**

### **⚠️ ALWAYS USE "ALEX" - NEVER OTHER PERSONAS:**
```gherkin
# ✅ CORRECT - SBS framework uses "Alex"
When Alex navigates to the billing page
Then Alex verifies the invoice is displayed
And Alex clicks the submit button

# ❌ WRONG - Other personas not supported by SBS
When I navigate to the billing page       # ❌ "I" not supported
When user clicks the submit button        # ❌ "user" not supported  
When the admin verifies the page          # ❌ "admin" not supported
```

## 🚨 **CRITICAL RULE #9: MANDATORY ERROR PREVENTION VALIDATION**

### **⚠️ POST-GENERATION VALIDATION CHECKLIST:**
After generating ANY artifacts, MUST validate:
- [ ] **File Naming**: Matches EXACT requirement file name (minus extension)
- [ ] **Text Accuracy**: All text from images matches character-for-character
- [ ] **Step Uniqueness**: No conflicts with existing SBS steps  
- [ ] **Import Paths**: Correct relative paths to generated files
- [ ] **SBS Compliance**: All patterns follow established SBS framework
- [ ] **Parameter Consistency**: All similar steps use identical patterns
- [ ] **Persona Compliance**: All steps use "Alex" persona only

### **⚠️ IMMEDIATE FIXES REQUIRED IF:**
- ❌ Any step pattern conflicts with existing SBS steps
- ❌ Any text differs from image source (case, spacing, punctuation)
- ❌ Any file name doesn't match requirement file exactly
- ❌ Any step uses "I", "user", or other personas besides "Alex"
- ❌ Any similar steps use inconsistent article patterns

## 🚨 **CRITICAL RULE #10: MANDATORY ATOMIC FILE OPERATIONS**

### **⚠️ PREVENT RACE CONDITIONS AND FILE CORRUPTION:**
ALWAYS use atomic file operations to prevent empty or corrupted files:

```javascript
// ✅ CORRECT - Atomic file writing
const tempFile = filePath + '.tmp';
await writeFile(tempFile, content);
await rename(tempFile, filePath);

// ❌ WRONG - Direct writing (race condition risk)
await writeFile(filePath, content);  // Can create empty files
```

### **⚠️ IMMEDIATE VALIDATION AFTER WRITING:**
```javascript
// MUST validate file content immediately after creation
const writtenContent = await readFile(filePath, 'utf8');
if (!writtenContent.trim()) {
    throw new Error(`File ${filePath} is empty or corrupted`);
}
```

## 🚨 **CRITICAL RULE #11: MANDATORY SIMPLE STEP DEFINITIONS - NO LOGIC**

### **⚠️ STEP DEFINITIONS MUST BE PURE DELEGATION ONLY:**
SBS framework requires step definitions to be **EXTREMELY SIMPLE** with **ZERO BUSINESS LOGIC**:

```javascript
// ✅ CORRECT - Pure delegation to page object (SBS Standard)
Then('Alex verifies the billing invoices page is displayed', async function () {
    await new BillingInvoicesPage(this.page).verifyPageDisplayed();
});

When('Alex clicks the submit button', async function () {
    await new BillingInvoicesPage(this.page).clickSubmitButton();
});

// ✅ CORRECT - Simple delegation without any logic
Then('the CFC promotional content should be displayed', async function () {
    await new CfcPromoPage(this.page).verifyContentDisplayed();
});
```

### **❌ FORBIDDEN PATTERNS - NEVER USE IN STEP DEFINITIONS:**
```javascript
// ❌ WRONG - if-else logic in steps (SBS VIOLATION)
Then('Alex verifies content is displayed', async function () {
    const isDisplayed = await new PageObject(this.page).checkContent();
    if (!isDisplayed) {  // ❌ FORBIDDEN
        throw new Error('Content not displayed');
    }
});

// ❌ WRONG - try-catch in steps (SBS VIOLATION)
When('Alex performs action', async function () {
    try {  // ❌ NO TRY-CATCH IN STEPS
        await new PageObject(this.page).performAction();
    } catch (error) {
        throw new Error('Action failed');
    }
});

// ❌ WRONG - variable assignments in steps (SBS VIOLATION)
Then('Alex verifies result', async function () {
    const result = await new PageObject(this.page).getResult();  // ❌ NO VARIABLES
    const isValid = result.isValid();  // ❌ NO BUSINESS LOGIC
});

// ❌ WRONG - conditional logic in steps (SBS VIOLATION)
When('Alex handles response', async function () {
    const response = await new PageObject(this.page).getResponse();
    if (response.status === 200) {  // ❌ NO CONDITIONALS
        // handle success
    } else {
        // handle error
    }
});
```

## 🚨 **CRITICAL RULE #0A: FUNDAMENTAL SBS FRAMEWORK VIOLATIONS - NEVER REPEAT**

### **⚠️ THESE ARE THE MOST CRITICAL MISTAKES THAT CAUSE 100% FAILURES:**

### **1. ❌ WRONG BASEPAGE REFERENCE - ALWAYS FAILS**
```javascript
// ❌ WRONG - This path NEVER works
const BasePage = require('./base-page');

// ✅ CORRECT - This is the ONLY correct path
const BasePage = require('../common/base-page');
```

### **2. ❌ IF-ELSE LOGIC IN STEPS - FRAMEWORK VIOLATION**
```javascript
// ❌ WRONG - NO IF-ELSE in step definitions EVER
When('Alex clicks the {string} button', async function(buttonText) {
  if (buttonText === 'Learn more') {  // ❌ FORBIDDEN
    await new Page(this.page).clickLearnMoreButton();
  }
});

// ✅ CORRECT - Pure delegation only
When('Alex clicks the {string} button', async function(buttonText) {
  await new Page(this.page).clickLearnMoreButton();
});
```

### **3. ❌ STATIC TEXT COMPARISONS - NOT NEEDED**
```javascript
// ❌ WRONG - These conditions are NEVER needed
if (headerText === 'Take control of your cash flow') {  // ❌ FORBIDDEN
if (badgeText === 'New') {  // ❌ FORBIDDEN
if (buttonText === 'Learn more') {  // ❌ FORBIDDEN

// ✅ CORRECT - Direct method calls only
await new Page(this.page).verifyHeader();
await new Page(this.page).verifyBadge();
await new Page(this.page).verifyButton();
```

### **4. ❌ WRONG PAGE LOCATION - DEPLOYMENT FAILURE**
```javascript
// ❌ WRONG - NEVER use /pages/common/ for generated pages
/SBS_Automation/pages/common/generated-page.js

// ✅ CORRECT - ALWAYS use /pages/auto-coder/ for generated pages
/SBS_Automation/pages/auto-coder/generated-page.js
```

### **5. ❌ TRY-CATCH IN STEPS - FRAMEWORK VIOLATION**
```javascript
// ❌ WRONG - NO try-catch in step definitions EVER
Then('Alex verifies result', async function() {
  try {  // ❌ FORBIDDEN
    await new Page(this.page).verifyResult();
  } catch (error) {
    throw new Error('Failed');
  }
});

// ✅ CORRECT - Direct delegation only
Then('Alex verifies result', async function() {
  await new Page(this.page).verifyResult();
});
```

### **❌ CRITICAL ERROR #6: WRONG PAGE FILE LOCATION - DEPLOYMENT FAILURE**

#### **⚠️ MANDATORY PAGE FILE LOCATION RULES:**
```javascript
// ❌ WRONG - NEVER create auto-coder subfolder in source pages
/auto-coder/SBS_Automation/pages/auto-coder/my-page.js  // FORBIDDEN

// ✅ CORRECT - Pages go directly in source pages folder
/auto-coder/SBS_Automation/pages/my-page.js  // REQUIRED

// ❌ WRONG - Step import path with auto-coder subfolder
const Page = require('../pages/auto-coder/my-page');  // FORBIDDEN

// ✅ CORRECT - Step import path without subfolder
const Page = require('../pages/my-page');  // REQUIRED
```

#### **⚠️ DEPLOYMENT TARGET STRUCTURE:**
```
SOURCE (generation):
auto-coder/SBS_Automation/features/my-feature.feature
auto-coder/SBS_Automation/steps/my-steps.js  
auto-coder/SBS_Automation/pages/my-page.js  // NO auto-coder subfolder
auto-coder/SBS_Automation/data/my-data.json

TARGET (deployment):
SBS_Automation/auto-coder/features/my-feature.feature
SBS_Automation/auto-coder/steps/my-steps.js
SBS_Automation/auto-coder/pages/my-page.js  // auto-coder subfolder in target
SBS_Automation/auto-coder/data/my-data.json
```

### **❌ CRITICAL ERROR #7: FORBIDDEN CODE PATTERNS - FRAMEWORK VIOLATIONS**

#### **⚠️ ABSOLUTELY FORBIDDEN IN ALL GENERATED FILES:**

```javascript
// ❌ FORBIDDEN #1: NO console.log() EVER
console.log('anything');  // FRAMEWORK VIOLATION
console.error('anything');  // FRAMEWORK VIOLATION
console.warn('anything');  // FRAMEWORK VIOLATION

// ❌ FORBIDDEN #2: NO try-catch EVER  
try {
  await action();
} catch (error) {
  // handle error
}  // FRAMEWORK VIOLATION

// ❌ FORBIDDEN #3: NO if-else in Steps EVER
if (condition) {
  await action();
}  // FRAMEWORK VIOLATION IN STEPS

// ❌ FORBIDDEN #4: NO business logic in Steps
const result = await page.getResult();
if (result.isValid()) {
  // process result
}  // FRAMEWORK VIOLATION IN STEPS
```

#### **✅ REQUIRED PATTERNS ONLY:**
```javascript
// ✅ CORRECT: Pure delegation in steps
When('Alex performs action', async function() {
  await new PageClass(this.page).performAction();
});

// ✅ CORRECT: Simple page methods  
async performAction() {
  await this.clickElement(BUTTON_SELECTOR);
}

// ✅ CORRECT: BasePage method usage
async verifyElement() {
  await this.verifyElementIsDisplayed(ELEMENT_SELECTOR, 'Element name');
}
```

### **⚠️ MANDATORY PREVENTION CHECKLIST - VALIDATE EVERY GENERATION:**
- [ ] Page files saved to `/auto-coder/SBS_Automation/pages/` (NO auto-coder subfolder)
- [ ] Step imports use `../pages/page-name` (NO auto-coder in path)
- [ ] ZERO console.log() statements in any file
- [ ] ZERO try-catch blocks in any file
- [ ] ZERO if-else statements in step files
- [ ] Steps are pure delegation only
- [ ] Deployment creates `/SBS_Automation/auto-coder/pages/` structure
