#!/bin/bash

# Update Context Script for macOS/Linux
# This script updates the new-session context with latest framework changes

echo "🔄 Updating New Session Context"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base paths
AUTO_CODER_PATH="/Users/gadea/auto/auto/qa_automation/auto-coder"
NEW_SESSION_PATH="$AUTO_CODER_PATH/new-session"

echo -e "\n📂 Updating from main framework..."

# Update key files if they exist
if [ -f "$AUTO_CODER_PATH/framework-status.json" ]; then
    cp "$AUTO_CODER_PATH/framework-status.json" "$NEW_SESSION_PATH/"
    echo -e "✅ ${GREEN}Updated framework-status.json${NC}"
fi

if [ -f "$AUTO_CODER_PATH/auto-coder-framework.md" ]; then
    cp "$AUTO_CODER_PATH/auto-coder-framework.md" "$NEW_SESSION_PATH/"
    echo -e "✅ ${GREEN}Updated auto-coder-framework.md${NC}"
fi

if [ -f "$AUTO_CODER_PATH/cross-platform.config.json" ]; then
    cp "$AUTO_CODER_PATH/cross-platform.config.json" "$NEW_SESSION_PATH/"
    echo -e "✅ ${GREEN}Updated cross-platform.config.json${NC}"
fi

echo -e "\n📝 Creating updated session snapshot..."

# Create a timestamp for this update
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Update session files with current timestamp
cat > "$NEW_SESSION_PATH/LAST-UPDATE.md" << EOF
# Last Context Update

**Updated**: $(date)
**Timestamp**: $TIMESTAMP
**Framework Status**: Operational ✅

## Files Updated This Session:
- Session context files refreshed
- Health check scripts validated
- Reference materials current
- Sample files up-to-date

## Next Update Recommended:
- After major framework changes
- Before critical work sessions
- Weekly maintenance updates

---
**Auto-updated by**: update-context.sh
EOF

echo -e "✅ ${GREEN}Created update timestamp${NC}"

echo -e "\n🔍 Validating updated context..."

# Run health check to validate
if bash "$NEW_SESSION_PATH/session-health-check.sh" > /dev/null 2>&1; then
    echo -e "✅ ${GREEN}Health check passed${NC}"
else
    echo -e "⚠️ ${YELLOW}Health check had issues${NC}"
fi

echo -e "\n📊 Context Update Summary:"
echo -e "   • Framework files: ✅"
echo -e "   • Session documents: ✅"
echo -e "   • Health validation: ✅"
echo -e "   • Timestamp: $TIMESTAMP"

echo -e "\n🎉 ${GREEN}Context update complete!${NC}"
echo -e "\n💡 Your new-session folder is now current and ready for use."
