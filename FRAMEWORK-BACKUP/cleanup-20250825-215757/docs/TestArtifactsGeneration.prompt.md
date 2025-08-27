# Test Artifact Generation Prompt

## 🚨 **ABSOLUTE CRITICAL RULE: REQUIREMENT ANALYSIS MANDATORY**

### **⚠️ NEVER GENERATE WITHOUT UNDERSTANDING THE REQUIREMENT FIRST:**

**STEP 0 - MANDATORY REQUIREMENT ANALYSIS:**
1. **📋 READ THE ACTUAL REQUIREMENT:**
   - **Text Files**: Use read_file to read complete content
   - **Image Files**: Analyze UI elements, buttons, text, layout shown
   - **Documents**: Extract acceptance criteria and testable elements
   - **NEVER assume or guess** what the requirement contains

2. **🔍 EXTRACT SPECIFIC TESTABLE ELEMENTS:**
   - Identify exact UI components, buttons, text labels
   - Map user interactions and expected behaviors  
   - Document what functionality needs to be tested

3. **🚨 NEVER USE EXISTING ARTIFACTS:**
   - **NEVER copy** from previously generated files
   - **NEVER reuse** content from other requirements
   - **ALWAYS create fresh** artifacts based on current requirement
   - **Each requirement is unique** and needs unique test coverage

4. **✅ VALIDATE UNDERSTANDING:**
   - Confirm you understand what the requirement shows/describes
   - Ensure you can identify specific testable functionality
   - **STOP and ask** if requirement is unclear

**❌ FORBIDDEN: Generating without reading/understanding the requirement**
**✅ REQUIRED: Always analyze requirement content first**

Use this prompt template to generate comprehensive test artifacts from requirements that match 100% with SBS_Automation framework patterns.


# CRITICAL GROUND RULES FOR AUTO-CODER FRAMEWORK
## MANDATORY FIRST STEPS:
	1.	ALWAYS READ REQUIREMENT FILE: MUST use read_file tool to read actual requirement content before generating ANY files
	2.	EXACT FILE NAMING: MUST use exact basename from input file path for ALL generated files (e.g., jira-story-cfc-bundle.txt → jira-story-cfc-bundle-steps.js)
	3.	NEVER REUSE CONTEXT: NEVER assume or reuse previous context - always read current requirement file

## STEP COMPLETENESS REQUIREMENTS:
	4.	MANDATORY STEP COMPLETENESS: Every single step in the feature file MUST have a corresponding implementation in the step definitions file. NO MISSING STEPS ALLOWED.
	5.	STEP VALIDATION: Verify that every Given/When/Then step in .feature file has exact matching implementation in -steps.js file
	6.	DOUBLE CHECK and DOUBLE VALIDATE all generated code and test artifacts with all points listed below
	7.	FRAMEWORK CONSISTENCY: All generated files MUST be consistent with the existing SBS_Automation framework
	8.	NAMING CONVENTIONS: All generated files MUST follow the naming conventions and generation patterns used in the SBS_Automation framework
	9.	FUNCTIONAL COMPLETENESS: All generated files MUST be functional, properly structured, and require no corrections
	10.	SYNTAX VALIDATION: All generated files MUST be free of syntax errors and coding issues
	11.	SBS_AUTOMATION STRICT COMPLIANCE: Follow the SBS_Automation pattern STRICTLY when generating test artifacts
	12.	NO CONSOLE LOGS: Remove any console.log statements from generated code
	13.	DETAILED DOCUMENTATION: Include detailed summary, comments and documentation explaining how to edit, what to edit, where to edit, and how to run tests when real UI/application is available
	14.	REAL LOCATORS ONLY: Use real locators and selectors instead of mock implementations
	15.	REAL APPLICATION TESTING: Ensure all tests are written to run against the real application
	16.	VALIDATION AND COMPLIANCE: Validate all generated test artifacts to ensure they follow best practices and patterns
	17.	FRAMEWORK ALIGNMENT: Validate all page objects, steps, and feature files against the existing SBS_Automation framework
	18.	EXPECTED FAILURE DESIGN: Tests MUST be designed to fail if locators are invalid, indicating users need to update them
	19.	NO MOCKED DATA: Generated tests MUST NOT rely on any mocked data or responses
	20.	PERFECT SBS_AUTOMATION MATCH: We need to match 100% with the SBS_Automation framework
	21.	FINAL VERIFICATION: Before completing generation, cross-check every feature step against step definitions to ensure 100% coverage
	22.	REAL APPLICATION READY: Tests should be ready to run against real applications (will fail until locators updated)
	23.	SBS_AUTOMATION INTEGRATION: Use existing SBS_Automation framework patterns for application launch and login procedures
	24.	DETAILED CUSTOM REPORTS: Generate comprehensive reports with: 
		•	Test steps, assertions, and error details
		•	Screenshots or videos of test execution
		•	Clear explanation of failures and required fixes
		•	Specific locator issues and user action requirements
	25.	REPORT ACCESSIBILITY: Reports MUST be easy to read, understand, and share
	26.	LOCATOR FAILURE EXPECTATION: Tests will initially fail due to missing/incorrect locators - this is REQUIRED behavior
	27.	COMPATIBILITY DESIGN: Generated tests follow SBS_Automation patterns exactly for direct compatibility
	28.	DIRECT PORTABILITY: Test files can be copied directly to SBS_Automation framework after locator adjustments

