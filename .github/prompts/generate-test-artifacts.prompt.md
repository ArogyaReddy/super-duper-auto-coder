# 🎯 Test Artifact Generation Prompt - SBS_Automation Aligned

Use this prompt template to generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

## 🚨 **FUNDAMENTAL RULES - NEVER DEVIATE**

### **RULE #1: SBS_AUTOMATION EXECUTION MODEL**
```
✅ Generate ONLY: Features + Steps + Pages (NO TEST FILES)
✅ Features ARE the tests - follow SBS_Automation model exactly
✅ Use feature-based execution with tags: @Team:, @Category:, @Generated
✅ Support parallel execution: -n parameter
✅ Execute via Cucumber like SBS_Automation: npm run test:features
❌ NO separate test files (.test.js, .spec.js) - conflicts with SBS model
❌ NO Jest/Mocha style tests - use Cucumber/Gherkin only
```

### **RULE #2: SBS_AUTOMATION PROTECTION & REFERENCE ARCHITECTURE**
```
❌ DONT TOUCH ANYTHING IN SBS_AUTOMATION
❌ DONT ADD ANYTHING IN SBS_AUTOMATION  
❌ DONT UPDATE ANYTHING IN SBS_AUTOMATION
✅ ALL WORK, PROCESSES, GENERATION MUST BE DONE ONLY IN AUTO-CODER
✅ SBS_AUTOMATION IS FOR 100% REFERENCE TO MATCH AND VALIDATE OUR WORK

🏗️ CRITICAL PATH RULES - NEVER DEVIATE:
❌ NEVER copy base-page.js, By.js, helpers.js, or any framework files from main SBS_Automation
❌ NEVER use complex conditional path logic like ../../pages/application/
❌ NEVER create dependencies on auto-coder-specific files
✅ ALWAYS generate paths that work when deployed to target environment
✅ USE simple, consistent path patterns:
   • Step definitions → Pages: ../pages/filename
   • Pages → Common: ./common/filename  
   • Pages → Support: ./../../support/filename
✅ Generated files must work immediately when copied to main SBS_Automation
✅ All imports must resolve correctly in target environment

🔄 REFERENCE-BASED WORKFLOW:
✅ Generate artifacts in auto-coder/SBS_Automation/ (staging)
✅ Deploy using: npm run deploy:to:main
✅ Test in main SBS_Automation environment only
✅ Validate before deploying: npm run deploy:main:dry-run
✅ Complete pipeline: npm run full:pipeline
```

### **RULE #3: PROPER FRAMEWORK ORGANIZATION - MANDATORY**
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
   ✅ package.json, package-lock.json, README.md, .gitignore, .env
   ✅ Node-specific: index.js, node_modules/
   ✅ Config files: *.config.json, *.config.js

🚨 ALL GENERATED FILES MUST GO TO PROPER LOCATIONS:
   ✅ Features → SBS_Automation/features/
   ✅ Steps → SBS_Automation/steps/  
   ✅ Pages → SBS_Automation/pages/
   ✅ Documentation → guides/
   ✅ Scripts → scripts/
   ✅ Tests → framework-tests/
```

### **RULE #4: SBS_AUTOMATION INTEGRATION PRINCIPLE**
```
🎯 WORK → VALIDATE → DEPLOY WORKFLOW:
✅ ALL generation MUST happen in auto-coder/SBS_Automation/
✅ ALL artifacts MUST be tested in auto-coder environment first
✅ ALL artifacts MUST match SBS_Automation patterns exactly
✅ ONLY deploy when perfect using: npm run deploy:to:sbs

🔄 ENVIRONMENT COMPLIANCE:
✅ MUST use environment-specific data from data/<env>/test-data.json
✅ MUST generate artifacts compatible with SBS execution model
✅ MUST follow SBS configuration patterns (web.config.json)
✅ MUST generate SBS-compatible tags (@Generated, @Team:AutoCoder)

