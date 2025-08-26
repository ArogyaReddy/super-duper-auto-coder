# MASTER TEST ARTIFACT GENERATION GUIDE

## 🎯 OBJECTIVE: Perfect Requirement-to-Test Transformation

This guide establishes the **GOLD STANDARD** for generating test artifacts from any type of requirement (images, text, documents, specifications).

## 🚨 **CRITICAL PRIORITY #0: NEVER SAVE TO MAIN SBS_AUTOMATION**

### **⚠️ MANDATORY FILE LOCATION RULE:**
**ALWAYS** save generated test artifacts to:
- ✅ `/auto-coder/SBS_Automation/features/`
- ✅ `/auto-coder/SBS_Automation/steps/`
- ✅ `/auto-coder/SBS_Automation/pages/`
- ✅ `/auto-coder/SBS_Automation/data/`

### **⚠️ MANDATORY IDENTICAL FILE NAMING RULE:**
**File names MUST match EXACT requirement file name (minus extension)**

**NAMING EXTRACTION PROCESS:**
1. REQ FILE: `jira-cfc-contest.txt`
2. REMOVE EXTENSION: `jira-cfc-contest`
3. USE AS BASE FOR ALL ARTIFACTS

**GENERATED FILES:**
- ✅ `jira-cfc-contest.feature`
- ✅ `jira-cfc-contest-steps.js`
- ✅ `jira-cfc-contest-page.js` (MUST end with `-page.js`)
- ✅ `jira-cfc-contest-data.json`

**MORE EXAMPLES:**
- **REQ:** `payment-processing.txt` → **FILES:** `payment-processing.feature`, `payment-processing-steps.js`, `payment-processing-page.js`
- **REQ:** `user-onboarding-flow.txt` → **FILES:** `user-onboarding-flow.feature`, `user-onboarding-flow-steps.js`, `user-onboarding-flow-page.js`

**FORBIDDEN NAMING:**
- ❌ `cfc-activation-consent-page.js` (interpreted name)
- ❌ `payment-modal-page.js` (extra descriptors)
- ❌ `contest-form-page.js` (truncated + extra descriptors)
- ✅ Use EXACT requirement file name as base

### **⚠️ MANDATORY FLAT FOLDER STRUCTURE RULE:**
**NEVER** create project subfolders:
- ❌ `features/payment/` (no project folders)
- ❌ `pages/billing/forms/` (no nested folders)
- ❌ `steps/module-name/` (no project folders)
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
- ❌ `Given Alex logs in with valid credentials`
- ❌ Any custom login/navigation Background steps
- ✅ Use the EXACT existing SBS Background pattern only

**This Background already exists in main SBS_Automation - do NOT create new steps for it**

**NEVER** save generated test artifacts to:
- ❌ `/SBS_Automation/features/` (main framework)
- ❌ `/SBS_Automation/steps/` (main framework)
- ❌ `/SBS_Automation/pages/` (main framework)
- ❌ `/SBS_Automation/data/` (main framework)

### **🎯 BLOCKER PREVENTION:**
This is a **BLOCKER ISSUE** if violated. Always check file paths before creating artifacts.

## 🚨 **CRITICAL PRIORITY #1: PREVENT AMBIGUOUS STEPS**

### **⚠️ MANDATORY PRE-GENERATION VALIDATION:**
BEFORE creating ANY new step definition:
1. **Search existing SBS steps**: `grep_search "step pattern" SBS_Automation/steps/**/*.js`
2. **If matches found**: REUSE existing step or modify pattern with context prefix
3. **If no matches**: Add domain-specific prefix (e.g., "billing invoices", "cfc activation")
4. **Validate uniqueness**: Run another search to confirm no conflicts

### **❌ FORBIDDEN AMBIGUOUS PATTERNS:**
```gherkin
Alex navigates to {string} page          # ❌ CONFLICTS with 10+ existing steps
Alex clicks {string} button             # ❌ CONFLICTS with 20+ existing steps  
Alex verifies {string} displayed        # ❌ CONFLICTS with 20+ existing steps
Alex verifies {string} page title is displayed  # ❌ CONFLICTS
Alex clicks {string} link               # ❌ CONFLICTS
```

