# 🏗️ PROMPT: SBS_AUTOMATION FRAMEWORK PATTERNS

## � CRITICAL PRODUCTION RULES - MANDATORY ENFORCEMENT

### **5 CRITICAL RULES FOR ALL GENERATED ARTIFACTS:**

1. **LOCATOR STANDARDS**: Prefer `By.css()` with single quotes; avoid `By.xpath()` unless necessary
2. **PARAMETERIZATION**: Use parameterized locators for dynamic elements referenced in feature files  
3. **CLEAN METHODS**: No unused parameters in page methods
4. **EXISTING METHODS ONLY**: Only use methods that exist in main SBS_Automation BasePage (no `waitForPageLoad()`)
5. **PROPER CONSTRUCTORS**: No locators in constructor, always call `super(page)`

### **CRITICAL EXAMPLES:**

✅ **CORRECT LOCATORS:**
```javascript
const SUBMIT_BUTTON = By.css('[data-test-id="submit-btn"]');
const DYNAMIC_ELEMENT = (elementId) => By.css(`[data-test-id="${elementId}"]`);
```

✅ **CORRECT CONSTRUCTOR:**
```javascript
constructor(page) {
    super(page);
    // No locators here
}
```

❌ **FORBIDDEN PATTERNS:**
- `By.xpath()` unless absolutely necessary
- Unused method parameters
- `waitForPageLoad()` method calls
- Locators in constructors

---

## �📋 **INTERACTION TEMPLATE**

```markdown
Hello Claude,

I need you to analyze and apply SBS_Automation framework patterns for the Auto-Coder framework to ensure 100% compatibility.

**ANALYSIS REQUEST:**
Please analyze the main SBS_Automation framework and help me with:
□ Extract current patterns from SBS_Automation 
□ Validate Auto-Coder compliance with SBS patterns
□ Update Auto-Coder generators to match SBS exactly
□ Create pattern enforcement rules
□ Document SBS compliance standards

**SBS_AUTOMATION LOCATION:**
Main framework: /Users/gadea/auto/auto/qa_automation/SBS_Automation/
Auto-Coder staging: /Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation/

**PATTERN AREAS TO ANALYZE:**
□ Page Object patterns (BasePage extension, constructor, methods)
□ Step Definition patterns (imports, assertions, structure)
□ Feature File patterns (tags, scenario structure, BDD format)
□ Locator patterns (data-test-id usage, selector formats)
□ Import patterns (relative paths, module references)
□ Execution patterns (Cucumber integration, tag usage)

**COMPLIANCE VERIFICATION:**
Please verify these SBS standards:
✅ Page Objects extend BasePage: constructor(page) { super(page); this.page = page; }
✅ Imports use: const By = require('./../../support/By.js');
✅ Assertions use: const { assert } = require('chai'); NOT expect
✅ Locators use: data-test-id attributes NOT data-cy
✅ Team tags use: @Team:SBSBusinessContinuity NOT @Team:AutoCoder
✅ Paths work in SBS_Automation context (relative paths)
✅ No auto-coder specific dependencies
```

## 🎯 **EXAMPLE USAGE**

```markdown
Hello Claude,

I need you to analyze and apply SBS_Automation framework patterns for the Auto-Coder framework to ensure 100% compatibility.

**ANALYSIS REQUEST:**
The Auto-Coder generators are producing artifacts that don't match SBS patterns exactly. Please analyze the main SBS_Automation framework and update our generators.

**SPECIFIC ISSUES:**
- Generated page objects have incorrect constructor patterns
- Step definitions using wrong assertion syntax (expect vs assert)
- Locators using data-cy instead of data-test-id
- Import paths not working when deployed to main SBS_Automation

**PATTERN AREAS TO ANALYZE:**
[All areas listed above]

**FILES TO EXAMINE:**
- Main SBS: /Users/gadea/auto/auto/qa_automation/SBS_Automation/pages/myAdp/my-adp-pay-page.js
- Main SBS: /Users/gadea/auto/auto/qa_automation/SBS_Automation/steps/plain-requirements-test-steps.js
- Main SBS: /Users/gadea/auto/auto/qa_automation/SBS_Automation/support/By.js
- Auto-Coder generators: /Users/gadea/auto/auto/qa_automation/auto-coder/src/generators/
```

