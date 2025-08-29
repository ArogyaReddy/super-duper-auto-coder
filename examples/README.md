# SBS Automation Reference Patterns

This folder contains **MANDATORY REFERENCE PATTERNS** for the auto-coder framework generation system. All generated test artifacts MUST follow these exact patterns.

## Reference Files Overview

### 1. Feature Files
- `REFERENCE-feature-homepage-checks.feature` - Home page validation patterns
- `REFERENCE-feature-payroll-navigation.feature` - Payroll navigation patterns

**Key Patterns:**
- Team tags: `@Team:Kokoro`
- Parent suite: `@parentSuite:Home` or `@parentSuite:Payroll`
- Test type tags: `@regression @critical @Home-SmokeTests`
- Background sections with proper Given/When setup
- Descriptive scenario titles
- Clear step language using "Alex" persona

### 2. Steps Files
- `REFERENCE-steps-home-steps.js` - Home page step definitions
- `REFERENCE-steps-payroll-calculate-checks-steps.js` - Payroll step definitions

**Key Patterns:**
- Proper imports: `const { assert } = require('chai');`, `const { When, Then } = require('@cucumber/cucumber');`
- Page class imports: `const HomePage = require('../../pages/common/home-page');`
- Direct instantiation pattern: `await new HomePage(this.page).methodName()`
- **NO persistent variables** (no `let myPage = myPage || new MyPage()`)
- Timeout specifications: `{ timeout: 360 * 1000 }`
- Assert patterns: `assert.isTrue(result, 'Error message')`
- **NO console.log()** statements
- **NO try-catch blocks**

### 3. Page Files
- `REFERENCE-page-home-page.js` - Home page object patterns
- `REFERENCE-page-payroll-calculate-checks-page.js` - Payroll page object patterns

**Key Patterns:**
- BasePage inheritance: `class HomePage extends BasePage`
- Constructor pattern with super call and page assignment
- Locator definitions section with descriptive names
- Method implementations using **REAL BasePage methods**:
  - `await this.waitForLocator(locator)`
  - `await this.clickElement(locator)`
  - `return await this.isVisible(locator)`
  - `await this.waitForPageToLoad()`
- **NO manual if-else logic**
- **NO try-catch blocks**
- **NO console.log() statements**
- Proper module.exports pattern

## SBS_Automation Compliance Requirements

### BasePage Methods (MANDATORY)
These are the ONLY methods that should be used in page classes:

```javascript
// Waiting methods
await this.waitForLocator(locator)
await this.waitForPageToLoad()

// Click methods  
await this.clickElement(locator)

// Visibility methods
return await this.isVisible(locator)
return await this.isVisibleIgnoreError(locator)

// Form methods
await this.page.fill(locator, text)
```

### Anti-Patterns (FORBIDDEN)
- **NO** manual if-else visibility checks
- **NO** try-catch error handling
- **NO** console.log() debugging
- **NO** persistent page variables in steps
- **NO** manual timeout handling

### Generation Rules
1. **Feature Generation**: Must use team tags, parent suite, and proper scenario structure
2. **Steps Generation**: Must use direct instantiation pattern with real BasePage methods
3. **Page Generation**: Must inherit from BasePage and use only approved methods
4. **Locator Generation**: Must use descriptive data-testid patterns
5. **Error Handling**: Must rely on BasePage built-in error handling

## Usage in Auto-Coder Framework

These reference patterns are **MANDATORY** templates that the auto-coder framework generation system must follow exactly. Any deviation from these patterns will result in non-SBS-compliant artifacts that require manual fixes.

The generation system should:
1. Use these files as exact templates
2. Replace placeholder content while maintaining structure
3. Ensure all generated code follows these exact patterns
4. Never introduce manual logic that these patterns don't contain

## Quality Assurance

Generated artifacts should be validated against these reference patterns to ensure:
- ✅ Proper SBS_Automation compliance
- ✅ No manual if-else logic
- ✅ Real BasePage method usage
- ✅ Consistent coding standards
- ✅ Production-ready quality
