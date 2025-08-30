#!/usr/bin/env node

/**
 * 🎯 UNIVERSAL SCREENSHOT MANAGER
 * 
 * Generic screenshot manager that works with any web application testing.
 * Manages screenshots with timestamped naming and organized storage.
 * No application-specific references - fully reusable framework component.
 */

const fs = require('fs-extra');
const path = require('path');

class UniversalScreenshotManager {
    constructor(options = {}) {
        this.options = {
            baseDir: options.baseDir || path.join(__dirname, 'screenshots'),
            timestampFormat: options.timestampFormat || 'YYMMDDHHMMSSAM',
            organizationStrategy: options.organizationStrategy || 'by-session',
            maxScreenshotsPerSession: options.maxScreenshotsPerSession || 100,
            imageFormat: options.imageFormat || 'png',
            quality: options.quality || 90,
            fullPage: options.fullPage !== false,
            ...options
        };
        
        this.sessionTimestamp = this.generateTimestamp();
        this.sessionDir = this.createSessionDirectory();
        this.screenshotCounter = 0;
        this.screenshotHistory = [];
        
        console.log(`📸 UNIVERSAL SCREENSHOT MANAGER INITIALIZED`);
        console.log(`🕒 Session: ${this.sessionTimestamp}`);
        console.log(`📁 Directory: ${this.sessionDir}`);
    }

    generateTimestamp() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = String(hours % 12 || 12).padStart(2, '0');
        
