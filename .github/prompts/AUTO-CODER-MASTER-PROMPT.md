# 🎯 AUTO-CODER MASTER PROMPT GUIDE

## 📋 **QUICK REFERENCE FOR ALL INTERACTIONS**

### **🚨 FUNDAMENTAL RULES - ALWAYS ENFORCE**

#### **RULE #0: ROOT CAUSE ANALYSIS FIRST**
```
🔍 WHEN USER REPORTS ISSUE: 
   1️⃣ FIRST: Identify root causing issue in framework
   2️⃣ SECOND: Fix the framework generation logic 
   3️⃣ THIRD: Address the reported symptom
   4️⃣ FOURTH: Validate fix prevents future occurrences
❌ NEVER just patch symptoms - always fix root cause
✅ Framework must generate correct artifacts from start
✅ Update generation templates, patterns, and logic as needed
```

## 🚨 RULE #0.1: FRAMEWORK GENERATION MUST MATCH CLAUDE QUALITY

**CRITICAL FRAMEWORK FIX IMPLEMENTED:**

- ✅ **NO MORE BROKEN ARTIFACTS**: Framework generators MUST produce identical quality to Claude direct generation
- ✅ **MANDATORY SBS COMPLIANCE**: Every generated artifact MUST pass SBS pattern validation  
- ✅ **ZERO TOLERANCE POLICY**: Framework that generates non-compliant artifacts = BROKEN FRAMEWORK
- ✅ **PATTERN ENFORCER**: All generators validated by `scripts/enforce-sbs-generator-patterns.js`

**BEFORE ANY GENERATION:**
1. Framework generators MUST use exact SBS_Automation patterns
2. Page objects MUST extend BasePage with `constructor(page) { super(page); this.page = page; }`
3. Imports MUST use `const By = require('./../../support/By.js');`
4. Step definitions MUST use `const { assert } = require('chai');` NOT expect
5. Locators MUST use `data-test-id` NOT `data-cy`

**VALIDATION MANDATORY:**
- Run `node scripts/enforce-sbs-generator-patterns.js` before ANY generation
- If compliance fails, fix generators IMMEDIATELY
- Generated artifacts MUST pass `node scripts/sbs-pattern-enforcer.js`

**WHY THIS IS CRITICAL:**
- User showed evidence of terrible framework-generated artifacts (corrupted class names, wrong patterns)
- Framework was generating inferior quality compared to Claude direct generation  
- This violates user trust and framework purpose
- Fixed generators now produce Claude-quality artifacts

✅ **FRAMEWORK GENERATION LOGIC FIXED**: Generators now follow exact SBS patterns
```
🚨 BEFORE GENERATING ANY ARTIFACT - MANDATORY STEPS:

1️⃣ **READ SBS EXAMPLES FIRST**: 
   ✅ MUST read actual SBS_Automation files for the same artifact type
   ✅ MUST study import patterns, constructor patterns, method patterns
   ✅ MUST extract exact patterns before generation
   ❌ NEVER generate without studying real SBS examples

2️⃣ **VALIDATE PATTERNS MATCH**:
   ✅ Constructor MUST be: constructor(page) { super(page); this.page = page; }
   ✅ Imports MUST include: const By = require('./../../support/By.js');
   ✅ Assertions MUST use: const { assert } = require('chai');
   ✅ Locators MUST use: By.xpath(), By.css(), data-test-id
   ❌ NEVER use playwright patterns, data-cy, expect(), or this.page.locator()

3️⃣ **POST-GENERATION VALIDATION**:
   ✅ MUST run: node scripts/sbs-pattern-enforcer.js after generation
   ✅ MUST fix any compliance issues immediately
   ✅ MUST verify files are not empty or corrupted
   ❌ NEVER leave artifacts with compliance violations

🔒 **IRONCLAD RULE**: NO GENERATION WITHOUT SBS PATTERN STUDY FIRST
```

