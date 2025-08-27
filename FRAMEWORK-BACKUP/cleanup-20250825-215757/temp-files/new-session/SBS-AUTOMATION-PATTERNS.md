# 📚 SBS AUTOMATION PATTERNS

## 🎯 Mandatory Compliance Patterns

### Import Patterns (ABSOLUTE PATHS ONLY)
```javascript
// ✅ CORRECT - Always use these exact paths
const BasePage = require('../../../SBS_Automation/pages/base-page');
const { By } = require('../../../SBS_Automation/support/web-driver-manager');

// ❌ WRONG - Never use these
const BasePage = require('./base-page');
const { By } = require('selenium-webdriver');
const { And } = require('@cucumber/cucumber'); // And is not needed
```

### Selector Declaration Pattern
```javascript
// ✅ CORRECT - Constants above class, meaningful names
const USERNAME_INPUT = By.css('[data-testid="username"]');
const PASSWORD_INPUT = By.css('[data-testid="password"]');
const LOGIN_BUTTON = By.css('[data-testid="login-button"]');

class LoginPage extends BasePage {
    // methods here
}

// ❌ WRONG - In constructor or as properties
class LoginPage extends BasePage {
    constructor() {
        super();
        this.usernameInput = By.css('[data-testid="username"]');
    }
}
```

### Class and Export Pattern
```javascript
// ✅ CORRECT - Class name matches export exactly
class UserLoginPage extends BasePage {
    // methods
}
module.exports = UserLoginPage;

// ❌ WRONG - Name mismatch
class UserLoginPage extends BasePage {}
module.exports = UserLoginPageClass; // Don't add suffixes
```

### Method Implementation Pattern
```javascript
// ✅ CORRECT - Use inherited BasePage methods
async enterUsername(username) {
    await this.enterText(USERNAME_INPUT, username);
}

async clickLoginButton() {
    await this.clickElement(LOGIN_BUTTON);
}

async verifyElementVisible() {
    await this.waitForElement(ELEMENT_SELECTOR);
}

// ❌ WRONG - Don't use try-catch unless specifically needed
async enterUsername(username) {
    try {
        await this.enterText(USERNAME_INPUT, username);
    } catch (error) {
        // Unnecessary try-catch
    }
}
```

## 🎪 BDD Compliance Patterns

### Feature File Structure
```gherkin
Feature: [Descriptive Title]
  Background:
    Given the application is loaded
    
  Scenario: [Specific scenario description]
    Given [context/setup]
    When [action/trigger]
    Then [expected result]
    
  Scenario: [Another scenario]
    Given [context]
    When [action]
    Then [result]
```

### Steps File Structure
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const [PageClass] = require('../pages/[page-file]');

Given('step definition text', async function () {
    await this.[pageInstance].[methodName]();
});

When('action step text', async function () {
    await this.[pageInstance].[actionMethod]();
});

Then('verification step text', async function () {
    await this.[pageInstance].[verifyMethod]();
});
```

## 🔧 BasePage Inherited Methods

### Available Methods (Use These)
```javascript
// Navigation
await this.navigateTo(url);
await this.getCurrentUrl();

// Element Interaction
await this.clickElement(selector);
await this.enterText(selector, text);
await this.selectDropdownOption(selector, option);

// Waiting and Verification
await this.waitForElement(selector);
await this.waitForElementToBeClickable(selector);
await this.waitForElementToBeVisible(selector);

// Text and Attributes
await this.getElementText(selector);
await this.getElementAttribute(selector, attribute);

// Validation
await this.verifyElementExists(selector);
await this.verifyElementNotExists(selector);
await this.verifyTextEquals(selector, expectedText);
```

## 🎨 Selector Best Practices

### Selector Naming Convention
```javascript
// ✅ CORRECT - Descriptive and consistent
const USERNAME_INPUT = By.css('[data-testid="username"]');
const SUBMIT_BUTTON = By.css('[data-testid="submit"]');
const ERROR_MESSAGE = By.css('[data-testid="error"]');
const HEADER_TITLE = By.css('[data-testid="header-title"]');

// ❌ WRONG - Vague or inconsistent
const INPUT1 = By.css('#input1');
const btn = By.css('.button');
const thing = By.xpath('//div');
```

### Selector Priority Order
1. **data-testid** (preferred): `By.css('[data-testid="element"]')`
2. **ID**: `By.css('#elementId')`
3. **Class**: `By.css('.element-class')`
4. **CSS Selectors**: `By.css('input[type="text"]')`
5. **XPath** (last resort): `By.xpath('//input[@type="text"]')`

## 📁 File Naming Conventions

### Generated File Names
```bash
# Feature files
[output-name].feature          # e.g., user-login.feature

# Steps files  
[output-name].js              # e.g., user-login.js

# Page files
[output-name].js              # e.g., user-login.js
```

### Class Naming
```javascript
// Convert kebab-case to PascalCase
// user-login → UserLogin
// shopping-cart → ShoppingCart
// admin-dashboard → AdminDashboard

class UserLoginPage extends BasePage {}
class ShoppingCartPage extends BasePage {}
class AdminDashboardPage extends BasePage {}
```

## 🚨 Common Anti-Patterns (AVOID)

### Import Anti-Patterns
```javascript
// ❌ Don't use relative imports
const BasePage = require('./base-page');
const BasePage = require('../base-page');

// ❌ Don't import And from cucumber
const { Given, When, Then, And } = require('@cucumber/cucumber');

// ❌ Don't use selenium-webdriver directly
const { By } = require('selenium-webdriver');
```

### Code Anti-Patterns
```javascript
// ❌ Don't log to console in generated code
console.log('Clicking button');

// ❌ Don't use hardcoded waits
await new Promise(resolve => setTimeout(resolve, 5000));

// ❌ Don't duplicate base-page functionality
async clickElement(selector) {
    const element = await this.driver.findElement(selector);
    await element.click();
}
```

### Structure Anti-Patterns
```javascript
// ❌ Don't put selectors in constructor
constructor() {
    super();
    this.selector = By.css('.element');
}

// ❌ Don't mix selector declarations
const GOOD_SELECTOR = By.css('[data-testid="good"]');
class Page extends BasePage {
    badSelector = By.css('.bad'); // Wrong location
}
```

## ✅ Validation Checklist

### Before Using Generated Code
- [ ] All imports use absolute paths to SBS_Automation
- [ ] Class extends BasePage correctly
- [ ] Selectors declared as constants above class
- [ ] No unnecessary try-catch blocks
- [ ] Export matches class name exactly
- [ ] Methods use BasePage inherited functions
- [ ] Feature has Background block
- [ ] Steps use Given/When/Then correctly
- [ ] No console.log statements

### Syntax Validation Commands
```bash
# Check JavaScript syntax
node -c [file].js

# Check feature file (visual inspection)
cat [file].feature | grep -E "(Feature|Background|Scenario|Given|When|Then)"
```

---

**🎯 Remember**: These patterns ensure 100% SBS_Automation compatibility and zero manual fixes required!
