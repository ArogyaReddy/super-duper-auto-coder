# 🔍 FRAMEWORK QUICK REFERENCE

## 🚨 CRITICAL PRODUCTION RULES - MANDATORY ENFORCEMENT

**5 CRITICAL RULES FOR ALL GENERATED ARTIFACTS:**

1. **LOCATOR STANDARDS**: Prefer `By.css()` with single quotes; avoid `By.xpath()` unless necessary
2. **PARAMETERIZATION**: Use parameterized locators for dynamic elements referenced in feature files  
3. **CLEAN METHODS**: No unused parameters in page methods
4. **EXISTING METHODS ONLY**: Only use methods that exist in main SBS_Automation BasePage (no `waitForPageLoad()`)
5. **PROPER CONSTRUCTORS**: No locators in constructor, always call `super(page)`

---

## Essential Commands & Patterns

### 🚀 Generator Commands
```bash
# From auto-coder root directory
cd /Users/gadea/auto/auto/qa_automation/auto-coder

# Generate artifacts
node no-ai/generate-feature-steps-page.js requirements/text/[requirement-file].txt [output-name]

# Example
node no-ai/generate-feature-steps-page.js requirements/text/login-flow.txt LoginFlow
```

### 📁 Key File Patterns

#### Requirement File Format
```text
# Option 1: Acceptance Criteria
Feature: User Login
AC1: User can enter username and password
AC2: User can click login button
AC3: System validates credentials and redirects to dashboard

# Option 2: BDD Steps
Given I am on the login page
When I enter valid credentials
Then I should be redirected to dashboard

# Option 3: Mixed (both AC and BDD)
Feature: User Login
AC1: User can enter credentials
Given I am on the login page...
```

#### Generated Feature Structure
```gherkin
Feature: [Auto-generated from requirement]
  Background:
    Given the application is loaded
    
  Scenario: [Generated from AC or BDD]
    Given [context]
    When [action]
    Then [verification]
```

#### Generated Steps Pattern
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const [PageClass] = require('../pages/[page-file]');

Given('step text', async function () {
    // Generated implementation
});
```

#### Generated Page Pattern
```javascript
const BasePage = require('../../../SBS_Automation/pages/base-page');
const { By } = require('../../../SBS_Automation/support/web-driver-manager');

// Selectors as constants (not in constructor)
const ELEMENT_SELECTOR = By.css('[selector]');

class [PageName] extends BasePage {
    async methodName() {
        // Generated methods
    }
}

module.exports = [PageName];
```

### 🎯 SBS Automation Standards

#### Import Patterns (ABSOLUTE PATHS)
```javascript
// ✅ Correct
const BasePage = require('../../../SBS_Automation/pages/base-page');
const { By } = require('../../../SBS_Automation/support/web-driver-manager');

// ❌ Wrong
const BasePage = require('./base-page');
const { By } = require('selenium-webdriver');
```

#### Selector Declaration
```javascript
// ✅ Correct - Constants above class
const USERNAME_INPUT = By.css('[data-testid="username"]');
const PASSWORD_INPUT = By.css('[data-testid="password"]');

class LoginPage extends BasePage {
    // class methods
}

// ❌ Wrong - In constructor
class LoginPage extends BasePage {
    constructor() {
        this.usernameInput = By.css('[data-testid="username"]');
    }
}
```

#### Export Pattern
```javascript
// ✅ Correct - Class name matches export
class LoginPage extends BasePage {
    // methods
}
module.exports = LoginPage;

// ❌ Wrong - Name mismatch
class LoginPage extends BasePage {}
module.exports = LoginPageClass;
```

### 🔧 Generator Logic Flow

1. **Parse Requirement**: Extract text and format type
2. **Segment Steps**: Split at conjunctions/full stops
3. **Map BDD Keywords**: Assign Given/When/Then/And
4. **Generate Selectors**: Extract from step text dynamically
5. **Create Methods**: Generate page methods from actions
6. **Build Files**: Feature, Steps, Page with proper imports

### 🎨 Dynamic Generation Examples

#### From Requirement Text:
```text
"User can enter username and password, then click login button"
```

#### Generates:
```javascript
// Selectors (extracted dynamically)
const USERNAME_INPUT = By.css('[data-testid="username"]');
const PASSWORD_INPUT = By.css('[data-testid="password"]');
const LOGIN_BUTTON = By.css('[data-testid="login"]');

// Methods (generated from actions)
async enterUsername(username) {
    await this.enterText(USERNAME_INPUT, username);
}

async enterPassword(password) {
    await this.enterText(PASSWORD_INPUT, password);
}

async clickLoginButton() {
    await this.clickElement(LOGIN_BUTTON);
}
```

### 🚨 Validation Checklist

#### After Generation:
- [ ] Feature file has Background block
- [ ] Steps use correct cucumber imports
- [ ] Page extends BasePage with absolute path
- [ ] Selectors declared as constants above class
- [ ] Methods use BasePage inherited functions
- [ ] Export matches class name exactly
- [ ] No hard-coded element references

#### Test Commands:
```bash
# Validate syntax
node -c [generated-file].js

# Run specific test
cd SBS_Automation
npm test -- --grep "[scenario-name]"
```

### 🎯 Prompt Quick Reference

#### GPT-4.1 Prompt: `ArogYYaa-GPT41-ULTIMATE.md`
- Action-forcing, no review mode
- Explicit input/output requirements
- BDD compliance enforced
- Final instruction: "START YOUR RESPONSE WITH THE FEATURE FILE. OUTPUT ONLY THE 3 FILES."

#### Usage:
1. Copy prompt from myPrompts.md
2. Specify requirement file path
3. Specify output names
4. Expect immediate 3-file output

---
**🔄 Quick Start Flow**:
1. Create requirement file → 2. Run generator → 3. Validate output → 4. Test execution