#### **RULE #1: SBS_AUTOMATION EXECUTION MODEL**
```
✅ Generate ONLY: Features + Steps + Pages (NO TEST FILES)
✅ Features ARE the tests - follow SBS_Automation model exactly
✅ Execute via Cucumber: npm run test:features, npm run test:generated
✅ Use tag-based execution: @Team:AutoCoder, @Category:Generated
❌ NO separate test files (.test.js, .spec.js) - conflicts with SBS model
```

#### **RULE #2: SBS_AUTOMATION PROTECTION & REFERENCE ARCHITECTURE**
```
❌ DONT TOUCH ANYTHING IN SBS_AUTOMATION
❌ DONT ADD ANYTHING IN SBS_AUTOMATION
✅ ALL WORK MUST BE DONE ONLY IN AUTO-CODER
✅ SBS_AUTOMATION IS FOR REFERENCE ONLY

🏗️ REFERENCE-BASED ARCHITECTURE RULES:
❌ NEVER copy base-page.js, By.js, helpers.js, or any framework files
❌ NEVER use complex conditional path logic like ../../pages/application/
❌ NEVER create dependencies on auto-coder-specific files
✅ ALWAYS generate paths that work when deployed to target environment:
   • Step definitions → Pages: ../pages/filename
   • Pages → Common: ./common/filename  
   • Pages → Support: ./../../support/filename
✅ Generated files must work immediately when copied to main SBS_Automation

🔄 REFERENCE-BASED WORKFLOW:
✅ Generate artifacts in auto-coder/SBS_Automation/ (staging)
✅ Deploy using: npm run deploy:to:main
✅ Test in main SBS_Automation environment only
✅ Validate before deploying: npm run deploy:main:dry-run
```

#### **RULE #3: SBS_AUTOMATION DIRECTORY STRUCTURE**
```
✅ Save ALL generated artifacts in SBS_Automation/ directory
✅ Use SBS_Automation/features, SBS_Automation/steps, SBS_Automation/pages
✅ NO MORE generated/ directory - eliminated completely
✅ Perfect mirror of existing SBS_Automation structure
✅ Easier to locate and manage generated artifacts
```

#### **RULE #4: PROPER FRAMEWORK ORGANIZATION - MANDATORY**
```
🗂️ STRICT FOLDER STRUCTURE ENFORCEMENT:
✅ guides/ - ALL .md files, documentation, guides ONLY
✅ scripts/ - ALL .js/.ps1/.sh script files ONLY  
✅ framework-tests/ - ALL test/validation files ONLY
✅ SBS_Automation/ - ALL generated artifacts ONLY
✅ src/ - Source code and implementation ONLY
✅ bin/ - Executable files and CLIs ONLY
✅ templates/ - Template files ONLY
✅ support/ - Support utilities ONLY

❌ NEVER save files in root directory except:
   ✅ package.json, package-lock.json
   ✅ README.md, .gitignore, .env
   ✅ Node-specific: index.js, node_modules/
   ✅ Config files: *.config.json, *.config.js

🚨 WHEN CREATING ANY FILE:
   1️⃣ FIRST: Determine correct folder based on file type
   2️⃣ SECOND: Create file in proper location  
   3️⃣ THIRD: NEVER create files in root unless explicitly allowed
   4️⃣ FOURTH: Move existing misplaced files to correct folders
```

