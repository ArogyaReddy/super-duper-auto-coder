# 🔧 PROMPT: FIX AUTO-CODER FRAMEWORK

## � **CRITICAL PRODUCTION RULES - MANDATORY FIXES** 🚨

**When fixing framework issues, ALWAYS enforce these rules:**

### 1. **LOCATOR FIXES:**
   ✅ Change to single quotes: `By.css('[data-test-id="element"]')`
   ✅ Prefer By.css() over By.xpath() when possible

### 2. **PARAMETRIZED LOCATOR FIXES:**
   ✅ Add parameters: `const BTN_ELEMENT = (btnName) => By.xpath(\`//sdf-button[text() = "\${btnName}"]\`);`
   ✅ Connect feature steps to parametrized locators

### 3. **UNUSED PARAMETER FIXES:**
   ✅ Remove unused parameters from method signatures

### 4. **BASEPAGE METHOD FIXES:**
   ✅ Replace `waitForPageLoad()` with existing BasePage methods
   ✅ Verify all method calls exist in main SBS_Automation BasePage

### 5. **CONSTRUCTOR FIXES:**
   ✅ Ensure proper pattern: `constructor(page) { super(page); this.page = page; }`
   ✅ Remove locators from constructor

---

## �📋 **INTERACTION TEMPLATE**

```markdown
Hello Claude,

I need you to diagnose and fix issues in the Auto-Coder framework to ensure it works correctly and maintains SBS_Automation compatibility.

**ISSUE DESCRIPTION:**
[Describe the problem you're experiencing:]
□ Framework not generating artifacts correctly
□ Generated artifacts have compilation errors
□ Execution failures in generated tests
□ SBS compliance violations
□ Generator logic producing incorrect output
□ Validation scripts not working
□ CLI interface issues
□ File structure problems

**SPECIFIC SYMPTOMS:**
[Provide specific error messages or behaviors:]
- Error messages: [paste exact error messages]
- Expected behavior: [what should happen]
- Actual behavior: [what actually happens]
- Files affected: [list specific files]
- Commands that fail: [list failing commands]

**FRAMEWORK COMPONENTS AFFECTED:**
□ Generation logic (src/generators/)
□ CLI interface (bin/, src/cli/)
□ Validation scripts (framework-tests/validation/)
□ SBS_Automation integration
□ Package configuration (package.json)
□ Documentation (guides/)
□ File structure organization

**DIAGNOSTIC REQUEST:**
Please help me:
□ Identify root cause of the issue
□ Analyze affected framework components
□ Provide step-by-step fix implementation
□ Validate fix doesn't break other components
□ Update any affected documentation
□ Prevent similar issues in the future
```

## 🎯 **EXAMPLE USAGE**

```markdown
Hello Claude,

I need you to diagnose and fix issues in the Auto-Coder framework to ensure it works correctly and maintains SBS_Automation compatibility.

**ISSUE DESCRIPTION:**
The framework is generating page objects with incorrect constructor patterns and the generated artifacts fail when executed.

**SPECIFIC SYMPTOMS:**
- Error messages: "TypeError: Cannot read property 'page' of undefined"
- Expected behavior: Page objects should extend BasePage correctly
- Actual behavior: Generated page objects have broken constructor syntax
- Files affected: All generated page objects in SBS_Automation/pages/
- Commands that fail: npm run test:generated

**FRAMEWORK COMPONENTS AFFECTED:**
□ Generation logic (src/generators/page-object-generator.js)
□ SBS_Automation integration
□ Validation scripts

**DIAGNOSTIC REQUEST:**
Please identify why the page object generator is producing incorrect constructor patterns and fix it to match SBS_Automation standards exactly.
```

## 🔍 **DIAGNOSTIC FRAMEWORK**

### **Phase 1: Issue Analysis**
```markdown
ANALYZE:
1. Reproduce the issue step-by-step
2. Identify exact failure points
3. Trace root cause through code
4. Assess impact on other components
5. Determine fix complexity and scope

EXAMINE:
- Error logs and stack traces
- Generated artifact content
- Generator source code
- Validation script results
- SBS compliance violations
```

### **Phase 2: Root Cause Investigation**
```markdown
INVESTIGATE:
1. Generator logic correctness
2. Template accuracy
3. Pattern extraction issues
4. SBS compliance gaps
5. File path resolution problems
6. Import statement correctness
7. Configuration issues
```

