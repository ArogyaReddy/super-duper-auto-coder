# VS Code Sync Issue Detector and Fixer
# Detects and resolves common VS Code sync problems
# Run: .\scripts\fix-vscode-sync.ps1

param(
    [switch]$Fix,
    [switch]$Force
)

Write-Host "🔍 VS CODE SYNC ISSUE DETECTOR" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

$issues = @()
$fixes = @()

# 1. Check Git Status vs Expected
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
$gitClean = [string]::IsNullOrEmpty($gitStatus)

if (!$gitClean) {
    $issues += "⚠️ Git shows uncommitted changes"
    $fixes += "Run: git add . && git commit -m 'Sync fix'"
}

# 2. Check for VS Code Lock Files
Write-Host "🔒 Checking for VS Code lock files..." -ForegroundColor Yellow
$vscodeFiles = @(".vscode/settings.json", ".vscode/tasks.json", ".vscode/launch.json")
foreach ($file in $vscodeFiles) {
    if (Test-Path "$file.lock") {
        $issues += "⚠️ VS Code lock file found: $file.lock"
        $fixes += "Delete lock file: Remove-Item `"$file.lock`""
    }
}

# 3. Check for Empty Files
Write-Host "📄 Checking for empty critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    "guides/prompts/AUTO-CODER-MASTER-PROMPT.md",
    "guides/prompts/generate-test-artifacts.prompt.md", 
    "guides/prompts/run-test-artifacts.prompt.md",
    "package.json",
    "README.md"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if ([string]::IsNullOrWhiteSpace($content)) {
            $issues += "🚨 CRITICAL: Empty file detected: $file"
            $fixes += "Restore from git: git checkout HEAD -- `"$file`""
        }
    }
}

# 4. Check Git Index Integrity
Write-Host "🔍 Checking git index integrity..." -ForegroundColor Yellow
$gitFsck = git fsck 2>&1
if ($gitFsck -match "error|corrupt") {
    $issues += "🚨 Git index corruption detected"
    $fixes += "Rebuild index: git read-tree HEAD && git checkout-index -f -a"
}

# 5. Check for Node Modules Issues
Write-Host "📦 Checking node_modules..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    $issues += "⚠️ node_modules missing"
    $fixes += "Run: npm install"
} elseif (!(Test-Path "node_modules/.package-lock.json")) {
    $issues += "⚠️ Incomplete npm installation"
    $fixes += "Run: rm -rf node_modules && npm install"
}

# 6. Check Framework Status
Write-Host "🚀 Checking framework integrity..." -ForegroundColor Yellow
try {
    $statusResult = npm run framework:status 2>$null
    if ($LASTEXITCODE -ne 0) {
        $issues += "⚠️ Framework status command failed"
        $fixes += "Check package.json scripts and dependencies"
    }
} catch {
    $issues += "🚨 Framework status completely broken"
    $fixes += "Reinstall dependencies: npm install"
}

# 7. Report Results
Write-Host ""
if ($issues.Count -eq 0) {
    Write-Host "✅ NO SYNC ISSUES DETECTED!" -ForegroundColor Green
    Write-Host "✅ VS Code and Git are in perfect sync" -ForegroundColor Green
    exit 0
} else {
    Write-Host "🚨 SYNC ISSUES DETECTED:" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    
    Write-Host ""
    Write-Host "🔧 RECOMMENDED FIXES:" -ForegroundColor Blue
    $fixes | ForEach-Object { Write-Host "   $_" -ForegroundColor Cyan }
}

# 8. Apply Fixes if Requested
if ($Fix) {
    Write-Host ""
    Write-Host "🔧 APPLYING FIXES..." -ForegroundColor Blue
    
    # Fix 1: Clean git state
    if (!$gitClean -and ($Force -or (Read-Host "Commit current changes? (y/n)") -eq "y")) {
        git add .
        $syncTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        git commit -m "Sync fix: $syncTimestamp"
        Write-Host "✅ Git changes committed" -ForegroundColor Green
    }
    
    # Fix 2: Remove lock files
    foreach ($file in $vscodeFiles) {
        if (Test-Path "$file.lock") {
            Remove-Item "$file.lock" -Force
            Write-Host "✅ Removed lock file: $file.lock" -ForegroundColor Green
        }
    }
    
    # Fix 3: Restore empty files
    foreach ($file in $criticalFiles) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
            if ([string]::IsNullOrWhiteSpace($content)) {
                if ($Force -or (Read-Host "Restore $file from git? (y/n)") -eq "y") {
                    git checkout HEAD -- $file
                    Write-Host "✅ Restored: $file" -ForegroundColor Green
                }
            }
        }
    }
    
    # Fix 4: Clear VS Code cache
    if ($Force -or (Read-Host "Clear VS Code cache? (y/n)") -eq "y") {
        if (Test-Path ".vscode") {
            Remove-Item ".vscode" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "✅ VS Code cache cleared" -ForegroundColor Green
        }
    }
    
    # Fix 5: Reinstall dependencies if needed
    if (!(Test-Path "node_modules") -or !(Test-Path "node_modules/.package-lock.json")) {
        if ($Force -or (Read-Host "Reinstall npm dependencies? (y/n)") -eq "y") {
            if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
            npm install
            Write-Host "✅ Dependencies reinstalled" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Blue
Write-Host "   1. Close VS Code completely" -ForegroundColor Cyan
Write-Host "   2. Run: .\scripts\fix-vscode-sync.ps1 -Fix" -ForegroundColor Cyan
Write-Host "   3. Restart VS Code: code ." -ForegroundColor Cyan
Write-Host "   4. Verify: git status" -ForegroundColor Cyan