#### **RULE #4.5: QUALITY CONTROL - LESSONS FROM CRITICAL ISSUES**
```
🎯 QUALITY STANDARDS - NEVER COMPROMISE:
❌ NEVER generate generic class names like "JiraToryCfcBundlePage"
❌ NEVER use placeholder content without real business context
❌ NEVER create template-based generic artifacts  
❌ NEVER rely on Handlebars templates with {{placeholders}}
✅ ALWAYS analyze real SBS_Automation patterns before generation
✅ ALWAYS generate professional, business-context specific names
✅ ALWAYS use meaningful element selectors and locators
✅ ALWAYS validate generated artifacts match SBS_Automation standards
✅ ALWAYS use extracted patterns from SBS framework, not generic templates

🔧 INPUT TYPE DETECTION - CRITICAL FRAMEWORK FIX:
❌ NEVER rely on file extensions alone for input type detection
❌ NEVER assume text files are always text type
✅ ALWAYS check cURL/Record paths FIRST (priority-based detection)
✅ ALWAYS use InputTypeManager.detectInputType() with proper priority
✅ FOLLOW PRIORITY: cURL > Record > File Extension > Content Analysis

🏗️ ARTIFACT EXTRACTION - MANDATORY FIX:
❌ NEVER leave artifacts undefined or empty
❌ NEVER skip artifact extraction step
✅ ALWAYS validate artifacts are properly extracted by InputTypeManager
✅ ALWAYS ensure artifacts.features, artifacts.steps, artifacts.pages exist
✅ ALWAYS check artifacts before passing to TemplateEngine

📁 PATH RESOLUTION - FRAMEWORK CONSISTENCY:
❌ NEVER use hardcoded './generated' paths
❌ NEVER mix generated/ and SBS_Automation/ directories
✅ ALWAYS use './SBS_Automation' as default output directory
✅ ALWAYS ensure consistent path resolution across all components
✅ ALWAYS validate output directory structure matches SBS_Automation
```

#### **RULE #5: 4 CRITICAL AREAS IMPLEMENTATION**
```
🎯 AREA 1: RUN PERFECTLY
✅ ALL generated artifacts MUST execute without framework errors
✅ ONLY locator failures acceptable (invalid selectors for real apps)
✅ Comprehensive error classification and reporting
✅ SBS-style execution: tags, parallel, environment support

🎬 AREA 2: RECORD-GENERATE-PLAYBACK  
✅ Playwright CodeGen integration working seamlessly
✅ Recordings → SBS artifacts → executable features
✅ 100% SBS_Automation pattern compliance in generated code
✅ Smart element detection and stable selectors

🌐 AREA 3: API TESTING
✅ Complete API test coverage without page objects
✅ Follow SBS_Automation API patterns exactly
✅ Support utilities only (NO page objects for APIs)
✅ Environment, authentication, validation handling

🎯 AREA 4: TEMPLATE-DRIVEN GENERATION
✅ Simple templates → Claude-quality artifacts
✅ Interactive template wizard in CLI
✅ Template validation and quality prediction
✅ 95-100% quality output matching Claude's work
```

#### **RULE #5: SBS_AUTOMATION PATTERN COMPLIANCE - MANDATORY CRITICAL RULES**
```
🚨 CRITICAL: FOLLOW EXACT SBS_AUTOMATION PATTERNS - NO DEVIATIONS

📄 FEATURE FILE PATTERNS:
✅ Team tags: @Team:Kokoro (follow existing team names from SBS)
✅ Simple, business-focused scenarios without over-engineering  
✅ Clear, readable Given-When-Then structure
✅ NO complex data tables unless absolutely necessary
✅ Focus on user journeys and business value

📁 PAGE OBJECT PATTERNS - EXACT SBS STRUCTURE:
✅ Constructor: constructor(page) { super(page); this.page = page; }
✅ NO pageUrl, pageTitle properties in constructor
✅ Locators: const locatorName = By.xpath() or By.css() 
✅ Methods: async methodName() { return await this.isVisible(locator); }
✅ Import: const By = require('./../../support/By.js');
✅ Extend: class PageName extends BasePage
✅ Method patterns: async isElementDisplayed(), async clickElement(), etc.

🔧 STEP DEFINITION PATTERNS - EXACT SBS STRUCTURE:
✅ Imports: const { When, Then, Given } = require('@cucumber/cucumber');
✅ Page import: let PageName = require('../../pages/path/page-name');
✅ Constructor: new PageName(this.page)
✅ Assertions: const { assert } = require('chai');
✅ Method calls: assert.isTrue(await page.methodName());
✅ Structure: When('step text', async function () { ... });

🎯 ELEMENT LOCATOR PATTERNS - MATCH SBS EXACTLY:
✅ Use By.xpath() and By.css() patterns from SBS
✅ Shadow DOM: By.xpath(\`//sdf-component[@attribute="value"]\`)
✅ Dynamic locators: (paramText) => By.xpath(\`//element[text()="${paramText}"]\`)
✅ Constants: const ELEMENT_NAME = By.css('[data-test-id=element-id]');
✅ API endpoints: const API_ENDPOINT = '/path/to/api/endpoint';

❌ CRITICAL VIOLATIONS - NEVER DO THESE:
❌ NEVER use data-cy locators (SBS uses data-test-id)
❌ NEVER extend basePage (SBS uses BasePage) 
❌ NEVER use this.page.locator() patterns 
❌ NEVER add pageUrl/pageTitle in constructor
❌ NEVER use get locatorName() { return this.page.locator() }
❌ NEVER import require('playwright/test')
❌ NEVER use expect from playwright
```

