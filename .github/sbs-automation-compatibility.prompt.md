# � PROMPT: SBS AUTOMATION COMPATIBILITY

## 🚨 **CRITICAL PRODUCTION RULES - 100% COMPATIBILITY** 🚨

**For COMPLETE SBS_Automation compatibility, MUST enforce:**

### 1. **LOCATOR COMPATIBILITY:**
   ✅ Single quotes pattern matches SBS_Automation: `By.css('[data-test-id="element"]')`
   ✅ Parametrized locators follow SBS patterns:
   ```javascript
   const BTN_ELEMENT = (btnName) => By.xpath(`//sdf-button[text() = "${btnName}"]`);
   const leftNavIcon = (leftNavName) => By.xpath(`//sdf-icon[@data-test-id='${leftNavName}-icon'] | //button[@data-test-id='${leftNavName}-btn']`);
   ```

### 2. **STEP COMPATIBILITY:**
   ✅ Parameter usage matches SBS patterns from `/steps/common/run-onboarding-steps.js`:
   ```javascript
   When('Alex clicks {string} menu on the Left Menu', { timeout: 100 * 1000 }, async function (leftNavOption) {
     await new RunOnboardingPage(this.page).clickOnLeftNavIcon(leftNavOption);
   });
   ```

### 3. **PAGE COMPATIBILITY:**
   ✅ Constructor matches SBS pattern from `/pages/common/home-page.js`
   ✅ Locators defined outside class like SBS_Automation
   ✅ Only use BasePage methods that exist in main framework

### 4. **IMPORT COMPATIBILITY:**
   ✅ Reference main SBS_Automation files correctly
   ✅ No duplication of framework files

### 5. **DEPLOYMENT COMPATIBILITY:**
   ✅ Artifacts work after deployment to main SBS_Automation
   ✅ Path corrections handle properly
   ✅ No execution failures due to missing methods

---

## 📋 **INTERACTION TEMPLATE**🔗 PROMPT: 100% SBS_AUTOMATION COMPATIBILITY

## 📋 **INTERACTION TEMPLATE**

```markdown
Hello Claude,

I need you to ensure 100% compatibility between Auto-Coder framework and main SBS_Automation framework for all features, steps, pages, test artifacts generation, execution, and maintenance.

**COMPATIBILITY REQUEST:**
Please help me achieve complete compatibility in:
□ Generated feature files match SBS format exactly
□ Generated step definitions integrate seamlessly
□ Generated page objects follow SBS patterns perfectly
□ Execution model identical to SBS_Automation
□ Import/export patterns work in SBS context
□ Deployment process seamless to main SBS framework
□ Maintenance workflows aligned with SBS practices

**CURRENT COMPATIBILITY ISSUES:**
[Describe any compatibility problems:]
□ Generated artifacts fail when moved to main SBS_Automation
□ Import paths don't resolve in SBS context
□ Constructor patterns don't match SBS standards
□ Execution commands differ from SBS approach
□ Tag patterns not recognized by SBS framework
□ Locator strategies incompatible with SBS

**SPECIFIC COMPATIBILITY AREAS:**
□ File structure and organization
□ Code patterns and conventions
□ Execution and testing workflows
□ Reporting and analysis
□ Environment configuration
□ Tool integration
□ Team collaboration workflows

**VALIDATION REQUIREMENTS:**
Please ensure:
✅ Generated artifacts work immediately in main SBS_Automation
✅ No manual modifications required after generation
✅ All imports resolve correctly in SBS context
✅ Execution commands match SBS patterns exactly
✅ Reports integrate with existing SBS reporting
✅ Team workflows remain unchanged
```

## 🎯 **EXAMPLE USAGE**

```markdown
Hello Claude,

I need you to ensure 100% compatibility between Auto-Coder framework and main SBS_Automation framework for all features, steps, pages, test artifacts generation, execution, and maintenance.

**COMPATIBILITY REQUEST:**
Currently, when I copy generated artifacts from Auto-Coder to the main SBS_Automation framework, they fail due to path resolution and pattern mismatches.