# IMPORTANT: SBS_Automation Pattern Requirements
## 1.	Step Files:
		•	NO Before hooks
		•	NO try/catch blocks
		•	NO if/else conditions
		•	NO console.log statements
		•	INCLUDE timeouts (e.g., { timeout: 240 * 1000 })
		•	Use page objects directly in steps (e.g., new HomePage(this.page).method())
		•	Use assert from chai (NOT expect)
		•	Example: assert.isTrue(result, 'Error message')
## 2.	Page Files:
		•	Include proper imports at top: const By = require('../../support/By');
			const helpers = require('../../support/helpers');
			let BasePage = require('../common/base-page'); 
		•	Define locators at top using By.xpath or By.css: const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"]`);
			const MENU_ITEM = (menuName) => By.xpath(`//div[contains(@class, "menu-item")][.//span[text()="${menuName}"]]`); 
		•	Class MUST extend BasePage
		•	Constructor MUST call super(page)
		•	NO console.log statements
		•	NO direct this.locators usage

# Supported Input Sources

The framework supports generating test artifacts from the following input sources:
## 1. Text Files
	•	Types: txt, md
	•	Usage: Plain text requirements, markdown documentation
	•	Example: /Users/arog/framework/auto-coder/input/text/jira-story-workers-comp.txt

## 2. Image Files
	•	Types: png, jpg, jpeg, gif
	•	Usage: UI mockups, wireframes, screenshots, design images
	•	Example: /Users/arog/framework/auto-coder/input/images/home-page-mockup.png

## 3. cURL API Requests
	•	Types: curl
	•	Usage: API endpoint specifications, REST API documentation
	•	Example: /Users/arog/framework/auto-coder/input/curl/api-endpoints.txt

## 4. JIRA Integration
	•	Types: jira
	•	Usage: JIRA Features, Stories, Epics, Tasks, Bugs
	•	Example: /Users/arog/framework/auto-coder/input/jira/PROJ-123.json

## 5. Confluence Pages
	•	Types: confluence
	•	Usage: Confluence documentation, requirements pages
	•	Example: /Users/arog/framework/auto-coder/input/confluence/requirements-page.html

## 6. UX Design Files
	•	Types: figma, adobe-xd, sketch
	•	Usage: Figma designs, Adobe XD prototypes, Sketch files
	•	Example: /Users/arog/framework/auto-coder/input/design/figma-prototype.json

# Standard Prompt Format
**INSTRUCTION**: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

**INPUT_SOURCE_TYPE**: [Select one: text, markdown, image, curl, jira, confluence, figma, adobe-xd, sketch]
**INPUT_FILE_PATH**: [Provide full path to input file, e.g., /Users/arog/framework/auto-coder/input/text/requirement-file.txt]

**REQUIRED_ARTIFACTS**:
- summary [.md]: Detailed requirement analysis with scenarios and test cases
- feature [.feature]: Cucumber feature file with BDD scenarios matching requirements
- steps [-steps.js]: Step definitions that match SBS_Automation patterns (see requirements)
- page [-page.js]: page that match SBS_Automation patterns (see requirements)

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

OUTPUT_DIRECTORY: [Provide path to output directory, e.g., /Users/arog/framework/auto-coder/generated]

IMPLEMENTATION_TYPE: sbs-automation  # Important: Follows exact SBS_Automation patterns

SPECIAL_INSTRUCTIONS: [Any special requirements or considerations]

NAMING_CONVENTION: Use source file basename (without extension) for all generated artifacts 

# Example Usage
## Text File Input

**INSTRUCTION**: Generate comprehensive test artifacts that match 100% with SBS_Automation framework patterns.

**INPUT_SOURCE_TYPE**: text
**INPUT_FILE_PATH**: /Users/arog/framework/auto-coder/input/text/jira-story-cfc-bundle.txt

**REQUIRED_ARTIFACTS**:
- summary [.md]: Detailed requirement analysis with scenarios and test cases
- feature [.feature]: Cucumber feature file with BDD scenarios matching requirements
- steps [-steps.js]: Step definitions that match SBS_Automation patterns (NO try/catch, NO Before hooks, WITH timeouts)
- page [-page.js]: Page object that matches SBS_Automation patterns (extends BasePage, locators at top)
- guide [_guide.md]: Detailed guide for locator updates and test execution

OUTPUT_DIRECTORY: /Users/arog/framework/auto-coder/generated

IMPLEMENTATION_TYPE: sbs-automation  # Important: Follows exact SBS_Automation patterns

SPECIAL_INSTRUCTIONS: 
- Ensure proper BDD structure with Given/When/Then steps that match EXACTLY the SBS_Automation framework patterns
- Use real locators that will fail against non-existent elements
- Include detailed guide for updating locators with real UI elements
- Remove all console.log statements, try/catch blocks, and if/else conditions
- Double validate all generated artifacts match SBS_Automation patterns 100%

NAMING_CONVENTION: Use source file basename (without extension) for all generated artifacts