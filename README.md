# 🎯 AUTO-CODER FRAMEWORK

**Clean, Minimal Test Artifa## 🚀 **Quick Start**

### **🎯 TEAM ONBOARDING (30 SECONDS)**
```bash
# 1. Clone and install
git clone <repository-url>
cd auto-coder
npm install

# 2. Validate setup
npm run team:validate

# 3. Start using
npm start
```

### **🔍 TEAM READINESS VALIDATION**
```bash
# Validate framework is ready for team distribution
npm run team:readiness
```

### **🎭 PLAYWRIGHT MCP (NEW & RECOMMENDED)**Generation System for SBS_Automation**

## 🚨 CRITICAL PRODUCTION RULES - MANDATORY ENFORCEMENT

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

## ⚠️ CRITICAL RULES - READ FIRSTAUTO-CODER FRAMEWORK

**Clean, Minimal Test Artifact Generation System for SBS_Automation**

## � CRITICAL RULES - READ FIRST

### **GENERATION-ONLY MANDATE**
**Auto-coder ONLY generates artifacts in `auto-coder/` subdirectories**
- ✅ Generates SBS-compliant test artifacts
- ✅ Analyzes SBS_Automation patterns (read-only)
- ✅ Provides integration recommendations
- ❌ **NEVER modifies main `../SBS_Automation/`**
- ❌ **NEVER moves/copies files to main SBS_Automation**

### **INTEGRATION RESPONSIBILITY**
**ONLY humans integrate artifacts into main SBS_Automation after review**

📖 **[READ FULL COMPLIANCE RULES](docs/AUTO-CODER-COMPLIANCE-RULES.md)**

## �🚀 **Quick Start**

### **� PLAYWRIGHT MCP (NEW & RECOMMENDED)**
**Intelligent page object generation from live URLs**
```bash
# Generate from live website
npm run generate:mcp -- --url https://example.com --name "homepage"

# Multiple pages
npm run generate:mcp -- --urls "https://app.com/login,https://app.com/dashboard"
```

### **🎯 INTERACTIVE CLI**
**Guided generation from requirements and templates**
```bash
# Start interactive mode
npm start

# Advanced intelligent CLI  
npm run start:intelligent
```

### **📝 DIRECT COMMANDS**
**Automated generation from requirements files**
```bash
# Generate from requirement file
node bin/auto-coder-generate.js --requirement requirements/your-requirements.txt

# Cross-platform execution
node bin/cross-platform-runner.js --suite generated
```

## 📚 **SINGLE PROMPT APPROACH**

**CRITICAL:** Framework now uses **ONE SIMPLE PROMPT** for consistency:
- � **[AUTO-CODER PROMPT](.github/auto-coder-prompt.md)** - **SINGLE SOURCE OF TRUTH**
- 🎯 **View prompt**: `npm run prompt:show`
- ✅ **Simple rules, no exceptions, consistent results**

### **⚙️ Framework Validation**
```bash
# Validate framework integrity
npm run framework:validate

# Test generated artifacts
npm run test:features
```

## 📁 **Clean Framework Structure**

```
auto-coder/
├── � .github/                      # USER-FACING PROMPTS
│   ├── generate-test-artifacts.prompt.md
│   ├── execute-test-artifacts.prompt.md
│   ├── fix-auto-coder-framework.prompt.md
│   ├── sbs-automation-compatibility.prompt.md
│   ├── framework-standards-implementation.prompt.md
│   ├── auto-coder-sbs-integration.prompt.md
│   └── sbs-framework-patterns.prompt.md
├── 📋 bin/                         # EXECUTABLE SCRIPTS
│   ├── auto-coder.js
│   ├── auto-coder-generate.js
│   ├── cross-platform-runner.js
│   └── cleanup-artifacts.js
├── ⚙️ config/                      # CONFIGURATION FILES
│   ├── web.config.json
│   ├── cucumber.config.json
│   ├── environment-config.json
│   └── playwright.config.js
├── 🧪 framework-tests/             # MINIMAL TESTING (cleaned)
├── ⚙️ src/                         # CORE FRAMEWORK CODE
├── 📝 requirements/                # YOUR REQUIREMENTS GO HERE
├── �️ SBS_Automation/              # GENERATED ARTIFACTS (staging)
├── 🗄️ archive/                      # HISTORICAL/BACKUP FILES
└── 📋 templates/                   # GENERATION TEMPLATES
```
## 🚨 **FRAMEWORK RULES & STANDARDS**

### **RULE 1: ONE SOURCE OF TRUTH**
- Each piece of functionality has ONE authoritative file
- Updates go to existing files, NOT new files  
- Delete old versions when creating replacements

### **RULE 2: CLEAR FILE HIERARCHY**
- User prompts: `.prompt.md` (in `.github/`)
- Scripts: `bin/` directory with descriptive names
- Config: `config/` directory, no duplicates
- Generated: `SBS_Automation/` (staging area)

### **RULE 3: FILE NAMING CONVENTIONS**
- User prompts: `.prompt.md`
- Configs: `.config.json`
- Scripts: descriptive names, no duplicates
- NO test, validation, or debug file proliferation

### **RULE 4: MANDATORY CLEANUP**
- Weekly cleanup of temporary files
- Monthly review of documentation
- Immediate removal of superseded files
- No tolerance for duplicate files

### **RULE 5: UPDATE NOT CREATE**
- Before creating ANY new file, check if existing file can be updated
- Document WHY a new file is needed if one must be created
- Remove old file when creating replacement
- Archive obsolete files immediately

## 🎯 **SBS Automation Integration**

Generated artifacts are placed in `SBS_Automation/` directory with:
- Features in `features/`
- Step definitions in `steps/`
- Page objects in `pages/`
- Test data in `data/`

All generated code follows SBS Automation patterns and standards.

## 💬 **Best Practices**

1. **Always use templates** - Don't hand-code test files
2. **Validate generation** - Run tests after generation
3. **Follow SBS patterns** - Match existing codebase style
4. **Keep it clean** - Archive unused files promptly
5. **Update documentation** - Keep README current
6. **One source of truth** - No duplicate functionality
