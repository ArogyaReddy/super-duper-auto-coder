# Auto-Coder PowerShell Script
# Version: 1.0.0
# Description: Generate and run test artifacts from various input sources (Windows Version)

param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$InputFile,
    
    [Parameter(ValueFromRemainingArguments)]
    [string[]]$AdditionalArgs
)

# Default values
$FRAMEWORK_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# Function to display usage
function Show-Usage {
    Write-Host "Auto-Coder - Usage" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage: .\auto-coder.ps1 <command> [input_file]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  generate <input_file>  - Generate test artifacts from input file"
    Write-Host "  run <test_file>       - Run generated test artifacts"
    Write-Host "  test <test_file>      - Run generated test artifacts (alias for run)"
    Write-Host "  interactive           - Launch interactive CLI"
    Write-Host "  help                  - Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\auto-coder.ps1 generate input\text\requirement.txt"
    Write-Host "  .\auto-coder.ps1 run generated\tests\requirement-test.js"
    Write-Host "  .\auto-coder.ps1 interactive"
    Write-Host ""
}

# Function to generate test artifacts
function Generate-Artifacts {
    param([string]$InputFilePath)
    
    if (-not (Test-Path $InputFilePath)) {
        Write-Host "Error: Input file '$InputFilePath' not found" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Generating test artifacts from: $InputFilePath" -ForegroundColor Blue
    
    # Ensure generated directories exist
    $GeneratedDirs = @(
        "generated",
        "generated\features",
        "generated\steps", 
        "generated\pages",
        "generated\tests",
        "generated\reports",
        "generated\summary"
    )
    
    foreach ($dir in $GeneratedDirs) {
        $fullPath = Join-Path $FRAMEWORK_ROOT $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Host "Created directory: $dir" -ForegroundColor Green
        }
    }
    
    # Run the Node.js auto-coder
    $autoCoder = Join-Path $FRAMEWORK_ROOT "bin\auto-coder.js"
    if (Test-Path $autoCoder) {
        Write-Host "Executing: node $autoCoder generate $InputFilePath" -ForegroundColor Yellow
        & node $autoCoder generate $InputFilePath
    } else {
        Write-Host "Error: auto-coder.js not found at $autoCoder" -ForegroundColor Red
        exit 1
    }
}

# Function to run test artifacts
function Run-TestArtifacts {
    param([string]$TestFile)
    
    if (-not (Test-Path $TestFile)) {
        Write-Host "Error: Test file '$TestFile' not found" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Running test artifacts: $TestFile" -ForegroundColor Blue
    
    $extension = [System.IO.Path]::GetExtension($TestFile).ToLower()
    
    switch ($extension) {
        ".feature" {
            Write-Host "Running Cucumber test..." -ForegroundColor Yellow
            & npx cucumber-js $TestFile --require "support\steps" --require "support\hooks.js" --format progress
        }
        ".js" {
            if ($TestFile -match "test|spec") {
                Write-Host "Running Playwright test..." -ForegroundColor Yellow
                & npx playwright test $TestFile
            } else {
                Write-Host "Running Node.js script..." -ForegroundColor Yellow
                & node $TestFile
            }
        }
        default {
            Write-Host "Unknown test file type: $extension" -ForegroundColor Red
            exit 1
        }
    }
}

# Function to launch interactive CLI
function Start-InteractiveCLI {
    Write-Host "Launching Auto-Coder Interactive CLI..." -ForegroundColor Blue
    $autoCoder = Join-Path $FRAMEWORK_ROOT "bin\auto-coder.js"
    & node $autoCoder
}

# Function to open reports
function Open-Reports {
    $reportDir = Join-Path $FRAMEWORK_ROOT "generated\reports"
    
    if (Test-Path $reportDir) {
        # Try to open Playwright report first
        $playwrightReport = Join-Path $reportDir "playwright-report\index.html"
        if (Test-Path $playwrightReport) {
            Start-Process $playwrightReport
        }
        
        # Try to open custom detailed report
        $detailedReport = Join-Path $reportDir "custom\detailed-test-report.html"
        if (Test-Path $detailedReport) {
            Start-Process $detailedReport
        }
    } else {
        Write-Host "No reports found in $reportDir" -ForegroundColor Yellow
    }
}

# Function to clean generated files
function Clear-Generated {
    $generatedDir = Join-Path $FRAMEWORK_ROOT "generated"
    $testResultsDir = Join-Path $FRAMEWORK_ROOT "test-results"
    
    if (Test-Path $generatedDir) {
        Remove-Item -Path "$generatedDir\*" -Recurse -Force
        Write-Host "Cleaned generated directory" -ForegroundColor Green
    }
    
    if (Test-Path $testResultsDir) {
        Remove-Item -Path "$testResultsDir\*" -Recurse -Force
        Write-Host "Cleaned test-results directory" -ForegroundColor Green
    }
}

# Main execution logic
switch ($Command.ToLower()) {
    "generate" {
        if (-not $InputFile) {
            Write-Host "Error: Input file required for generate command" -ForegroundColor Red
            Show-Usage
            exit 1
        }
        Generate-Artifacts -InputFilePath $InputFile
    }
    
    "run" -or "test" {
        if (-not $InputFile) {
            Write-Host "Error: Test file required for run/test command" -ForegroundColor Red
            Show-Usage
            exit 1
        }
        Run-TestArtifacts -TestFile $InputFile
    }
    
    "interactive" -or "cli" {
        Start-InteractiveCLI
    }
    
    "reports" -or "open" {
        Open-Reports
    }
    
    "clean" {
        Clear-Generated
    }
    
    "help" -or "" {
        Show-Usage
    }
    
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Usage
        exit 1
    }
}

Write-Host "Auto-Coder execution completed." -ForegroundColor Green
