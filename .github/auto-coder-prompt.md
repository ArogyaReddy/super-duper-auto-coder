# 🚨 AUTO-CODER PROMPT - SIMPLE & STRICT

## **⚠️ USER FEEDBACK: "I am not sure, if you are really following on my RULES, PROMPTS?? I am not sure, if you are really following all of STANDARDS and GUIDELINES?? because, I am concerned, as you are making the same mistakes again and again.And I want you follow strictly the given RULES, process, patterns and match everything exactly as per main SBS_Automation."**

**SOLUTION: ONE SIMPLE PROMPT WITH ABSOLUTE RULES - NO EXCEPTIONS**

---

## 🔥 **CRITICAL RULE #1: ALWAYS FOLLOW SBS_AUTOMATION PATTERNS**

### **✅ MANDATORY: COPY EXACT PATTERNS FROM MAIN SBS_AUTOMATION**
- **Feature files**: Copy naming, tags, scenarios from `/SBS_Automation/features/`
- **Step files**: Copy structure, imports, methods from `/SBS_Automation/steps/`  
- **Page files**: Copy locators, methods, patterns from `/SBS_Automation/pages/`
- **NO EXCEPTIONS** - Always match SBS patterns exactly

### **✅ MANDATORY FILE LOCATIONS:**
- Save to: `/auto-coder/SBS_Automation/features/`, `/auto-coder/SBS_Automation/steps/`, `/auto-coder/SBS_Automation/pages/`
- Use EXACT requirement file name: `req-cfc-promo.txt` → `req-cfc-promo.feature`
- **NO auto-coder subfolders** in source pages

---

## 🔥 **CRITICAL RULE #2: IMAGE ANALYSIS - READ EVERYTHING**

### **✅ MANDATORY: EXTRACT ALL VISIBLE ELEMENTS**
When analyzing images, MUST identify:
- **Text** (exact spelling, capitalization) 
- **Buttons** (exact button text)
- **Links** (clickable text)
- **Headers** (main titles)
- **Sub-headers** (secondary titles)
- **Badges** ("New", "Beta", status indicators)
- **Checkboxes** (form elements)
- **Radio buttons** (selection options)
- **Text boxes** (input fields)
- **All UI elements** visible in image

### **✅ EXAMPLE: PROPER IMAGE ANALYSIS**
```gherkin
# ✅ CORRECT: Based on actual image elements
Scenario: CFC promotional section displays correctly
  When Alex clicks on "Billings and Invoice" menu
  Then Alex navigates to the Billings and Invoice page
  And Alex verifies the CFC promotional header is displayed
  And Alex verifies the "New" badge is displayed
  And Alex verifies the CFC promotional sub header is displayed
  And Alex verifies the feature summary paragraph is displayed
  And Alex verifies the "Learn more" button is displayed
```

---

## 🔥 **CRITICAL RULE #3: NO FORBIDDEN PATTERNS EVER**

### **❌ ABSOLUTELY FORBIDDEN:**
- **NO console.log()** in any file
- **NO try-catch** in step files
- **NO if-else** in step files
- **NO wrong BasePage import** - ALWAYS use `require('../common/base-page')`
- **NO generic step patterns** - Use context-specific patterns
- **NO wrong personas** - ALWAYS use "Alex"

### **✅ ONLY ALLOWED:**
```javascript
// ✅ CORRECT Step Definition
When('Alex clicks the {string} button', async function(buttonText) {
  await new PageClass(this.page).clickLearnMoreButton();
});

// ✅ CORRECT Page Object
const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

const BUTTON_SELECTOR = By.css('[data-test-id="button"]');

class MyPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  
  async clickButton() {
    await this.clickElement(BUTTON_SELECTOR);
  }
}
```

---

## 🔥 **CRITICAL RULE #4: CONSISTENCY MANDATE**

### **⚠️ USER FEEDBACK: "I am afraid to share to team as you are inconstant in test artifacts generations."**

### **✅ CONSISTENCY REQUIREMENTS:**
- **EVERY generation** must follow same quality standard
- **SAME systematic approach** for image analysis every time
- **SAME SBS compliance** on every artifact
- **NO quality variations** between generations
- **NO re-teaching** required

### **✅ PRE-GENERATION CHECKLIST:**
- [ ] Analyzed ALL visible elements in image
- [ ] Extracted exact text with correct spelling/capitalization
- [ ] Will use SBS patterns from main framework
- [ ] Will save to correct locations
- [ ] Will NOT use forbidden code patterns

---

## 🎯 **GENERATION PROCESS - SIMPLE & SYSTEMATIC**

### **STEP 1: ANALYZE REQUIREMENT**
- Read text files completely
- Scan images systematically (top→bottom, left→right)
- Extract ALL visible elements with exact text

### **STEP 2: FOLLOW SBS PATTERNS**
- Check main SBS_Automation for similar patterns
- Copy structure, naming, and methods exactly
- Use established conventions

### **STEP 3: GENERATE ARTIFACTS**
- Feature: Based on actual requirement elements
- Steps: Pure delegation, no logic
- Page: Locators above class, extend BasePage
- Use exact requirement file name

### **STEP 4: VALIDATE COMPLIANCE**
- No forbidden patterns (console.log, try-catch, if-else in steps)
- Correct file locations
- SBS pattern compliance

---

## 🚨 **ABSOLUTE GUARANTEE TO USER**

**I WILL:**
- ✅ **Read and follow this prompt completely** every time
- ✅ **Analyze ALL image elements systematically** 
- ✅ **Follow SBS patterns exactly** without exceptions
- ✅ **Generate consistent quality** on every generation
- ✅ **Never use forbidden patterns**

**USER EXPECTATION:** *"Allways follow RULES, naming convensions, standards, feature file, steps file, page file patterns from main SBS_Automation. NO exceptions for that."*

**MY COMMITMENT:** **NO EXCEPTIONS - ALWAYS FOLLOW SBS PATTERNS EXACTLY**