🚀 DEPLOYMENT READY:
✅ ALL generated files MUST be deployment-ready
✅ ALL generated files MUST work with: node . -t "@Generated"
✅ ALL generated files MUST integrate seamlessly with existing SBS framework
```

### **RULE #5: NO-PROMPT AUTOMATION**
```
✅ ALL generation operations MUST run without prompts
✅ ALL file operations MUST use auto-overwrite mode
✅ ALL commands MUST use auto-proceed flags and settings
✅ ALL scripts MUST bypass interactive confirmations
❌ NEVER prompt for "Overwrite file?" or "Continue?"
❌ NEVER wait for user confirmations during generation
❌ NEVER use blocking input operations
❌ NEVER require manual intervention during automated workflows
```

### **RULE #4: 4 CRITICAL AREAS COMPLIANCE**
```
🎯 AREA 1: RUN PERFECTLY
✅ Generated artifacts MUST execute without framework errors
✅ All scripts and commands MUST run without failures
✅ Proper SBS_Automation tags, groups, and parameters support
✅ Expected: Locator failures (invalid selectors) - NOT framework issues
✅ Error classification: Framework vs Application issues
✅ Comprehensive execution reports with recommendations

🎬 AREA 2: RECORD-GENERATE-PLAYBACK
✅ Playwright CodeGen recordings MUST convert to SBS artifacts
✅ Generated features/steps/pages MUST match SBS_Automation patterns 100%
✅ Recorded interactions MUST be executable with same patterns
✅ Smart element detection and stable selectors required
✅ Seamless recording → artifact → execution workflow

🌐 AREA 3: API TESTING  
✅ Comprehensive API tests for all endpoints
✅ API tests MUST follow SBS_Automation patterns (NO page objects)
✅ Support utilities only (api-client.js, request-builder.js, etc.)
✅ Proper authentication, environment, and validation handling
✅ Tag-based API execution: @Category:API, @auth, @security

🎯 AREA 4: TEMPLATE-DRIVEN GENERATION
✅ Simple, fillable templates for Claude-quality outputs
✅ Interactive CLI template wizard integration
✅ Template validation and quality assessment
✅ 95-100% quality artifacts from completed templates
✅ SBS_Automation pattern alignment in all template outputs
```

## 🚨 CRITICAL FRAMEWORK FIX IMPLEMENTED

**ISSUE RESOLVED:** Framework generation logic was producing non-compliant artifacts with:
- ❌ Corrupted class names (e.g., "JiraToryClaIcFooterPage")  
- ❌ Wrong assertion patterns (expect vs assert)
- ❌ Wrong imports (playwright vs SBS patterns)
- ❌ Wrong constructor patterns
- ❌ Wrong locator patterns (data-cy vs data-test-id)

**SOLUTION IMPLEMENTED:**
- ✅ **Fixed all generators** to use exact SBS_Automation patterns
- ✅ **Pattern enforcer** validates all generators: `npm run validate:generators`
- ✅ **Quality test** ensures framework matches Claude generation: `npm run validate:framework-quality`
- ✅ **SBS compliance** validated for all generated artifacts

**VALIDATION COMMANDS:**
```bash
# Validate generators follow SBS patterns
npm run validate:generators

# Test framework generation quality  
npm run validate:framework-quality

# Validate generated artifacts
npm run validate:sbs-compliance
```

**GUARANTEE:** Framework now generates **identical quality** to Claude direct generation.

### **RULE #0: ROOT CAUSE ANALYSIS FIRST**
```
🔍 WHEN ISSUE REPORTED: 
   1️⃣ FIRST: Identify root cause in framework generation
   2️⃣ SECOND: Fix framework templates/patterns/logic
   3️⃣ THIRD: Address the reported issue  
   4️⃣ FOURTH: Validate fix prevents recurrence
