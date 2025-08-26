# Auto-Coder Platform Switcher (PowerShell)
# Simple one-command platform switching

# Set this environment variable to override automatic detection
# Values: 'darwin' (Mac), 'win32' (Windows), 'linux' (Linux)
# Leave empty or unset for automatic detection

# Windows
$env:AUTO_CODER_PLATFORM = "win32"

# Mac  
# $env:AUTO_CODER_PLATFORM = "darwin"

# Linux
# $env:AUTO_CODER_PLATFORM = "linux"

# Auto-detect (default)
# Remove-Item Env:AUTO_CODER_PLATFORM -ErrorAction SilentlyContinue

Write-Host "Platform override set to: $env:AUTO_CODER_PLATFORM"
Write-Host "Run 'node bin/cross-platform-runner.js platform-info' to verify"
