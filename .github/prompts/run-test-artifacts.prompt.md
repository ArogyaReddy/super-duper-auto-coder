# 🚀 Test Artifact Execution Prompt - SBS_Automation Aligned

Use this prompt template to run and manage test artifacts using SBS_Automation execution patterns.

## 🚨 **FUNDAMENTAL RULES - NEVER DEVIATE**

### **RULE #1: PROPER FRAMEWORK ORGANIZATION - MANDATORY**
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

🚨 WHEN CREATING ANY FILE:
   1️⃣ FIRST: Determine correct folder based on file type
   2️⃣ SECOND: Create file in proper location  
   3️⃣ THIRD: NEVER create files in root unless explicitly allowed
   4️⃣ FOURTH: Move existing misplaced files to correct folders
```

### **RULE #2: SBS_AUTOMATION EXECUTION MODEL**
```
✅ Execute Features ONLY (NO test files) - features ARE the tests
✅ Use SBS-style execution: npm run test:features, npm run test:generated
✅ Tag-based filtering: @Team:AutoCoder, @Category:Generated, @smoke, @critical
✅ Parallel execution support: npm run test:parallel
✅ Cucumber-based execution like SBS_Automation
❌ NO separate test file execution (.test.js, .spec.js)
❌ NO Jest/Mocha execution - use Cucumber only
```

### **RULE #3: SBS_AUTOMATION PROTECTION & REFERENCE ARCHITECTURE** 
```
❌ DONT TOUCH ANYTHING IN SBS_AUTOMATION
❌ DONT RUN TESTS IN SBS_AUTOMATION DIRECTORY
✅ ALL TEST EXECUTION MUST BE DONE ONLY IN AUTO-CODER
✅ SBS_AUTOMATION IS FOR REFERENCE AND VALIDATION ONLY

🏗️ REFERENCE-BASED EXECUTION RULES:
❌ NEVER execute tests directly on copied framework files
❌ NEVER run tests that depend on auto-coder-specific paths
✅ ALWAYS use deployment workflow for testing:
   1. Generate artifacts in auto-coder/SBS_Automation/
   2. Deploy to main SBS_Automation: npm run deploy:to:main
   3. Test in main SBS_Automation: npm run test:with:main
✅ VALIDATE deployment with: npm run deploy:main:dry-run
✅ USE complete pipeline: npm run full:pipeline
✅ ENSURE all generated paths work in target environment
```

### **RULE #4: NO-PROMPT EXECUTION**
```
✅ ALL test execution MUST run without prompts or confirmations
✅ ALL execution commands MUST use auto-proceed mode
✅ ALL report generation MUST be automatic without user input
✅ ALL browser/driver operations MUST be headless by default
✅ ALL cleanup operations MUST proceed automatically
❌ NEVER prompt for "Continue execution?" or "Generate reports?"
❌ NEVER wait for user confirmation during test runs
❌ NEVER require manual intervention for report viewing
❌ NEVER block execution waiting for user responses
```

### **RULE #4: 4 CRITICAL AREAS EXECUTION COMPLIANCE**
```
🎯 AREA 1: PERFECT EXECUTION
✅ Pre-execution validation MUST pass before any test run
✅ Error classification MUST distinguish framework vs application issues
✅ Expected locator failures MUST be clearly identified and reported
✅ Framework errors MUST result in execution termination and fix
✅ Comprehensive execution reports MUST be generated

🎬 AREA 2: RECORDED ARTIFACT EXECUTION
✅ Recorded artifacts MUST execute using same patterns as SBS_Automation
✅ Generated features from recordings MUST follow SBS execution model
✅ Recorded interactions MUST be tagged properly (@Generated @Recorded)
✅ Recording playback MUST provide clear pass/fail results

🌐 AREA 3: API TEST EXECUTION
✅ API tests MUST execute without page object dependencies
✅ API tests MUST support environment-specific configuration
✅ API authentication MUST be handled properly
✅ API response validation MUST be comprehensive
✅ API execution MUST support parallel and tag-based filtering

