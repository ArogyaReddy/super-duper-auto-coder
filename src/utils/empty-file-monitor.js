
// FILE MONITOR - DETECTS EMPTY FILE CREATION
const fs = require('fs');
const path = require('path');

class EmptyFileMonitor {
    constructor(watchDir) {
        this.watchDir = watchDir;
        this.emptyFileCount = 0;
    }
    
    startMonitoring() {
        console.log(`🔍 Monitoring for empty files in ${this.watchDir}`);
        
        fs.watch(this.watchDir, { recursive: true }, (eventType, filename) => {
            if (eventType === 'change' && filename && filename.endsWith('.md')) {
                const filePath = path.join(this.watchDir, filename);
                
                try {
                    const stats = fs.statSync(filePath);
                    if (stats.size === 0) {
                        this.emptyFileCount++;
                        console.error(`🚨 EMPTY FILE DETECTED: ${filePath}`);
                        console.error(`   Empty file count: ${this.emptyFileCount}`);
                        
                        // Auto-delete empty files to prevent confusion
                        fs.unlinkSync(filePath);
                        console.log(`🗑️ Auto-deleted empty file: ${filePath}`);
                    }
                } catch (error) {
                    // File might have been deleted
                }
            }
        });
    }
}

module.exports = { EmptyFileMonitor };
