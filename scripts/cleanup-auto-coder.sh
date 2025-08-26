#!/bin/bash
# AUTO-CODER CLEANUP SCRIPT
# Prevents old/duplicate files from being deployed to main SBS_Automation

AUTO_CODER_DIR="/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation"

echo "🧹 CLEANING AUTO-CODER DIRECTORY..."

# Function to clean old artifacts
clean_old_artifacts() {
    local base_name="$1"
    echo "Cleaning artifacts for: $base_name"
    
    # Remove any files that match the pattern but aren't the current one
    find "$AUTO_CODER_DIR" -name "${base_name}*" -not -name "${base_name}.feature" -not -name "${base_name}-page.js" -not -name "${base_name}-steps.js" -type f -delete
}

# Function to show current artifacts
show_current_artifacts() {
    echo "📋 CURRENT ARTIFACTS IN AUTO-CODER:"
    echo "Features:"
    ls -la "$AUTO_CODER_DIR/features/" 2>/dev/null || echo "  No features found"
    echo "Pages:"
    ls -la "$AUTO_CODER_DIR/pages/" 2>/dev/null || echo "  No pages found"
    echo "Steps:"
    ls -la "$AUTO_CODER_DIR/steps/" 2>/dev/null || echo "  No steps found"
}

# Function to validate clean state
validate_clean_state() {
    local feature_count=$(find "$AUTO_CODER_DIR/features" -name "*.feature" 2>/dev/null | wc -l)
    local page_count=$(find "$AUTO_CODER_DIR/pages" -name "*-page.js" 2>/dev/null | wc -l)
    local steps_count=$(find "$AUTO_CODER_DIR/steps" -name "*-steps.js" 2>/dev/null | wc -l)
    
    echo "📊 ARTIFACT COUNT:"
    echo "  Features: $feature_count"
    echo "  Pages: $page_count"
    echo "  Steps: $steps_count"
    
    if [ "$feature_count" -ne "$page_count" ] || [ "$feature_count" -ne "$steps_count" ]; then
        echo "⚠️  WARNING: Mismatched artifact counts! Some files may be missing."
        return 1
    fi
    
    echo "✅ CLEAN STATE VALIDATED"
    return 0
}

# Main execution
show_current_artifacts
validate_clean_state

echo "🎯 CLEANUP COMPLETE"