🎯 AREA 4: TEMPLATE-GENERATED EXECUTION
✅ Template-generated artifacts MUST execute at Claude-quality level
✅ Template artifacts MUST pass execution validation
✅ Template-generated tests MUST follow SBS_Automation patterns exactly
✅ Quality assessment MUST match predicted template quality
```

## 🚨 **EXECUTION QUALITY CONTROL RULES - MANDATORY**

### **RULE #EQ1: PROPER EXECUTION VALIDATION**
```
✅ MUST validate all features load without syntax errors
✅ MUST validate all step definitions are found
✅ MUST validate all page objects are accessible
✅ MUST check for missing imports or dependencies
✅ MUST verify browser/driver setup is working
❌ NEVER proceed with execution if validation fails
```

### **RULE #EQ2: COMPREHENSIVE REPORTING**
```
✅ MUST generate Cucumber HTML reports
✅ MUST generate Playwright reports (if using Playwright)
✅ MUST generate custom execution summary
✅ MUST include pass/fail statistics
✅ MUST include execution timing information
✅ MUST include error details for failures
✅ MUST include screenshot on failures (when applicable)
```

### **RULE #EQ3: PROPER ERROR HANDLING**
```
✅ Handle locator not found errors gracefully
✅ Provide clear error messages for missing elements
✅ Include suggestions for locator updates
✅ Handle timeout errors with retry logic
✅ Capture and report browser console errors
✅ Provide debugging information for failures
```

### **RULE #EQ4: EXECUTION ENVIRONMENT MANAGEMENT**
```
✅ Properly initialize browser/driver
✅ Handle environment-specific configurations
✅ Manage test data and cleanup
✅ Ensure proper test isolation
✅ Handle parallel execution conflicts
✅ Proper resource cleanup after execution
```

### **RULE #EQ5: REPORTING AND DOCUMENTATION**
```
✅ Generate detailed execution reports
✅ Document how to interpret results
✅ Provide guidance for fixing failures
✅ Include performance metrics
✅ Generate both HTML and JSON reports
✅ Include execution screenshots for debugging
```

## 🎯 **CRITICAL EXECUTION REQUIREMENTS**

### **MANDATORY PRE-EXECUTION CHECKS:**
1. **FEATURE VALIDATION**: Verify all feature files exist in SBS_Automation/features/
2. **STEP COMPLETENESS**: Ensure all Gherkin steps have corresponding step definitions
3. **PAGE OBJECT VALIDATION**: Verify all page objects are properly structured
4. **TAG VALIDATION**: Confirm proper tags for execution filtering

### **SBS_AUTOMATION EXECUTION ALIGNMENT:**
5. **FEATURE-BASED EXECUTION**: Execute scenarios through Cucumber like SBS_Automation
6. **TAG-BASED FILTERING**: Support execution by tags (@Generated, @Team:AutoCoder, etc.)
7. **PARALLEL EXECUTION**: Support multi-threaded execution for performance
8. **ENVIRONMENT CONFIGURATION**: Support multiple environment configurations
9. **HEADLESS EXECUTION**: Support headless browser execution options
10. **FAILED TEST RERUN**: Support rerun capabilities for failed scenarios
11. **REAL APPLICATION TESTING**: Features MUST run against real applications
12. **EXPECTED FAILURES**: Features SHOULD fail if locators are invalid - this is EXPECTED behavior
13. **NO GENERATED DIRECTORY**: All execution from SBS_Automation/ structure only

## 🚀 **SUPPORTED EXECUTION COMMANDS**

### **SBS-Style Feature Execution:**
```bash
# Execute all generated features
npm run test:features

# Execute by tags (SBS-style)
npm run test:generated              # @Generated tagged features  
npm run test:team:autocoder         # @Team:AutoCoder tagged features
npm run test:smoke                  # @smoke tagged features
npm run test:critical               # @critical tagged features

# Performance execution
npm run test:parallel               # Parallel execution with 4 threads
npm run test:headless              # Headless browser execution

# Failed test management
npm run test:rerun                 # Re-run failed scenarios

