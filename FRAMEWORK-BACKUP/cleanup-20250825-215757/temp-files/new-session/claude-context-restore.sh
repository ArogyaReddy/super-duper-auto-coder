#!/bin/bash

# Claude Context Restoration Script
# Run this when starting a new session to get Claude up to speed

echo "🚀 CLAUDE CONTEXT RESTORATION"
echo "=============================="
echo ""

NEW_SESSION_DIR="/Users/gadea/auto/auto/qa_automation/auto-coder/new-session"
AUTO_CODER_ROOT="/Users/gadea/auto/auto/qa_automation/auto-coder"

# Check if directories exist
if [[ ! -d "$NEW_SESSION_DIR" ]]; then
    echo "❌ ERROR: new-session directory not found at $NEW_SESSION_DIR"
    exit 1
fi

if [[ ! -d "$AUTO_CODER_ROOT" ]]; then
    echo "❌ ERROR: auto-coder root directory not found at $AUTO_CODER_ROOT"
    exit 1
fi

echo "📁 Directories confirmed:"
echo "   New Session: $NEW_SESSION_DIR"
echo "   Auto-coder Root: $AUTO_CODER_ROOT"
echo ""

# Display critical context files
echo "📋 CRITICAL CONTEXT FILES TO READ:"
echo "=================================="
echo ""

echo "1️⃣  SESSION CONTEXT SUMMARY (Must Read First):"
echo "   📄 $NEW_SESSION_DIR/SESSION-CONTEXT-SUMMARY.md"
echo ""

echo "2️⃣  FRAMEWORK QUICK REFERENCE:"
echo "   📄 $NEW_SESSION_DIR/FRAMEWORK-QUICK-REF.md"
echo ""

echo "3️⃣  RECENT CONVERSATION SUMMARY:"
echo "   📄 $NEW_SESSION_DIR/SESSION-LAST-CONVERSATION.md"
echo ""

echo "4️⃣  CURRENT ISSUES & MONITORING:"
echo "   📄 $NEW_SESSION_DIR/SESSION-CURRENT-ISSUES.md"
echo ""

echo "5️⃣  CRITICAL DOCUMENTATION:"
echo "   📄 $AUTO_CODER_ROOT/docs/NEVER-DUPLICATE-SBS-FILES.md"
echo "   📄 $AUTO_CODER_ROOT/docs/SBS-DUPLICATION-PREVENTION.md"
echo ""

echo "🎯 KEY PROMPTS TO REFERENCE:"
echo "============================"
echo "   📄 $AUTO_CODER_ROOT/.github/myPrompts/You-Me-Direct.md"
echo "   📄 $AUTO_CODER_ROOT/.github/myPrompts/ArogYYaa.md"
echo ""

echo "🔧 VALIDATION TOOLS:"
echo "==================="
echo "   🛠️  $AUTO_CODER_ROOT/scripts/check-sbs-duplicates.sh"
echo "   🛠️  $NEW_SESSION_DIR/session-health-check.sh"
echo ""

echo "⚡ QUICK START COMMANDS:"
echo "======================="
echo "   # Health check"
echo "   cd $NEW_SESSION_DIR && ./session-health-check.sh"
echo ""
echo "   # Duplication check"
echo "   cd $AUTO_CODER_ROOT && ./scripts/check-sbs-duplicates.sh"
echo ""
echo "   # Test generation"
echo "   cd $AUTO_CODER_ROOT"
echo "   node no-ai/generate-feature-steps-page.js [requirement-file] [base-name]"
echo ""

echo "🚨 CRITICAL RULES TO REMEMBER:"
echo "=============================="
echo "   ❌ NEVER duplicate SBS_Automation files in auto-coder"
echo "   ✅ ALWAYS reference main framework with '../../../SBS_Automation/' paths"
echo "   ✅ ONLY generate test artifacts (features, steps, pages)"
echo "   ✅ Use validation scripts to check compliance"
echo ""

echo "📊 FRAMEWORK STATE: FULLY OPERATIONAL"
echo "📅 Last Updated: August 3, 2025"
echo "🎯 Ready for immediate use"
echo ""
echo "✅ Context restoration complete. Claude should now be up to speed!"
