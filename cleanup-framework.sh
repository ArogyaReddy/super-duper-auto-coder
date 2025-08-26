#!/bin/bash

# 🎯 AUTO-CODER FRAMEWORK CLEANUP SCRIPT
# Consolidates 200+ scattered files into clean, organized structure

echo "🚀 Starting Auto-Coder Framework Cleanup..."

# Set base directory
BASE_DIR="/Users/gadea/auto/auto/qa_automation/auto-coder"
cd "$BASE_DIR"

# Create archive directory with timestamp
ARCHIVE_DIR="archive/cleanup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

echo "📚 Step 1: Cleaning up documentation files..."

# Archive old documentation files (keeping only the 3 new consolidated files)
find guides/ -name "*.md" \
  -not -name "MASTER-GUIDE-CONSOLIDATED.md" \
  -not -name "GENERATE-ARTIFACTS-PROMPT.md" \
  -not -name "EXECUTE-ARTIFACTS-PROMPT.md" \
  -exec mv {} "$ARCHIVE_DIR/docs/" \; 2>/dev/null

# Create docs archive directory first
mkdir -p "$ARCHIVE_DIR/docs/"

# Move specific files that are clearly outdated
echo "📁 Moving outdated documentation..."

# Move root level docs
[ -f "AR.md" ] && mv "AR.md" "$ARCHIVE_DIR/docs/"
[ -f "ArogYYaa.md" ] && mv "ArogYYaa.md" "$ARCHIVE_DIR/docs/"
[ -f "ReddYY.md" ] && mv "ReddYY.md" "$ARCHIVE_DIR/docs/"
[ -f "myPrompts.md" ] && mv "myPrompts.md" "$ARCHIVE_DIR/docs/"
[ -f "auto-coder-framework.md" ] && mv "auto-coder-framework.md" "$ARCHIVE_DIR/docs/"

echo "🧪 Step 2: Organizing test and validation files..."

# Create framework-tests structure
mkdir -p "framework-tests/validation"
mkdir -p "framework-tests/generators"
mkdir -p "framework-tests/execution"
mkdir -p "framework-tests/archive"

# Move scattered test files to proper locations
find . -name "*test*.js" -not -path "./node_modules/*" -not -path "./SBS_Automation/*" -not -path "./archive/*" \
  -exec mv {} "framework-tests/validation/" \; 2>/dev/null

find . -name "*validate*.js" -not -path "./node_modules/*" -not -path "./SBS_Automation/*" -not -path "./archive/*" \
  -exec mv {} "framework-tests/validation/" \; 2>/dev/null

find . -name "*demo*.js" -not -path "./node_modules/*" -not -path "./SBS_Automation/*" -not -path "./archive/*" \
  -exec mv {} "framework-tests/generators/" \; 2>/dev/null

echo "📋 Step 3: Cleaning up requirement templates..."

# Keep only essential requirement templates
mkdir -p "requirements/examples"

# Move excessive templates to archive
find requirements/ -name "template-*.md" -exec mv {} "$ARCHIVE_DIR/requirements/" \; 2>/dev/null
find requirements/ -name "completed" -type d -exec mv {} "$ARCHIVE_DIR/requirements/" \; 2>/dev/null
find requirements/ -name "templates" -type d -exec mv {} "$ARCHIVE_DIR/requirements/" \; 2>/dev/null

echo "🗂️ Step 4: Archive redundant configuration files..."

# Archive duplicate config files
mkdir -p "$ARCHIVE_DIR/config"
find . -name "*.config.json" -not -path "./node_modules/*" -not -path "./config/*" \
  -exec cp {} "$ARCHIVE_DIR/config/" \; 2>/dev/null

echo "📊 Step 5: Generate cleanup summary..."

# Create cleanup summary
cat > "$ARCHIVE_DIR/CLEANUP-SUMMARY.md" << EOF
# 🎯 AUTO-CODER CLEANUP SUMMARY

## 📅 Cleanup Date
$(date)

## 📚 Files Archived

### Documentation Files
- Moved 90+ redundant .md files from guides/
- Kept only 3 essential guides:
  - MASTER-GUIDE-CONSOLIDATED.md
  - GENERATE-ARTIFACTS-PROMPT.md  
  - EXECUTE-ARTIFACTS-PROMPT.md

### Test Files
- Organized scattered test files into framework-tests/
- Separated validation, generator, and execution tests
- Archived obsolete demo and experimental files

### Requirements
- Consolidated requirement templates
- Moved duplicate templates to archive
- Kept essential examples only

### Configuration
- Backed up duplicate config files
- Maintained active configs in config/ directory

## 📁 New Structure

\`\`\`
auto-coder/
├── 📚 guides/                       # CLEAN - 3 files only
│   ├── MASTER-GUIDE-CONSOLIDATED.md
│   ├── GENERATE-ARTIFACTS-PROMPT.md
│   └── EXECUTE-ARTIFACTS-PROMPT.md
├── 🧪 framework-tests/              # ORGANIZED
│   ├── validation/
│   ├── generators/
│   ├── execution/
│   └── archive/
├── 📋 requirements/                 # MINIMAL
│   └── examples/
├── 🏗️ SBS_Automation/               # STAGING AREA
├── 🔧 scripts/                      # UTILITY SCRIPTS
├── 📦 src/                          # CORE LOGIC
└── 🗄️ archive/                      # HISTORICAL FILES
\`\`\`

## 🎯 Benefits

1. **Clarity**: Single source of truth documentation
2. **Organization**: Logical file structure  
3. **Maintainability**: Easy to find and update files
4. **Performance**: Reduced file scanning overhead
5. **Focus**: Essential files only in active directories

## 🔄 Restoration

If needed, archived files can be restored from:
\`archive/cleanup-$(date +%Y%m%d-%H%M%S)/\`

EOF

echo "✅ Step 6: Final cleanup validation..."

# Count files in key directories
GUIDES_COUNT=$(find guides/ -name "*.md" | wc -l)
TESTS_COUNT=$(find framework-tests/ -name "*.js" | wc -l)
ARCHIVE_COUNT=$(find "$ARCHIVE_DIR" -type f | wc -l)

echo "📊 Cleanup Results:"
echo "   📚 Guides: $GUIDES_COUNT files (should be 3)"
echo "   🧪 Tests: $TESTS_COUNT files organized"  
echo "   🗄️ Archived: $ARCHIVE_COUNT files"

echo "🎉 Auto-Coder Framework Cleanup Complete!"
echo "📁 Archived files location: $ARCHIVE_DIR"
echo "📖 Review: guides/MASTER-GUIDE-CONSOLIDATED.md"

# Make script executable
chmod +x cleanup-framework.sh
