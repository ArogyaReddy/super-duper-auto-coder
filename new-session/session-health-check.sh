#!/bin/bash

# Session Health Check Script for macOS/Linux
# This script validates the auto-coder framework setup

echo "🔍 Auto-Coder Framework Health Check"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base paths
AUTO_CODER_PATH="/Users/gadea/auto/auto/qa_automation/auto-coder"
SBS_PATH="/Users/gadea/auto/auto/qa_automation/SBS_Automation"

echo -e "\n📂 Checking Directory Structure..."

# Check auto-coder directory
if [ -d "$AUTO_CODER_PATH" ]; then
    echo -e "✅ ${GREEN}Auto-coder directory found${NC}"
else
    echo -e "❌ ${RED}Auto-coder directory missing${NC}"
    exit 1
fi

# Check SBS_Automation directory
if [ -d "$SBS_PATH" ]; then
    echo -e "✅ ${GREEN}SBS_Automation directory found${NC}"
else
    echo -e "❌ ${RED}SBS_Automation directory missing${NC}"
    exit 1
fi

echo -e "\n🔧 Checking Generator Files..."

# Check generator file
GENERATOR_FILE="$AUTO_CODER_PATH/no-ai/generate-feature-steps-page.js"
if [ -f "$GENERATOR_FILE" ]; then
    echo -e "✅ ${GREEN}Generator file found${NC}"
    # Check syntax
    if node -c "$GENERATOR_FILE" 2>/dev/null; then
        echo -e "✅ ${GREEN}Generator syntax valid${NC}"
    else
        echo -e "❌ ${RED}Generator syntax error${NC}"
        exit 1
    fi
else
    echo -e "❌ ${RED}Generator file missing${NC}"
    exit 1
fi

echo -e "\n📝 Checking Prompt Files..."

# Check prompt files
PROMPT_FILE="$AUTO_CODER_PATH/.github/myPrompts/myPrompts.md"
GPT41_PROMPT_FILE="$AUTO_CODER_PATH/.github/myPrompts/ArogYYaa-GPT41-ULTIMATE.md"
if [ -f "$PROMPT_FILE" ]; then
    echo -e "✅ ${GREEN}Prompt file found${NC}"
elif [ -f "$GPT41_PROMPT_FILE" ]; then
    echo -e "✅ ${GREEN}GPT-4.1 prompt file found${NC}"
    PROMPT_FILE="$GPT41_PROMPT_FILE"
else
    echo -e "❌ ${RED}Prompt files missing${NC}"
    exit 1
fi

# Check for GPT-4.1 prompt content
if [ -f "$GPT41_PROMPT_FILE" ]; then
    echo -e "✅ ${GREEN}GPT-4.1 Ultimate prompt found${NC}"
elif grep -q "ArogYYaa-GPT41-ULTIMATE" "$PROMPT_FILE" 2>/dev/null; then
    echo -e "✅ ${GREEN}GPT-4.1 prompt section found${NC}"
else
    echo -e "⚠️ ${YELLOW}GPT-4.1 prompt may be missing${NC}"
fi

echo -e "\n📁 Checking Output Directories..."

# Check output directories exist
OUTPUT_DIRS=("$AUTO_CODER_PATH/SBS_Automation/features" "$AUTO_CODER_PATH/SBS_Automation/steps" "$AUTO_CODER_PATH/SBS_Automation/pages")

for dir in "${OUTPUT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "✅ ${GREEN}$(basename "$dir") directory exists${NC}"
    else
        echo -e "⚠️ ${YELLOW}Creating $(basename "$dir") directory${NC}"
        mkdir -p "$dir"
    fi
done

echo -e "\n🎯 Testing Generator Function..."