❌ NEVER patch symptoms - always fix generation source
✅ Generated artifacts must be correct from framework
```

## 🚨 **CRITICAL QUALITY CONTROL RULES - MANDATORY**

### **RULE #QC1: NO EMPTY OR INCOMPLETE FILES**
```
❌ NEVER generate empty files or placeholders
❌ NEVER generate files with "// TODO" or "// Implementation needed"
❌ NEVER generate partial implementations
❌ NEVER use generic placeholders like "iid", "pageType", etc.
❌ NEVER use poor class names like "JiraToryCfcBundlePage"
✅ ALL files MUST be complete, functional, and ready to execute
✅ ALL steps MUST have full implementation with real business logic
✅ ALL page objects MUST have complete methods and realistic selectors
✅ ALL features MUST have actionable scenarios with meaningful data
```

### **RULE #QC2: 100% SBS_AUTOMATION COMPLIANCE**
```
✅ MUST match SBS_Automation patterns EXACTLY
✅ MUST use identical naming conventions (PascalCase for classes, kebab-case for files)
✅ MUST use identical file structure and import patterns
✅ MUST use identical error handling patterns with try/catch
✅ MUST use identical assertion patterns with expect()
✅ MUST include proper tags: @Team:AutoCoder @Category:Smoke @Generated
✅ MUST validate against existing SBS_Automation examples
```

### **RULE #QC3: PROFESSIONAL CODE STANDARDS**
```
✅ FEATURE FILES: Clear business scenarios with realistic data
✅ STEP DEFINITIONS: Professional class names (UserLoginPage, NOT JiraToryCfcBundlePage)
✅ PAGE OBJECTS: Real selectors and business-focused methods
✅ ERROR HANDLING: Comprehensive try/catch with meaningful messages
✅ NAMING: Consistent camelCase/PascalCase/kebab-case conventions
✅ IMPORTS: Correct relative paths and module requirements
```

### **RULE #QC4: REQUIREMENT MATCHING GUARANTEE**
```
✅ MUST read actual requirement file content
✅ MUST generate artifacts that fulfill ALL requirements
✅ MUST include ALL specified functionality
✅ MUST include ALL acceptance criteria
✅ MUST include ALL business rules
✅ MUST validate generated content matches requirements 100%
```

### **RULE #QC4: SYNTAX AND EXECUTION VALIDATION**
```
✅ ALL generated files MUST be syntactically correct
✅ ALL imports/requires MUST resolve correctly
✅ ALL method calls MUST be valid
✅ ALL Gherkin syntax MUST be proper
✅ ALL JavaScript MUST be executable
✅ NO syntax errors, typos, or malformed code
```

### **RULE #QC5: REAL APPLICATION READINESS**
```
✅ Use real locator strategies (xpath, css, data-test-id)
✅ Include comprehensive locator fallbacks
✅ Design for real application interaction
✅ Include proper wait strategies
✅ Include proper error handling for UI elements
❌ NO mock data or hardcoded responses
❌ NO placeholder locators like "button" or "#submit"
```

## 🎯 **CRITICAL REQUIREMENTS - MANDATORY COMPLIANCE**

### **MANDATORY FIRST STEPS:**
1. **ALWAYS READ REQUIREMENT FILE**: MUST use read_file tool to read actual requirement content before generating ANY files
2. **EXACT FILE NAMING**: MUST use exact basename from input file path for ALL generated files (e.g., jira-story-cfc-bundle.txt → jira-story-cfc-bundle.feature)
3. **NEVER REUSE CONTEXT**: NEVER assume or reuse previous context - always read current requirement file

### **SBS_AUTOMATION COMPLIANCE REQUIREMENTS:**
4. **MANDATORY ARTIFACT GENERATION**: Generate ONLY these 3 types (NO test files):
   - **Feature file** (.feature) - Gherkin scenarios with proper tags
   - **Step definitions** (.js) - Implementation of Gherkin steps  
   - **Page objects** (.js) - UI interaction encapsulation
5. **STEP COMPLETENESS**: Every single step in feature file MUST have corresponding implementation in step definitions
6. **TAG REQUIREMENTS**: Include proper tags: @Generated, @Team:AutoCoder, @Category:[type]
7. **FRAMEWORK CONSISTENCY**: All generated files MUST be consistent with existing SBS_Automation framework
8. **NAMING CONVENTIONS**: Follow SBS_Automation naming patterns exactly
9. **FUNCTIONAL COMPLETENESS**: All generated files MUST be functional, properly structured, and require no corrections
10. **SYNTAX VALIDATION**: All generated files MUST be free of syntax errors
11. **SBS_AUTOMATION STRICT COMPLIANCE**: Follow SBS_Automation patterns STRICTLY
12. **NO CONSOLE LOGS**: Remove any console.log statements from generated code
13. **DETAILED DOCUMENTATION**: Include detailed summary and documentation explaining how to edit, what to edit, where to edit, and how to run features
14. **REAL LOCATORS ONLY**: Use real locators and selectors instead of mock implementations
15. **REAL APPLICATION TESTING**: Ensure all features are written to run against the real application
16. **VALIDATION AND COMPLIANCE**: Validate all generated artifacts to ensure they follow SBS_Automation patterns
17. **FRAMEWORK ALIGNMENT**: Validate all page objects, steps, and feature files against existing SBS_Automation framework
18. **EXPECTED FAILURE DESIGN**: Features MUST be designed to fail if locators are invalid, indicating users need to update them
19. **NO MOCKED DATA**: Generated features MUST NOT rely on any mocked data or responses
20. **PERFECT SBS_AUTOMATION MATCH**: Match 100% with SBS_Automation framework patterns
21. **FINAL VERIFICATION**: Before completing generation, cross-check every feature step against step definitions to ensure 100% coverage
22. **REAL APPLICATION READY**: Features ready to run against real applications (will fail until locators updated)
23. **SBS_AUTOMATION INTEGRATION**: Use existing SBS_Automation framework patterns for application launch and login procedures
24. **DIRECT PORTABILITY**: Generated artifacts can be copied directly to SBS_Automation framework after locator adjustments

## 🎯 **SBS_AUTOMATION EXECUTION ALIGNMENT**

### **EXECUTION MODEL REQUIREMENTS:**
1. **Feature-Based Execution**: Features contain scenarios which ARE the tests
2. **Tag-Based Filtering**: Use @Team:, @Category:, @Generated tags for execution
3. **Parallel Execution**: Support npm run test:parallel for performance
4. **Environment-Aware**: Support multiple environment configurations
5. **Cucumber Integration**: Execute via npx cucumber-js like SBS_Automation
6. **Headless Support**: Support headless execution options
7. **Failed Test Rerun**: Support rerun capabilities for failed scenarios

### **EXECUTION COMMANDS TO SUPPORT:**
```bash
# Generated feature execution (SBS-style)
npm run test:features              # Run all generated features
npm run test:generated            # Run @Generated tagged features
npm run test:team:autocoder       # Run @Team:AutoCoder tagged features
npm run test:parallel             # Run with parallel execution
npm run test:smoke               # Run @smoke tagged features
npm run test:critical            # Run @critical tagged features
```

## 🏗️ **IMPORTANT: SBS_Automation Pattern Requirements**

### **Feature Files (.feature):**
- Proper Gherkin syntax with Given/When/Then
- Include scenario tags: @Generated, @Team:AutoCoder, @Category:[type]
- Background steps for common setup
- Clear scenario descriptions
- Real application workflow scenarios

### **Step Definition Files (.js):**
- NO Before hooks
- NO try/catch blocks  
- NO if/else conditions
- NO console.log statements
- INCLUDE timeouts (e.g., `{ timeout: 240 * 1000 }`)
- Direct page object method calls
- Proper assertions using chai
- Clear step descriptions

### **Page Object Files (.js):**
- Class-based structure
- Constructor accepts page parameter
- Real locators (will need updating for real app)
- Helper methods for complex interactions
- Proper encapsulation of UI elements
- Clear method naming conventions
   - Use page objects directly in steps (e.g., `new HomePage(this.page).method()`)
   - Use assert from chai (NOT expect)
   - Example: `assert.isTrue(result, 'Error message')`

2. **Page Files:**
   - Include proper imports at top:
     ```javascript
     const By = require('../../support/By.js');
     const helpers = require('../../support/helpers');
     let BasePage = require('../common/base-page');
     ```
   - Define locators at top using By.xpath or By.css:
     ```javascript
     const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"]`);
     const MENU_ITEM = (menuName) => By.xpath(`//div[contains(@class, "menu-item")][.//span[text()="${menuName}"]]`);
     ```
   - Class MUST extend BasePage
   - Constructor MUST call super(page)
   - NO console.log statements
   - NO direct this.locators usage

## Supported Input Sources

The framework supports generating test artifacts from the following input sources:

### 1. Text Files
- **Types**: txt, md
- **Usage**: Plain text requirements, markdown documentation
- **Example**: `/Users/gadea/auto/auto/qa_automation/auto-coder/requirements/text/jira-story-workers-comp.txt`

### 2. Image Files
- **Types**: png, jpg, jpeg, gif
- **Usage**: UI mockups, wireframes, screenshots, design images
- **Example**: `/Users/gadea/auto/auto/qa_automation/auto-coder/requirements/images/home-page-mockup.png`

### 3. cURL API Requests
- **Types**: curl
- **Usage**: API endpoint specifications, REST API documentation
- **Example**: `/Users/gadea/auto/auto/qa_automation/auto-coder/requirements/curl/api-endpoints.txt`

### 4. JIRA Integration
- **Types**: jira
- **Usage**: JIRA Features, Stories, Epics, Tasks, Bugs
- **Example**: `/Users/gadea/auto/auto/qa_automation/auto-coder/requirements/jira/PROJ-123.json`

### 5. Confluence Pages
- **Types**: confluence
- **Usage**: Confluence documentation, requirements pages
- **Example**: `/Users/gadea/auto/auto/qa_automation/auto-coder/requirements/confluence/requirements-page.html`

### 6. UX Design Files
- **Types**: figma, adobe-xd, sketch
- **Usage**: Figma designs, Adobe XD prototypes, Sketch files
- **Example**: `/Users/gadea/auto/auto/qa_automation/auto-coder/requirements/design/figma-prototype.json`

## Standard Prompt Format

```
INSTRUCTION: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