# Direct Cucumber execution (advanced)
npx cucumber-js generated/features/ --require generated/steps/ --tags "@Generated"
npx cucumber-js generated/features/ --require generated/steps/ --parallel 4
```

### **Execution Parameters:**
- **--tags**: Filter by scenario tags (@Generated, @smoke, etc.)
- **--parallel**: Number of parallel threads (1, 2, 4, 8)
- **--require**: Path to step definitions and support files
- **--format**: Report format (json, html, progress)

## 📊 **CRITICAL EXECUTION VALIDATION**

### **PRE-EXECUTION VALIDATION:**
1. **NO UNDEFINED STEPS**: Every Gherkin step must have implementation
2. **STEP COMPLETENESS CHECK**: Validate step coverage before execution
3. **FEATURE SYNTAX**: Verify proper Gherkin syntax in feature files
4. **PAGE OBJECT STRUCTURE**: Confirm page objects follow SBS patterns

### **EXECUTION EXPECTATIONS:**
5. **EXPECTED FAILURES**: Features WILL fail initially due to invalid locators
6. **REAL LOCATOR TESTING**: Features use real locators that need updating for actual app
7. **NO MOCKED DATA**: Features MUST NOT rely on mocked data or responses
8. **UI ELEMENT VALIDATION**: Features MUST validate actual UI elements in real application
4. Test files can be copied directly to SBS_Automation framework after locator adjustments
5. Detailed error reports will help identify which locators need to be updated

## Supported Test Types by Input Source

The framework supports running tests generated from various input sources:

### 1. Text-based Tests (txt, md)
- **Focus**: Functional testing, business logic validation
- **Execution**: Feature files with step definitions

### 2. Image-based Tests (png, jpg, jpeg, gif)
- **Focus**: UI validation, visual regression testing
- **Execution**: Visual comparison tests, element interaction tests

### 3. API Tests (curl)
- **Focus**: API endpoint validation, integration testing
- **Execution**: Request/response validation, status code checks

### 4. JIRA-based Tests (jira)
- **Focus**: Story acceptance criteria, bug reproduction
- **Execution**: Feature tests mapped to JIRA requirements

### 5. Confluence Tests (confluence)
- **Focus**: Documentation-driven testing, requirement validation
- **Execution**: Comprehensive feature coverage tests

### 6. Design Tests (figma, adobe-xd, sketch)
- **Focus**: User experience validation, responsive design testing
- **Execution**: Multi-device tests, interaction flow validation

## Guidelines for Running Tests

1. Tests should be run against real application environments
2. Test failures should provide clear details about failed locators
3. Reports should include screenshots of failures for easy debugging
4. Reports should indicate exact locations in code where failures occur

## Standard Prompt Format

```
INSTRUCTION: Execute the specified test artifacts. Tests will fail initially due to placeholder locators.

TEST_TYPE: [Select one: feature, api, ui, integration, visual, all]
TEST_TARGET: [Provide file or directory path, e.g., /Users/gadea/auto/auto/qa_automation/auto-coder/generated/features/cfc-api-test.feature]
INPUT_SOURCE_TYPE: [Original source type: text, markdown, image, curl, jira, confluence, figma, adobe-xd, sketch]

