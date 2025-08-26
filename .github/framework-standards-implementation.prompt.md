# 📚 PROMPT: AUTO-CODER FRAMEWORK STANDARDS & IMPLEMENTATION

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

I need you to help me establish, document, and implement comprehensive standards for the Auto-Coder framework to ensure consistent quality and SBS_Automation compatibility.

**STANDARDS REQUEST:**
Please help me with:
□ Define framework architecture standards
□ Establish coding standards and patterns
□ Create implementation guidelines
□ Document process workflows
□ Define quality assurance standards
□ Establish SBS compliance requirements

**CURRENT SITUATION:**
[Describe your current framework state:]
□ Framework is working but lacks documented standards
□ Inconsistent patterns across generated artifacts
□ Need to establish development processes
□ Want to improve code quality and maintainability
□ Need clear guidelines for team collaboration
□ Seeking best practices implementation

**AREAS NEEDING STANDARDS:**
□ Code structure and organization
□ Generation patterns and templates
□ Validation and testing procedures
□ Documentation requirements
□ SBS_Automation compliance rules
□ CLI interface standards
□ Error handling and logging
□ Performance benchmarks

**IMPLEMENTATION SCOPE:**
□ Framework architecture documentation
□ Coding style guides
□ Process workflows
□ Quality gates and checkpoints
□ Automated enforcement tools
□ Training materials
□ Best practices documentation
```

## 🎯 **EXAMPLE USAGE**

```markdown
Hello Claude,

I need you to help me establish, document, and implement comprehensive standards for the Auto-Coder framework to ensure consistent quality and SBS_Automation compatibility.

**STANDARDS REQUEST:**
The Auto-Coder framework is functional but lacks comprehensive standards. I need to establish clear guidelines for development, generation patterns, and SBS compliance.

**CURRENT SITUATION:**
- Framework generates artifacts but quality is inconsistent
- Multiple developers working on different components
- No documented standards for code organization
- SBS compliance checks are manual and incomplete
- Need automated quality enforcement

**AREAS NEEDING STANDARDS:**
[All areas listed above]

**IMPLEMENTATION SCOPE:**
Please create a complete standards framework including documentation, automated enforcement, and training materials.
```

## 🏗️ **FRAMEWORK ARCHITECTURE STANDARDS**

### **Directory Structure Standards**
```markdown
DEFINE:
1. Mandatory directory organization
2. File naming conventions
3. Component separation rules
4. Archive and cleanup policies
5. Configuration management

STRUCTURE:
auto-coder/
├── 📚 guides/ (documentation only)
├── 🎯 src/ (core generation logic)
├── 🛠️ bin/ (CLI executables)
├── 🧪 framework-tests/ (validation and testing)
├── 🏗️ SBS_Automation/ (generated artifacts staging)
├── 📋 requirements/ (input templates)
├── 🔧 scripts/ (utility scripts)
└── 🗄️ archive/ (historical files)
```

### **Code Organization Standards**
```markdown
ESTABLISH:
1. Module structure requirements
2. Import/export patterns
3. Class and function naming
4. Comment and documentation standards
5. Error handling patterns
6. Logging requirements
```

## 📝 **CODING STANDARDS**

### **JavaScript/Node.js Standards**
```markdown
STYLE REQUIREMENTS:
- ESLint configuration for consistency
- Prettier formatting rules
- JSDoc documentation for all functions
- Consistent async/await usage
- Error handling best practices
- Module export patterns

EXAMPLE:
/**
 * Generates page object following SBS patterns
 * @param {Object} requirements - Parsed requirements object
 * @param {string} outputPath - Target file path
 * @returns {Promise<boolean>} Success status
 */
async function generatePageObject(requirements, outputPath) {
  try {
    // Implementation following standards
    return true;
  } catch (error) {
    logger.error('Page object generation failed', { error, requirements });
    throw error;
  }
}
```

### **Template Standards**
```markdown
TEMPLATE REQUIREMENTS:
- Handlebars syntax consistency
- SBS pattern compliance built-in
- Parameterization standards
- Validation rules embedded
- Error prevention measures

EXAMPLE TEMPLATE:
const By = require('./../../support/By.js');
const BasePage = require('../common/base-page');

