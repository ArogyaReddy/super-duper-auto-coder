# ✅ QUICK RESTORE CHECKLIST

## � CRITICAL PRODUCTION RULES - MANDATORY ENFORCEMENT

**5 CRITICAL RULES FOR ALL GENERATED ARTIFACTS:**

1. **LOCATOR STANDARDS**: Prefer `By.css()` with single quotes; avoid `By.xpath()` unless necessary
2. **PARAMETERIZATION**: Use parameterized locators for dynamic elements referenced in feature files  
3. **CLEAN METHODS**: No unused parameters in page methods
4. **EXISTING METHODS ONLY**: Only use methods that exist in main SBS_Automation BasePage (no `waitForPageLoad()`)
5. **PROPER CONSTRUCTORS**: No locators in constructor, always call `super(page)`

---

## �🚀 New Session Startup (5 minutes)

### Step 0: Critical Rule Reminder ⚠️
**FIRST THING TO REMEMBER:**
- [ ] **NEVER duplicate SBS_Automation files in auto-coder directory**
- [ ] **ALWAYS reference main SBS_Automation with `../../../SBS_Automation/` paths**
- [ ] **CHECK: All generated artifacts follow the 5 CRITICAL PRODUCTION RULES**
- [ ] **Check for any base-page.js, By.js duplicates and delete immediately**
- [ ] **Use validation script if unsure**: `./scripts/check-sbs-duplicates.sh`

### Step 1: Environment Setup
- [ ] Open VS Code in new-session folder: `/Users/gadea/auto/auto/qa_automation/auto-coder/new-session`
- [ ] Terminal in auto-coder root: `cd /Users/gadea/auto/auto/qa_automation/auto-coder`
- [ ] Check Node.js version: `node --version` (should be v14+)

### Step 2: Context Loading (Priority Order)
1. [ ] **Read**: `SESSION-CONTEXT-SUMMARY.md` (framework state - 2 min)
2. [ ] **Read**: `FRAMEWORK-QUICK-REF.md` (patterns & commands - 2 min)
3. [ ] **Scan**: `SESSION-LAST-CONVERSATION.md` (recent progress - 1 min)
4. [ ] **Check**: `SESSION-CURRENT-ISSUES.md` (pending items)

### Step 3: Health Check Validation
```bash
# Run health check script
cd /Users/gadea/auto/auto/qa_automation/auto-coder/new-session
./session-health-check.sh  # macOS/Linux
# or
./session-health-check.ps1  # Windows
```

Expected outputs:
- [ ] Generator file exists and is valid
- [ ] SBS_Automation reference framework accessible
- [ ] Prompt files are up to date
- [ ] Required dependencies installed

### Step 4: Quick Validation Test
```bash
# Test generator with sample requirement
cd /Users/gadea/auto/auto/qa_automation/auto-coder
node no-ai/generate-feature-steps-page.js new-session/reference-files/sample-requirement.txt TestValidation
```

Expected results:
- [ ] Feature file generated in SBS_Automation/features/
- [ ] Steps file generated in SBS_Automation/steps/
- [ ] Page file generated in SBS_Automation/pages/
- [ ] No syntax errors in generated files

## 🎯 Context Validation Points

### Framework State Check
- [ ] Generator logic is latest refactored version
- [ ] No hard-coded keywords or static mappings
- [ ] Dynamic selector/method generation working
- [ ] BDD step segmentation operational
- [ ] SBS compliance patterns enforced

### File Locations Confirmed
- [ ] Main generator: `auto-coder/no-ai/generate-feature-steps-page.js`
- [ ] Prompt files: `auto-coder/myPrompts.md` (contains ArogYYaa-GPT41-ULTIMATE.md)
- [ ] Generated output: `auto-coder/SBS_Automation/features|steps|pages/`
- [ ] Requirements: `auto-coder/requirements/text/`
- [ ] Reference framework: `SBS_Automation/` (parallel to auto-coder)

### Capability Verification
- [ ] Can generate from AC format requirements
- [ ] Can generate from BDD step requirements  
- [ ] Can generate from mixed format requirements
- [ ] Generated artifacts use absolute import paths
- [ ] Generated page classes extend BasePage correctly
- [ ] Generated files have proper exports/naming

## 🔧 Common Issue Quick Fixes

### Generator Not Working
```bash
# Check file exists and syntax
ls -la /Users/gadea/auto/auto/qa_automation/auto-coder/no-ai/generate-feature-steps-page.js
node -c /Users/gadea/auto/auto/qa_automation/auto-coder/no-ai/generate-feature-steps-page.js
```

### Import Path Errors
- Ensure using: `../../../SBS_Automation/pages/base-page`
- Ensure using: `../../../SBS_Automation/support/web-driver-manager`

### Missing Dependencies
```bash
cd /Users/gadea/auto/auto/qa_automation/SBS_Automation
npm install
```

### Generated Files Syntax Issues
- Check export matches class name exactly
- Verify selectors declared as constants above class
- Confirm no try-catch blocks unless needed

## 🎨 Ready-to-Use Commands

### Generate New Artifacts
```bash
# Template command
node no-ai/generate-feature-steps-page.js requirements/text/[file].txt [OutputName]

# Example
node no-ai/generate-feature-steps-page.js requirements/text/user-login.txt UserLogin
```

### Validate Generated Output
```bash
# Syntax check
node -c SBS_Automation/pages/[generated-page].js
node -c SBS_Automation/steps/[generated-steps].js

# Feature file validation (visual check for BDD compliance)
cat SBS_Automation/features/[generated-feature].feature
```

### Test Execution
```bash
cd /Users/gadea/auto/auto/qa_automation/SBS_Automation
npm test -- --grep "[scenario-name]"
```

## 🚨 Emergency Recovery

### If Context is Lost
1. **Return to this folder**: `/Users/gadea/auto/auto/qa_automation/auto-coder/new-session`
2. **Read context summary**: `SESSION-CONTEXT-SUMMARY.md`
3. **Run health check**: `./session-health-check.sh`
4. **Use quick reference**: `FRAMEWORK-QUICK-REF.md`

### If Generator is Broken
1. **Check last working version**: `SESSION-CHANGELOG.md`
2. **Review issues**: `SESSION-CURRENT-ISSUES.md`
3. **Reference working patterns**: `reference-files/key-generator-logic.js`

### If Outputs are Wrong
1. **Verify requirement format**: Check against examples in `reference-files/`
2. **Check SBS patterns**: Use `SBS-AUTOMATION-PATTERNS.md`
3. **Validate against samples**: Compare with `reference-files/sample-*.js`

---

**⏱️ Total Time**: 5 minutes for full context restoration
**🎯 Success Criteria**: Generator working + Context loaded + Health check passed
