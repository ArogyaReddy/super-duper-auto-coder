# Auto-Proceed Script Wrapper
# Eliminates ALL prompts and enables zero-interruption workflows
# Usage: .\scripts\auto-proceed-wrapper.ps1 -Command "npm run test:features"

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    [switch]$Background,
    [switch]$Silent
)

# Set auto-proceed environment
$env:AUTO_PROCEED = "true"
$env:CI = "true"
$env:NO_INTERACTION = "true"
$env:BATCH_MODE = "true"
$env:FORCE_COLOR = "0"

# PowerShell auto-proceed settings
$ConfirmPreference = "None"
$ProgressPreference = "SilentlyContinue"
$WarningPreference = "SilentlyContinue"
$VerbosePreference = "SilentlyContinue"

if ($Silent) {
    $InformationPreference = "SilentlyContinue"
}

Write-Host "🚀 AUTO-PROCEED MODE: Executing without prompts..." -ForegroundColor Green

# Create log file
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "logs/auto-proceed-$timestamp.log"

if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
}

# Function to execute with auto-proceed
function Invoke-AutoProceedCommand {
    param([string]$Cmd)
    
    try {
        # Log start
        "START: $timestamp - Command: $Cmd" | Out-File $logFile -Append
        
        if ($Background) {
            # Background execution
            $job = Start-Job -ScriptBlock {
                param($command, $env_vars)
                
                # Set environment in job
                foreach ($var in $env_vars.GetEnumerator()) {
                    Set-Item -Path "env:$($var.Key)" -Value $var.Value
                }
                
                # Execute command
                Invoke-Expression $command
            } -ArgumentList $Cmd, @{
                AUTO_PROCEED = "true"
                CI = "true"
                NO_INTERACTION = "true"
                BATCH_MODE = "true"
            }
            
            Write-Host "✅ Command started in background (Job ID: $($job.Id))" -ForegroundColor Green
            return $job
        } else {
            # Foreground execution with no prompts
            if ($Silent) {
                Invoke-Expression $Cmd 2>&1 | Out-File $logFile -Append
            } else {
                Invoke-Expression $Cmd 2>&1 | Tee-Object -FilePath $logFile -Append
            }
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Command completed successfully" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Command completed with exit code: $LASTEXITCODE" -ForegroundColor Yellow
            }
        }
        
        # Log completion
        "COMPLETE: $(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss') - Exit Code: $LASTEXITCODE" | Out-File $logFile -Append
        
    } catch {
        Write-Host "❌ Error executing command: $($_.Exception.Message)" -ForegroundColor Red
        "ERROR: $timestamp - $($_.Exception.Message)" | Out-File $logFile -Append
        throw
    }
}

# Override common prompt functions to auto-proceed
function Read-Host { 
    param([string]$Prompt)
    Write-Host "$Prompt [AUTO-PROCEED: Y]" -ForegroundColor Cyan
    return "Y"
}

function Confirm {
    param([string]$Title, [string]$Message)
    Write-Host "$Title - $Message [AUTO-PROCEED: Yes]" -ForegroundColor Cyan
    return $true
}

# Execute the command with auto-proceed
$result = Invoke-AutoProceedCommand -Cmd $Command

Write-Host ""
Write-Host "📊 AUTO-PROCEED SUMMARY:" -ForegroundColor Blue
Write-Host "  Command: $Command" -ForegroundColor Cyan
Write-Host "  Log File: $logFile" -ForegroundColor Cyan
Write-Host "  Mode: $(if ($Background) { 'Background' } else { 'Foreground' })" -ForegroundColor Cyan
Write-Host "  Silent: $(if ($Silent) { 'Yes' } else { 'No' })" -ForegroundColor Cyan

if ($Background -and $result) {
    Write-Host "  Job ID: $($result.Id)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 To check background job status:" -ForegroundColor Yellow
    Write-Host "   Get-Job $($result.Id)" -ForegroundColor Cyan
    Write-Host "   Receive-Job $($result.Id)" -ForegroundColor Cyan
}
