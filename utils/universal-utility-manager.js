#!/usr/bin/env node

/**
 * 🎯 UNIVERSAL QA AUTOMATION FRAMEWORK - UTILITY MANAGER
 * 
 * Generic utility manager that coordinates all testing utilities.
 * Works with any web application - no application-specific references.
 * Generates timestamped reports to preserve test history.
 */

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

class UniversalUtilityManager {
    constructor(baseDir = null) {
        this.baseDir = baseDir || path.join(__dirname, '..');
        this.utilsDir = path.join(this.baseDir, 'utils');
        this.reportsDir = path.join(this.baseDir, 'reports');
        this.timestamp = this.generateTimestamp();
        
        // Ensure directories exist
        fs.ensureDirSync(this.utilsDir);
        fs.ensureDirSync(this.reportsDir);
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

    async showUtilityInventory() {
        console.log('🎯 UNIVERSAL QA AUTOMATION FRAMEWORK - UTILITY INVENTORY');
        console.log('========================================================');
        console.log(`🕒 Current Timestamp: ${this.timestamp}`);
        console.log(`📁 Base Directory: ${this.baseDir}`);
        console.log(`🔧 Generic Framework - Works with ANY application`);
        console.log('');
        
        const utilities = [
            {
                id: '01',
                name: 'Generic Timestamped Report Generator',
                file: 'generic-timestamped-report-generator.js',
                description: 'Generates timestamped reports for any web application testing',
                status: await this.checkUtilityStatus('generic-timestamped-report-generator.js')
            },
            {
                id: '02', 
                name: 'Universal Link Tester',
                file: 'robust-adp-tester.js',
                description: 'Comprehensive link testing for any web application',
                status: await this.checkUtilityStatus('robust-adp-tester.js'),
                note: 'Needs renaming to generic-comprehensive-tester.js'
            },
            {
                id: '03',
                name: 'Test Status Updater',
                file: 'excel-status-updater.js', 
                description: 'Updates test statuses in Excel reports accurately',
                status: await this.checkUtilityStatus('excel-status-updater.js'),
                note: 'Needs renaming to generic-status-updater.js'
            },
            {
                id: '04',
                name: 'Excel Workbook Creator',
                file: 'create-timestamped-excel-workbook.py',
                description: 'Creates Excel workbooks from timestamped CSV files',
                status: await this.checkUtilityStatus('create-timestamped-excel-workbook.py')
            },
            {
                id: '05',
                name: 'Framework Status Checker',
                file: '../config/framework-status.json',
                description: 'Tracks framework configuration and status',
                status: await this.checkUtilityStatus('../config/framework-status.json')
            },
            {
                id: '06',
                name: 'Cross-Platform Config Manager',
                file: '../config/cross-platform.config.json',
                description: 'Manages testing configurations across platforms',
                status: await this.checkUtilityStatus('../config/cross-platform.config.json')
            },
            {
                id: '07',
                name: 'Comprehensive Test Updater',
                file: 'comprehensive-test-updater.js',
                description: 'Updates comprehensive test configurations',
                status: await this.checkUtilityStatus('comprehensive-test-updater.js'),
                note: 'Needs renaming to generic-test-updater.js'
            },
            {
                id: '08',
                name: 'Authentication Handler',
                file: 'authentication-handler.js',
                description: 'Handles authentication for any web application',
                status: 'PLANNED'
            },
            {
                id: '09',
                name: 'Screenshot Manager',
                file: 'screenshot-manager.js',
                description: 'Manages screenshots across test runs',
                status: 'PLANNED'
            },
            {
                id: '10',
                name: 'Test Data Manager',
                file: 'test-data-manager.js',
                description: 'Manages test data and configurations',
                status: 'PLANNED'
            }
        ];

        console.log('📋 UTILITY INVENTORY:');
        console.log('=====================');
        
        for (const utility of utilities) {
            const statusIcon = this.getStatusIcon(utility.status);
            console.log(`${utility.id}. ${statusIcon} ${utility.name}`);
            console.log(`    📄 File: ${utility.file}`);
            console.log(`    📝 Description: ${utility.description}`);
            console.log(`    🔍 Status: ${utility.status}`);
            if (utility.note) {
                console.log(`    ⚠️  Note: ${utility.note}`);
            }
            console.log('');
        }

        console.log('🎯 NEXT ACTIONS:');
        console.log('================');
        console.log('1. Rename utilities to remove application-specific references');
        console.log('2. Implement timestamped naming for all outputs');
        console.log('3. Create missing utilities (Authentication Handler, etc.)');
        console.log('4. Test generic framework with different applications');
        console.log('5. Document generic usage patterns');
        console.log('');
    }

    async checkUtilityStatus(fileName) {
        const filePath = path.join(this.utilsDir, fileName);
        try {
            if (await fs.pathExists(filePath)) {
                const stats = await fs.stat(filePath);
                return stats.size > 0 ? 'ACTIVE' : 'EMPTY';
            } else {
                return 'MISSING';
            }
        } catch (error) {
            return 'ERROR';
        }
    }

    getStatusIcon(status) {
        switch (status) {
            case 'ACTIVE': return '✅';
            case 'EMPTY': return '📄';
            case 'MISSING': return '❌';
            case 'ERROR': return '⚠️';
            case 'PLANNED': return '📋';
            default: return '❓';
        }
    }

    async renameUtilitiesToGeneric() {
        console.log('🔄 RENAMING UTILITIES TO GENERIC FRAMEWORK');
        console.log('==========================================');
        console.log('Removing application-specific references...');
        console.log('');

        const renamingMap = [
            {
                old: 'robust-adp-tester.js',
                new: 'generic-comprehensive-tester.js',
                description: 'Universal comprehensive link and navigation tester'
            },
            {
                old: 'excel-status-updater.js',
                new: 'generic-status-updater.js', 
                description: 'Universal test status updater for Excel reports'
            },
            {
                old: 'comprehensive-test-updater.js',
                new: 'generic-test-updater.js',
                description: 'Universal test configuration updater'
            }
        ];

        for (const item of renamingMap) {
            const oldPath = path.join(this.utilsDir, item.old);
            const newPath = path.join(this.utilsDir, item.new);
            
            try {
                if (await fs.pathExists(oldPath)) {
                    await fs.move(oldPath, newPath);
                    console.log(`✅ Renamed: ${item.old} → ${item.new}`);
                    console.log(`   📝 ${item.description}`);
                } else {
                    console.log(`⚠️  Source file not found: ${item.old}`);
                }
            } catch (error) {
                console.log(`❌ Failed to rename ${item.old}: ${error.message}`);
            }
            console.log('');
        }

        console.log('🎯 Benefits of Generic Naming:');
        console.log('   ✅ Framework works with any application');
        console.log('   ✅ No application-specific dependencies');  
        console.log('   ✅ Easy to understand and reuse');
        console.log('   ✅ Professional and maintainable');
        console.log('');
    }

    async generateTimestampedReports(resultsFile = null) {
        console.log('📊 GENERATING TIMESTAMPED REPORTS');
        console.log('=================================');
        console.log(`🕒 Timestamp: ${this.timestamp}`);
        console.log('🔧 Using generic framework approach');
        console.log('');

        try {
            // Find the most recent results file if not specified
            if (!resultsFile) {
                const resultsFiles = await this.findResultsFiles();
                if (resultsFiles.length === 0) {
                    throw new Error('No test results files found');
                }
                resultsFile = resultsFiles[0]; // Use most recent
                console.log(`📄 Using results file: ${path.basename(resultsFile)}`);
            }

            // Run the generic timestamped report generator
            const generatorPath = path.join(this.utilsDir, 'generic-timestamped-report-generator.js');
            
            if (await fs.pathExists(generatorPath)) {
                console.log('🚀 Running generic timestamped report generator...');
                const success = await this.runUtility(generatorPath, [resultsFile, this.reportsDir]);
                
                if (success) {
                    console.log('✅ Timestamped reports generated successfully!');
                    await this.displayTimestampedReports();
                } else {
                    console.log('❌ Report generation failed');
                }
            } else {
                console.log('❌ Generic report generator not found');
            }

        } catch (error) {
            console.error('❌ Timestamped report generation failed:', error.message);
        }
    }

    async findResultsFiles() {
        const resultsFiles = [];
        const possibleFiles = [
            'real-adp-test-results.json',
            'test-results.json', 
            'comprehensive-test-results.json',
            'latest-test-results.json'
        ];

        for (const fileName of possibleFiles) {
            const filePath = path.join(this.reportsDir, fileName);
            if (await fs.pathExists(filePath)) {
                const stats = await fs.stat(filePath);
                resultsFiles.push({ path: filePath, mtime: stats.mtime });
            }
        }

        // Sort by modification time, newest first
        resultsFiles.sort((a, b) => b.mtime - a.mtime);
        return resultsFiles.map(f => f.path);
    }

    async displayTimestampedReports() {
        console.log('\n📋 TIMESTAMPED REPORTS GENERATED');
        console.log('================================');
        console.log(`🕒 Timestamp: ${this.timestamp}`);
        console.log(`📁 Location: ${this.reportsDir}`);
        console.log('');

        const expectedFiles = [
            `00_Master_Import_Guide_${this.timestamp}.csv`,
            `01_Summary_Dashboard_${this.timestamp}.csv`,
            `02_All_Links_Catalog_${this.timestamp}.csv`, 
            `03_Menu_Navigation_${this.timestamp}.csv`,
            `04_Broken_Links_Details_${this.timestamp}.csv`,
            `05_Test_Results_${this.timestamp}.csv`,
            `06_Recommendations_${this.timestamp}.csv`,
            `BrokenLinks_Testing_Report_${this.timestamp}.xlsx`,
            `Comprehensive_Test_Report_${this.timestamp}.html`
        ];

        console.log('📄 Expected Files:');
        for (const fileName of expectedFiles) {
            const filePath = path.join(this.reportsDir, fileName);
            const exists = await fs.pathExists(filePath);
            const icon = exists ? '✅' : '❌';
            console.log(`   ${icon} ${fileName}`);
        }

        console.log('\n🎯 Benefits:');
        console.log('   ✅ No report overwrites - all history preserved');
        console.log('   ✅ Easy comparison between test runs');
        console.log('   ✅ Generic framework works with any application');
        console.log('   ✅ Professional timestamped naming convention');
        console.log('   ✅ Ready for stakeholder review');
        console.log('');
    }

    async runUtility(utilityPath, args = []) {
        return new Promise((resolve) => {
            const process = spawn('node', [utilityPath, ...args], {
                stdio: 'inherit',
                cwd: this.utilsDir
            });

            process.on('close', (code) => {
                resolve(code === 0);
            });

            process.on('error', (error) => {
                console.error('Process error:', error.message);
                resolve(false);
            });
        });
    }

    async runComprehensiveTesting(targetUrl, credentials) {
        console.log('🧪 RUNNING COMPREHENSIVE TESTING');
        console.log('=================================');
        console.log(`🎯 Target: ${targetUrl}`);
        console.log(`🕒 Timestamp: ${this.timestamp}`);
        console.log('🔧 Using generic comprehensive tester');
        console.log('');

        try {
            // Check if we have the generic tester (might still be old name)
            const possibleTesters = [
                'generic-comprehensive-tester.js',
                'robust-adp-tester.js'  // fallback to old name
            ];

            let testerPath = null;
            for (const testerName of possibleTesters) {
                const testPath = path.join(this.utilsDir, testerName);
                if (await fs.pathExists(testPath)) {
                    testerPath = testPath;
                    console.log(`📄 Using tester: ${testerName}`);
                    break;
                }
            }

            if (!testerPath) {
                throw new Error('No comprehensive tester found');
            }

            // Run the comprehensive tester
            console.log('🚀 Starting comprehensive testing...');
            const success = await this.runUtility(testerPath, []);
            
            if (success) {
                console.log('✅ Comprehensive testing completed!');
                
                // Generate timestamped reports
                await this.generateTimestampedReports();
                
                return true;
            } else {
                console.log('❌ Comprehensive testing failed');
                return false;
            }

        } catch (error) {
            console.error('❌ Comprehensive testing failed:', error.message);
            return false;
        }
    }

    async getFrameworkStatus() {
        console.log('📊 UNIVERSAL QA AUTOMATION FRAMEWORK STATUS');
        console.log('===========================================');
        console.log(`🕒 Current Timestamp: ${this.timestamp}`);
        console.log('🔧 Generic Framework - Application Agnostic');
        console.log('');

        const status = {
            timestamp: this.timestamp,
            baseDir: this.baseDir,
            reportsDir: this.reportsDir,
            utilsDir: this.utilsDir,
            utilities: {},
            reports: {},
            recommendations: []
        };

        // Check utilities
        const utilityFiles = await fs.readdir(this.utilsDir);
        for (const file of utilityFiles) {
            if (file.endsWith('.js') || file.endsWith('.py')) {
                const filePath = path.join(this.utilsDir, file);
                const stats = await fs.stat(filePath);
                status.utilities[file] = {
                    size: stats.size,
                    modified: stats.mtime,
                    generic: !file.includes('adp') && !file.includes('sbs')
                };
            }
        }

        // Check reports
        const reportFiles = await fs.readdir(this.reportsDir);
        for (const file of reportFiles) {
            if (file.endsWith('.csv') || file.endsWith('.xlsx') || file.endsWith('.json') || file.endsWith('.html')) {
                const filePath = path.join(this.reportsDir, file);
                const stats = await fs.stat(filePath);
                status.reports[file] = {
                    size: stats.size,
                    modified: stats.mtime,
                    timestamped: /\d{12}(AM|PM)/.test(file)
                };
            }
        }

        // Generate recommendations
        const nonGenericUtils = Object.keys(status.utilities).filter(
            file => !status.utilities[file].generic
        );
        const nonTimestampedReports = Object.keys(status.reports).filter(
            file => !status.reports[file].timestamped
        );

        if (nonGenericUtils.length > 0) {
            status.recommendations.push({
                type: 'NAMING',
                priority: 'HIGH',
                message: `Rename ${nonGenericUtils.length} utilities to remove application-specific references`,
                files: nonGenericUtils
            });
        }

        if (nonTimestampedReports.length > 0) {
            status.recommendations.push({
                type: 'TIMESTAMPING',
                priority: 'MEDIUM', 
                message: `${nonTimestampedReports.length} reports lack timestamps`,
                files: nonTimestampedReports
            });
        }

        console.log(`📋 Utilities: ${Object.keys(status.utilities).length}`);
        console.log(`📄 Reports: ${Object.keys(status.reports).length}`);
        console.log(`⚠️  Recommendations: ${status.recommendations.length}`);
        console.log('');

        if (status.recommendations.length > 0) {
            console.log('🎯 RECOMMENDATIONS:');
            for (const rec of status.recommendations) {
                console.log(`   ${rec.priority}: ${rec.message}`);
            }
            console.log('');
        }

        return status;
    }
}

// CLI interface
async function main() {
    const command = process.argv[2] || 'status';
    const manager = new UniversalUtilityManager();

    try {
        switch (command) {
            case 'inventory':
                await manager.showUtilityInventory();
                break;
            
            case 'rename':
                await manager.renameUtilitiesToGeneric();
                break;
                
            case 'reports':
                await manager.generateTimestampedReports(process.argv[3]);
                break;
                
            case 'test':
                const url = process.argv[3] || 'https://example.com';
                const creds = process.argv[4] || 'user/pass';
                await manager.runComprehensiveTesting(url, creds);
                break;
                
            case 'status':
            default:
                await manager.getFrameworkStatus();
                break;
        }
    } catch (error) {
        console.error('❌ Command failed:', error.message);
        process.exit(1);
    }
}

module.exports = { UniversalUtilityManager };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