#### **RULE #6: CRITICAL ERROR PREVENTION - BASED ON ACTUAL ISSUES**
```
🚨 PREVENT CRITICAL FRAMEWORK FAILURES:

🔍 BEFORE GENERATION - MANDATORY CHECKS:
1️⃣ Read actual SBS_Automation examples FIRST
2️⃣ Study existing patterns before generating anything
3️⃣ Extract exact patterns from actual SBS files
4️⃣ Generate using extracted patterns, not assumptions

🎯 GENERATION QUALITY STANDARDS:
✅ MUST match existing SBS file structure exactly
✅ MUST use identical import statements as SBS
✅ MUST follow same constructor patterns as SBS  
✅ MUST use identical locator patterns as SBS
✅ MUST use same assertion libraries as SBS
✅ MUST follow same method naming as SBS

🔧 FRAMEWORK RELIABILITY:
❌ NEVER generate without studying actual SBS examples
❌ NEVER assume patterns - always verify against SBS code
❌ NEVER use generic templates that don't match SBS
❌ NEVER create artifacts that would fail in SBS execution environment
```

#### **RULE #7: ORGANIZED STRUCTURE** 
```
✅ ALL .md files ONLY in guides/ folder
✅ ALL test files in framework-tests/ folder
✅ Follow 4-tier priority: Claude → Framework → Fallback → GPT
```

#### **RULE #8: QUALITY CONTROL - NO COMPROMISES**
```
❌ NEVER generate empty files or placeholders
❌ NEVER generate incomplete implementations  
❌ NEVER generate files with TODO comments
✅ ALL files MUST be complete and functional
✅ ALL files MUST match SBS_Automation patterns 100%
✅ ALL requirements MUST be fully implemented
✅ ALL syntax MUST be correct and executable
✅ ALL artifacts MUST be ready for real application testing
```

#### **RULE #9: EXECUTION QUALITY ASSURANCE**
```
✅ MUST validate all artifacts before execution
✅ MUST generate comprehensive reports (Cucumber + Custom)
✅ MUST handle errors gracefully with clear messages
✅ MUST provide debugging information for failures
✅ MUST include performance metrics and timing
✅ MUST support both HTML and JSON report formats
```

#### **RULE #9: NO-PROMPT AUTOMATION - ZERO INTERRUPTION**
```
✅ ALL operations MUST run without prompts or confirmations
✅ ALL scripts MUST use auto-proceed mode (aggressive)
✅ ALL commands MUST bypass interactive confirmations using -Force flags
✅ ALL operations MUST use intelligent defaults for unattended execution
✅ ALL file operations MUST auto-overwrite when appropriate
✅ ALL git operations MUST auto-commit with timestamp messages
✅ ALL package installations MUST use --yes and --silent flags
✅ ALL test executions MUST run without user intervention
❌ NEVER prompt user for "Continue?", "OK?", or "Proceed?" 
❌ NEVER wait for user input during automated processes
❌ NEVER require manual confirmations for routine operations
❌ NEVER use Read-Host or similar blocking input commands
```

