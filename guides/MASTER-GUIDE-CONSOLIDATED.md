# MASTER GUIDE: REQUIREMENT-DRIVEN TEST AUTOMATION

## 🎯 MISSION STATEMENT
Create the **ULTIMATE FRAMEWORK** for transforming any requirement (image, text, document) into **PERFECT TEST ARTIFACTS** with **ZERO ASSUMPTIONS** and **100% FRAMEWORK COMPLIANCE**.

## 🚨 **CRITICAL PRIORITY #0: NEVER SAVE TO MAIN SBS_AUTOMATION**

### **⚠️ MANDATORY FILE LOCATION RULE - BLOCKER PREVENTION:**
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

**FORBIDDEN NAMING:**
- ❌ `cfc-activation-consent-page.js` (interpreted name)
- ❌ `contest-modal-page.js` (extra descriptors)
- ❌ `feature-name-component-page.js` (generic names)
- ✅ Use EXACT requirement file name as base

### **⚠️ MANDATORY FLAT FOLDER STRUCTURE RULE:**
**NEVER** create project subfolders:
- ❌ `features/project/` (no project folders)
- ❌ `pages/module/component/` (no nested folders)
- ❌ `steps/feature-group/` (no project folders)
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
- ❌ `Given user navigates to home page`
- ❌ Any custom login/navigation Background steps
- ✅ Use the EXACT existing SBS Background pattern only

**CRITICAL**: This Background already exists in main SBS_Automation framework - never create new steps for it.

### **🎯 WHY THIS IS CRITICAL:**
- **Isolation**: Generated artifacts isolated in auto-coder workspace
- **Safety**: Prevents contamination of main SBS framework
- **Review Process**: Enables proper validation before integration
- **Consistency**: Identical naming matches SBS framework standards
- **Maintainability**: Flat structure prevents folder proliferation
- **Framework Compliance**: Uses existing Background steps, no duplication

## 🚨 **CRITICAL PRIORITY #1: ELIMINATE AMBIGUOUS STEPS**

### **⚠️ MANDATORY VALIDATION PROTOCOL:**
**BEFORE CREATING ANY STEP - EXECUTE THIS PROCESS:**
1. **Search Pattern**: `grep_search "your step pattern" SBS_Automation/steps/**/*.js`
2. **Check Conflicts**: If ANY matches found → REUSE or ADD CONTEXT PREFIX
3. **Validate Uniqueness**: Confirm your final step has ZERO conflicts
4. **Context Prefix**: Always add feature-specific prefix (e.g., "billing invoices", "cfc activation")

### **❌ FORBIDDEN AMBIGUOUS PATTERNS:**
```gherkin
# These patterns CONFLICT with existing SBS steps:
Alex navigates to {string} page          # ❌ 10+ conflicts
Alex clicks {string} button             # ❌ 20+ conflicts  
Alex verifies {string} displayed        # ❌ 20+ conflicts
Alex verifies {string} page title is displayed  # ❌ conflicts
```

### **✅ REQUIRED SAFE PATTERNS:**
```gherkin
# Always use context-specific prefixes:
Alex navigates to billing invoices {string} page
Alex clicks the cfc activation {string} button
Alex verifies the employee onboarding {string} is displayed
Alex verifies the payroll processing {string} section is visible
```

## 🚨 **CRITICAL RULE #2: SBS PAGE OBJECT INSTANTIATION PATTERN**

### **⛔ ANTI-PATTERN - NEVER DO THIS:**
```javascript
Given('user setup step', async function () {
  this.pageObject = new PageObject(this.page);     // ❌ WRONG
  this.anotherPage = new AnotherPage(this.page);   // ❌ WRONG
});

When('user action step', async function () {
  await this.pageObject.performAction();           // ❌ BREAKS IDE
});
```

### **✅ CORRECT SBS PATTERN - ALWAYS DO THIS:**
```javascript
Given('user setup step', async function () {
  await new PageObject(this.page).setup();         // ✅ CORRECT
});

When('user action step', async function () {
  await new PageObject(this.page).performAction(); // ✅ CORRECT
});

Then('user validation step', async function () {
  const result = await new PageObject(this.page).validate(); // ✅ CORRECT
  assert.isTrue(result, 'Validation message');
});
```

