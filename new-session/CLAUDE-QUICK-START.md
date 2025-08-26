# ⚡ CLAUDE QUICK START

## For New Chat Sessions - Get Claude Up to Speed in 30 Seconds

### 🚨 **CRITICAL PRODUCTION RULES - MANDATORY ENFORCEMENT**

**5 CRITICAL RULES FOR ALL GENERATED ARTIFACTS:**

1. **LOCATOR STANDARDS**: Prefer `By.css()` with single quotes; avoid `By.xpath()` unless necessary
2. **PARAMETERIZATION**: Use parameterized locators for dynamic elements referenced in feature files  
3. **CLEAN METHODS**: No unused parameters in page methods
4. **EXISTING METHODS ONLY**: Only use methods that exist in main SBS_Automation BasePage (no `waitForPageLoad()`)
5. **PROPER CONSTRUCTORS**: No locators in constructor, always call `super(page)`

### 🎯 **STEP 1: Mention This Path**
```
/Users/gadea/auto/auto/qa_automation/auto-coder/new-session
```

### 🎯 **STEP 2: Claude Will Read These Key Files**
1. `SESSION-CONTEXT-SUMMARY.md` - Current framework state
2. `FRAMEWORK-QUICK-REF.md` - Commands and patterns  
3. `SESSION-LAST-CONVERSATION.md` - Recent progress
4. `QUICK-RESTORE-CHECKLIST.md` - Validation steps

### 🎯 **STEP 3: Critical Rule Reminder**
**MOST IMPORTANT**: Claude will remember:
- ❌ **NEVER** duplicate SBS_Automation files in auto-coder
- ✅ **ALWAYS** reference main framework with `../../../SBS_Automation/` paths
- ✅ **ONLY** generate test artifacts (features, steps, pages)

### 🎯 **STEP 4: Ready for Action**
Claude will be immediately ready to:
- Generate BDD test artifacts from requirements
- Use correct import paths and SBS patterns
- Follow all compliance rules
- Validate output with built-in checks

---

## 🚀 **RESULT**: Claude will be 100% up to speed and ready to work!

**No additional setup needed. Just mention the path and Claude gets full context.**

---

## 📋 **Optional Validation Commands** (if needed)

```bash
# Check framework health
./new-session/session-health-check.sh

# Verify no duplication violations  
./scripts/check-sbs-duplicates.sh

# Get full context display
./new-session/claude-context-restore.sh
```

## 🎯 **Framework State**: FULLY OPERATIONAL ✅
**Last Updated**: August 3, 2025

---

## 🚨 CRITICAL FIXES - NEVER REPEAT THESE MISTAKES

### ❌ **MISTAKE #1: Rule Comments in Generated Files**
```javascript
// ❌ WRONG - No rule comments in production code
// ✅ CRITICAL RULE #2: LOCATOR STANDARDS (MANDATORY)
const PAGE_TITLE = By.css('[data-test-id="page-header-title"]');

// ✅ CORRECT - Clean production code only
const PAGE_TITLE = By.css('[data-test-id="page-header-title"]');
```

### ❌ **MISTAKE #2: Wrong By.js Import (Causes Crashes)**
```javascript
// ❌ WRONG - Destructuring causes runtime crashes
const { By } = require('../../support/By.js');

// ✅ CORRECT - Direct import
const By = require('../../support/By.js');
```

### ❌ **MISTAKE #3: Wrong Steps Import Paths**
```javascript
// ❌ WRONG - Breaks "Go to Definition"
const PageClass = require('../pages/page-name-page');

// ✅ CORRECT - Proper relative path for auto-coder
const PageClass = require('../../pages/auto-coder/page-name-page');
```