### **Phase 3: Fix Implementation**
```markdown
IMPLEMENT:
1. Correct generator logic
2. Update templates
3. Fix pattern matching
4. Resolve SBS compliance issues
5. Update validation rules
6. Test fix thoroughly
```

## 🛠️ **COMMON ISSUES & FIXES**

### **Generation Issues**
```markdown
ISSUE: Generators producing incorrect code
SYMPTOMS: 
- Syntax errors in generated files
- Missing imports or incorrect paths
- Wrong method signatures
- Incomplete implementations

FIX APPROACH:
1. Review generator templates
2. Update pattern extraction logic
3. Fix SBS compliance rules
4. Validate against real SBS examples
```

### **SBS Compliance Issues**
```markdown
ISSUE: Generated artifacts don't match SBS patterns
SYMPTOMS:
- Wrong constructor patterns
- Incorrect import statements
- Wrong assertion syntax
- Improper tag usage

FIX APPROACH:
1. Analyze current SBS patterns
2. Update generator templates
3. Fix pattern enforcement rules
4. Validate with SBS examples
```

### **Execution Issues**
```markdown
ISSUE: Generated tests fail during execution
SYMPTOMS:
- Module not found errors
- Element not found errors
- Assertion failures
- Timeout issues

FIX APPROACH:
1. Fix import path resolution
2. Update locator patterns
3. Fix assertion syntax
4. Adjust timeout configurations
```

### **CLI Interface Issues**
```markdown
ISSUE: Interactive CLI not working correctly
SYMPTOMS:
- Menu options not responding
- Commands failing
- Error messages unclear
- Process hanging

FIX APPROACH:
1. Debug CLI flow logic
2. Fix command routing
3. Improve error handling
4. Update user feedback
```

## 🧪 **FIX VALIDATION PROCESS**

### **Pre-Fix Validation**
```bash
# Document current state
npm run validate:framework > before-fix.log

# Reproduce issue
npm run reproduce:issue

# Create fix branch
git checkout -b fix/[issue-description]
```

### **Fix Implementation**
```bash
# Implement fix
# [Apply the fix based on diagnosis]

# Test fix locally
npm run test:fix

# Validate fix doesn't break other components
npm run validate:framework
```

### **Post-Fix Validation**
```bash
# Full framework validation
npm run validate:framework > after-fix.log

# Compare before/after
diff before-fix.log after-fix.log

# Test generation and execution
npm run test:end-to-end

# Document fix
git commit -m "fix: [issue description and solution]"
```

## 📊 **FIX VERIFICATION CHECKLIST**

### **Generation Fixes**
- [ ] Generators produce syntactically correct code
- [ ] Generated artifacts match SBS patterns exactly
- [ ] All imports resolve correctly
- [ ] No placeholder or incomplete code
- [ ] All requirements fully implemented

### **Execution Fixes**
- [ ] Generated tests execute without errors
- [ ] Proper error handling and reporting
- [ ] Performance meets expectations
- [ ] Cross-environment compatibility
- [ ] Report generation works correctly

### **Framework Fixes**
- [ ] CLI interface responds correctly
- [ ] All commands execute successfully
- [ ] Validation scripts work properly
- [ ] Documentation updated
- [ ] No regression in other components

## 🎯 **PREVENTION STRATEGIES**

```markdown
To prevent similar issues:

1. **Automated Testing**
   - Add comprehensive test coverage
   - Include SBS compliance tests
   - Test generation and execution flows
   - Validate against real SBS examples

2. **Code Quality**
   - Implement linting rules
   - Add type checking
   - Code review process
   - Pattern enforcement

3. **Documentation**
   - Keep documentation current
   - Include troubleshooting guides
   - Document known issues
   - Maintain change logs

4. **Monitoring**
   - Regular framework validation
   - Automated compliance checking
   - Performance monitoring
   - User feedback collection
```

## 🚨 **EMERGENCY FIXES**

### **Critical Production Issues**
```markdown
For urgent fixes:
1. Identify minimum viable fix
2. Implement with surgical precision
3. Test immediately on isolated environment
4. Deploy with rollback plan ready
5. Monitor post-deployment
6. Plan comprehensive fix for next iteration
```

### **Rollback Procedures**
```markdown
If fix causes new issues:
1. Restore from last known good state
2. Document what went wrong
3. Analyze fix impact more thoroughly
4. Develop alternative approach
5. Test more extensively before retry
```

---

**📞 Usage:** Copy the interaction template above, describe your specific framework issue, and send to Claude for comprehensive diagnosis and fix implementation.
