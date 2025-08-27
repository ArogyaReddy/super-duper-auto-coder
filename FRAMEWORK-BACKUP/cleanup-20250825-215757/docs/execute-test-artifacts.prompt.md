# 🧪 PROMPT: EXECUTE TEST ARTIFACTS

## � **CRITICAL PRODUCTION RULES - MUST ENFORCE** 🚨

**Before ANY execution, verify artifacts follow these MANDATORY rules:**

### 1. **LOCATOR STANDARDS:**
   ✅ Single quotes only: `By.css('[data-test-id="element"]')`
   ❌ NO: `By.css("[data-test-id='element']")`

### 2. **PARAMETRIZED LOCATORS:**
   ✅ Feature: `And Alex clicks on "Learn More" link`
   ✅ Steps: `When('Alex clicks on {string} link', async function (linkName) { ... })`
   ✅ Page: `const LINK_ELEMENT = (linkText) => By.xpath(\`//a[contains(text(),"\${linkText}")]\`);`

### 3. **NO UNUSED PARAMETERS:**
   ❌ `async isPageDisplayed(unused) { return this.isVisible(TITLE); }`
   ✅ `async isPageDisplayed() { return this.isVisible(TITLE); }`

### 4. **BASEPAGE METHODS ONLY:**
   ❌ `await this.waitForPageLoad();` // DOES NOT EXIST
   ✅ `await this.isVisible(locator);` // EXISTS

### 5. **PROPER CONSTRUCTOR:**
   ✅ `constructor(page) { super(page); this.page = page; }`

---

## �📋 **INTERACTION TEMPLATE**

```markdown
Hello Claude,

I need help executing test artifacts in the Auto-Coder framework with proper SBS_Automation compliance validation.

**CURRENT SITUATION:**
[Describe your current state:]
□ Just generated new test artifacts
□ Existing artifacts need execution
□ Artifacts failing during execution
□ Need execution strategy planning
□ Debugging execution issues

**EXECUTION REQUEST:**
Please help me with:
□ Pre-execution validation
□ Environment setup verification
□ Execution strategy planning
□ Running specific test scenarios
□ Troubleshooting execution failures
□ Report generation and analysis

**ARTIFACTS TO EXECUTE:**
[List the artifacts:]
- Feature files: [path/feature-name.feature]
- Step definitions: [path/steps-name.js]
- Page objects: [path/page-name.js]
- Target environment: [FIT/IAT/PROD/LOCAL]

**EXECUTION REQUIREMENTS:**
✅ Validate SBS_Automation compliance before execution
✅ Use proper SBS_Automation execution patterns
✅ Generate comprehensive reports (Cucumber HTML + Allure)
✅ Handle locator failures gracefully
✅ Provide debugging information for failures
✅ Support parallel execution when appropriate
✅ Capture screenshots on UI test failures

**TROUBLESHOOTING NEEDED:**
[If applicable, describe issues:]
- Import/path errors: [details]
- Locator failures: [details]  
- Step definition mismatches: [details]
- Environment/browser issues: [details]
- Performance problems: [details]
```

## 🎯 **EXAMPLE USAGE**

```markdown
Hello Claude,

I need help executing test artifacts in the Auto-Coder framework with proper SBS_Automation compliance validation.

**CURRENT SITUATION:**
I just generated login functionality test artifacts and need to execute them in FIT environment.

**EXECUTION REQUEST:**
Please help me with complete execution workflow including pre-validation and troubleshooting.

**ARTIFACTS TO EXECUTE:**
- Feature files: SBS_Automation/features/auth/admin-login.feature
- Step definitions: SBS_Automation/steps/auth/admin-login-steps.js
- Page objects: SBS_Automation/pages/auth/admin-login-page.js
- Target environment: FIT

**EXECUTION REQUIREMENTS:**
[Same requirements as above]

**TROUBLESHOOTING NEEDED:**
Getting "Element not found" errors for login button selector - need help updating with real application selectors.
```

## 🔧 **EXECUTION WORKFLOW**

### **Phase 1: Pre-Execution Validation**
```bash
# Validate framework compliance
npm run validate:framework

# Check SBS patterns
npm run validate:sbs-compliance

# Verify environment setup
npm run validate:environment
```

### **Phase 2: Environment Setup**
```bash
# Set target environment
export ADP_ENV=fit  # or iat/prod/local

# Configure execution mode
export HEADLESS_MODE=true
export DEBUG_MODE=false
```

### **Phase 3: Execution**
```bash
# Interactive CLI (recommended)
npm start
# Choose: "🧪 Execute Tests"

# Direct execution
cd auto-coder/SBS_Automation
npm run test:generated

# Parallel execution
npx cucumber-js features/ --require steps/ --require support/ --parallel 4
```

### **Phase 4: Validation & Reporting**
```bash
# Generate reports
npm run reports:generate

# Open reports
npm run reports:open

# Analyze results
npm run analyze:results
```

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Import/Path Errors**
```markdown
SYMPTOM: Module not found errors
SOLUTION: 
1. Validate paths with: npm run validate:generators
2. Check step imports: grep -r "require(" SBS_Automation/steps/
3. Verify page imports: grep -r "require(" SBS_Automation/pages/
```

### **Locator Failures**
```markdown
SYMPTOM: Element not found errors
SOLUTION:
1. Update generated selectors with real application elements
2. Use browser dev tools to find correct selectors
3. Replace placeholders: [data-test-id="button-identifier"] → [data-test-id="submit-button"]
```

### **Step Definition Mismatches**
```markdown
SYMPTOM: Step implementation not found
SOLUTION:
1. Ensure step patterns match feature file exactly
2. Check for typos in step definitions
3. Verify step definition imports
```

### **Environment Issues**
```markdown
SYMPTOM: Browser or environment problems
SOLUTION:
1. Clear browser cache: npm run cleanup:browser
2. Reset environment: npm run cleanup:environment  
3. Reinstall dependencies: rm -rf node_modules && npm install
```

## 📊 **SUCCESS METRICS**

### **Quality Indicators**
- **Pass Rate**: > 80% on first execution
- **Manual Fixes**: < 20% of generated artifacts
- **Execution Time**: Comparable to hand-written tests
- **Reliability**: Consistent results across environments

### **Report Analysis**
- **HTML Report**: Scenario-level details and failure analysis
- **Allure Report**: Trends, analytics, and test history
- **Console Output**: Real-time execution feedback
- **Screenshots**: UI failure evidence (when applicable)

## 🎯 **POST-EXECUTION ACTIONS**

```markdown
After execution, please help me:
□ Analyze test results and failure patterns
□ Update locators based on real application elements
□ Optimize execution performance
□ Plan deployment to main SBS_Automation framework
□ Document any manual fixes required
□ Create execution strategy for CI/CD integration
```

---

**📞 Usage:** Copy the interaction template above, describe your execution needs, and send to Claude for comprehensive execution support.
