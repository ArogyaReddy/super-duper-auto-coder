# Auto-Coder Platform Switcher
# Simple one-command platform switching

# Set this environment variable to override automatic detection
# Values: 'darwin' (Mac), 'win32' (Windows), 'linux' (Linux)
# Leave empty or unset for automatic detection

# Windows
export AUTO_CODER_PLATFORM=win32

# Mac  
# export AUTO_CODER_PLATFORM=darwin

# Linux
# export AUTO_CODER_PLATFORM=linux

# Auto-detect (default)
# export AUTO_CODER_PLATFORM=

echo "Platform override set to: $AUTO_CODER_PLATFORM"
echo "Run 'node bin/cross-platform-runner.js platform-info' to verify"