EXECUTION_OPTIONS:
- browser: chrome (single browser only - no multi-browser testing needed for placeholder locators)
- headless: [true, false]
- parallel: 1 (single process recommended for initial testing)
- tags: [optional tag expression, e.g., "@api and not @wip"]
- timeout: [optional timeout in ms, default: 240000]
- debug: [true, false] - enables additional logging and screenshots
- screenshots: only-on-failure (capture failures for debugging)
- video: retain-on-failure (record failures for analysis)
- trace: on-first-retry (detailed trace for debugging)
- detailed_reports: true (MANDATORY - generates comprehensive reports with error analysis)
- save_artifacts: true (saves test artifacts for debugging)
- locator_highlighting: true (highlights locators in screenshots for easier debugging)
- report_directory: generated/reports (structured report storage)
- html_report_auto_open: false (don't auto-serve - save for manual access)
- custom_detailed_reporting: true (generate comprehensive analysis reports)

REPORT_FORMAT: [html, json, junit, custom] (custom detailed reporting is MANDATORY)
REPORT_DIRECTORY: /Users/gadea/auto/auto/qa_automation/auto-coder/generated/reports (structured directory with subfolders)

LOCATOR_VALIDATION: true (MANDATORY - Checks and reports real locators that fail with detailed analysis)
ERROR_ANALYSIS: true (MANDATORY - Provides comprehensive analysis of why tests failed)
FAILURE_GUIDANCE: true (MANDATORY - Provides step-by-step guidance for fixing failures)
INTEGRATION_SETTINGS: sbs-automation (Use SBS_Automation framework patterns for application launch and login)

SPECIAL_INSTRUCTIONS: [Any special requirements or test-specific configurations]

## MANDATORY PRE-EXECUTION VALIDATION

Before running any tests, perform these checks:

### ✅ Step Definition Coverage Validation:
1. Open the target .feature file and identify all Given/When/Then steps
2. Open the corresponding -steps.js file
3. Verify every feature step has a matching step definition
4. Check for parameterized steps (with `<parameter>` or `{string}` patterns)
5. Ensure regex patterns in step definitions match feature file syntax
6. Report any missing step implementations before execution

### ✅ File Structure Validation:
1. Verify all required files exist:
   - .feature file (scenarios)
   - -steps.js file (step definitions)  
   - -page.js file (page objects)
   - -test.js file (test runner)
2. Check file naming consistency (same base name)
3. Validate import/require statements resolve correctly

### ✅ Execution Environment Check:
1. Verify application accessibility (if testing against live app)
2. Check browser/environment configuration
3. Validate locators marked as placeholders need updates
4. Confirm test data availability

## MANDATORY STEP IMPLEMENTATION AND HOOKS RULES:
- For every step marked "Undefined" during test execution, you MUST copy the provided snippet into the steps file (e.g., generated/steps/jira-story-cfc-bundle-steps.js) and implement the logic. No missing steps allowed.
- In support/hooks.js, ensure that any referenced functions (e.g., this.init, this.takeScreenshot) are defined on your World object or replaced with correct logic. If using a custom World, it MUST include these methods.
- Double validate: Every feature step MUST have a matching implementation in the steps file. Remove any unused or broken references in hooks.
- Before completing execution, implement all missing step definitions and fix or remove broken hook functions.

### CRITICAL RULE: NO MISSING STEP DEFINITIONS
- Every feature step in the .feature file MUST have a matching implementation in the steps file.
- If any step is marked "Undefined" during test execution, this is a generation failure and MUST be auto-fixed before completion.
- The generation process MUST double validate and guarantee 100% step coverage—no missing steps allowed.
- This rule is mandatory for all input sources and all future generations.

# SBS_Automation Agent Compliance: API Test Artifact Execution

## MANDATORY RULES FOR API TEST EXECUTION
1. All API test scripts must execute the original cURL command directly using Node.js `child_process.execSync` or equivalent, to ensure exact request fidelity and bypass network/proxy restrictions.
2. The cURL command must be read from the designated input file and executed as-is, preserving all headers, cookies, and options.
3. The script must print the full cURL command before execution and output the full response (stdout and stderr) for validation and debugging.
4. Any error or non-200 response must print both the error message and the raw output for troubleshooting.
5. No API test script may use only axios, fetch, or other HTTP libraries for direct execution—cURL invocation is required for compliance.
6. All API test artifacts must be double-validated for correct parsing, execution, and output before marking as passed.
7. These rules are mandatory for all agent-driven API/cURL-based test artifact execution.

---

## Expected Test Results

### ⚠️ Initial Execution (Placeholder Locators):
- Tests WILL fail with "Element not found" errors
- This is EXPECTED and REQUIRED behavior
- Failure reports should identify specific selectors needing updates

### ✅ After Locator Updates:
- Tests should interact with real application elements
- May still fail on business logic (which provides valuable feedback)
- Should generate meaningful test reports with actual results

## Execution Examples by Input Source Type
```

## Example Usage

### Text/Markdown Source Tests
```
INSTRUCTION: Execute the specified test artifacts. Tests will fail initially due to placeholder locators.

TEST_TYPE: feature
TEST_TARGET: /Users/gadea/auto/auto/qa_automation/auto-coder/generated/features/jira-story-cfc-bundle.feature
INPUT_SOURCE_TYPE: text

EXECUTION_OPTIONS:
- browser: chrome
- headless: false
- parallel: 1
- timeout: 300000
- debug: true
- screenshots: on-failure
- video: on-failure
- detailed_reports: true

REPORT_FORMAT: html,json,allure
REPORT_DIRECTORY: /Users/gadea/auto/auto/qa_automation/auto-coder/test-results

LOCATOR_VALIDATION: true
ERROR_ANALYSIS: true

SPECIAL_INSTRUCTIONS: Expect failures due to placeholder locators from text-based requirements.
```

### Image Source Tests
```
INSTRUCTION: Execute the specified test artifacts. Tests will fail initially due to placeholder locators.

TEST_TYPE: ui
TEST_TARGET: /Users/gadea/auto/auto/qa_automation/auto-coder/generated/features/home-page-design.feature
INPUT_SOURCE_TYPE: image

EXECUTION_OPTIONS:
- browser: chrome
- headless: false
- screenshots: always
- video: always
- detailed_reports: true

SPECIAL_INSTRUCTIONS: Visual tests generated from image mockups. Expect locator failures until UI elements are mapped.
```

### API Source Tests
```
INSTRUCTION: Execute the specified test artifacts. Tests will fail initially due to placeholder locators.

TEST_TYPE: api
TEST_TARGET: /Users/gadea/auto/auto/qa_automation/auto-coder/generated/features/api-endpoints.feature
INPUT_SOURCE_TYPE: curl

EXECUTION_OPTIONS:
- parallel: 4
- timeout: 60000
- debug: true

SPECIAL_INSTRUCTIONS: API tests from cURL specifications. Verify endpoint configurations and authentication.
```

### JIRA Source Tests
```
INSTRUCTION: Execute the specified test artifacts. Tests will fail initially due to placeholder locators.

TEST_TYPE: feature
TEST_TARGET: /Users/gadea/auto/auto/qa_automation/auto-coder/generated/features/PROJ-123.feature
INPUT_SOURCE_TYPE: jira

EXECUTION_OPTIONS:
- browser: chrome
- headless: false
- tags: "@story and @acceptance"
- detailed_reports: true

SPECIAL_INSTRUCTIONS: Tests generated from JIRA story acceptance criteria. Map to actual implementation.
```

### Confluence Source Tests
```
INSTRUCTION: Execute the specified test artifacts. Tests will fail initially due to placeholder locators.

TEST_TYPE: integration
TEST_TARGET: /Users/gadea/auto/auto/qa_automation/auto-coder/generated/features/requirements-page.feature
INPUT_SOURCE_TYPE: confluence

EXECUTION_OPTIONS:
- browser: chrome
- parallel: 2
- detailed_reports: true

SPECIAL_INSTRUCTIONS: Comprehensive tests from Confluence documentation. Verify all documented features.
```

### Design Source Tests
```
INSTRUCTION: Execute the specified test artifacts. Tests will fail initially due to placeholder locators.

TEST_TYPE: visual
TEST_TARGET: /Users/gadea/auto/auto/qa_automation/auto-coder/generated/features/figma-prototype.feature
INPUT_SOURCE_TYPE: figma

EXECUTION_OPTIONS:
- browser: chrome,firefox,webkit
- headless: false
- screenshots: always
- video: always
- detailed_reports: true

SPECIAL_INSTRUCTIONS: UX validation tests from design prototypes. Test across multiple browsers and devices.
```

## Quick Reference

To use this prompt, simply refer to it like this:
`/run-test-artifacts.prompt.md`

Then provide your specific inputs:

- Test type and target
- Execution options
- Report format and location
- Any special instructions

## Understanding Test Failures

When you run tests generated by this framework, they will initially fail - this is expected behavior:

1. **Missing/Incorrect Locators**: Tests are generated with placeholder locators that need to be updated
2. **Application Differences**: Generated tests might not match your exact application structure
3. **Environment Setup**: Some environment-specific configuration may be needed

## Locator Debugging and Fixing

To update tests with correct locators:

1. Run tests with debug mode enabled (`debug: true`)
2. Review test failures and identify missing/incorrect locators
3. Update page object files with correct XPath or CSS selectors
4. Replace placeholder locators with real UI element selectors
5. Run tests again to verify fixes

Example locator update:
```javascript
// BEFORE: Placeholder locator
const CLASSIC_FOOTER = By.css('[data-testid="classic-footer"]');

// AFTER: Real locator
const CLASSIC_FOOTER = By.xpath('//footer[@class="classic-footer-container"]');
```

## Transition to SBS_Automation

Once locators are updated and tests are working, you can easily move them to SBS_Automation:

1. Copy generated feature files to SBS_Automation's features directory
2. Copy generated step files to SBS_Automation's steps directory
3. Copy generated page files to SBS_Automation's pages directory
4. Update any import paths as needed
5. Run tests using SBS_Automation's test runner

### Using Direct Cucumber.js

```bash
npx cucumber-js <feature-file-or-directory> --require generated/steps --format json:test-results/report.json
```

## Execution Methods

Tests can be executed in several ways:

### Using index.js Runner (Recommended)

```bash
node index.js <feature-file-or-directory>
```

### Using Environment Variables for Configuration

```bash
BROWSER=chrome HEADLESS=false TAGS="@api" DEBUG=true node index.js <feature-file-or-directory>
```

### Debugging Options

Add these environment variables for better debugging:

```bash
DEBUG=true SCREENSHOTS=true TIMEOUT=300000 node index.js <feature-file-or-directory>
```

## Example Commands

### Run a specific feature file:
```bash
node index.js generated/features/jira-story-classic-footer.feature
```

### Run with debug mode and screenshots:
```bash
DEBUG=true SCREENSHOTS=true node index.js generated/features/jira-story-classic-footer.feature
```

### Run all features with a specific tag:
```bash
TAGS="@api" node index.js generated/features
```

### Run in headless mode with parallel execution:
```bash
HEADLESS=true PARALLEL=2 node index.js generated/features
```

Remember: Tests will initially fail due to placeholder locators. This is expected behavior, not a framework issue.

```bash
```bash
# Auto-Coder Enhanced Test Execution Commands

# Run specific feature file with enhanced reporting
./auto-coder.sh test generated/features/jira-story-rs-end-point.feature

# Run specific test with detailed custom reports
./auto-coder.sh test generated/tests/jira-story-rs-end-point-test.js

# Run all generated tests with comprehensive reporting
npm run test:generated

# View reports manually (no auto-serving)
npm run reports:open          # HTML report
npm run reports:detailed      # Custom detailed report

# Clean reports directory
npm run reports:clean

# Debug specific test with enhanced logging
npm run dev:debug -- generated/tests/jira-story-rs-end-point-test.js

# Trace test execution for detailed analysis
npm run dev:trace

# Quick test run commands
npm run auto-coder-run        # Run predefined test
npm run test:cfc             # Run CFC bundle test
npm run generate:cfc         # Generate CFC artifacts
```

## Expected Behavior and Next Steps

### ⚠️ Initial Test Execution (Expected Failures):
1. **All tests WILL fail** - This is EXPECTED and REQUIRED behavior
2. **Failure reasons**: Placeholder locators (data-testid) don't exist in real applications
3. **Success indicator**: Detailed failure reports are generated with specific locator issues
4. **Framework validation**: Failures confirm real tests were generated (not mocks)

### 📊 Enhanced Reporting Features:
1. **HTML Report**: `generated/reports/html-report/index.html`
2. **Custom Detailed Report**: `generated/reports/custom/detailed-test-report.html`
3. **JSON Results**: `generated/reports/custom/detailed-results.json`
4. **Failure Analysis**: Detailed breakdown of each failure with recommendations
5. **Locator Guidance**: Specific instructions for updating selectors

### 🛠️ Next Steps for Real Application Testing:
1. **Review Failure Reports**: Check detailed reports for specific locator issues
2. **Inspect Real Application**: Use browser dev tools to find actual element selectors
3. **Update Page Files**: Replace placeholder locators in `generated/pages/` directory
4. **Validate Selectors**: Test selectors in browser console before updating
5. **Re-run Tests**: Execute tests again with updated locators
6. **Copy to SBS_Automation**: Move working tests to SBS_Automation framework

### 🎯 Integration with SBS_Automation:
1. Generated test artifacts follow SBS_Automation patterns exactly
2. Files can be copied directly after locator updates
3. Framework handles application launch and login procedures
4. Tests integrate seamlessly with existing SBS_Automation infrastructure

Remember: Initial test failures indicate the framework is working correctly by generating real tests, not mocks.