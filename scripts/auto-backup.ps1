# Auto-Backup Script for Auto-Coder Framework
# Prevents data loss from VS Code sync issues
# Run: .\scripts\auto-backup.ps1

param(
    [switch]$Force,
    [string]$Message = ""
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = "backups"

# Create backup directory if it doesn't exist
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

Write-Host "🚀 AUTO-BACKUP STARTING: $timestamp" -ForegroundColor Green

# 1. Check Git Status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null

if ($gitStatus -or $Force) {
    # 2. Add all changes
    Write-Host "📝 Adding changes to git..." -ForegroundColor Yellow
    git add . 2>$null
    
    # 3. Create commit message
    if ($Message) {
        $commitMessage = "Manual backup: $Message ($timestamp)"
    } else {
        $commitMessage = "Auto-backup: $timestamp"
    }
    
    # 4. Commit changes
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    $commitResult = git commit -m $commitMessage 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ BACKUP SUCCESSFUL: $commitMessage" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Commit failed, but files are staged" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️ No changes to backup" -ForegroundColor Cyan
}

# 5. Save framework status
Write-Host "📋 Saving framework status..." -ForegroundColor Yellow
try {
    npm run framework:status > "$backupDir\status-$timestamp.txt" 2>$null
    Write-Host "✅ Framework status saved" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not save framework status" -ForegroundColor Yellow
}

# 6. Create file manifest
Write-Host "📁 Creating file manifest..." -ForegroundColor Yellow
$files = @()
$files += "=== AUTO-CODER FRAMEWORK BACKUP ==="
$files += "Timestamp: $timestamp"
$files += "Git Status: $(git status --short 2>$null | Measure-Object | Select-Object -ExpandProperty Count) files tracked"
$files += "Latest Commit: $(git log --oneline -1 2>$null)"
$files += ""
$files += "=== KEY DIRECTORIES ==="
$files += "guides/: $(Get-ChildItem guides -Recurse -File | Measure-Object | Select-Object -ExpandProperty Count) files"
$files += "SBS_Automation/: $(Get-ChildItem SBS_Automation -Recurse -File -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count) files"
$files += "requirements/: $(Get-ChildItem requirements -Recurse -File -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count) files"
$files += "src/: $(Get-ChildItem src -Recurse -File -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count) files"
$files += ""
$files += "=== RECENT COMMITS ==="
$files += git log --oneline -5 2>$null

$files | Out-File "$backupDir\manifest-$timestamp.txt" -Encoding UTF8

# 7. Cleanup old backups (keep last 20)
Write-Host "🧹 Cleaning old backups..." -ForegroundColor Yellow
$oldBackups = Get-ChildItem $backupDir -Filter "status-*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 20
$oldManifests = Get-ChildItem $backupDir -Filter "manifest-*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 20

$oldBackups + $oldManifests | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "🎉 AUTO-BACKUP COMPLETE: $timestamp" -ForegroundColor Green
Write-Host "📁 Backup files saved to: $backupDir\" -ForegroundColor Cyan

# 8. Show current status
Write-Host ""
Write-Host "📊 CURRENT STATUS:" -ForegroundColor Blue
git status --short 2>$null | ForEach-Object { Write-Host "   $_" }

if (!(git status --porcelain 2>$null)) {
    Write-Host "   ✅ Working directory clean" -ForegroundColor Green
}
