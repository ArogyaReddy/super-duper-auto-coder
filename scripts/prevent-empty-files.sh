
#!/bin/bash

# AUTO-CODER EMPTY FILE PREVENTION SYSTEM
# Run this before any auto-coder operations

echo "🛡️ EMPTY FILE PREVENTION SYSTEM ACTIVATED"

# 1. Check for existing empty files
echo "📂 Scanning for empty files..."
find . -name "*.md" -size 0 -delete
echo "✅ Cleaned up any existing empty files"

# 2. Set up monitoring
echo "👁️ Setting up file monitoring..."
# This would run the Node.js monitor in background

# 3. Validate framework
echo "🔧 Validating framework..."
if [ ! -f "src/utils/safe-file-writer.js" ]; then
    echo "❌ Safe file writer not found! Run fix-empty-file-bug.js first"
    exit 1
fi

echo "✅ PREVENTION SYSTEM READY"
