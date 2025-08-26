#!/bin/bash

# SBS_Automation Duplication Detection Script
# This script checks for any forbidden duplicates of main SBS_Automation files

echo "🔍 Checking for SBS_Automation file duplications..."

MAIN_SBS_PATH="/Users/gadea/auto/auto/qa_automation/SBS_Automation"
AUTO_CODER_SBS_PATH="/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation"

# Framework files that should NEVER be duplicated
FORBIDDEN_FILES=(
    "pages/common/base-page.js"
    "support/By.js" 
    "support/helpers.js"
    "pages/common/login-page.js"
    "support/credentials-manager.js"
    "support/playwright-helpers.js"
    "hooks/before-after.js"
    "apis/api-client.js"
)

echo "Main SBS_Automation path: $MAIN_SBS_PATH"
echo "Auto-coder SBS_Automation path: $AUTO_CODER_SBS_PATH"
echo ""

VIOLATIONS_FOUND=0

for file in "${FORBIDDEN_FILES[@]}"; do
    main_file="$MAIN_SBS_PATH/$file"
    auto_coder_file="$AUTO_CODER_SBS_PATH/$file"
    
    if [[ -f "$auto_coder_file" ]]; then
        echo "❌ VIOLATION: Found duplicate file: $auto_coder_file"
        echo "   This file should only exist in: $main_file"
        VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
    fi
done

# Check for any other suspicious framework files
echo ""
echo "🔍 Checking for other potential framework duplicates..."

if [[ -d "$AUTO_CODER_SBS_PATH/support" ]]; then
    support_files=$(find "$AUTO_CODER_SBS_PATH/support" -name "*.js" 2>/dev/null)
    if [[ -n "$support_files" ]]; then
        echo "❌ VIOLATION: Found files in auto-coder support directory:"
        echo "$support_files"
        VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
    fi
fi

if [[ -d "$AUTO_CODER_SBS_PATH/pages/common" ]]; then
    common_files=$(find "$AUTO_CODER_SBS_PATH/pages/common" -name "*.js" 2>/dev/null)
    if [[ -n "$common_files" ]]; then
        echo "❌ VIOLATION: Found files in auto-coder pages/common directory:"
        echo "$common_files"
        VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
    fi
fi

if [[ -d "$AUTO_CODER_SBS_PATH/hooks" ]]; then
    hook_files=$(find "$AUTO_CODER_SBS_PATH/hooks" -name "*.js" 2>/dev/null)
    if [[ -n "$hook_files" ]]; then
        echo "❌ VIOLATION: Found files in auto-coder hooks directory:"
        echo "$hook_files"
        VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
    fi
fi

echo ""
if [[ $VIOLATIONS_FOUND -eq 0 ]]; then
    echo "✅ SUCCESS: No SBS_Automation file duplications found!"
    echo "✅ All framework files properly referenced from main SBS_Automation"
else
    echo "🚨 FAILURE: Found $VIOLATIONS_FOUND violation(s)"
    echo "🚨 Action required: Remove duplicate files and fix import paths"
    exit 1
fi

echo ""
echo "📋 Allowed files in auto-coder/SBS_Automation/:"
echo "  ✅ features/ - Generated feature files"
echo "  ✅ steps/ - Generated step definition files"  
echo "  ✅ pages/ - Generated page objects (that extend main BasePage)"
echo "  ✅ data/ - Generated test data files"
echo ""
echo "🚫 Forbidden duplicates:"
echo "  ❌ Any file that exists in main SBS_Automation framework"
echo "  ❌ support/, pages/common/, hooks/, apis/ directories"
echo ""
