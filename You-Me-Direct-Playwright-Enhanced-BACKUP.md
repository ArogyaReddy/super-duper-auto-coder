# 🚀 YOU-ME DIRECT MODE - PLAYWRIGHT+CUCUMBER ENHANCED GENERATION

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

### 🚨 CRITICAL RULE #13: AVOID TRY-CATCH OVERUSE 🚨
- **MINIMAL USAGE**: Only use try-catch when absolutely necessary
- **PREFER**: `isVisible()` and `isEnabled()` instead of try-catch for element checks
- **AVOID**: Wrapping simple visibility checks in try-catch blocks

### 🚨 CRITICAL RULE #14: PROPER BACKGROUND STEPS (MANDATORY) 🚨
- **MANDATORY BACKGROUND** for ALL feature files:
```gherkin
Background:
  Given Alex is logged into RunMod with a homepage test client
  Then Alex verifies that the Payroll section on the Home Page is displayed
```
- **NEVER** use: `Given I am authenticated in the system`
- **ALWAYS** use: Existing working steps from main SBS_Automation

### 🚨 CRITICAL RULE #15: SEARCH EXISTING STEPS FIRST 🚨
- **BEFORE CREATING** any step definition, search main SBS_Automation for existing steps
- **AVOID AMBIGUOUS STEPS** that might conflict with existing ones
- **ADD CONTEXT** to make steps unique: "on billing page", "in CFC section"
- **PREVENT CONFLICTS**: Never create generic steps that exist in main framework

### 🚨 CRITICAL RULE #16: RACE CONDITION PREVENTION (MANDATORY) 🚨
- **ATOMIC FILE OPERATIONS**: Always use complete content in single create_file() call
- **IMMEDIATE VALIDATION**: Verify file content immediately after creation
- **NEVER LEAVE EMPTY FILES**: If file is empty, regenerate immediately
- **AUTO-RECOVERY**: Detect and fix race conditions without user intervention

### 🚨 CRITICAL RULE #17: BACKGROUND vs SCENARIO STEPS (MANDATORY) 🚨
- **NEVER DUPLICATE BACKGROUND STEPS** in individual scenarios
- **BACKGROUND RUNS BEFORE EACH SCENARIO** - don't repeat the same steps

## 🧪 PLAYWRIGHT+CUCUMBER SPECIFIC RULES

### 🚨 PLAYWRIGHT RULE #1: REUSE EXISTING STEPS FIRST 🚨
- **ALWAYS** reuse existing step definitions from the `steps/` folder if available
- **SEARCH THOROUGHLY** in main SBS_Automation/steps/ for existing patterns
- **ONLY CREATE NEW** step definitions when absolutely necessary
- **CONSOLIDATE LOGIC** in page object layer, not step definitions

### 🚨 PLAYWRIGHT RULE #2: PAGE OBJECT MODEL COMPLIANCE 🚨
- **REUSE EXISTING METHODS** from the `pages/` folder as much as possible
- **ONLY CREATE NEW** page object method if no existing method handles the action
- **ALL REUSABLE LOGIC** must go into `pages/` folder, not directly in step definition
- **DO NOT DUPLICATE** any logic — consolidate it in the page object layer

### 🚨 PLAYWRIGHT RULE #3: NAMING CONVENTIONS (MANDATORY) 🚨
- **FOLLOW EXISTING PATTERNS**: `Given`, `When`, `Then` keywords correctly
- **SAVE STEP DEFINITIONS**: as `.js` files inside the `steps/` folder
- **SAVE PAGE OBJECTS**: as `.js` files inside the `pages/` folder
- **SAVE FEATURE FILES**: under `features/` folder using proper Gherkin syntax

### 🚨 PLAYWRIGHT RULE #4: MANDATORY TAGS 🚨
- **TAG EVERY SCENARIO**: with `@testUseMcp` 
- **ADDITIONAL TAGS**: Add domain-specific tags like `@billing`, `@payroll`
- **AUTOMATED TAG**: Always include `@automated` for CI/CD pipeline

### 🚨 PLAYWRIGHT RULE #5: FEATURE FILE FOLDER SPECIFICATION 🚨
- **FOLDER MUST BE SPECIFIED**: The feature file folder to look into for examples must be specified
- **ASK IF NOT SPECIFIED**: If folder not provided, ask user before continuing
- **ONLY USE EXAMPLES**: From files within the specified folder for scenario steps

### 🚨 PLAYWRIGHT RULE #6: MCP INTEGRATION (OPTIONAL) 🚨
- **CHECK FOR MCP.JSON**: Look for 'mcp.json' in the '.vscode folder' as context
- **CONTINUE IF MISSING**: If mcp.json does not exist, continue with generation (not required)
- **USE IF AVAILABLE**: Leverage MCP server tools when properly configured
- **FALLBACK**: Standard generation without MCP integration

