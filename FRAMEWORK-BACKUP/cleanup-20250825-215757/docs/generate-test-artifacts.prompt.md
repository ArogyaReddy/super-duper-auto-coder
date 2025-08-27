# 🎯 PROMPT: GENERATE TEST ARTIFACTS

## 🚨 **CRITICAL REQUIREMENT ANALYSIS RULE**

### **⚠️ MANDATORY: ANALYZE REQUIREMENT FIRST**
**BEFORE** generating any test artifacts:

1. **📋 READ AND UNDERSTAND THE ACTUAL REQUIREMENT:**
   - **Text Files**: Read complete content and extract testable elements
   - **Image Files**: Examine UI elements, buttons, text, layout, functionality
   - **Documents**: Parse acceptance criteria and business rules
   - **NEVER assume** what the requirement contains

2. **🔍 IDENTIFY SPECIFIC TESTABLE ELEMENTS:**
   - Extract exact text, button labels, UI components
   - Map user interactions and expected behaviors
   - Note specific functionality to be tested

3. **✅ CREATE FRESH ARTIFACTS:**
   - **NEVER copy** from existing files
   - **NEVER reuse** generic content
   - **ALWAYS generate** based on actual requirement analysis

## 🚨 **CRITICAL MINIMAL FEATURE RULES**

### **⚠️ MANDATORY: KEEP FEATURES MINIMAL**
- **SIMPLE BUTTON/LINK**: 1-2 scenarios MAXIMUM
- **SIMPLE FORM**: 2-3 scenarios MAXIMUM  
- **SIMPLE PAGE**: 1-3 scenarios MAXIMUM
- **DO NOT** add unnecessary complexity, edge cases, or multiple device scenarios
- **DO NOT** add accessibility/performance scenarios unless explicitly requested
- **ONLY** test what is visible and described in the requirement
- **ALWAYS** verify files are not empty after generation

### **⚠️ FORBIDDEN OVERENGINEERING:**
❌ Never add unless explicitly requested:
- Responsive design scenarios
- Cross-device testing scenarios  
- Accessibility scenarios
- Performance scenarios
- Edge case scenario outlines
- Multiple validation scenarios for the same thing

## 📋 **INTERACTION TEMPLATE**

```markdown
Hello Claude,

I need you to generate test artifacts for the Auto-Coder framework that are 100% compatible with SBS_Automation patterns.

**REQUIREMENTS:**
[Paste your requirements here - can be:]
- Plain text description
- JIRA story with acceptance criteria  
- API specification (Swagger/OpenAPI)
- UI mockups or screenshots
- Business rules and workflows

**GENERATION REQUEST:**
Please generate the following artifacts following SBS_Automation patterns exactly:

□ Feature file (.feature)
□ Step definitions (-steps.js)  
□ Page object (.js)
□ Full test suite (all three above)

**🚨 CRITICAL PRODUCTION RULES (MANDATORY):**

1. **LOCATOR STANDARDS:**
   ✅ Prefer By.css() over By.xpath() unless xpath necessary
   ✅ Single quotes ONLY: By.css('[data-test-id="element"]') 
   ❌ NO double quotes outside: By.css("[data-test-id='element']")

2. **PARAMETRIZED LOCATORS:**
   ✅ Feature: And Alex clicks on "Learn More" link
   ✅ Steps: When('Alex clicks on {string} link', async function (linkName) { ... })
   ✅ Page: const LINK_ELEMENT = (linkText) => By.xpath(`//a[contains(text(),"${linkText}")]`);
   ✅ Method: async clickLink(linkText) { await this.click(LINK_ELEMENT(linkText)); }

3. **NO UNUSED PARAMETERS:**
   ❌ async isPageTitleDisplayed(expectedTitle) { return await this.isVisible(PAGE_TITLE); }
   ✅ async isPageTitleDisplayed() { return await this.isVisible(PAGE_TITLE); }

4. **EXISTING BASEPAGE METHODS ONLY:**
   ❌ await this.waitForPageLoad(); // DOES NOT EXIST - FAILS
   ✅ await this.isVisible(locator); await this.click(locator); // EXISTS

5. **PROPER CONSTRUCTOR:**
   ✅ constructor(page) { super(page); this.page = page; } // NO locators in constructor

**OUTPUT LOCATIONS (CORRECTED):**
- Feature: SBS_Automation/features/[feature-name].feature (MAIN FRAMEWORK)
- Steps: SBS_Automation/steps/[feature-name]-steps.js (MAIN FRAMEWORK) 
- Page: SBS_Automation/pages/[feature-name]-page.js (MAIN FRAMEWORK)

**CRITICAL And STEP PATTERN:**
- Feature file: 'And I should see the result'
- Steps file: Then('I should see the result', async function () { ... });
- NEVER import And from cucumber - it doesn't exist in SBS framework!

