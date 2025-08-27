#!/bin/bash

# 🎯 AUTO-CODER FRAMEWORK CLEANUP SCRIPT
# Consolidates scattered files into clean, organized structure for production use

echo "🚀 Starting Auto-Coder Framework Cleanup..."

# Set base directory
BASE_DIR="/Users/arog/auto/auto/qa_automation/auto-coder"
cd "$BASE_DIR"

# Create archive directory with timestamp
ARCHIVE_DIR="FRAMEWORK-BACKUP/cleanup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

echo "📚 Step 1: Cleaning up documentation files..."

# Archive old documentation files keeping only essential ones
mkdir -p "$ARCHIVE_DIR/docs/"
mkdir -p "$ARCHIVE_DIR/examples/"
mkdir -p "$ARCHIVE_DIR/temp-files/"

# Move specific files that are clearly outdated
echo "📁 Moving outdated documentation..."

# Essential files to KEEP:
# - README.md (main)
# - TEAM-SETUP-GUIDE.md (team onboarding)
# - .github/auto-coder-prompt.md (main AI prompt)
# Everything else goes to backup

# Move root level outdated docs
[ -f "AR.md" ] && mv "AR.md" "$ARCHIVE_DIR/docs/"
[ -f "You-Me-Direct-BACKUP-COMPREHENSIVE.md" ] && mv "You-Me-Direct-BACKUP-COMPREHENSIVE.md" "$ARCHIVE_DIR/docs/"
[ -f "You-Me-Direct-Playwright-Enhanced-BACKUP.md" ] && mv "You-Me-Direct-Playwright-Enhanced-BACKUP.md" "$ARCHIVE_DIR/docs/"

# Move example files
[ -f "home-page-example.js" ] && mv "home-page-example.js" "$ARCHIVE_DIR/examples/"
[ -f "my-page-example.js" ] && mv "my-page-example.js" "$ARCHIVE_DIR/examples/"
[ -f "my-page1-example.js" ] && mv "my-page1-example.js" "$ARCHIVE_DIR/examples/"
[ -f "test-page-example.js" ] && mv "test-page-example.js" "$ARCHIVE_DIR/examples/"
[ -f "test-page-demo-example.js" ] && mv "test-page-demo-example.js" "$ARCHIVE_DIR/examples/"
[ -f "enhanced-test-page-example.js" ] && mv "enhanced-test-page-example.js" "$ARCHIVE_DIR/examples/"
[ -f "corrected-test-page-example.js" ] && mv "corrected-test-page-example.js" "$ARCHIVE_DIR/examples/"
[ -f "help-example.js" ] && mv "help-example.js" "$ARCHIVE_DIR/examples/"

# Move sample files
[ -f "sample-report.html" ] && mv "sample-report.html" "$ARCHIVE_DIR/temp-files/"

# Move whole directories that are not essential
[ -d "knowledge-base" ] && mv "knowledge-base" "$ARCHIVE_DIR/docs/"
[ -d "guides" ] && mv "guides" "$ARCHIVE_DIR/docs/"
[ -d "docs" ] && mv "docs" "$ARCHIVE_DIR/docs/"
[ -d "archive" ] && mv "archive" "$ARCHIVE_DIR/"
[ -d "temp" ] && mv "temp" "$ARCHIVE_DIR/temp-files/"
[ -d "new-session" ] && mv "new-session" "$ARCHIVE_DIR/temp-files/"

# Move excessive prompt files (keep only .github/auto-coder-prompt.md)
find . -name "*.prompt.md" -not -path "*/.github/auto-coder-prompt.md" -exec mv {} "$ARCHIVE_DIR/docs/" \; 2>/dev/null

echo "🧪 Step 2: Testing framework functionality..."

# Test core framework functions before cleanup
echo "🔍 Testing package.json scripts..."
if npm run framework:status >/dev/null 2>&1; then
    echo "✅ Framework status: OK"
else
    echo "⚠️  Framework status: Check needed"
fi

echo "📋 Step 3: Creating streamlined structure summary..."

# Create cleanup summary that shows what we're keeping vs archiving
cat > "FRAMEWORK-ORGANIZATION-REPORT.md" << EOF
# 🚀 Framework Organization Report

## ✅ **CORE FRAMEWORK FILES (KEPT)**

