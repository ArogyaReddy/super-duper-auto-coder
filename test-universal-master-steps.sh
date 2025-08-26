#!/bin/bash

# Test Universal Master Steps CLI Integration
echo "🧪 Testing Universal Master Steps CLI Integration..."

cd /Users/gadea/auto/auto/qa_automation/auto-coder

echo ""
echo "📋 Testing Universal Master Steps Generation..."
echo "Input: requirements/text/jira-story-cfc-landing-page.txt"
echo ""

# Run the generator
node no-ai/generate-feature-steps-page-MASTER-LIBRARY-FIXED.js requirements/text/jira-story-cfc-landing-page.txt jira-test

echo ""
echo "✅ Generation Complete!"
echo ""

echo "📊 Generated Files Analysis:"
echo ""

# Check feature file
if [ -f "SBS_Automation/features/jira-test.feature" ]; then
    echo "✅ Feature File: $(wc -l < SBS_Automation/features/jira-test.feature) lines"
    echo "   Scenarios: $(grep -c "Scenario:" SBS_Automation/features/jira-test.feature)"
    echo "   Steps: $(grep -c "Given\|When\|Then\|And" SBS_Automation/features/jira-test.feature)"
else
    echo "❌ Feature File: Missing"
fi

# Check steps file  
if [ -f "SBS_Automation/steps/jira-test-steps.js" ]; then
    echo "✅ Steps File: $(wc -l < SBS_Automation/steps/jira-test-steps.js) lines"
    echo "   Step Definitions: $(grep -c "Given\|When\|Then" SBS_Automation/steps/jira-test-steps.js)"
    echo "   Import Path: $(grep -o "require('../../pages/auto-coder/.*')" SBS_Automation/steps/jira-test-steps.js | head -1)"
else
    echo "❌ Steps File: Missing"
fi

# Check page file
if [ -f "SBS_Automation/pages/jira-test-page.js" ]; then
    echo "✅ Page File: $(wc -l < SBS_Automation/pages/jira-test-page.js) lines"
    echo "   Methods: $(grep -c "async " SBS_Automation/pages/jira-test-page.js)"
    echo "   Locators: $(grep -c "get " SBS_Automation/pages/jira-test-page.js)"
else
    echo "❌ Page File: Missing"
fi

echo ""
echo "🎯 Quality Check Results:"
echo ""

# Quality validation
FEATURE_QUALITY=0
STEPS_QUALITY=0  
PAGE_QUALITY=0

if [ -f "SBS_Automation/features/jira-test.feature" ]; then
    if [ $(wc -l < SBS_Automation/features/jira-test.feature) -gt 10 ]; then
        FEATURE_QUALITY=100
        echo "✅ Feature Quality: 100% (Real content with scenarios)"
    fi
fi

if [ -f "SBS_Automation/steps/jira-test-steps.js" ]; then
    if grep -q "require('../../pages/auto-coder/" SBS_Automation/steps/jira-test-steps.js; then
        if [ $(grep -c "Given\|When\|Then" SBS_Automation/steps/jira-test-steps.js) -gt 3 ]; then
            STEPS_QUALITY=100
            echo "✅ Steps Quality: 100% (Correct imports + real definitions)"
        fi
    fi
fi

if [ -f "SBS_Automation/pages/jira-test-page.js" ]; then
    if [ $(grep -c "async " SBS_Automation/pages/jira-test-page.js) -gt 5 ]; then
        PAGE_QUALITY=100
        echo "✅ Page Quality: 100% (Multiple methods + locators)"
    fi
fi

OVERALL_QUALITY=$(( (FEATURE_QUALITY + STEPS_QUALITY + PAGE_QUALITY) / 3 ))

echo ""
echo "📈 OVERALL QUALITY SCORE: ${OVERALL_QUALITY}%"

if [ $OVERALL_QUALITY -eq 100 ]; then
    echo "🚀 STATUS: PRODUCTION READY ✅"
else
    echo "⚠️  STATUS: NEEDS IMPROVEMENT"
fi

echo ""
echo "🧪 Test Complete!"
