# Auto-Coder Framework - AI Coding Agent Instructions

## 🎯 Project Overview

The Auto-Coder Framework is an intelligent test artifact generation system that leverages existing SBS_Automation patterns (1,915 features, 563 steps, 585 pages) to automatically generate BDD test artifacts from various input sources. This is a **reference-based architecture** - never copy from SBS_Automation, only reference it.

## 🚨 Critical Architecture Rules

### RULE #1: SBS_Automation Protection
```bash
❌ NEVER touch anything in SBS_Automation/ - it's READ-ONLY reference
✅ ALL work happens in auto-coder/ directory only  
✅ Generate artifacts in auto-coder/SBS_Automation/ (staging area)
✅ Deploy using: npm run deploy:to:sbs (one-script deployment)
```

### RULE #2: 4-Tier Priority System
1. **Priority #1 (Claude)**: 95-100% quality, production-ready, no manual work
2. **Priority #2 (Framework)**: 50-80% quality, requires refinement
3. **Priority #3 (Templates)**: 30-50% quality, significant manual work  
4. **Priority #4 (GPT)**: Variable quality, extensive validation needed

**Always prefer Priority #1 (AI collaboration) for best results.**

## 🚀 Essential Workflows

### Core Development Commands
```bash
# Start interactive CLI (primary interface)
npm start

# Generate test artifacts from requirements
npm run generate requirements/text/story.txt
npm run generate:jira     # From JIRA stories
npm run generate:auto     # No-prompt mode

# Environment management (mirrors SBS_Automation)
npm run env:switch iat    # Switch to IAT environment
npm run env:list          # List all environments
npm run env:current       # Show current environment

# Deploy to actual SBS_Automation
npm run deploy:to:sbs     # ONE-SCRIPT deployment
npm run deploy:dry-run    # Preview deployment safely

# Complete pipeline
npm run full:pipeline     # generate → deploy → test
```

### Testing & Validation
```bash
# Test generated artifacts in staging
npm run sbs:test:generated    # Test @Generated tagged features
npm run test:features         # Run all generated features

# Framework validation
npm run framework:validate    # Complete health check
npm run validate:cross-platform # Platform compatibility

# Test in actual SBS_Automation after deployment
cd ../SBS_Automation && node . -t "@Generated"
```

## 📁 Key Directory Structure

```
auto-coder/
├── SBS_Automation/           # Staging area for generated artifacts
├── src/
│   ├── interactive-cli.js    # Main user interface
│   ├── templates/            # Template-based generation (Area 4)
│   └── cross-platform-runner.js # Cross-platform execution
├── requirements/             # Input sources (text, JIRA, images, etc.)
├── scripts/
│   ├── deploy-to-sbs.js     # ONE-SCRIPT deployment
│   └── environment-manager.js # Environment switching
├── guides/                   # All documentation
└── framework-tests/          # Validation and testing
```

## 🎯 Framework-Specific Patterns

### BDD Artifact Generation
- **Input**: Text requirements, JIRA stories, images, API specs, Confluence
- **Output**: `.feature` files, `-steps.js` files, `-page.js` files
- **Pattern**: Extract from SBS_Automation reference, generate SBS-compatible code
- **Tags**: Always include `@Generated` and `@Team:AutoCoder`

### Path Resolution Rules
```javascript
// Generated files use target environment paths:
const BasePage = require('./common/base-page');        // Works in SBS_Automation
const By = require('./../../support/By.js');           // Works in SBS_Automation
const helpers = require('./../../support/helpers.js'); // Works in SBS_Automation
```

### Environment Configuration
- Uses `web.config.json` matching SBS_Automation structure
- Environment-specific data in `data/<env>/test-data.json`
- Three environments: FIT, IAT, DEV (mirroring SBS_Automation)

## 🛠️ Integration Points

### Template System (Area 4)
```bash
# BDD template generation with exact Given-When-Then mapping
node src/templates/simple-template-manager.js wizard 1  # Simplest template
node src/templates/simple-template-manager.js generate  # Generate from template
```

### Cross-Platform Support
- Windows: Uses PowerShell scripts (`.ps1`)
- macOS/Linux: Uses shell scripts (`.sh`) 
- All commands work via npm scripts with `cross-env`

### Quality Validation
- `framework-tests/priority1/` - Highest quality validation
- SBS pattern compliance checking via `scripts/sbs-pattern-enforcer.js`
- Integration testing with actual SBS_Automation framework

## 🔧 Common Debugging Patterns

### Path Issues
```bash
npm run deploy:dry-run        # Preview paths before deployment
npm run validate:structure    # Check directory structure
```

### Generation Issues
```bash
npm run framework:validate    # Check framework health
npm run clean:all            # Clean generated artifacts
```

### Environment Issues  
```bash
npm run env:current          # Check current environment
npm run env:switch <env>     # Switch if needed
```

## 📚 Documentation Hierarchy

1. **guides/MASTER-GUIDE.md** - Complete framework overview
2. **guides/FRAMEWORK-GUIDELINES.md** - Fundamental rules (MANDATORY)
3. **guides/INTERACTIVE-CLI-GUIDE.md** - User interface guide
4. **REFERENCE_ARCHITECTURE.md** - Technical architecture details

## 💡 Best Practices for AI Agents

1. **Always check `guides/FRAMEWORK-GUIDELINES.md` first** - contains fundamental rules
2. **Use Priority #1 approach** - collaborate with human for best quality
3. **Never modify SBS_Automation** - it's reference-only
4. **Test in staging first** - use auto-coder/SBS_Automation/ before deployment
5. **Use interactive CLI** - `npm start` provides guided workflows
6. **Validate deployments** - always use `npm run deploy:dry-run` first

This framework emphasizes **pattern extraction over duplication**, **safe deployment workflows**, and **100% SBS_Automation compatibility** while maintaining complete isolation during development.