INPUT_SOURCE_TYPE: [Select one: text, markdown, image, curl, jira, confluence, figma, adobe-xd, sketch]
INPUT_FILE_PATH: [Provide full path to requirements file, e.g., /Users/gadea/auto/auto/qa_automation/auto-coder/requirements/text/requirement-file.txt]

OUTPUT_DIRECTORY: SBS_Automation/

REQUIRED_ARTIFACTS:
- summary [.md]: Detailed requirement analysis with scenarios and test cases (saved to guides/)
- feature [.feature]: Cucumber feature file saved to SBS_Automation/features/
- steps [-steps.js]: Step definitions saved to SBS_Automation/steps/
- page [-page.js]: Page object saved to SBS_Automation/pages/
- guide [_guide.md]: Detailed guide for locator updates and test execution (saved to guides/)

NO TEST FILES: Do NOT generate test files (.test.js, .spec.js) - Features ARE the tests
NO GENERATED DIRECTORY: Save directly to SBS_Automation/ structure

## MANDATORY PRE-COMPLETION VALIDATION CHECKLIST

Before declaring generation complete, VERIFY:

### ✅ Step Coverage Validation:
1. Count total Given/When/Then steps in .feature file
2. Count corresponding step implementations in -steps.js file  
3. Verify 1:1 mapping - every feature step MUST have step definition
4. Check for parameterized steps and ensure proper regex matching
5. Verify no steps are missing, incomplete, or incorrectly mapped