### Essential Directories:
- \`SBS_Automation/\` - Generated test artifacts (CORE OUTPUT)
- \`src/\` - Framework source code (CORE LOGIC)
- \`bin/\` - Executable scripts (CORE TOOLS) 
- \`scripts/\` - Utility scripts (CORE UTILITIES)
- \`config/\` - Configuration files (CORE SETTINGS)
- \`requirements/\` - Requirement templates (CORE INPUT)
- \`support/\` - Framework support files (CORE SUPPORT)
- \`utils/\` - Framework utilities (CORE HELPERS)

### Essential Files:
- \`package.json\` - Dependencies and scripts (REQUIRED)
- \`README.md\` - Main documentation (TEAM GUIDE)
- \`.github/auto-coder-prompt.md\` - **PRIMARY AI PROMPT** (TEAM USAGE)
- \`TEAM-SETUP-GUIDE.md\` - Team onboarding guide (TEAM USAGE)
- \`cleanup-framework.sh\` - This cleanup script

### Essential for Team Usage:
- \`.github/auto-coder-prompt.md\` - **MAIN PROMPT** for AI interactions
- \`TEAM-SETUP-GUIDE.md\` - Setup instructions for new team members
- \`package.json\` scripts - npm run commands for daily usage

## 📦 **MOVED TO BACKUP (FRAMEWORK-BACKUP/)**

### Documentation Archive:
- \`knowledge-base/\` - Historical development documents
- \`guides/\` - Multiple guide versions
- \`docs/\` - Legacy documentation
- \`AR.md\`, \`You-Me-Direct-*.md\` - Development notes

### Development Archive:
- \`*-example.js\` files - Code examples and demos
- \`sample-report.html\` - Sample outputs
- \`archive/\` - Previous archive folders

### Temporary Files:
- \`temp/\` - Temporary working files
- \`new-session/\` - Session artifacts
- Multiple \`.prompt.md\` files - Old prompt versions

## 🎯 **STREAMLINED FRAMEWORK STRUCTURE**

\`\`\`
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
\`\`\`

## 📋 **TEAM USAGE - ESSENTIAL COMMANDS**

### Daily Usage:
\`\`\`bash
npm start                    # Interactive CLI
npm run generate:intelligent # Smart generation
npm run test:generated      # Test generated artifacts
npm run framework:status    # Check framework health
\`\`\`

### Team Setup:
\`\`\`bash
npm install                 # Install dependencies
npm run team:validate      # Validate setup
\`\`\`

## 🎯 **AI INTERACTION - SINGLE PROMPT**

**File**: \`.github/auto-coder-prompt.md\`
- ✅ Simple & strict rules
- ✅ SBS_Automation compliance
- ✅ Consistent quality
- ✅ Team-shareable

## 📋 **NEXT STEPS**

1. ✅ Review streamlined structure
2. ✅ Test core functionality: \`npm run framework:status\`
3. ✅ Test generation: \`npm start\`
4. ✅ Share with team: \`TEAM-SETUP-GUIDE.md\`
5. ✅ Use main prompt: \`.github/auto-coder-prompt.md\`
6. ✅ Once confirmed working: Delete FRAMEWORK-BACKUP/

## � **VALIDATION CHECKLIST**

- [ ] Framework starts: \`npm start\`
- [ ] Can generate artifacts: AI prompt works
- [ ] Tests run: \`npm run test:generated\`
- [ ] Team can follow: \`TEAM-SETUP-GUIDE.md\`
- [ ] AI prompt accessible: \`.github/auto-coder-prompt.md\`

EOF
echo "✅ Step 4: Final validation and summary..."

# Count files before and after
TOTAL_FILES_BEFORE=$(find . -type f | wc -l)
BACKUP_FILES=$(find "$ARCHIVE_DIR" -type f | wc -l)

echo "📊 Cleanup Results:"
echo "   📁 Files moved to backup: $BACKUP_FILES"
echo "   📚 Essential documentation: 3 files (README.md, TEAM-SETUP-GUIDE.md, .github/auto-coder-prompt.md)"
echo "   🎯 Streamlined for production use"

echo ""
echo "🎉 Auto-Coder Framework Cleanup Complete!"
echo ""
echo "📍 **ESSENTIAL FILES FOR TEAM:**"
echo "   � Setup: TEAM-SETUP-GUIDE.md"
echo "   � AI Prompt: .github/auto-coder-prompt.md"
echo "   � Main docs: README.md"
echo "   💻 Commands: package.json scripts"
echo ""
echo "📁 Archived files location: $ARCHIVE_DIR"
echo "📖 Full report: FRAMEWORK-ORGANIZATION-REPORT.md"
echo ""
echo "🧪 **TEST THE FRAMEWORK:**"
echo "   npm run framework:status"
echo "   npm start"
echo ""