**CURRENT COMPATIBILITY ISSUES:**
- Generated page objects fail with "Cannot find module" errors
- Step definitions use different assertion syntax than SBS standard
- Feature file tags not recognized by SBS execution engine
- Import paths work in Auto-Coder but fail in main SBS_Automation

**SPECIFIC COMPATIBILITY AREAS:**
All areas listed above, with focus on making generated artifacts work immediately when deployed to main SBS_Automation.

**VALIDATION REQUIREMENTS:**
Generated artifacts must be copy-paste ready for main SBS_Automation with zero modifications.
```

## 🏗️ **SBS_AUTOMATION COMPATIBILITY MATRIX**

### **File Structure Compatibility**
```markdown
SBS_AUTOMATION STRUCTURE:
SBS_Automation/
├── features/
│   └── [category]/[feature].feature
├── steps/
│   └── [category]/[feature]-steps.js
├── pages/
│   └── [category]/[page].js
├── support/
│   ├── By.js
│   ├── helpers.js
│   └── base-page.js
└── package.json

AUTO-CODER MUST GENERATE:
auto-coder/SBS_Automation/
├── features/
│   └── [category]/[feature].feature (SBS compatible)
├── steps/
│   └── [category]/[feature]-steps.js (SBS compatible)
└── pages/
    └── [category]/[page].js (SBS compatible)

COMPATIBILITY RULE:
✅ Generated files must work when copied to exact SBS locations
✅ All relative paths must resolve in SBS context
✅ No auto-coder specific dependencies
```

### **Code Pattern Compatibility**
```markdown
SBS PAGE OBJECT PATTERN:
const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

class MyPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  
  async myMethod() {
    await this.clickElement(LOCATOR);
  }
}

module.exports = MyPage;

AUTO-CODER MUST GENERATE EXACTLY:
- Same import structure
- Same inheritance pattern  
- Same constructor implementation
- Same method signatures
- Same export format
```

### **Step Definition Compatibility**
```markdown
SBS STEP PATTERN:
const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');
const PageClass = require('../../pages/category/page-name');

let pageObject;

Given('I am on the page', { timeout: 60 * 1000 }, async function () {
  pageObject = new PageClass(this.page);
  const result = await pageObject.navigateToPage();
  assert.isTrue(result, 'Should navigate successfully');
});

AUTO-CODER MUST GENERATE EXACTLY:
- Same import statements
- Same assertion library (chai.assert, NOT expect)
- Same timeout pattern
- Same page object instantiation
- Same assertion patterns
```

## 🔍 **COMPATIBILITY VALIDATION PROCESS**

### **Phase 1: Pattern Analysis**
```bash
# Analyze main SBS_Automation patterns
cd /Users/gadea/auto/auto/qa_automation/SBS_Automation

# Extract page object patterns
find pages/ -name "*.js" -exec head -20 {} \; > sbs-page-patterns.txt

# Extract step definition patterns  
find steps/ -name "*-steps.js" -exec head -30 {} \; > sbs-step-patterns.txt

# Extract feature file patterns
find features/ -name "*.feature" -exec head -15 {} \; > sbs-feature-patterns.txt
```

### **Phase 2: Generator Alignment**
```bash
# Update Auto-Coder generators to match SBS patterns exactly
npm run update:generators-to-sbs

# Validate generator output
npm run validate:sbs-compatibility

# Test with real SBS examples
npm run test:sbs-compatibility
```

### **Phase 3: Integration Testing**
```bash
# Generate test artifacts
npm run generate:test-artifacts

