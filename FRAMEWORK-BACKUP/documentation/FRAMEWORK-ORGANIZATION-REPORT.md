# 🚀 Framework Organization Report

## ✅ **CORE FRAMEWORK FILES (KEPT)**

### Essential Directories:
- `SBS_Automation/` - Generated test artifacts (CORE OUTPUT)
- `src/` - Framework source code (CORE LOGIC)
- `bin/` - Executable scripts (CORE TOOLS) 
- `scripts/` - Utility scripts (CORE UTILITIES)
- `config/` - Configuration files (CORE SETTINGS)
- `requirements/` - Requirement templates (CORE INPUT)
- `support/` - Framework support files (CORE SUPPORT)
- `utils/` - Framework utilities (CORE HELPERS)

### Essential Files:
- `package.json` - Dependencies and scripts (REQUIRED)
- `README.md` - Main documentation (TEAM GUIDE)
- `.github/auto-coder-prompt.md` - **PRIMARY AI PROMPT** (TEAM USAGE)
- `TEAM-SETUP-GUIDE.md` - Team onboarding guide (TEAM USAGE)
- `cleanup-framework.sh` - This cleanup script

### Essential for Team Usage:
- `.github/auto-coder-prompt.md` - **MAIN PROMPT** for AI interactions
- `TEAM-SETUP-GUIDE.md` - Setup instructions for new team members
- `package.json` scripts - npm run commands for daily usage

## 📦 **MOVED TO BACKUP (FRAMEWORK-BACKUP/)**

### Documentation Archive:
- `knowledge-base/` - Historical development documents
- `guides/` - Multiple guide versions
- `docs/` - Legacy documentation
- `AR.md`, `You-Me-Direct-*.md` - Development notes

### Development Archive:
- `*-example.js` files - Code examples and demos
- `sample-report.html` - Sample outputs
- `archive/` - Previous archive folders

### Temporary Files:
- `temp/` - Temporary working files
- `new-session/` - Session artifacts
- Multiple `.prompt.md` files - Old prompt versions

## 🎯 **STREAMLINED FRAMEWORK STRUCTURE**

```
auto-coder/                          # Clean, production-ready framework
├── 📁 SBS_Automation/               # Generated test artifacts
├── 📁 src/                          # Framework source code  
├── 📁 bin/                          # Executable CLI tools
├── 📁 scripts/                      # Utility scripts
├── 📁 config/                       # Configuration files
├── 📁 requirements/                 # Input templates
├── 📁 support/                      # Framework support
├── 📁 utils/                        # Helper utilities
├── 📄 package.json                  # Dependencies & scripts
├── 📄 README.md                     # Main documentation
├── 📄 TEAM-SETUP-GUIDE.md           # Team onboarding
├── 📁 .github/
│   └── 📄 auto-coder-prompt.md      # **MAIN AI PROMPT**
└── 📁 FRAMEWORK-BACKUP/             # Archived materials
    ├── docs/                        # Documentation archive
    ├── examples/                    # Code examples
    └── temp-files/                  # Temporary files
```

## 📋 **TEAM USAGE - ESSENTIAL COMMANDS**

### Daily Usage:
```bash
npm start                    # Interactive CLI
npm run generate:intelligent # Smart generation
npm run test:generated      # Test generated artifacts
npm run framework:status    # Check framework health
```

### Team Setup:
```bash
npm install                 # Install dependencies
npm run team:validate      # Validate setup
```

## 🎯 **AI INTERACTION - SINGLE PROMPT**

**File**: `.github/auto-coder-prompt.md`
- ✅ Simple & strict rules
- ✅ SBS_Automation compliance
- ✅ Consistent quality
- ✅ Team-shareable

## 📋 **NEXT STEPS**

1. ✅ Review streamlined structure
2. ✅ Test core functionality: `npm run framework:status`
3. ✅ Test generation: `npm start`
4. ✅ Share with team: `TEAM-SETUP-GUIDE.md`
5. ✅ Use main prompt: `.github/auto-coder-prompt.md`
6. ✅ Once confirmed working: Delete FRAMEWORK-BACKUP/

## � **VALIDATION CHECKLIST**

- [ ] Framework starts: `npm start`
- [ ] Can generate artifacts: AI prompt works
- [ ] Tests run: `npm run test:generated`
- [ ] Team can follow: `TEAM-SETUP-GUIDE.md`
- [ ] AI prompt accessible: `.github/auto-coder-prompt.md`