### ✅ SBS_Automation Pattern Compliance:
1. Step definitions use proper timeout: `{ timeout: 240 * 1000 }`
2. No Before/After hooks in step files
3. No try/catch blocks in steps
4. No console.log statements anywhere
5. Assert statements use `assert.isTrue()`, NOT expect()
6. Page objects called correctly: `new PageName(this.page).method()`

### ✅ File Structure Validation:
1. Page objects extend BasePage with proper constructor
2. Locators defined at top using By.xpath/By.css
3. Required imports present in all files
4. Naming convention: base-filename used for all artifacts
5. All files syntactically correct and runnable

### ✅ Functional Completeness:
1. Every requirement scenario has corresponding test coverage
2. All acceptance criteria addressed in feature steps
3. Proper error handling scenarios included
4. Real locators (not mocks) used for UI interactions
5. Tests designed to fail with placeholder selectors
- page [-page.js]: Page object that matches SBS_Automation patterns (see requirements)
- test [-test.js]: Test file matching page, steps, and feature

OUTPUT_DIRECTORY: [Provide path to output directory, e.g., /Users/gadea/auto/auto/qa_automation/auto-coder/generated]

IMPLEMENTATION_TYPE: sbs-automation  # Important: Follows exact SBS_Automation patterns

SPECIAL_INSTRUCTIONS: [Any special requirements or considerations]

NAMING_CONVENTION: Use source file basename (without extension) for all generated artifacts
```

## Example Usage

### Text File Input
```
INSTRUCTION: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

INPUT_SOURCE_TYPE: text
INPUT_FILE_PATH: /Users/gadea/auto/auto/qa_automation/auto-coder/requirements/text/jira-story-cfc-bundle.txt