### **🏆 BENEFITS OF CORRECT PATTERN:**
1. **IDE Excellence**: Full IntelliSense, Go to Definition, Find References
2. **SBS Compliance**: Matches established framework patterns 100%
3. **Maintainability**: Self-contained, independent, traceable steps
4. **Professional Quality**: Enterprise-grade code standards
5. **Debugging Power**: Better error isolation and stack traces

## 📚 COMPREHENSIVE GUIDE STRUCTURE

### 1. 🔍 REQUIREMENT ANALYSIS MASTERY

#### **IMAGE REQUIREMENT ANALYSIS (GOLD STANDARD)**
```
STEP 1: VISUAL ELEMENT INVENTORY
├── Headers/Titles: Document exact text
├── Buttons: Note text, style, position
├── Input Fields: Labels, placeholders, types
├── Checkboxes/Radio: Text, states, groupings
├── Links: Text, destinations, styles
├── Text Content: All visible text, messages
├── Icons: Purpose, functionality, accessibility
├── Modals/Dialogs: Structure, content, interactions
├── Error/Success States: Messages, styling, triggers
└── Forms: Complete structure, validation, flow

STEP 2: INTERACTION MAPPING
├── Click Interactions: What can be clicked?
├── Form Interactions: What can be filled/selected?
├── Navigation Flows: Where do actions lead?
├── State Changes: What visual changes occur?
└── Validation Triggers: What causes errors/success?

STEP 3: TEST SCENARIO GENERATION
├── Happy Path Scenarios: Successful interactions
├── Validation Scenarios: Error states, edge cases
├── Accessibility Scenarios: Keyboard, screen reader
├── Responsive Scenarios: Different screen sizes
└── Integration Scenarios: Page-to-page flows
```

#### **TEXT REQUIREMENT ANALYSIS**
```
STEP 1: FUNCTIONAL EXTRACTION
├── Business Rules: Specific requirements
├── User Stories: Actor-action-outcome
├── Acceptance Criteria: Success conditions
├── Data Requirements: Inputs, outputs, formats
└── Integration Points: System interactions

STEP 2: SCENARIO MAPPING
├── Positive Test Cases: Expected functionality
├── Negative Test Cases: Error conditions
├── Boundary Test Cases: Limits, edge cases
├── Data Variation Cases: Different input types
└── Workflow Test Cases: End-to-end scenarios
```

### 2. 🏗️ ARTIFACT GENERATION FRAMEWORK

#### **FEATURE FILE EXCELLENCE**
```gherkin
# Template for Perfect Feature Files
@RequirementMatch @Team:Name @Priority @Type
Feature: [EXACT name from requirement]
  
  [Brief description matching requirement scope]
  
  Background:
    Given [Common setup from requirement context]
    Then [Initial state validation]
    
  Scenario: [Specific functionality from requirement]
    Given [Precondition from requirement]
    When [User action on requirement element]
    Then [Expected result from requirement]
    And [Additional validation from requirement]
    
  # Error handling scenarios from requirement
  Scenario: [Error condition from requirement]
    Given [Error precondition]
    When [Action that triggers error]
    Then [Error response from requirement]
    
  # Accessibility scenarios for UI requirements
  Scenario: [Accessibility validation]
    Given [Accessibility context]
    When [Accessibility interaction]
    Then [Accessibility compliance verification]
```

#### **STEPS FILE ARCHITECTURE**
```javascript
// Perfect Steps File Structure
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Import page objects for requirement elements only
const RequirementPage = require('../pages/requirement-page');

// Step definitions matching feature scenarios exactly
Given('requirement precondition step', async function() {
  // Implementation for requirement-specific setup
  this.requirementPage = new RequirementPage(this.page);
  await this.requirementPage.navigateToRequirementContext();
});

When('user performs requirement action', async function() {
  // Implementation for requirement-specified interaction
  await this.requirementPage.performRequirementAction();
});

Then('system responds per requirement', async function() {
  // Validation matching requirement specification exactly
  await this.requirementPage.validateRequirementOutcome();
});
```