**QUALITY REQUIREMENTS:**
❌ NO placeholders, TODOs, or incomplete implementations
❌ NO empty methods or "Implementation needed" comments
❌ NO syntactic errors or broken code
✅ COMPLETE functional implementation of all requirements
✅ READY for production use without manual fixes
```

## 🎯 **EXAMPLE USAGE**

```markdown
Hello Claude,

I need you to generate test artifacts for the Auto-Coder framework that are 100% compatible with SBS_Automation patterns.

**REQUIREMENTS:**
Create login functionality for admin users:
- Admin enters username and password on login page
- System validates credentials against backend API
- On success: redirect to admin dashboard with welcome message
- On failure: show error message "Invalid credentials"
- Include forgot password link that opens password reset modal
- Support "Remember me" checkbox functionality
- Handle session timeout after 30 minutes

**GENERATION REQUEST:**
Please generate full test suite (feature + steps + page) following SBS_Automation patterns exactly.

**MANDATORY SBS COMPLIANCE:**
[Same compliance rules as above]
```

## 📊 **VALIDATION CHECKLIST**

After generation, verify:
- [ ] All imports use correct paths to main SBS_Automation framework for IDE navigation
- [ ] Inline comments show main framework integration paths
- [ ] Page objects extend BasePage properly with super(page) constructor
- [ ] Step definitions implement all feature steps with SBS patterns
- [ ] Locators use data-test-id attributes (SBS standard)
- [ ] Assertions use chai.assert syntax (not expect)
- [ ] Team tags use @Team:SBSBusinessContinuity
- [ ] Comprehensive file headers with integration instructions included
- [ ] No syntax errors or incomplete code
- [ ] Files generated in auto-coder/SBS_Automation/ structure

## 🚀 **POST-GENERATION STEPS**

```bash
# Validate generated artifacts
npm run validate:framework

# Check SBS compliance  
npm run validate:sbs-compliance

# Execute generated tests
cd auto-coder/SBS_Automation
npm run test:generated
```

---

**📞 Usage:** Copy the interaction template above, fill in your requirements, and send to Claude for artifact generation.

**REQUIRED FILE HEADER:**
All generated files MUST include this header:
```javascript
/**
 * 🚨 AUTO-GENERATED ARTIFACT - REVIEW REQUIRED
 * Generated by auto-coder for [Feature Name]
 * 
 * BEFORE INTEGRATION INTO MAIN SBS_AUTOMATION:
 * 1. Review all locators and update with real UI elements
 * 2. Update require paths (see inline comments)
 * 3. Validate page object methods and step definitions
 * 4. Test integration with existing framework components
 * 
 * REQUIRES MANUAL REVIEW before integration into main SBS_Automation
 */
```

**REFERENCE PATH EXAMPLES:**
```javascript
// In auto-coder/SBS_Automation/pages/
const By = require('../../../SBS_Automation/support/By');
// When moved to main framework, update to: require('../../support/By')

// In auto-coder/SBS_Automation/steps/
const PageClass = require('../../../SBS_Automation/pages/page-name');
// When moved to main framework, update to: require('../pages/page-name')
```

## 🖼️ **MANDATORY IMAGE ANALYSIS GUIDELINES**

### **⚠️ SYSTEMATIC IMAGE SCANNING REQUIRED**
For all image-based requirements:

1. **📍 IDENTIFY ALL VISIBLE ELEMENTS (Top to Bottom, Left to Right):**
   - Headers/Titles (exact text: "Take control of your cash flow")
   - Buttons (exact text: "Learn more", not "learnmore")
   - Badges/Labels (exact text: "New", "Beta", etc.)
   - Content sections and descriptions
   - Images/Graphics/Preview elements
   - Navigation and interactive elements

2. **📝 EXTRACT EXACT TEXT CONTENT:**
   - **Use exact spelling and capitalization** as shown
   - **Never abbreviate** button text ("Learn more" not "learnmore")
   - **Include all visible badges** and status indicators
   - **Copy exact headers** and titles

3. **🎯 CREATE TESTS FOR VISIBLE ELEMENTS ONLY:**
   - Test what you can see in the image
   - Don't assume additional functionality
   - Map each visible element to a test step
   - Use exact text in step definitions

### **📋 IMAGE ANALYSIS CHECKLIST:**
- [ ] All text extracted with exact spelling
- [ ] All interactive elements identified
- [ ] All visual elements documented
- [ ] Test scenarios match visible content only
- [ ] No assumptions about hidden functionality

## 🚨 **CRITICAL RULE #0: FUNDAMENTAL SBS VIOLATIONS - MUST PREVENT**

### **⚠️ THESE ARE THE #1 FAILURE CAUSES - NEVER REPEAT:**

### **1. ❌ WRONG BASEPAGE PATH - ALWAYS FAILS**
```javascript
// ❌ WRONG - This import path NEVER works
const BasePage = require('./base-page');

// ✅ CORRECT - This is the ONLY correct import path
const BasePage = require('../common/base-page');
```

### **2. ❌ IF-ELSE IN STEPS - FRAMEWORK VIOLATION**
```javascript
// ❌ WRONG - NO if-else logic in step definitions EVER
When('Alex clicks the {string} button', async function(buttonText) {
  if (buttonText === 'Learn more') {  // ❌ FORBIDDEN
    await page.click();
  }
});