REQUIRED_ARTIFACTS:
- summary [.md]: Detailed requirement analysis with scenarios and test cases
- feature [.feature]: Cucumber feature file with BDD scenarios matching requirements
- steps [-steps.js]: Step definitions that match SBS_Automation patterns (NO try/catch, NO Before hooks, WITH timeouts)
- page [-page.js]: Page object that matches SBS_Automation patterns (extends BasePage, locators at top)
- test [-test.js]: Test file matching page, steps, and feature
- guide [_guide.md]: Detailed guide for locator updates and test execution

OUTPUT_DIRECTORY: /Users/gadea/auto/auto/qa_automation/auto-coder/generated

IMPLEMENTATION_TYPE: sbs-automation  # Important: Follows exact SBS_Automation patterns

SPECIAL_INSTRUCTIONS: 
- Ensure proper BDD structure with Given/When/Then steps that match EXACTLY the SBS_Automation framework patterns
- Use real locators that will fail against non-existent elements
- Include detailed guide for updating locators with real UI elements
- Remove all console.log statements, try/catch blocks, and if/else conditions
- Double validate all generated artifacts match SBS_Automation patterns 100%

NAMING_CONVENTION: Use source file basename (without extension) for all generated artifacts
```

### Image File Input
```
INSTRUCTION: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

INPUT_SOURCE_TYPE: image
INPUT_FILE_PATH: /Users/gadea/auto/auto/qa_automation/auto-coder/requirements/images/home-page-design.png

REQUIRED_ARTIFACTS: [same as above]

SPECIAL_INSTRUCTIONS: 
- Analyze UI elements visible in the image
- Generate locators based on common UI patterns
- Create test scenarios for visual elements and user interactions shown
- Include accessibility testing scenarios where applicable
```

### cURL API Input
```
INSTRUCTION: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

INPUT_SOURCE_TYPE: curl
INPUT_FILE_PATH: /Users/gadea/auto/auto/qa_automation/auto-coder/requirements/curl/api-endpoints.txt

REQUIRED_ARTIFACTS: [same as above]

SPECIAL_INSTRUCTIONS: 
- Generate API testing scenarios
- Include request/response validation
- Create page objects for API interactions
- Focus on status codes, headers, and response body validation
```

### JIRA Input
```
INSTRUCTION: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

INPUT_SOURCE_TYPE: jira
INPUT_FILE_PATH: /Users/gadea/auto/auto/qa_automation/auto-coder/requirements/jira/PROJ-123.json

REQUIRED_ARTIFACTS: [same as above]

SPECIAL_INSTRUCTIONS: 
- Extract acceptance criteria from JIRA story
- Generate scenarios based on story requirements
- Include edge cases and negative scenarios
- Map JIRA labels to test tags
```

### Confluence Input
```
INSTRUCTION: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

INPUT_SOURCE_TYPE: confluence
INPUT_FILE_PATH: /Users/gadea/auto/auto/qa_automation/auto-coder/requirements/confluence/requirements-page.html

REQUIRED_ARTIFACTS: [same as above]

SPECIAL_INSTRUCTIONS: 
- Parse structured requirements from Confluence content
- Extract user stories and acceptance criteria
- Generate comprehensive test coverage for all documented features
```

### UX Design Input
```
INSTRUCTION: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

INPUT_SOURCE_TYPE: figma
INPUT_FILE_PATH: /Users/gadea/auto/auto/qa_automation/auto-coder/requirements/design/prototype.json

REQUIRED_ARTIFACTS: [same as above]