### **✅ REQUIRED CONTEXT-SPECIFIC PATTERNS:**
```gherkin
# Navigation with context
Alex navigates to billing invoices {string} page
Alex navigates to cfc activation {string} page
Alex navigates to employee onboarding {string} page

# Actions with context  
Alex clicks the billing invoices {string} button
Alex clicks the cfc consent {string} button
Alex clicks the payroll summary {string} button

# Verifications with context
Alex verifies the billing invoices {string} is displayed
Alex verifies the cfc activation {string} is displayed
Alex verifies the employee management {string} is displayed
```

## 🚨 **CRITICAL RULE #2: PAGE OBJECT INSTANTIATION PATTERN**

### **❌ ANTI-PATTERN (NEVER DO THIS):**
```javascript
// WRONG - Storing page object in this.pageObject
Given('user is on page', async function () {
  this.pageObject = new PageObject(this.page);  // ❌ NEVER DO THIS
});

When('user clicks button', async function () {
  await this.pageObject.clickButton();  // ❌ BREAKS IDE SUPPORT
});
```

### **✅ CORRECT SBS FRAMEWORK PATTERN:**
```javascript
// CORRECT - Direct instantiation in each step
Given('user is on page', async function () {
  await new PageObject(this.page).ensurePageLoaded();  // ✅ ALWAYS DO THIS
});

When('user clicks button', async function () {
  await new PageObject(this.page).clickButton();  // ✅ ENABLES IDE SUPPORT
});

Then('user verifies result', async function () {
  const result = await new PageObject(this.page).getResult();  // ✅ SELF-CONTAINED
  assert.isTrue(result, 'Validation message');
});
```

### **🎯 WHY THIS IS MANDATORY:**
- **✅ IDE Support**: Enables "Go to Definition", "Find References", "Refactoring"
- **✅ SBS Compliance**: Matches framework patterns exactly
- **✅ Maintainability**: Each step is independent and traceable
- **✅ Debugging**: Better error tracking and step isolation
- **✅ Code Quality**: Cleaner, more professional implementation

### **📋 STEP GENERATION TEMPLATE:**
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');
const PageObjectClass = require('../../pages/path/page-object-class');

Given('Alex is on the page', async function () {
  await new PageObjectClass(this.page).navigateToPage();
});

When('Alex performs action', async function () {
  await new PageObjectClass(this.page).performAction();
});

Then('Alex verifies expected result', async function () {
  const isResultCorrect = await new PageObjectClass(this.page).validateResult();
  assert.isTrue(isResultCorrect, 'Expected result validation message');
});
```

## 📋 REQUIREMENT TYPES & APPROACHES

### 1. 🖼️ IMAGE REQUIREMENTS (Screenshots, UI Mockups, Wireframes)

#### **ANALYSIS PROTOCOL:**
1. **Visual Element Inventory**
   ```
   - Headers/Titles: [List all visible text headers]
   - Buttons: [List all clickable buttons with exact text]
   - Input Fields: [List all form fields with labels]
   - Links: [List all clickable links]
   - Text Content: [List all visible text]
   - Icons: [List all icons and their purposes]
   - Modals/Dialogs: [Identify any overlay elements]
   - Error/Success Messages: [Note any status messages]
   ```

2. **Interaction Flow Mapping**
   ```
   - What can users click?
   - What can users type?
   - What can users select?
   - What validations are visible?
   - What navigation paths exist?
   ```

3. **Test Scenario Generation**
   ```
   - Generate scenarios for each visible interaction
   - Create validation steps for each UI element
   - Include error handling for visible error states
   - Add accessibility testing for all elements
   ```

#### **🚨 CRITICAL RULE FOR IMAGES:**
**ONLY test what is VISUALLY PRESENT. No assumptions. No "should exist" features.**

### 2. 📝 TEXT REQUIREMENTS (Specifications, User Stories, BRDs)

#### **ANALYSIS PROTOCOL:**
1. **Functional Requirement Extraction**
   - Identify specific business rules
   - Map user scenarios described
   - Extract validation criteria
   - Note data requirements

2. **Scenario Mapping**
   - Convert requirements to test scenarios
   - Identify positive and negative test cases
   - Map boundary conditions
   - Plan data variations

### 3. 📊 DOCUMENT REQUIREMENTS (PDFs, Technical Specs)

#### **ANALYSIS PROTOCOL:**
1. **Content Analysis**
   - Extract functional requirements
   - Identify business rules
   - Map data flows
   - Note system interactions

## 🏗️ ARTIFACT GENERATION WORKFLOW

### PHASE 1: REQUIREMENT ANALYSIS
```
Step 1: Analyze requirement type (image/text/document)
Step 2: Create element/functionality inventory
Step 3: Map user interactions and workflows
Step 4: Identify validation points
Step 5: Plan test scenarios
Step 6: Document analysis findings
```

### PHASE 2: FEATURE FILE GENERATION
```gherkin
@RequirementTag @Team:TeamName @Priority
Feature: [Exact Feature Name from Requirement]
  
  [Brief description matching requirement]
  
  Background:
    Given [Common preconditions]
    
  Scenario: [Scenario based on requirement functionality]
    Given [Initial state from requirement]
    When [User action on requirement element]
    Then [Expected outcome from requirement]
    And [Additional validations needed]