        return `${year}${month}${day}${displayHours}${minutes}${seconds}${ampm}`;
    }

    createSessionDirectory() {
        let sessionDir;
        
        switch (this.options.organizationStrategy) {
            case 'by-session':
                sessionDir = path.join(this.options.baseDir, `session_${this.sessionTimestamp}`);
                break;
            case 'by-date':
                const date = new Date().toISOString().slice(0, 10);
                sessionDir = path.join(this.options.baseDir, date, this.sessionTimestamp);
                break;
            case 'flat':
                sessionDir = this.options.baseDir;
                break;
            default:
                sessionDir = path.join(this.options.baseDir, `session_${this.sessionTimestamp}`);
        }
        
        fs.ensureDirSync(sessionDir);
        return sessionDir;
    }

    /**
     * Take a screenshot with automatic naming and organization
     * @param {Object} page - Playwright page object
     * @param {string} name - Screenshot name/description
     * @param {Object} options - Screenshot options
     */
    async takeScreenshot(page, name = 'screenshot', options = {}) {
        try {
            this.screenshotCounter++;
            
            if (this.screenshotCounter > this.options.maxScreenshotsPerSession) {
                console.log(`⚠️  Maximum screenshots per session reached (${this.options.maxScreenshotsPerSession})`);
                return null;
            }
            
            const screenshotOptions = {
                fullPage: options.fullPage !== undefined ? options.fullPage : this.options.fullPage,
                quality: options.quality || this.options.quality,
                ...options
            };
            
            const fileName = this.generateScreenshotFilename(name);
            const filePath = path.join(this.sessionDir, fileName);
            
            // Take screenshot
            await page.screenshot({
                path: filePath,
                ...screenshotOptions
            });
            
            // Record screenshot info
            const screenshotInfo = {
                id: this.screenshotCounter,
                name,
                fileName,
                filePath,
                timestamp: new Date().toISOString(),
                url: page.url(),
                title: await page.title().catch(() => 'Unknown'),
                size: (await fs.stat(filePath)).size,
                options: screenshotOptions
            };
            
            this.screenshotHistory.push(screenshotInfo);
            
            console.log(`📸 Screenshot ${this.screenshotCounter}: ${fileName}`);
            
            return screenshotInfo;
            
        } catch (error) {
            console.error(`❌ Screenshot failed for "${name}":`, error.message);
            return null;
        }
    }

    /**
     * Generate standardized screenshot filename
     */
    generateScreenshotFilename(name) {
        const sanitizedName = name
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        const counterStr = String(this.screenshotCounter).padStart(3, '0');
        const timestamp = this.generateTimestamp();
        
        return `${counterStr}_${sanitizedName}_${timestamp}.${this.options.imageFormat}`;
    }

    /**
     * Take screenshot for test step
     */
    async captureTestStep(page, stepName, stepIndex = null) {
        const name = stepIndex !== null ? 
            `step_${String(stepIndex).padStart(2, '0')}_${stepName}` : 
            `step_${stepName}`;
        
        return await this.takeScreenshot(page, name);
    }

    /**
     * Take screenshot for error/failure
     */
    async captureError(page, errorName, errorDetails = null) {
        const name = `error_${errorName}`;
        const screenshot = await this.takeScreenshot(page, name);
        
        if (screenshot && errorDetails) {
            // Save error details alongside screenshot
            const errorFile = screenshot.filePath.replace(`.${this.options.imageFormat}`, '_error.json');
            await fs.writeJSON(errorFile, {
                timestamp: new Date().toISOString(),
                error: errorDetails,
                screenshot: screenshot.fileName,
                url: page.url(),
                title: await page.title().catch(() => 'Unknown')
            }, { spaces: 2 });
        }
        
        return screenshot;
    }

    /**
     * Take screenshot before critical action
     */
    async captureBeforeAction(page, actionName) {
        return await this.takeScreenshot(page, `before_${actionName}`);
    }

    /**
     * Take screenshot after critical action
     */
    async captureAfterAction(page, actionName) {
        return await this.takeScreenshot(page, `after_${actionName}`);
    }

    /**
     * Take comparison screenshots (before/after)
     */
    async captureComparison(page, actionName, actionCallback) {
        const before = await this.captureBeforeAction(page, actionName);
        
        try {
            const result = await actionCallback();
            const after = await this.captureAfterAction(page, actionName);
            
            return {
                success: true,
                result,
                screenshots: { before, after }
            };
        } catch (error) {
            const errorShot = await this.captureError(page, actionName, error.message);
            
            return {
                success: false,
                error: error.message,
                screenshots: { before, error: errorShot }
            };
        }
    }

    /**
     * Take screenshot of specific element
     */
    async captureElement(page, selector, name) {
        try {
            const element = await page.$(selector);
            if (!element) {
                console.log(`⚠️  Element not found for screenshot: ${selector}`);
                return null;
            }
            
            const fileName = this.generateScreenshotFilename(`element_${name}`);
            const filePath = path.join(this.sessionDir, fileName);
            
            await element.screenshot({ path: filePath });
            
            const screenshotInfo = {
                id: this.screenshotCounter++,
                name: `element_${name}`,
                fileName,
                filePath,
                timestamp: new Date().toISOString(),
                selector,
                type: 'element',
                size: (await fs.stat(filePath)).size
            };
            
            this.screenshotHistory.push(screenshotInfo);
            console.log(`📸 Element screenshot: ${fileName}`);
            
            return screenshotInfo;
            
        } catch (error) {
            console.error(`❌ Element screenshot failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Create screenshot gallery/report
     */
    async generateScreenshotReport() {
        const reportData = {
            session: {
                timestamp: this.sessionTimestamp,
                directory: this.sessionDir,
                totalScreenshots: this.screenshotHistory.length,
                duration: this.getSessionDuration()
            },
            screenshots: this.screenshotHistory,
            summary: this.generateScreenshotSummary()
        };
        
        // Generate HTML report
        const htmlReport = this.generateHTMLReport(reportData);
        const reportFile = path.join(this.sessionDir, `Screenshot_Report_${this.sessionTimestamp}.html`);
        await fs.writeFile(reportFile, htmlReport);
        
        // Generate JSON report
        const jsonFile = path.join(this.sessionDir, `Screenshot_Catalog_${this.sessionTimestamp}.json`);
        await fs.writeJSON(jsonFile, reportData, { spaces: 2 });
        
        console.log(`📊 Screenshot report generated: Screenshot_Report_${this.sessionTimestamp}.html`);
        
        return {
            htmlReport: reportFile,
            jsonReport: jsonFile,
            data: reportData
        };
    }

    generateScreenshotSummary() {
        const screenshots = this.screenshotHistory;
        const totalSize = screenshots.reduce((sum, s) => sum + (s.size || 0), 0);
        
        const typeCount = screenshots.reduce((counts, s) => {
            const type = s.name.split('_')[0];
            counts[type] = (counts[type] || 0) + 1;
            return counts;
        }, {});
        
        return {
            totalCount: screenshots.length,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            typeBreakdown: typeCount,
            averageSizeKB: screenshots.length > 0 ? 
                ((totalSize / screenshots.length) / 1024).toFixed(2) : 0
        };
    }

    getSessionDuration() {
        if (this.screenshotHistory.length === 0) return 0;
        
        const firstTime = new Date(this.screenshotHistory[0].timestamp);
        const lastTime = new Date(this.screenshotHistory[this.screenshotHistory.length - 1].timestamp);
        
        return Math.round((lastTime - firstTime) / 1000); // seconds
    }

    generateHTMLReport(data) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Screenshot Report - ${data.session.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007acc; padding-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-number { font-size: 1.5em; font-weight: bold; color: #007acc; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .screenshot-item { border: 1px solid #ddd; border-radius: 5px; padding: 15px; background: white; }
        .screenshot-item img { width: 100%; border-radius: 3px; }
        .screenshot-info { margin-top: 10px; font-size: 0.9em; color: #666; }
        .timestamp { color: #999; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📸 Screenshot Report</h1>
            <p class="timestamp">Session: ${data.session.timestamp}</p>
            <p>Universal QA Automation Framework - Generic Screenshot Management</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.session.totalScreenshots}</div>
                <div>Total Screenshots</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.summary.totalSizeMB}MB</div>
                <div>Total Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.session.duration}s</div>
                <div>Session Duration</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.summary.averageSizeKB}KB</div>
                <div>Average Size</div>
            </div>
        </div>

        <div class="screenshot-grid">
            ${data.screenshots.map(screenshot => `
                <div class="screenshot-item">
                    <img src="${screenshot.fileName}" alt="${screenshot.name}" loading="lazy">
                    <div class="screenshot-info">
                        <strong>${screenshot.name}</strong><br>
                        <span class="timestamp">${new Date(screenshot.timestamp).toLocaleString()}</span><br>
                        ${screenshot.url ? `URL: ${screenshot.url}<br>` : ''}
                        ${screenshot.title ? `Title: ${screenshot.title}<br>` : ''}
                        Size: ${((screenshot.size || 0) / 1024).toFixed(1)}KB
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Clean up old screenshots
     */
    async cleanupOldScreenshots(daysOld = 7) {
        console.log(`🧹 Cleaning up screenshots older than ${daysOld} days...`);
        
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        let deletedCount = 0;
        
        try {
            const allDirs = await fs.readdir(this.options.baseDir);
            
            for (const dirName of allDirs) {
                const dirPath = path.join(this.options.baseDir, dirName);
                const stat = await fs.stat(dirPath);
                
                if (stat.isDirectory() && stat.mtime.getTime() < cutoffTime) {
                    await fs.remove(dirPath);
                    deletedCount++;
                    console.log(`   🗑️  Deleted: ${dirName}`);
                }
            }
            
            console.log(`✅ Cleanup complete: ${deletedCount} old screenshot directories removed`);
            
        } catch (error) {
            console.error(`❌ Cleanup failed: ${error.message}`);
        }
    }

    /**
     * Get screenshot statistics
     */
    getStatistics() {
        return {
            sessionTimestamp: this.sessionTimestamp,
            sessionDirectory: this.sessionDir,
            totalScreenshots: this.screenshotHistory.length,
            summary: this.generateScreenshotSummary(),
            history: this.screenshotHistory
        };
    }
}

module.exports = { UniversalScreenshotManager };

// CLI usage example
if (require.main === module) {
    console.log('📸 UNIVERSAL SCREENSHOT MANAGER');
    console.log('===============================');
    console.log('Generic screenshot manager for any web application testing.');
    console.log('');
    console.log('Usage in your testing framework:');
    console.log('');
    console.log('```javascript');
    console.log('const { UniversalScreenshotManager } = require("./universal-screenshot-manager");');
    console.log('');
    console.log('const screenshots = new UniversalScreenshotManager();');
    console.log('');
    console.log('// Take screenshots during testing');
    console.log('await screenshots.takeScreenshot(page, "login-page");');
    console.log('await screenshots.captureError(page, "login-failed");');
    console.log('await screenshots.generateScreenshotReport();');
    console.log('```');
    console.log('');
    console.log('🎯 Benefits:');
    console.log('   ✅ Automatic timestamped naming');
    console.log('   ✅ Organized screenshot storage');
    console.log('   ✅ HTML report generation');
    console.log('   ✅ Error capture with details');
    console.log('   ✅ Comparison screenshots');
    console.log('   ✅ Automatic cleanup options');
}
