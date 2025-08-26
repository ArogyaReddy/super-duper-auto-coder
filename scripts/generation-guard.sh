#!/bin/bash
# ARTIFACT GENERATION GUARD
# This script GUARANTEES clean generation by auto-cleaning before any new generation

AUTOCODER_DIR="/Users/gadea/auto/auto/qa_automation/auto-coder/SBS_Automation"

# Function to completely clean auto-coder directory
clean_autocoder_completely() {
    echo "🧹 ENFORCING CLEAN SLATE..."
    
    # Remove ALL existing artifacts
    rm -f "$AUTOCODER_DIR/features/"*.feature 2>/dev/null
    rm -f "$AUTOCODER_DIR/pages/"*-page.js 2>/dev/null  
    rm -f "$AUTOCODER_DIR/steps/"*-steps.js 2>/dev/null
    
    echo "✅ AUTO-CODER DIRECTORY COMPLETELY CLEAN"
}

# Function to validate generation
validate_single_generation() {
    local requirement_name="$1"
    
    # Count files
    local feature_count=$(find "$AUTOCODER_DIR/features" -name "*.feature" 2>/dev/null | wc -l)
    local page_count=$(find "$AUTOCODER_DIR/pages" -name "*-page.js" 2>/dev/null | wc -l)
    local steps_count=$(find "$AUTOCODER_DIR/steps" -name "*-steps.js" 2>/dev/null | wc -l)
    
    # Validate exactly one set of files
    if [ "$feature_count" -ne 1 ] || [ "$page_count" -ne 1 ] || [ "$steps_count" -ne 1 ]; then
        echo "❌ CONTAMINATION DETECTED!"
        echo "   Features: $feature_count (should be 1)"
        echo "   Pages: $page_count (should be 1)" 
        echo "   Steps: $steps_count (should be 1)"
        return 1
    fi
    
    # Validate naming consistency
    local expected_feature="$AUTOCODER_DIR/features/${requirement_name}.feature"
    local expected_page="$AUTOCODER_DIR/pages/${requirement_name}-page.js"
    local expected_steps="$AUTOCODER_DIR/steps/${requirement_name}-steps.js"
    
    if [ ! -f "$expected_feature" ] || [ ! -f "$expected_page" ] || [ ! -f "$expected_steps" ]; then
        echo "❌ NAMING INCONSISTENCY DETECTED!"
        return 1
    fi
    
    echo "✅ GENERATION VALIDATED: Single clean set for $requirement_name"
    return 0
}

# Pre-generation cleanup (called before any generation)
pre_generation_cleanup() {
    echo "🚨 PRE-GENERATION CLEANUP ENFORCEMENT"
    clean_autocoder_completely
}

# Post-generation validation (called after generation)
post_generation_validation() {
    local requirement_name="$1"
    echo "🔍 POST-GENERATION VALIDATION"
    validate_single_generation "$requirement_name"
}

# Main execution based on mode
case "$1" in
    "pre")
        pre_generation_cleanup
        ;;
    "post")
        post_generation_validation "$2"
        ;;
    "clean")
        clean_autocoder_completely
        ;;
    *)
        echo "Usage: $0 {pre|post|clean} [requirement_name]"
        echo "  pre  - Clean before generation"
        echo "  post - Validate after generation"  
        echo "  clean - Force clean now"
        exit 1
        ;;
esac
