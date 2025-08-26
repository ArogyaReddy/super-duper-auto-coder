#!/bin/bash
# RACE CONDITION PREVENTION SCRIPT
# Use this after file generation to validate content

validate_generated_files() {
    local feature_file="$1"
    local steps_file="$2" 
    local page_file="$3"
    
    echo "🔍 VALIDATING GENERATED FILES..."
    
    # Check if files exist and have content
    if [[ ! -s "$feature_file" ]]; then
        echo "❌ CRITICAL: Feature file is empty or missing!"
        return 1
    fi
    
    if [[ ! -s "$steps_file" ]]; then
        echo "❌ CRITICAL: Steps file is empty or missing!"
        return 1
    fi
    
    if [[ ! -s "$page_file" ]]; then
        echo "❌ CRITICAL: Page file is empty or missing!"
        return 1
    fi
    
    # Check for minimum content requirements
    if ! grep -q "Feature:" "$feature_file"; then
        echo "❌ CRITICAL: Feature file missing Feature declaration!"
        return 1
    fi
    
    if ! grep -q "module.exports" "$page_file"; then
        echo "❌ CRITICAL: Page file missing module.exports!"
        return 1
    fi
    
    if ! grep -q "require.*cucumber" "$steps_file"; then
        echo "❌ CRITICAL: Steps file missing cucumber imports!"
        return 1
    fi
    
    echo "✅ ALL FILES VALIDATED SUCCESSFULLY"
    return 0
}

# Usage: ./validate-files.sh feature.feature steps.js page.js
validate_generated_files "$1" "$2" "$3"