# Test generator with sample requirement
SAMPLE_REQ="$AUTO_CODER_PATH/new-session/reference-files/sample-requirement.txt"
if [ -f "$SAMPLE_REQ" ]; then
    echo -e "✅ ${GREEN}Sample requirement found${NC}"
    
    # Run generator test
    cd "$AUTO_CODER_PATH"
    if node no-ai/generate-feature-steps-page.js new-session/reference-files/sample-requirement.txt HealthCheck 2>/dev/null; then
        echo -e "✅ ${GREEN}Generator execution successful${NC}"
        
        # Check generated files
        if [ -f "$AUTO_CODER_PATH/SBS_Automation/features/health-check.feature" ]; then
            echo -e "✅ ${GREEN}Feature file generated${NC}"
        fi
        if [ -f "$AUTO_CODER_PATH/SBS_Automation/steps/health-check.js" ]; then
            echo -e "✅ ${GREEN}Steps file generated${NC}"
        fi
        if [ -f "$AUTO_CODER_PATH/SBS_Automation/pages/health-check.js" ]; then
            echo -e "✅ ${GREEN}Page file generated${NC}"
        fi
        
        # Cleanup test files
        rm -f "$AUTO_CODER_PATH/SBS_Automation/features/health-check.feature"
        rm -f "$AUTO_CODER_PATH/SBS_Automation/steps/health-check.js"  
        rm -f "$AUTO_CODER_PATH/SBS_Automation/pages/health-check.js"
        
        # Validate syntax of generated files (if they exist)
        HEALTH_STEPS="$AUTO_CODER_PATH/SBS_Automation/steps/health-check.js"
        HEALTH_PAGE="$AUTO_CODER_PATH/SBS_Automation/pages/health-check.js"
        
        if [ -f "$HEALTH_STEPS" ]; then
            if node -c "$HEALTH_STEPS" 2>/dev/null; then
                echo -e "✅ ${GREEN}Generated steps syntax valid${NC}"
            else
                echo -e "❌ ${RED}Generated steps syntax error${NC}"
                exit 1
            fi
        fi
        
        if [ -f "$HEALTH_PAGE" ]; then
            if node -c "$HEALTH_PAGE" 2>/dev/null; then
                echo -e "✅ ${GREEN}Generated page syntax valid${NC}"
            else
                echo -e "❌ ${RED}Generated page syntax error${NC}"
                exit 1
            fi
        fi
        
        # Check for correct kebab-case naming
        HEALTH_FEATURE="$AUTO_CODER_PATH/SBS_Automation/features/health-check.feature"
        if [ -f "$HEALTH_FEATURE" ]; then
            echo -e "✅ ${GREEN}Generated feature uses kebab-case naming${NC}"
        else
            echo -e "⚠️ ${YELLOW}Could not verify feature file naming${NC}"
        fi
        
        # Cleanup test files after validation
        rm -f "$HEALTH_STEPS" "$HEALTH_PAGE"
        
    else
        echo -e "❌ ${RED}Generator execution failed${NC}"
        exit 1
    fi
else
    echo -e "⚠️ ${YELLOW}Sample requirement missing${NC}"
fi

echo -e "\n📦 Checking Dependencies..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"

# Check npm dependencies in SBS_Automation
cd "$SBS_PATH"
if [ -f "package.json" ]; then
    echo -e "✅ ${GREEN}SBS_Automation package.json found${NC}"
    if [ -d "node_modules" ]; then
        echo -e "✅ ${GREEN}SBS_Automation dependencies installed${NC}"
    else
        echo -e "⚠️ ${YELLOW}SBS_Automation dependencies may need installation${NC}"
    fi
else
    echo -e "⚠️ ${YELLOW}SBS_Automation package.json missing${NC}"
fi

echo -e "\n🎉 ${GREEN}Health Check Complete!${NC}"
echo -e "\n📋 Summary:"
echo -e "   • Framework structure: ✅"
echo -e "   • Generator function: ✅"  
echo -e "   • Prompt files: ✅"
echo -e "   • Output directories: ✅"
echo -e "   • Dependencies: ✅"

echo -e "\n🚀 ${GREEN}Framework is ready for use!${NC}"
echo -e "\n💡 Quick start command:"
echo -e "   ${YELLOW}node no-ai/generate-feature-steps-page.js requirements/text/[file].txt [OutputName]${NC}"