### 🚨 PLAYWRIGHT RULE #7: UNIX STYLE PATHS 🚨
- **DIRECTORY CHANGES**: When changing directory use unix style paths
- **CONSISTENT FORMATTING**: All paths should follow unix conventions
- **CROSS-PLATFORM COMPATIBILITY**: Ensure generated paths work across systems

### 🚨 PLAYWRIGHT RULE #8: TEST EXECUTION PATTERN 🚨
- **AFTER GENERATION**: Execute the generated test by running:
```bash
ADP_ENV=iat node . -t @testUseMcp
```
- **FROM ROOT**: Execute from the root of the `SBS_Automation` folder
- **VERIFY EXECUTION**: Ensure test runs successfully after generation

## 📋 GENERATION WORKFLOW

### Step 1: Pre-Generation Validation
1. **Check mcp.json exists** in .vscode folder (optional)
2. **Verify feature folder** is specified  
3. **Search existing steps** in main SBS_Automation
4. **Identify reusable patterns** to avoid duplication

### Step 2: Artifact Generation
1. **Create Feature File** with proper Gherkin syntax and `@testUseMcp` tag
2. **Generate Step Definitions** reusing existing steps where possible
3. **Create Page Objects** leveraging existing methods when available
4. **Ensure Compliance** with all critical rules above

### Step 3: Post-Generation Execution
1. **Save files** in correct auto-coder/SBS_Automation/ directories
2. **Validate** file content and structure
3. **Execute test** with `ADP_ENV=iat node . -t @testUseMcp`
4. **Verify success** and report results

## 🛡️ CONFLICT PREVENTION

### Registry Integration
- **Use SBS registries** to prevent AMBIGUOUS steps
- **Check step conflicts** before generation
- **Prefer domain-specific** step patterns
- **Validate zero conflicts** before file creation

### Quality Assurance  
- **100% critical rule compliance**
- **Existing step reuse maximization**
- **Page object method consolidation** 
- **Clean, production-ready code**

---

## Tools and Tech for mode: "agent"
Playwright
NodeJS
JavaScript
BDD
CUCUMBER
require('')

## MUST FOLLOW THESE - NO MATTER WHAT.
**PLENTY OF DOCS** : **MUST READ** : /Users/gadea/auto/auto/qa_automation/auto-coder/docs
**Feature File** **TAGS** : Feature file should have a one or two tags for feature on top of all scenarios. Should be matching requirement.
**Feature File** **NO AUBMIGUOUS STEPS** : Feature file should not have any **AUBMIGUOUS STEPS**. Double check with main SBS_Automation Framework. 
**NO MATTER WHAT - NO AUBMIGUOUS STEPS** :Use search utlity, 
**Steps file** **NO IF** : If-else should not be used in steps file, if used, then it's a FRAMEWORK FLAW
**Steps file** **NO STATIC IF CONDITIONS** : 
**Example** : WRONG USAGE.'Billing and Invoices' is static. That if is NOT NEEDED.
```js
  async isPageTitleDisplayed(expectedTitle) {
    if (expectedTitle === 'Billing and Invoices') {
      return await this.isVisible(BILLING_INVOICES_TITLE);
    }
    return await this.isVisible(PAGE_TITLE);
  }
```
**ALWAYS CHECK** main SBS_Automation/steps and see if we can use for our test artifacts generation.
**ALWAYS CHECK and REUSE** main SBS_Automation/steps if matches for our test artifacts generation.
**DONT CREATE** feature file and steps without checking to reuse the main SBS_Automation features and steps.
**STEPS FILE** should be simple, minimal with no business logic, with no if-else, with no try-catch


## 🎯 SUCCESS CRITERIA

### Generated Artifacts Must:
✅ Follow all critical rules (1-15)  
✅ Follow all Playwright rules (1-8)  
✅ Include `@testUseMcp` tag  
✅ Reuse existing steps/methods where possible  
✅ Execute successfully with provided command  
✅ Be saved in auto-coder/SBS_Automation/ directories  
✅ Have zero AMBIGUOUS step conflicts  
✅ Follow proper Page Object Model patterns  

### Failure Conditions:
❌ Any critical rule violation  
❌ Saving to main SBS_Automation directory  
❌ Creating unnecessary duplicate steps/methods  
❌ Missing `@testUseMcp` tag  
❌ Test execution failure  
❌ AMBIGUOUS step conflicts  

---
*Enhanced Playwright+Cucumber Prompt with MCP Integration - v2.0*