```

### PHASE 3: IMPLEMENTATION ARTIFACTS

#### **Steps File Structure:**
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

// Step definitions matching feature scenarios exactly
Given('requirement-based precondition', async function() {
  // Implementation for visible/specified functionality only
});

When('user performs requirement action', async function() {
  // Implementation for specified user interaction
});

Then('system responds per requirement', async function() {
  // Validation matching requirement specification
});
```

#### **Page Object Structure:**
```javascript
class RequirementBasedPage {
  constructor(page) {
    this.page = page;
    // Locators for elements specified in requirement only
    this.requiredElement = page.locator('selector-for-required-element');
  }
  
  async performRequiredAction() {
    // Methods for requirement-specified actions only
  }
  
  async validateRequiredState() {
    // Validations for requirement-specified states only
  }
}
```

## ✅ QUALITY ASSURANCE CHECKLIST

### **Requirements Coverage:**
- [ ] All requirement elements have corresponding tests
- [ ] No functionality added beyond requirements
- [ ] Exact terminology from requirements used
- [ ] All user scenarios from requirements covered

### **Framework Integration:**
- [ ] SBS_Automation framework compliance verified
- [ ] Existing patterns and conventions followed
- [ ] Proper file structure and naming conventions
- [ ] Integration with existing page objects and steps

### **Code Quality:**
- [ ] Clean, readable, maintainable code
- [ ] Proper error handling implemented
- [ ] Comprehensive assertions added
- [ ] Accessibility considerations included

### **Test Coverage:**
- [ ] Positive scenarios covered
- [ ] Negative scenarios covered
- [ ] Edge cases identified and tested
- [ ] Cross-browser compatibility considered

## 🎯 SUCCESS PATTERNS

### **EXCELLENT REQUIREMENT ANALYSIS EXAMPLE:**
```
Requirement: Modal dialog with "Connect your data to [CashFlow Central]" header
Analysis Result:
✅ UI Elements: Header text, Close button, Checkbox, Continue button
✅ Interactions: Click close, Check checkbox, Click continue
✅ Validations: Modal visibility, Checkbox state, Button enablement
✅ Test Scenarios: Display modal, Interact with elements, Validate states
```

### **POOR REQUIREMENT ANALYSIS EXAMPLE:**
```
Requirement: Same modal dialog
Analysis Result:
❌ Added: Database validation (not visible)
❌ Added: Email notifications (not specified)
❌ Added: Complex workflow (not shown)
❌ Assumed: Backend API calls (not visible)
```

## 🚨 ANTI-PATTERNS TO AVOID

### **❌ NEVER DO:**
- Add functionality not in the requirement
- Make assumptions about "hidden" features
- Generate complex workflows not specified
- Include technical implementation details not visible
- Create tests for "should exist" functionality

### **✅ ALWAYS DO:**
- Analyze requirements thoroughly before generation
- Map every visible/specified element to test cases
- Use exact terminology from requirements
- Generate complete coverage for specified functionality
- Maintain framework compliance and code quality

## 📊 MEASUREMENT CRITERIA

### **PERFECT GENERATION SCORE = 100%**
- **Requirement Fidelity:** 100% match between requirement and tests
- **Framework Compliance:** Perfect SBS_Automation integration
- **Code Quality:** Clean, maintainable, professional code
- **Coverage Completeness:** All requirement elements tested
- **Zero Drift:** No assumptions or additions beyond requirements

---

## 🏆 EXCELLENCE STANDARD

**Generate test artifacts that achieve PERFECT requirement-to-test mapping with ZERO assumptions and COMPLETE framework integration.**

**Success = Requirements perfectly translated into executable, maintainable, comprehensive test artifacts.**