# Copy to main SBS_Automation
cp auto-coder/SBS_Automation/* ../SBS_Automation/

# Test in main SBS context
cd ../SBS_Automation
npm test
```

## 🛠️ **COMPATIBILITY ENFORCEMENT**

### **Import Path Compatibility**
```markdown
PROBLEM: Auto-Coder paths don't work in main SBS_Automation
SOLUTION: Generate paths that work in target context

AUTO-CODER GENERATES (WRONG):
const By = require('../../auto-coder/SBS_Automation/support/By.js');

MUST GENERATE (CORRECT):
const By = require('./../../support/By.js');

RULE: All imports must use relative paths from target file location
```

### **Constructor Pattern Compatibility**
```markdown
PROBLEM: Generated constructors don't match SBS BasePage pattern
SOLUTION: Use exact SBS constructor pattern

AUTO-CODER GENERATES (WRONG):
constructor(page) {
  this.page = page;
}

MUST GENERATE (CORRECT):
constructor(page) {
  super(page);
  this.page = page;
}

RULE: Always call super(page) first, then assign this.page
```

### **Assertion Compatibility**
```markdown
PROBLEM: Auto-Coder uses expect() but SBS uses assert
SOLUTION: Always use chai.assert syntax

AUTO-CODER GENERATES (WRONG):
expect(result).to.be.true;

MUST GENERATE (CORRECT):
assert.isTrue(result, 'Operation should succeed');

RULE: Use chai.assert methods with descriptive messages
```

### **Locator Compatibility**
```markdown
PROBLEM: Auto-Coder uses data-cy but SBS uses data-test-id
SOLUTION: Always use SBS locator attributes

AUTO-CODER GENERATES (WRONG):
const BUTTON = By.css('[data-cy="submit-btn"]');

MUST GENERATE (CORRECT):
const BUTTON = By.css('[data-test-id="submit-btn"]');

RULE: Use data-test-id attributes exclusively
```

## 📊 **COMPATIBILITY METRICS**

### **Success Criteria**
```markdown
DEPLOYMENT SUCCESS:
- 100% of generated artifacts work in main SBS_Automation without modification
- 0% import resolution errors when deployed
- 0% syntax errors in generated code
- 100% test execution success in SBS context

COMPATIBILITY SCORE:
- Path Resolution: 100% success rate
- Pattern Matching: 100% compliance with SBS patterns
- Execution Compatibility: 100% success in SBS environment
- Integration Seamless: 0 manual modifications required
```

### **Validation Tools**
```bash
# Compatibility validation suite
npm run validate:sbs-compatibility

# Path resolution testing
npm run test:path-resolution

# Pattern compliance checking
npm run test:pattern-compliance

# End-to-end compatibility test
npm run test:e2e-compatibility
```

## 🔄 **DEPLOYMENT WORKFLOW**

### **Seamless Deployment Process**
```markdown
WORKFLOW:
1. Generate artifacts in Auto-Coder staging area
2. Validate 100% SBS compatibility
3. Copy artifacts to main SBS_Automation
4. Verify execution in SBS context
5. No manual modifications required

COMMANDS:
# Generate in Auto-Coder
npm run generate:artifacts

# Validate compatibility
npm run validate:sbs-compatibility

# Deploy to main SBS (when ready)
npm run deploy:to-sbs

# Verify in main SBS
cd ../SBS_Automation && npm test
```

### **Zero-Modification Guarantee**
```markdown
GUARANTEE:
Generated artifacts must work immediately when copied to main SBS_Automation with:
- Zero code modifications
- Zero import fixes
- Zero path adjustments
- Zero pattern corrections
- Zero syntax fixes

VALIDATION:
Every generated artifact tested in actual SBS_Automation context before release
```

## 🎯 **CONTINUOUS COMPATIBILITY**

### **Compatibility Monitoring**
```markdown
MONITOR:
- SBS_Automation pattern changes
- New SBS framework updates
- Breaking changes in main framework
- Compatibility regression detection

ALERT SYSTEM:
- Daily compatibility validation
- Automatic pattern drift detection
- SBS framework update notifications
- Compatibility score tracking
```

### **Maintenance Alignment**
```markdown
ALIGNMENT:
- Auto-Coder updates follow SBS changes
- Pattern updates synchronized
- Compatibility maintained across versions
- Breaking changes communicated early

PROCESS:
1. Monitor SBS_Automation changes
2. Update Auto-Coder generators accordingly
3. Validate compatibility maintained
4. Release compatible updates
```

---

**📞 Usage:** Copy the interaction template above, describe your specific compatibility needs, and send to Claude for comprehensive SBS_Automation compatibility implementation.
