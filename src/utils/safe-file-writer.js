
const fs = require('fs');
const path = require('path');

// SAFE FILE WRITER - PREVENTS EMPTY FILE BUG
function safeWriteFile(filePath, content, options = {}) {
    // CRITICAL: Validate content before writing
    if (!content || content.trim() === '') {
        const error = new Error(`EMPTY FILE BUG PREVENTED: Attempted to write empty content to ${filePath}`);
        console.error('🚫 EMPTY FILE BUG PREVENTED:', error.message);
        
        if (options.allowEmpty !== true) {
            throw error;
        }
    }
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write with validation
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Successfully wrote ${content.length} characters to ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to write to ${filePath}:`, error.message);
        return false;
    }
}

module.exports = { safeWriteFile };