SPECIAL_INSTRUCTIONS: 
- Analyze interactive elements and user flows
- Generate tests for responsive design scenarios
- Include user experience validation steps
- Create scenarios for different device types and screen sizes
```

## Quick Reference

To use this prompt, simply refer to it like this:
`/generate-test-artifacts.prompt.md`

Then provide your specific inputs:

- Input source type
- Input file path
- Any special instructions

## SBS_Automation Pattern Details

### Step Files Requirements

1. **Simplified Structure**
   ```javascript
   const { assert } = require('chai');
   const { When, Then } = require('@cucumber/cucumber');
   const ExamplePage = require('../../pages/example-page');

   Then('verification step description', { timeout: 240 * 1000 }, async function () {
     let result = await new ExamplePage(this.page).methodName();
     assert.isTrue(result, 'Error message if assertion fails');
   });
   ```

2. **Key Patterns**
   - Include timeout: `{ timeout: 240 * 1000 }`
   - Create page object instance in each step: `new ExamplePage(this.page)`
   - Use chai assertions: `assert.isTrue()`, `assert.equal()`, etc.
   - NO try/catch blocks
   - NO console.log statements
   - NO if/else conditions
   - NO Before hooks

### Page Files Requirements

1. **Required Structure**
   ```javascript
   const By = require('../../support/By.js');
   const helpers = require('../../support/helpers');
   let BasePage = require('../common/base-page');

   // Define locators at the top level
   const CLASSIC_FOOTER = By.xpath('//footer[@class="classic-footer"]');
   const NEXTGEN_FOOTER = By.xpath('//footer[@class="nextgen-footer"]');
   const SYSTEM_PROPERTY_TABLE = By.css('table.system-properties');
   const PROPERTY_VALUE_FIELD = By.css('input[name="property-value"]');
   const SAVE_BUTTON = By.css('button[type="submit"]');

   class ClassicFooterPage extends BasePage {
     constructor(page) {
       super(page);
       this.page = page;
     }

     async setClassicFooterProperty(value) {
       await this.navigate('/admin/system-properties');
       await this.waitForElement(SYSTEM_PROPERTY_TABLE);
       await this.click(PROPERTY_VALUE_FIELD);
       await this.fill(PROPERTY_VALUE_FIELD, value);
       await this.click(SAVE_BUTTON);
     }

     async isClassicFooterDisplayed() {
       return await this.isVisible(CLASSIC_FOOTER);
     }
   }

   module.exports = ClassicFooterPage;
   ```

2. **Key Patterns**
   - Define locators at top using By.xpath or By.css
   - Class MUST extend BasePage
   - Constructor MUST call super(page)
   - Use locators directly, not in this.locators object
   - NO console.log statements
   - NO try/catch blocks unless absolutely necessary

### CRITICAL RULE: NO MISSING STEP DEFINITIONS
- Every feature step in the .feature file MUST have a matching implementation in the steps file.
- If any step is marked "Undefined" during test execution, this is a generation failure and MUST be auto-fixed before completion.
- The generation process MUST double validate and guarantee 100% step coverage—no missing steps allowed.
- This rule is mandatory for all input sources and all future generations.

### AGENT VALIDATION RULE (MANDATORY):
The agent must verify every generated file is present, non-empty, and matches SBS_Automation standards. If any file is missing, empty, or non-compliant, the agent must immediately regenerate, validate, and report the issue before marking the task complete.

### cURL Parsing Rule for API Test Artifacts (MANDATORY):
For API test artifact generation, the agent must parse cURL commands from input files and generate matching Node.js requests. This ensures all headers, cookies, and request details are included, and no steps are missed. Always validate the generated request against manual cURL execution.

### API Test Output Rule (MANDATORY):
For every API test artifact, the agent must ensure the test script prints clear status and response (or error) output to the console. This guarantees users always see pass/fail results and response details when running API tests.

# SBS_Automation Agent Compliance: API Test Artifact Generation

## MANDATORY RULES FOR API TESTS
1. All API test scripts must execute the original cURL command directly using Node.js `child_process.execSync` or equivalent, to ensure exact request fidelity and bypass network/proxy restrictions.
2. The cURL command must be read from the designated input file and executed as-is, preserving all headers, cookies, and options.
3. The script must print the full cURL command before execution and output the full response (stdout and stderr) for validation and debugging.
4. Any error or non-200 response must print both the error message and the raw output for troubleshooting.
5. No API test script may use only axios, fetch, or other HTTP libraries for direct execution—cURL invocation is required for compliance.
6. All API test artifacts must be double-validated for correct parsing, execution, and output before marking as passed.
7. These rules are mandatory for all agent-driven API/cURL-based test artifact generation and execution.

## Example Files

### Example Step Definition (Following SBS_Automation Patterns):

```javascript
const { assert } = require('chai');
const { When, Then } = require('@cucumber/cucumber');
const ClassicFooterPage = require('../../pages/example/classic-footer-page');

// Background
Given('the test environment is set up', { timeout: 240 * 1000 }, async function() {
  await new ClassicFooterPage(this.page).navigateToApplication();
});

// Scenario: Classic footer is not displayed when property is ON
Given('the classic footer display property is set to {string}', { timeout: 240 * 1000 }, async function(value) {
  await new ClassicFooterPage(this.page).setClassicFooterProperty(value);
});