#### **PAGE OBJECT MASTERY**
```javascript
// Perfect Page Object for Requirements
class RequirementBasedPage {
  constructor(page) {
    this.page = page;
    
    // Locators for requirement elements ONLY
    this.requirementElements = {
      header: page.locator('[data-testid="requirement-header"]'),
      actionButton: page.getByRole('button', {name: 'Requirement Action'}),
      inputField: page.getByLabel('Requirement Input'),
      validationMessage: page.locator('.requirement-validation')
    };
  }
  
  // Methods for requirement functionality ONLY
  async performRequirementAction() {
    await this.requirementElements.actionButton.click();
  }
  
  async validateRequirementState() {
    await expect(this.requirementElements.validationMessage).toBeVisible();
  }
  
  // Accessibility methods for UI requirements
  async validateAccessibility() {
    // Keyboard navigation test
    await this.page.keyboard.press('Tab');
    await expect(this.requirementElements.actionButton).toBeFocused();
  }
}

module.exports = RequirementBasedPage;
```

### 3. 🎯 FRAMEWORK INTEGRATION STANDARDS

#### **SBS_AUTOMATION COMPLIANCE**
```
✅ MANDATORY COMPLIANCE POINTS:
├── File Structure: Match SBS conventions exactly
├── Naming Conventions: Follow established patterns
├── Import Statements: Use framework imports
├── Step Patterns: Reuse existing steps where possible
├── Page Object Patterns: Follow SBS architecture
├── Configuration: Integrate with SBS configs
├── Tagging Strategy: Use SBS tag conventions
└── Execution: Compatible with SBS runners
```

#### **QUALITY STANDARDS**
```
✅ CODE QUALITY REQUIREMENTS:
├── Clean Code: Readable, maintainable
├── Error Handling: Comprehensive try/catch
├── Async/Await: Proper promise handling
├── Assertions: Multiple validation layers
├── Documentation: Clear comments
├── Performance: Efficient execution
├── Reusability: DRY principles
└── Maintainability: Easy to update
```

### 4. 📊 VALIDATION & VERIFICATION

#### **REQUIREMENT FIDELITY CHECKLIST**
```
□ Every requirement element has corresponding test
□ No functionality added beyond requirements
□ Exact terminology from requirements used
□ All user scenarios from requirements covered
□ Error conditions from requirements tested
□ Success conditions from requirements validated
□ No assumptions made beyond requirements
□ Framework compliance verified
```

#### **TEST COVERAGE MATRIX**
```
REQUIREMENT ELEMENT → TEST COVERAGE
├── UI Elements → Element visibility, interaction, state
├── User Actions → Click, type, select, navigate
├── Validations → Success, error, edge cases
├── Workflows → End-to-end scenarios
├── Accessibility → Keyboard, screen reader, ARIA
├── Responsive → Mobile, tablet, desktop
└── Integration → Page flows, data persistence
```

### 5. 🚀 ADVANCED CAPABILITIES

#### **PLAYWRIGHT ENHANCEMENT**
```javascript
// Advanced Playwright features for requirements
class AdvancedRequirementPage {
  // Visual regression testing
  async validateVisualRequirement() {
    await expect(this.page).toHaveScreenshot('requirement-state.png');
  }
  
  // Network interception for API requirements
  async interceptRequirementAPI() {
    await this.page.route('**/api/requirement', route => {
      expect(route.request().postDataJSON()).toMatchRequirement();
      route.continue();
    });
  }
  
  // Accessibility testing
  async validateAccessibilityCompliance() {
    const snapshot = await this.page.accessibility.snapshot();
    expect(snapshot).toMatchAccessibilityGuidelines();
  }
}
```

#### **CROSS-BROWSER TESTING**
```javascript
// Multi-browser requirement validation
const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
  test.describe(`Requirement validation on ${browserName}`, () => {
    test('requirement functionality works across browsers', async () => {
      // Requirement-specific cross-browser testing
    });
  });
});
```

## 🏆 EXCELLENCE METRICS

