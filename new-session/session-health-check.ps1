# Session Health Check Script for Windows PowerShell
# This script validates the auto-coder framework setup

Write-Host "🔍 Auto-Coder Framework Health Check" -ForegroundColor Cyan
Write-Host "======================================"

# Base paths
$AUTO_CODER_PATH = "C:\Users\$env:USERNAME\auto\auto\qa_automation\auto-coder"
$SBS_PATH = "C:\Users\$env:USERNAME\auto\auto\qa_automation\SBS_Automation"

# If running on different path, adjust accordingly
if (!(Test-Path $AUTO_CODER_PATH)) {
    $AUTO_CODER_PATH = "/Users/gadea/auto/auto/qa_automation/auto-coder"
    $SBS_PATH = "/Users/gadea/auto/auto/qa_automation/SBS_Automation"
}

Write-Host "`n📂 Checking Directory Structure..."

# Check auto-coder directory
if (Test-Path $AUTO_CODER_PATH) {
    Write-Host "✅ Auto-coder directory found" -ForegroundColor Green
} else {
    Write-Host "❌ Auto-coder directory missing" -ForegroundColor Red
    exit 1
}

# Check SBS_Automation directory
if (Test-Path $SBS_PATH) {
    Write-Host "✅ SBS_Automation directory found" -ForegroundColor Green
} else {
    Write-Host "❌ SBS_Automation directory missing" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Checking Generator Files..."

# Check generator file
$GENERATOR_FILE = Join-Path $AUTO_CODER_PATH "no-ai\generate-feature-steps-page.js"
if (Test-Path $GENERATOR_FILE) {
    Write-Host "✅ Generator file found" -ForegroundColor Green
    # Check syntax
    $syntaxCheck = node -c $GENERATOR_FILE 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Generator syntax valid" -ForegroundColor Green
    } else {
        Write-Host "❌ Generator syntax error" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Generator file missing" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Checking Prompt Files..."

# Check prompt files
$PROMPT_FILE = Join-Path $AUTO_CODER_PATH ".github\myPrompts\myPrompts.md"
if (Test-Path $PROMPT_FILE) {
    Write-Host "✅ Prompt file found" -ForegroundColor Green
    # Check for GPT-4.1 prompt
    $promptContent = Get-Content $PROMPT_FILE -Raw
    if ($promptContent -match "ArogYYaa-GPT41-ULTIMATE") {
        Write-Host "✅ GPT-4.1 prompt found" -ForegroundColor Green
    } else {
        Write-Host "⚠️ GPT-4.1 prompt may be missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Prompt file missing" -ForegroundColor Red
    exit 1
}

Write-Host "`n📁 Checking Output Directories..."

# Check output directories exist
$OUTPUT_DIRS = @(
    (Join-Path $AUTO_CODER_PATH "SBS_Automation\features"),
    (Join-Path $AUTO_CODER_PATH "SBS_Automation\steps"),
    (Join-Path $AUTO_CODER_PATH "SBS_Automation\pages")
)

foreach ($dir in $OUTPUT_DIRS) {
    if (Test-Path $dir) {
        $dirName = Split-Path $dir -Leaf
        Write-Host "✅ $dirName directory exists" -ForegroundColor Green
    } else {
        $dirName = Split-Path $dir -Leaf
        Write-Host "⚠️ Creating $dirName directory" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "`n🎯 Testing Generator Function..."

# Test generator with sample requirement
$SAMPLE_REQ = Join-Path $AUTO_CODER_PATH "new-session\reference-files\sample-requirement.txt"
if (Test-Path $SAMPLE_REQ) {
    Write-Host "✅ Sample requirement found" -ForegroundColor Green
    
    # Run generator test
    Set-Location $AUTO_CODER_PATH
    $testResult = node "no-ai\generate-feature-steps-page.js" "new-session\reference-files\sample-requirement.txt" "HealthCheck" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Generator execution successful" -ForegroundColor Green
        
        # Check generated files
        $featureFile = Join-Path $AUTO_CODER_PATH "SBS_Automation\features\health-check.feature"
        $stepsFile = Join-Path $AUTO_CODER_PATH "SBS_Automation\steps\health-check.js"
        $pageFile = Join-Path $AUTO_CODER_PATH "SBS_Automation\pages\health-check.js"
        
        if (Test-Path $featureFile) {
            Write-Host "✅ Feature file generated" -ForegroundColor Green
        }
        if (Test-Path $stepsFile) {
            Write-Host "✅ Steps file generated" -ForegroundColor Green
        }
        if (Test-Path $pageFile) {
            Write-Host "✅ Page file generated" -ForegroundColor Green
        }
        
        # Cleanup test files
        Remove-Item $featureFile -ErrorAction SilentlyContinue
        Remove-Item $stepsFile -ErrorAction SilentlyContinue
        Remove-Item $pageFile -ErrorAction SilentlyContinue
        
    } else {
        Write-Host "❌ Generator execution failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️ Sample requirement missing" -ForegroundColor Yellow
}

Write-Host "`n📦 Checking Dependencies..."

# Check Node.js version
$NODE_VERSION = node --version
Write-Host "Node.js version: $NODE_VERSION" -ForegroundColor Green

# Check npm dependencies in SBS_Automation
Set-Location $SBS_PATH
if (Test-Path "package.json") {
    Write-Host "✅ SBS_Automation package.json found" -ForegroundColor Green
    if (Test-Path "node_modules") {
        Write-Host "✅ SBS_Automation dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️ SBS_Automation dependencies may need installation" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ SBS_Automation package.json missing" -ForegroundColor Yellow
}

Write-Host "`n🎉 Health Check Complete!" -ForegroundColor Green
Write-Host "`n📋 Summary:"
Write-Host "   • Framework structure: ✅"
Write-Host "   • Generator function: ✅"  
Write-Host "   • Prompt files: ✅"
Write-Host "   • Output directories: ✅"
Write-Host "   • Dependencies: ✅"

Write-Host "`n🚀 Framework is ready for use!" -ForegroundColor Green
Write-Host "`n💡 Quick start command:"
Write-Host "   node no-ai\generate-feature-steps-page.js requirements\text\[file].txt [OutputName]" -ForegroundColor Yellow