Then('the classic footer should not be displayed', { timeout: 240 * 1000 }, async function() {
  let isDisplayed = await new ClassicFooterPage(this.page).isClassicFooterDisplayed();
  assert.isFalse(isDisplayed, 'Classic footer is displayed when it should not be');
});
```

### Example Page Object (Following SBS_Automation Patterns):

```javascript
const By = require('../../support/By.js');
const helpers = require('../../support/helpers');
let BasePage = require('../common/base-page');

// Define locators at the top level
const CLASSIC_FOOTER = By.xpath('//footer[@class="classic-footer"]');
const NEXTGEN_FOOTER = By.xpath('//footer[@class="nextgen-footer"]');
const SYSTEM_PROPERTY_TABLE = By.css('table.system-properties');
const PROPERTY_VALUE_FIELD = By.css('input[name="property-value"]');
const SAVE_BUTTON = By.css('button[type="submit"]');

class ClassicFooterPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async setClassicFooterProperty(value) {
    await this.navigate('/admin/system-properties');
    await this.waitForElement(SYSTEM_PROPERTY_TABLE);
    await this.click(PROPERTY_VALUE_FIELD);
    await this.fill(PROPERTY_VALUE_FIELD, value);
    await this.click(SAVE_BUTTON);
  }

  async isClassicFooterDisplayed() {
    return await this.isVisible(CLASSIC_FOOTER);
  }
}

module.exports = ClassicFooterPage;
```

## Naming Conventions

All generated files will follow consistent naming based on the source file:

- `{basename}.md` - Summary file
- `{basename}.feature` - Feature file
- `{basename}-steps.js` - Step definitions
- `{basename}-page.js` - Page object
- `{basename}-test.js` - Test file
- `{basename}_guide.md` - Detailed guide for editing and running tests

Where `{basename}` is the name of the source file without extension.

## Guide Document Requirements

The `{basename}_guide.md` file MUST include:

1. Detailed explanation of the generated test artifacts
2. Instructions for how to edit locators when the real UI is available
3. Specific guidance on what locators need to be updated and where
4. Step-by-step instructions for running the tests against a real application
5. Troubleshooting information for common issues
6. Examples of valid locators that might work in the real application

This guide is crucial for users to successfully transition from generated test artifacts to working tests against the real application.

### API Test Best Practice Rule (MANDATORY):
For API-only tests, use Mocha, Jest, or a plain Node.js script. Only use Playwright’s test runner for browser-based tests.

### **RULE #3.5: CRITICAL QUALITY FIXES - LESSONS LEARNED**
```
🎯 ROOT CAUSE FIXES IMPLEMENTED:
❌ NEVER generate generic class names like "JiraToryCfcBundlePage"
❌ NEVER use placeholder content without real business context
❌ NEVER rely on generic Handlebars templates with {{placeholders}}
❌ NEVER mix generated/ and SBS_Automation/ directory structures
✅ ALWAYS analyze real SBS_Automation patterns before generation
✅ ALWAYS generate professional, business-contextual class names
✅ ALWAYS use meaningful element selectors following SBS patterns
✅ ALWAYS save artifacts in SBS_Automation/ directory structure only

🔧 INPUT TYPE DETECTION - CRITICAL FRAMEWORK FIX:
❌ NEVER rely on file extensions alone for input type detection
✅ ALWAYS use priority-based detection: cURL > Record > Extension > Content
✅ ALWAYS validate input type before processing with InputTypeManager
✅ ALWAYS ensure artifacts are properly extracted before template generation

📁 PATH RESOLUTION - FRAMEWORK CONSISTENCY:
❌ NEVER use hardcoded './generated' paths in any component
✅ ALWAYS use './SBS_Automation' as default output directory
✅ ALWAYS ensure AutoCoder main class uses correct default paths
✅ ALWAYS validate output directory structure matches SBS_Automation

🏗️ TEMPLATE ENGINE - PROFESSIONAL QUALITY:
❌ NEVER use generic templates with basic placeholders
✅ ALWAYS use SBS_Automation-specific templates with real patterns
✅ ALWAYS generate meaningful locators: [data-cy="business-context-element"]
✅ ALWAYS include proper imports and professional code structure
✅ ALWAYS validate generated code matches SBS_Automation standards
```
