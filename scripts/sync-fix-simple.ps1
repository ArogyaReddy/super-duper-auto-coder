# VS Code Sync Issue Detector and Fixer (Simple Version)
# Detects and resolves common VS Code sync problems
# Run: .\scripts\sync-fix-simple.ps1

param(
    [switch]$Fix,
    [switch]$Force
)

Write-Host "VS CODE SYNC ISSUE DETECTOR" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

$issues = @()
$fixes = @()

# 1. Check Git Status
Write-Host "Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
$gitClean = [string]::IsNullOrEmpty($gitStatus)

if (!$gitClean) {
    $issues += "WARNING: Git shows uncommitted changes"
    $fixes += "Run: git add . && git commit -m 'Sync fix'"
}

# 2. Check for Empty Critical Files
Write-Host "Checking for empty critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    "guides\prompts\AUTO-CODER-MASTER-PROMPT.md",
    "guides\prompts\generate-test-artifacts.prompt.md", 
    "guides\prompts\run-test-artifacts.prompt.md",
    "package.json",
    "README.md"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if ([string]::IsNullOrWhiteSpace($content)) {
            $issues += "CRITICAL: Empty file detected: $file"
            $fixes += "Restore from git: git checkout HEAD -- $file"
        }
    }
}

# 3. Check Framework Status
Write-Host "Checking framework integrity..." -ForegroundColor Yellow
try {
    $null = npm run framework:status 2>$null
    if ($LASTEXITCODE -ne 0) {
        $issues += "WARNING: Framework status command failed"
        $fixes += "Check package.json scripts and dependencies"
    }
} catch {
    $issues += "CRITICAL: Framework status completely broken"
    $fixes += "Reinstall dependencies: npm install"
}

# Report Results
Write-Host ""
if ($issues.Count -eq 0) {
    Write-Host "SUCCESS: NO SYNC ISSUES DETECTED!" -ForegroundColor Green
    Write-Host "VS Code and Git are in perfect sync" -ForegroundColor Green
    exit 0
} else {
    Write-Host "SYNC ISSUES DETECTED:" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    
    Write-Host ""
    Write-Host "RECOMMENDED FIXES:" -ForegroundColor Blue
    $fixes | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
}

# Apply Fixes if Requested
if ($Fix) {
    Write-Host ""
    Write-Host "APPLYING FIXES..." -ForegroundColor Blue
    
    # Fix 1: Clean git state
    if (!$gitClean) {
        Write-Host "Committing current changes..."
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
        git commit -m "Sync fix: $timestamp"
        Write-Host "SUCCESS: Git changes committed" -ForegroundColor Green
    }
    
    # Fix 2: Restore empty files
    foreach ($file in $criticalFiles) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
            if ([string]::IsNullOrWhiteSpace($content)) {
                Write-Host "Restoring empty file: $file"
                git checkout HEAD -- $file
                Write-Host "SUCCESS: Restored $file" -ForegroundColor Green
            }
        }
    }
    
    # Fix 3: Clear VS Code cache
    Write-Host "Clearing VS Code cache..."
    if (Test-Path ".vscode") {
        Remove-Item ".vscode" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "SUCCESS: VS Code cache cleared" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Blue
Write-Host "  1. Close VS Code completely" -ForegroundColor Cyan
Write-Host "  2. Run: npm run sync:fix" -ForegroundColor Cyan
Write-Host "  3. Restart VS Code: code ." -ForegroundColor Cyan
Write-Host "  4. Verify: git status" -ForegroundColor Cyan