## 🔍 **PATTERN ANALYSIS FRAMEWORK**

### **Page Object Pattern Analysis**
```markdown
EXAMINE:
1. BasePage inheritance structure
2. Constructor implementation
3. Method naming conventions
4. Locator definition patterns
5. Import statement formats
6. Module export patterns

EXTRACT:
- Standard constructor: constructor(page) { super(page); this.page = page; }
- Locator definitions: const ELEMENT = By.css('[data-test-id="identifier"]');
- Method structure: async methodName() { ... }
- Import format: const By = require('./../../support/By.js');
```

### **Step Definition Pattern Analysis**
```markdown
EXAMINE:
1. Cucumber integration patterns
2. Assertion library usage
3. Page object instantiation
4. Error handling patterns
5. Timeout configurations
6. Import structures

EXTRACT:
- Cucumber imports: const { Given, When, Then } = require('@cucumber/cucumber');
- Assertion imports: const { assert } = require('chai');
- Page instantiation: pageObject = new PageClass(this.page);
- Timeout pattern: { timeout: 60 * 1000 }
```

### **Feature File Pattern Analysis**
```markdown
EXAMINE:
1. Tag usage patterns
2. Background sections
3. Scenario structures
4. Step phrasing conventions
5. Data table usage
6. Outline patterns

EXTRACT:
- Team tags: @Team:SBSBusinessContinuity
- Category tags: @Category:UI, @Category:API
- Priority tags: @Priority:P1, @Priority:P2
- Scenario structure: Given/When/Then patterns
```

## 🛠️ **PATTERN ENFORCEMENT**

### **Generator Updates Needed**
```markdown
Please update these Auto-Coder generators to match SBS patterns:

1. PAGE OBJECT GENERATOR:
   - Fix constructor pattern
   - Update import statements
   - Correct locator definitions
   - Apply SBS method conventions

2. STEP DEFINITION GENERATOR:
   - Fix assertion imports (chai.assert)
   - Update timeout patterns
   - Correct page object instantiation
   - Apply SBS error handling

3. FEATURE FILE GENERATOR:
   - Fix tag patterns
   - Update scenario structures
   - Apply SBS BDD conventions
   - Correct step phrasing
```

### **Validation Rules**
```markdown
Create enforcement rules for:
1. Import path validation
2. Constructor pattern validation
3. Assertion syntax validation
4. Locator attribute validation
5. Tag pattern validation
6. File structure validation
```

## 📊 **COMPLIANCE VERIFICATION**

### **Before Pattern Updates**
```bash
# Run current compliance check
npm run validate:sbs-compliance

# Document current violations
npm run analyze:violations
```

### **After Pattern Updates**
```bash
# Validate updated generators
npm run validate:generators

# Test pattern compliance
npm run test:pattern-compliance

# Generate compliance report
npm run report:compliance
```

## 🎯 **DELIVERABLES REQUESTED**

```markdown
Please provide:

1. **Pattern Analysis Report**
   - Current SBS patterns documented
   - Auto-Coder compliance gaps identified
   - Recommended fixes for each gap

2. **Updated Generator Code**
   - Page object generator with SBS patterns
   - Step definition generator with SBS patterns
   - Feature file generator with SBS patterns

3. **Validation Rules**
   - Pattern enforcement scripts
   - Compliance checking tools
   - Automated violation detection

4. **Documentation Updates**
   - SBS pattern guide
   - Compliance checklist
   - Migration instructions
```

## 🚨 **CRITICAL REQUIREMENTS**

```markdown
MUST ENSURE:
❌ NO breaking changes to main SBS_Automation framework
❌ NO auto-coder specific dependencies in generated artifacts
❌ NO modifications to main SBS_Automation files
✅ Generated artifacts work immediately when copied to main SBS_Automation
✅ All imports resolve correctly in target environment
✅ 100% pattern compatibility with existing SBS framework
✅ Seamless integration with SBS execution model
```

---

**📞 Usage:** Copy the interaction template above, specify your pattern analysis needs, and send to Claude for comprehensive SBS_Automation pattern compliance.