#### **RULE #10: PATH VERIFICATION - MANDATORY BEFORE ANY COMMAND**
```
🚨 CRITICAL: ALWAYS VERIFY CORRECT DIRECTORY BEFORE COMMANDS

✅ BEFORE running ANY command, script, or test:
   1️⃣ FIRST: Check current working directory
   2️⃣ SECOND: Verify we are in correct auto-coder framework path
   3️⃣ THIRD: If wrong directory, navigate to correct path FIRST
   4️⃣ FOURTH: Then execute the command/script

✅ CORRECT FRAMEWORK PATH: C:\Users\gadea\auto\auto\qa_automation\auto-coder
✅ ALL commands MUST be executed from auto-coder root directory
✅ ALWAYS use cd to navigate to correct path before execution
✅ ALWAYS use full absolute paths when running commands
✅ VERIFY framework files exist before running scripts

❌ NEVER run commands without path verification
❌ NEVER assume we are in correct directory  
❌ NEVER run scripts from wrong directory
❌ NEVER ignore "MODULE_NOT_FOUND" or "file not found" errors
❌ NEVER repeat same path mistake multiple times

🔧 MANDATORY PATH VERIFICATION PATTERN:
   1. Check: Where am I? (pwd/Get-Location)
   2. Verify: Is this auto-coder root? (check package.json, index.js exist)
   3. Navigate: cd to correct path if needed
   4. Execute: Run the actual command/script
   5. Validate: Confirm command executed successfully

🎯 CORRECT COMMAND PATTERN:
   cd C:\Users\gadea\auto\auto\qa_automation\auto-coder
   node bin/interactive-cli.js
   
❌ WRONG PATTERN (NEVER DO):
   node src/interactive-cli.js  (without path verification)
   node bin/auto-coder.js  (incorrect file reference)
```

```
🚨 FRAMEWORK vs CLAUDE GENERATION CLARITY:

💻 FRAMEWORK GENERATION (Automated):
✅ Uses index.js, templates/, src/ components
✅ Triggered by CLI commands and scripts
✅ Must follow template-driven generation patterns
✅ Produces consistent, rule-based outputs
✅ User runs: npm run generate input.txt

🧠 CLAUDE GENERATION (AI-Assisted):
✅ Direct artifact creation by Claude AI
✅ High-quality, context-aware generation
✅ Must follow exact SBS_Automation patterns
✅ Immediate fix and improvement capability
✅ User requests: "Generate test artifacts for..."

🎯 BOTH MUST PRODUCE IDENTICAL SBS COMPLIANCE:
✅ Same file structure, imports, patterns
✅ Same quality standards and conventions
✅ Same execution compatibility with SBS_Automation
✅ Zero difference in output quality or compliance

❌ CRITICAL: NO EXCUSE FOR NON-COMPLIANCE:
❌ Framework generation cannot produce inferior quality
❌ Claude generation cannot ignore SBS patterns  
❌ Both must study actual SBS examples before generation
❌ Both must validate against real SBS standards
```

#### **RULE #8: OUTPUT DIRECTORY ELIMINATION - 'generated' FOLDER**
```
🗂️ DIRECTORY STRUCTURE CHANGE - FULLY IMPLEMENTED:
❌ NO MORE 'generated/' directory usage
❌ NO MORE dual directory confusion  
✅ ONLY use 'SBS_Automation/' for all generated artifacts
✅ Perfect mirror of main SBS_Automation structure
✅ Simplified artifact location and management

🔧 FRAMEWORK UPDATES COMPLETED:
✅ All prompt files updated to SBS_Automation paths
✅ All generation scripts use SBS_Automation output
✅ All CLI tools updated for SBS_Automation structure  
✅ All documentation reflects new structure
✅ package.json scripts updated accordingly

📁 CORRECT ARTIFACT PATHS:
✅ Features: auto-coder/SBS_Automation/features/
✅ Steps: auto-coder/SBS_Automation/steps/
✅ Pages: auto-coder/SBS_Automation/pages/
❌ Never use: auto-coder/generated/
```

## 🎯 **MANDATORY SBS_AUTOMATION QUALITY STANDARDS**