// ✅ CORRECT - Pure delegation only
When('Alex clicks the {string} button', async function(buttonText) {
  await new PageClass(this.page).clickLearnMoreButton();
});
```

### **3. ❌ WRONG PAGE LOCATION - DEPLOYMENT FAILS**
```javascript
// ❌ WRONG - Generated pages NEVER go here
/SBS_Automation/pages/common/my-page.js

// ✅ CORRECT - Generated pages ALWAYS go here  
/SBS_Automation/pages/auto-coder/my-page.js
```

### **4. ❌ STATIC TEXT COMPARISONS - NOT NEEDED**
```javascript
// ❌ WRONG - These conditions are NEVER needed
if (buttonText === 'Learn more') {  // ❌ REMOVE
if (headerText === 'Take control') {  // ❌ REMOVE

// ✅ CORRECT - Direct method calls only
await page.clickLearnMoreButton();
await page.verifyHeader();
```

### **❌ FORBIDDEN #4: NON-EXISTENT BASEPAGE METHODS**
**NEVER USE METHODS THAT DON'T EXIST:**
```javascript
❌ await this.verifyElementIsDisplayed(selector, 'desc');  // DOESN'T EXIST
❌ await this.expectVisible(selector);                     // DOESN'T EXIST  
❌ await this.waitForElementVisible(selector);             // DOESN'T EXIST
❌ await this.clickElement(selector, 'description');       // WRONG SIGNATURE

✅ await this.isVisible(selector);                         // ✅ EXISTS
✅ await this.clickElement(selector);                      // ✅ CORRECT SIGNATURE
✅ await this.waitForSelector(selector);                   // ✅ EXISTS
✅ await this.scrollIntoViewIfNeeded(selector);            // ✅ EXISTS
```

### **✅ MANDATORY METHOD VALIDATION:**
**VERIFY BEFORE USING ANY METHOD:**
- [ ] Method exists in SBS_Automation/pages/common/base-page.js
- [ ] Method signature matches exactly (no extra parameters)
- [ ] Use `const isVisible = await this.isVisible(selector)` pattern
- [ ] Add proper error handling with meaningful messages

### **❌ FORBIDDEN #5: WRONG IMPORT PATHS**  
**NEVER USE HARDCODED PATHS:**
```javascript
❌ const Page = require('../../pages/auto-coder/page');    // BREAKS IN SOURCE
❌ const Page = require('../pages/page');                  // BREAKS IN TARGET

✅ USE DYNAMIC PATH RESOLUTION - DEPLOYMENT SCRIPT HANDLES THIS
```

### **✅ MANDATORY COMPLIANCE CHECKLIST:**
`````
`````
This is the description of what the code block changes:
<changeDescription>
Adding user feedback integration and systematic image analysis requirements
</changeDescription>

This is the code block that represents the suggested code change:
```markdown
## 🚨 **CRITICAL USER FEEDBACK INTEGRATION**

### **⚠️ NEVER BE INCONSISTENT - SYSTEMATIC IMAGE ANALYSIS REQUIRED**

**USER FEEDBACK:** *"You are very inconsistent. why so? Last time you generated perfect image to test artifacts. But this time, not. You need to analyse the image, elements in image like text, buttons, links, text, paragraph, headers, sub-headers, badges, check-boxes and so.. So that it's easy for you to generate test artifacts with them and we can verify them, we can also verify the functionality accordingly. I dont have to teach you every time to do the job.."*

### **🎯 SYSTEMATIC IMAGE ELEMENT EXTRACTION MANDATORY:**

**FOR EVERY IMAGE REQUIREMENT - MUST IDENTIFY:**
- **Headers**: Extract exact main titles/headlines  
- **Sub-headers**: Extract exact secondary titles
- **Badges**: Document all status indicators ("New", "Beta", "Updated")
- **Buttons**: Use exact button text ("Learn more", "Get started", "Sign up")
- **Links**: Identify all clickable text links
- **Paragraphs**: Extract all descriptive text content
- **Checkboxes**: Note all checkbox elements and labels
- **Form Elements**: Document inputs, dropdowns, radio buttons
- **Images/Graphics**: Note visual elements, icons, illustrations
- **Navigation**: Menus, breadcrumbs, tabs
- **Lists**: Bullet points, feature lists

### **✅ COMPLETE ANALYSIS → PERFECT ARTIFACTS:**
1. **Systematic scanning** of ALL visible elements in image
2. **Exact text extraction** with perfect spelling/capitalization
3. **Element mapping** to specific test verification steps
4. **Complete test coverage** for all visible functionality
5. **Consistent quality** on every single generation

**🚨 NO MORE INCONSISTENCY - DELIVER PERFECTION EVERY TIME**
```
<userPrompt>
Provide the fully rewritten file, incorporating the suggested code change. You must produce the complete file.
</userPrompt>
