# AI INTEGRATION GUIDE FOR REAL SBS PATTERNS

## 🎯 Objective
This guide shows how to integrate the Universal SBS Pattern Enforcement system with AI-based test artifact generation.

## 🔧 Integration Steps

### 1. Import the System
```javascript
const { UniversalSBSPatternEnforcement } = require('./src/ai/universal-sbs-pattern-enforcement');

const enforcer = new UniversalSBSPatternEnforcement();
await enforcer.initialize();
```

### 2. Enforce AI Generation
```javascript
// For any AI-based generation
const result = await enforcer.enforceAIGeneration(
    "Create a login page test",  // User request
    "page"                       // Artifact type: feature, steps, page
);

console.log(result.content);     // Enforced content
console.log(result.violations);  // Any violations found
console.log(result.suggestions); // Suggestions for fixes
```

### 3. Validate Existing Content
```javascript
const validation = enforcer.validateContent("page", pageContent);
if (!validation.isValid) {
    console.log("Violations found:", validation.violations);
    console.log("Suggestions:", validation.suggestions);
}
```

### 4. Get Real Pattern Examples
```javascript
const featureExample = enforcer.getRealPatternExamples("feature");
const stepsExample = enforcer.getRealPatternExamples("steps");
const pageExample = enforcer.getRealPatternExamples("page");
```

## 🛡️ Enforcement Rules

### Mandatory Patterns
- **Feature Files**: @Team:Agnostics, @regression tags, Alex persona
- **Steps Files**: 420 * 1000 timeout, assert.isTrue assertions
- **Page Files**: By.xpath(), By.css() locators, complex selectors

### Forbidden Patterns
- **Generic**: data-testid, getElementById, querySelector
- **Simple**: input[type=, #id, .class
- **Outdated**: element(by., browser.

## 🚀 Usage Example

```javascript
async function generateTestWithAI(userRequest, type) {
    const enforcer = new UniversalSBSPatternEnforcement();
    await enforcer.initialize();
    
    const result = await enforcer.enforceAIGeneration(userRequest, type);
    
    if (result.violations.length > 0) {
        console.warn("Violations detected and fixed:", result.violations);
    }
    
    return result.content; // This content follows real SBS patterns
}

// Usage
const pageContent = await generateTestWithAI("Create login page", "page");
const featureContent = await generateTestWithAI("Test user login", "feature");
const stepsContent = await generateTestWithAI("Login steps", "steps");
```

## ✅ Benefits
1. **Consistency**: Both AI and framework use identical real SBS patterns
2. **Quality**: No more simple selectors or generic patterns
3. **Compliance**: Automatic validation and fixing of violations
4. **Maintainability**: Single source of truth for patterns

## 🔧 Customization
You can modify the enforcement rules in the UniversalSBSPatternEnforcement class to add new patterns or validation rules.