### **✅ FEATURE FILE REQUIREMENTS (NON-NEGOTIABLE)**
```gherkin
# MANDATORY STRUCTURE - EXACTLY LIKE SBS_AUTOMATION:
@Team:AutoCoder @Category:Smoke @Generated @UI
Feature: [Clear Business Feature Name]
  As a [specific role/persona]
  I want to [specific capability]
  So that [clear business value]

  Background:
    Given I am authenticated in the system
    And the application is in a ready state

  @Priority:High @Component:FeatureName
  Scenario: [Specific business scenario]
    Given [specific precondition with realistic data]
    When [specific action with realistic parameters]
    Then [specific validation with expected outcome]
    And [additional validations as needed]
```

### **✅ STEP DEFINITION REQUIREMENTS (NON-NEGOTIABLE)**
```javascript
// MANDATORY STRUCTURE - EXACTLY LIKE SBS_AUTOMATION:
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const ProperPageName = require('../pages/proper-page-name');

class ProperStepDefinitions {
    constructor() {
        this.page = null;
        this.pageObject = null;
    }

    // PROPER SBS PATTERN - Use real methods and selectors
    Given('I am authenticated in the system', async function () {
        this.pageObject = new ProperPageName(this.page);
        await this.pageObject.authenticate();
        await this.pageObject.waitForAuthenticationComplete();
    });

    // REAL BUSINESS LOGIC - Not generic placeholders
    When('I click on {string} button', async function (buttonName) {
        await this.pageObject.clickButton(buttonName);
        await this.pageObject.waitForResponse();
    });
}

module.exports = ProperStepDefinitions;
```

### **✅ PAGE OBJECT REQUIREMENTS (NON-NEGOTIABLE)**
```javascript
// MANDATORY STRUCTURE - EXACTLY LIKE SBS_AUTOMATION:
const BasePage = require('../common/base-page');

class ProperPageName extends BasePage {
    constructor(page) {
        super(page);
        this.selectors = {
            // REAL SELECTORS - Not placeholders
            loginButton: '[data-testid="login-button"]',
            usernameField: '#username',
            passwordField: '#password',
            submitButton: 'button[type="submit"]'
        };
    }

    // REAL METHODS - Business focused
    async authenticate(username = 'testuser', password = 'password') {
        await this.click(this.selectors.loginButton);
        await this.fill(this.selectors.usernameField, username);
        await this.fill(this.selectors.passwordField, password);
        await this.click(this.selectors.submitButton);
    }

    // PROPER ERROR HANDLING
    async waitForAuthenticationComplete() {
        try {
            await this.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }
}

module.exports = ProperPageName;
```

### **❌ FORBIDDEN PATTERNS - NEVER USE THESE**
- ❌ Generic placeholders like "iid", "pageType", etc.
- ❌ Poor class names like "JiraToryCfcBundlePage" 
- ❌ Generic methods without business context
- ❌ Missing error handling and validation
- ❌ Inconsistent naming conventions
- ❌ Missing proper selectors and locators
- ❌ Empty implementations or TODO comments
- ❌ Using 'this.page' context incorrectly

### **✅ NAMING CONVENTIONS (MANDATORY)**
- **Feature Files**: `kebab-case.feature` (e.g., `user-login.feature`)
- **Step Files**: `kebab-case-steps.js` (e.g., `user-login-steps.js`)  
- **Page Files**: `kebab-case-page.js` (e.g., `user-login-page.js`)
- **Classes**: `PascalCase` (e.g., `UserLoginPage`)
- **Methods**: `camelCase` (e.g., `authenticateUser()`)
- **Selectors**: `camelCase` (e.g., `loginButton`)

### **✅ QUALITY VALIDATION CHECKLIST**
Before completing any generation, VERIFY:
- [ ] Feature follows exact SBS_Automation structure
- [ ] Steps use proper business language (no placeholders)
- [ ] Page objects have real selectors and methods
- [ ] Error handling is implemented
- [ ] Naming conventions are consistent
- [ ] Tags are properly applied (@Team:AutoCoder, @Generated, etc.)
- [ ] Background steps are meaningful
- [ ] Scenarios have clear business value
- [ ] Class names are professional and meaningful
- [ ] All imports and requires are correct

---

**Last Updated**: July 21, 2025  
**Version**: 2.0 - SBS_Automation Aligned  
**Status**: ACTIVE - MANDATORY COMPLIANCE