class {{className}} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
  
  {{#each methods}}
  async {{name}}() {
    // SBS compliant implementation
  }
  {{/each}}
}

module.exports = {{className}};
```

## 🎯 **SBS COMPLIANCE STANDARDS**

### **Mandatory Compliance Rules**
```markdown
PAGE OBJECTS:
✅ Must extend BasePage with: constructor(page) { super(page); this.page = page; }
✅ Must use: const By = require('./../../support/By.js');
✅ Must use data-test-id locators: By.css('[data-test-id="identifier"]')
✅ Must export with: module.exports = ClassName;

STEP DEFINITIONS:
✅ Must use: const { Given, When, Then } = require('@cucumber/cucumber');
✅ Must use: const { assert } = require('chai'); NOT expect
✅ Must include timeout: { timeout: 60 * 1000 }
✅ Must instantiate pages: pageObject = new PageClass(this.page);

FEATURE FILES:
✅ Must use: @Team:SBSBusinessContinuity tags
✅ Must include: @Category:UI or @Category:API
✅ Must follow: Given/When/Then BDD structure
✅ Must include: Background sections when appropriate
```

### **Automated Compliance Checking**
```bash
# SBS pattern validation
npm run validate:sbs-compliance

# Code quality checks
npm run lint:all

# Template validation
npm run validate:templates

# Generation quality test
npm run test:generation-quality
```

## 📊 **QUALITY STANDARDS**

### **Generation Quality Metrics**
```markdown
REQUIREMENTS:
- 100% syntax correctness (no compilation errors)
- 95% SBS pattern compliance
- 90% functional completeness on first generation
- <2 minutes generation time per feature
- <20% manual fixes required

MEASUREMENT:
- Automated syntax validation
- SBS compliance scoring
- Functional testing of generated artifacts
- Performance benchmarking
- Manual review requirements tracking
```

### **Testing Standards**
```markdown
TEST COVERAGE:
- Unit tests for all generator functions
- Integration tests for complete generation flows
- SBS compliance validation tests
- Performance benchmark tests
- End-to-end workflow tests

TEST STRUCTURE:
framework-tests/
├── unit/ (individual component tests)
├── integration/ (workflow tests)
├── compliance/ (SBS validation tests)
├── performance/ (benchmark tests)
└── e2e/ (complete workflow tests)
```

## 🔄 **PROCESS STANDARDS**

### **Development Workflow**
```markdown
PROCESS:
1. Requirements Analysis
   - Parse and validate input requirements
   - Identify generation patterns needed
   - Plan artifact structure

2. Generation Implementation
   - Apply SBS patterns consistently
   - Generate complete, functional artifacts
   - Validate syntax and compliance

3. Quality Assurance
   - Automated compliance checking
   - Manual review for complex scenarios
   - End-to-end testing

4. Deployment Preparation
   - Final validation against SBS standards
   - Performance verification
   - Documentation updates
```

### **Release Standards**
```markdown
RELEASE CHECKLIST:
- [ ] All tests passing (unit, integration, e2e)
- [ ] SBS compliance validation passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)
- [ ] Rollback plan prepared
```

## 🛠️ **IMPLEMENTATION TOOLS**

### **Automated Enforcement**
```markdown
TOOLS TO IMPLEMENT:
1. Pre-commit hooks for code quality
2. CI/CD pipeline with quality gates
3. Automated SBS compliance checking
4. Performance monitoring
5. Documentation generation
6. Template validation

EXAMPLE PRE-COMMIT:
#!/bin/sh
npm run lint:fix
npm run validate:sbs-compliance
npm run test:unit
```

### **Documentation Standards**
```markdown
DOCUMENTATION REQUIREMENTS:
- README.md with quick start guide
- API documentation for all public functions
- Architecture decision records (ADRs)
- SBS compliance guide
- Troubleshooting documentation
- Change log maintenance

DOCUMENTATION STRUCTURE:
guides/
├── README.md (framework overview)
├── GETTING-STARTED.md (quick start)
├── API-REFERENCE.md (function documentation)
├── SBS-COMPLIANCE.md (compliance guide)
├── TROUBLESHOOTING.md (common issues)
└── CHANGELOG.md (version history)
```

## 📈 **MONITORING & METRICS**

### **Framework Health Metrics**
```markdown
TRACK:
- Generation success rate
- SBS compliance score
- Performance metrics
- User adoption
- Issue resolution time
- Code quality trends

REPORTING:
- Daily automated health checks
- Weekly quality reports
- Monthly performance reviews
- Quarterly architecture assessments
```

### **Continuous Improvement**
```markdown
IMPROVEMENT PROCESS:
1. Collect metrics and feedback
2. Identify improvement opportunities
3. Plan enhancements
4. Implement with standards compliance
5. Measure impact and adjust
```

## 🎯 **TRAINING & ADOPTION**

### **Team Training Materials**
```markdown
CREATE:
1. Framework overview presentation
2. Hands-on coding workshops
3. SBS compliance training
4. Best practices documentation
5. Common mistakes guide
6. Advanced usage scenarios

DELIVERY:
- Interactive workshops
- Documentation review sessions
- Pair programming exercises
- Code review guidelines
- Mentoring programs
```

---

**📞 Usage:** Copy the interaction template above, specify your standards and implementation needs, and send to Claude for comprehensive framework standards development.