### **PERFECT GENERATION SCORECARD**
```
🎯 REQUIREMENT FIDELITY: 100%
├── Visual elements mapped: 100%
├── Functionality covered: 100%
├── Terminology accuracy: 100%
└── Assumption count: 0%

🏗️ FRAMEWORK INTEGRATION: 100%
├── SBS compliance: 100%
├── Code quality: A+
├── Performance: Optimized
└── Maintainability: Excellent

🧪 TEST QUALITY: 100%
├── Coverage completeness: 100%
├── Assertion strength: Comprehensive
├── Error handling: Robust
└── Accessibility: Compliant
```

## 🎉 SUCCESS PATTERNS

### **WINNING FORMULA:**
1. **ANALYZE** requirements with surgical precision
2. **MAP** every element to test scenarios
3. **GENERATE** artifacts with zero assumptions
4. **INTEGRATE** perfectly with SBS framework
5. **VALIDATE** 100% requirement coverage
6. **OPTIMIZE** for performance and maintainability

### **ANTI-PATTERNS TO ELIMINATE:**
- ❌ Adding features not in requirements
- ❌ Making assumptions about functionality
- ❌ Poor framework integration
- ❌ Incomplete test coverage
- ❌ Low code quality standards

---

## 🌟 ULTIMATE GOAL

**Create the most sophisticated, accurate, and maintainable test automation framework that transforms ANY requirement into PERFECT test artifacts with ZERO human intervention needed for corrections.**

**Excellence Standard: Requirements → Perfect Tests, Every Time, First Time.**

## 🚨 **CRITICAL PRIORITY #1A: RESILIENT LOCATOR STRATEGY**

### **⚠️ MANDATORY COMBINED LOCATOR APPROACH:**
**ALWAYS** use combined Primary | Secondary | Fallback strategies in single locator:

```javascript
// ✅ RESILIENT STATIC LOCATORS
const PAGE_TITLE = By.css('[data-test-id="page-title"] | h1.page-title | .title-header');
const SUBMIT_BUTTON = By.xpath('//button[@data-test-id="submit"] | //input[@type="submit"] | //button[contains(text(),"Submit")]');
const MODAL_CONTAINER = By.css('[data-test-id="modal"] | .modal-dialog | [role="dialog"]');

// ✅ RESILIENT PARAMETERIZED LOCATORS
const BUTTON_ELEMENT = (btnName) => By.xpath(`//sdf-button[text()="${btnName}"] | //button[contains(text(),"${btnName}")] | //*[@aria-label="${btnName}"]`);
const LEFT_NAV_ICON = (leftNavName) => By.xpath(`//sdf-icon[@data-test-id='${leftNavName}-icon'] | //button[@data-test-id='${leftNavName}-btn'] | //*[@title='${leftNavName}']`);
const SUBMISSION_BUTTON = (submissionButton) => By.xpath(`//sdf-button[contains(.,"${submissionButton}")] | //button[contains(.,"${submissionButton}")] | //*[@value="${submissionButton}"]`);
const MODAL_HEADER = (headerText) => By.xpath(`//sdf-focus-pane[@heading="${headerText}"] | //h1[contains(text(),"${headerText}")] | //*[@data-test-id="${headerText}-header"]`);
const SDF_MODAL_BUTTON = (buttonText) => By.css(`[aria-label*='${buttonText}'] | [title*='${buttonText}'] | button:contains('${buttonText}')`);
```

### **❌ FORBIDDEN SINGLE-STRATEGY PATTERNS:**
```javascript
// WRONG - Single strategy locators (not resilient)
const BUTTON_SELECTOR = By.css('[data-test-id="button"]'); // WRONG - no fallback
const INPUT_FIELD = By.id('input-field'); // WRONG - no alternatives

// WRONG - Separate constants for same element
const PRIMARY_BUTTON = By.css('[data-test-id="button"]'); // WRONG
const SECONDARY_BUTTON = By.xpath('//button[@id="button"]'); // WRONG
const FALLBACK_BUTTON = By.css('.button-class'); // WRONG
```

### **🎯 RESILIENT LOCATOR BENEFITS:**
- **Higher Success Rate**: If primary fails, secondary/fallback strategies still work
- **Reduced Maintenance**: One locator handles multiple selector approaches
- **Better Error Reporting**: Shows all attempted strategies in failure logs
- **SDF Framework Compliance**: Matches patterns from main SBS_Automation
- **Production Ready**: Handles dynamic DOM changes and browser variations
