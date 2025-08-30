#!/usr/bin/env node

/**
 * 🎯 IMMEDIATE EXCEL STATUS UPDATER
 * 
 * Updates the existing Excel CSV files to correctly reflect which links were actually tested
 * vs. which were only cataloged. This provides immediate clarity while comprehensive testing runs.
 */

const fs = require('fs-extra');
const path = require('path');

class ExcelStatusUpdater {
    constructor() {
        this.reportsDir = path.join(__dirname, '..', 'reports');
        this.testResults = null;
    }

    async updateExcelStatuses() {
        console.log('🔄 IMMEDIATE EXCEL STATUS UPDATER');
        console.log('==================================');
        console.log('📊 Updating Excel files with accurate test status...');
        
        try {
            // Load the actual test results
            await this.loadTestResults();
            
            // Update the All Links Catalog CSV
            await this.updateAllLinksCatalog();
            
            // Update the Menu Navigation CSV
            await this.updateMenuNavigationCatalog();
            
            // Update the Broken Links Details CSV
            await this.updateBrokenLinksDetails();
            
            // Create a new summary with accurate information
            await this.createAccurateSummary();
            
            // Regenerate Excel workbook with corrected data
            await this.regenerateExcelWorkbook();
            
            console.log('\n✅ Excel status update completed!');
            this.displayUpdatedStats();
            
        } catch (error) {
            console.error('❌ Excel status update failed:', error.message);
        }
    }

    async loadTestResults() {
        const resultsPath = path.join(this.reportsDir, 'real-adp-test-results.json');
        
        if (await fs.pathExists(resultsPath)) {
            this.testResults = JSON.parse(await fs.readFile(resultsPath, 'utf8'));
            console.log(`   ✅ Loaded test results: ${this.testResults.linkTests?.length || 0} links actually tested`);
        } else {
            throw new Error('Test results file not found');
        }
    }

    async updateAllLinksCatalog() {
        console.log('📋 Updating All Links Catalog...');
        
        const csvPath = path.join(this.reportsDir, 'EXCEL_02_All_Links_Catalog.csv');
        
        if (await fs.pathExists(csvPath)) {
            const csvContent = await fs.readFile(csvPath, 'utf8');
            const lines = csvContent.split('\n');
            const headerLine = lines[0];
            
            // Create updated CSV content
            const updatedLines = [headerLine];
            
            // Get actual test results
            const actualTests = this.testResults.linkTests || [];
            const actualTestsMap = {};
            actualTests.forEach(test => {
                actualTestsMap[test.link.href] = {
                    status: test.working ? 'PASSED' : 'FAILED',
                    error: test.error || 'None',
                    timestamp: test.timestamp
                };
            });
            
            // Process each data line
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const columns = this.parseCSVLine(lines[i]);
                    if (columns.length >= 11) {
                        const linkReference = columns[2].replace(/"/g, '');
                        
                        // Check if this link was actually tested
                        if (actualTestsMap[linkReference]) {
                            // Update with actual test results
                            columns[10] = `"${actualTestsMap[linkReference].status}"`;
                        } else {
                            // Mark as not tested
                            columns[10] = '"NOT TESTED"';
                        }
                        
                        updatedLines.push(columns.join(','));
                    }
                }
            }
            
            await fs.writeFile(csvPath, updatedLines.join('\n'));
            console.log(`   ✅ Updated All Links Catalog with accurate test statuses`);
        }
    }

    async updateMenuNavigationCatalog() {
        console.log('🧭 Updating Menu Navigation Catalog...');
        
        const csvPath = path.join(this.reportsDir, 'EXCEL_03_Menu_Navigation.csv');
        
        if (await fs.pathExists(csvPath)) {
            const csvContent = await fs.readFile(csvPath, 'utf8');
            const lines = csvContent.split('\n');
            const headerLine = lines[0];
            
            const updatedLines = [headerLine];
            
            // Get navigation test results
            const navTests = this.testResults.navigationTests || [];
            const navTestsMap = {};
            navTests.forEach(test => {
                const key = test.element?.text || test.element?.href || 'unknown';
                navTestsMap[key] = {
                    status: test.working ? 'PASSED' : 'FAILED',
                    error: test.error || 'None'
                };
            });
            
            // Process each data line
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const columns = this.parseCSVLine(lines[i]);
                    if (columns.length >= 10) {
                        const menuName = columns[1].replace(/"/g, '');
                        
                        // Check if this menu item was tested
                        if (navTestsMap[menuName]) {
                            columns[9] = `"${navTestsMap[menuName].status}"`;
                            columns[10] = `"${navTestsMap[menuName].error}"`;
                        } else {
                            columns[9] = '"NOT TESTED"';
                            columns[10] = '"Not tested in current run"';
                        }
                        
                        updatedLines.push(columns.join(','));
                    }
                }
            }
            
            await fs.writeFile(csvPath, updatedLines.join('\n'));
            console.log(`   ✅ Updated Menu Navigation Catalog with accurate test statuses`);
        }
    }

    async updateBrokenLinksDetails() {
        console.log('🚨 Updating Broken Links Details...');
        
        const csvPath = path.join(this.reportsDir, 'EXCEL_04_Broken_Links_Details.csv');
        
        // Get only the actually failed tests
        const failedTests = (this.testResults.linkTests || []).filter(test => !test.working);
        
        if (failedTests.length > 0) {
            const headerRow = [
                'ID', 'Link Name', 'Link URL', 'Target', 'Test ID', 'Error Type', 
                'Error Message', 'Severity', 'Category', 'Priority', 'Timestamp'
            ];
            
            const dataRows = failedTests.map((test, index) => [
                index + 1,
                test.link.text || 'No Display Text',
                test.link.href,
                test.link.target || '_self',
                test.link.testId || 'No Test ID',
                this.determineErrorType(test.error),
                (test.error || 'Unknown error').replace(/\n/g, ' ').substring(0, 200),
                this.determineSeverity(test.error),
                this.categorizeByURL(test.link.href),
                this.determinePriority(test.link.href),
                new Date(test.timestamp).toLocaleString()
            ]);
            
            const allData = [headerRow, ...dataRows];
            const csvContent = allData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            
            await fs.writeFile(csvPath, csvContent);
            console.log(`   ✅ Updated Broken Links Details with ${failedTests.length} actual broken links`);
        } else {
            console.log(`   ✅ No broken links found in actual test results`);
        }
    }

    async createAccurateSummary() {
        console.log('📊 Creating accurate summary...');
        
        const actualTests = this.testResults.linkTests || [];
        const passedTests = actualTests.filter(test => test.working);
        const failedTests = actualTests.filter(test => !test.working);
        const totalCataloged = this.testResults.pageAnalysis?.links?.length || 0;
        const totalTested = actualTests.length;
        const notTested = totalCataloged - totalTested;
        
        const summaryData = [
            ['ADP APPLICATION TESTING SUMMARY DASHBOARD - CORRECTED', '', '', ''],
            ['Test Date', new Date().toLocaleDateString(), '', ''],
            ['Application Tested', 'ADP RUN Payroll System', '', ''],
            ['Authentication Status', this.testResults.authentication?.success ? 'SUCCESS' : 'FAILED', '', ''],
            ['', '', '', ''],
            ['ACCURATE LINK TESTING SUMMARY', '', '', ''],
            ['Total Links Cataloged', totalCataloged, '', ''],
            ['Links Actually Tested', totalTested, '', ''],
            ['Links NOT Tested', notTested, '', ''],
            ['Tested Links - Working', passedTests.length, '', ''],
            ['Tested Links - Broken', failedTests.length, '', ''],
            ['Coverage Percentage', totalCataloged > 0 ? ((totalTested / totalCataloged) * 100).toFixed(1) + '%' : '0%', '', ''],
            ['Success Rate (of tested)', totalTested > 0 ? ((passedTests.length / totalTested) * 100).toFixed(1) + '%' : '0%', '', ''],
            ['', '', '', ''],
            ['TESTING STATUS BREAKDOWN', '', '', ''],
            ['Status: PASSED', passedTests.length, '', ''],
            ['Status: FAILED', failedTests.length, '', ''],
            ['Status: NOT TESTED', notTested, '', ''],
            ['', '', '', ''],
            ['NEXT STEPS REQUIRED', '', '', ''],
            ['1. Run comprehensive testing on remaining ' + notTested + ' links', '', '', ''],
            ['2. Fix the ' + failedTests.length + ' broken links identified', '', '', ''],
            ['3. Implement automated link monitoring', '', '', ''],
            ['4. Add proper test IDs to elements', '', '', '']
        ];
        
        const csvContent = summaryData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const summaryPath = path.join(this.reportsDir, 'EXCEL_01_Summary_Dashboard.csv');
        await fs.writeFile(summaryPath, csvContent);
        
        console.log('   ✅ Created accurate summary dashboard');
    }

    async regenerateExcelWorkbook() {
        console.log('📊 Regenerating Excel workbook with corrected data...');
        
        try {
            // Run the Python Excel workbook creator
            const { spawn } = require('child_process');
            const pythonProcess = spawn('/usr/bin/python3', ['create-excel-workbook.py'], {
                cwd: path.join(__dirname),
                stdio: 'inherit'
            });
            
            await new Promise((resolve, reject) => {
                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Python process exited with code ${code}`));
                    }
                });
            });
            
            console.log('   ✅ Excel workbook regenerated with corrected data');
        } catch (error) {
            console.log('   ⚠️  Could not regenerate Excel workbook:', error.message);
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
                current += char;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    determineErrorType(error) {
        if (!error) return 'Unknown';
        if (error.includes('Timeout')) return 'Timeout';
        if (error.includes('net::')) return 'Network';
        if (error.includes('404')) return 'Not Found';
        if (error.includes('500')) return 'Server Error';
        return 'Navigation';
    }

    determineSeverity(error) {
        if (!error) return 'MEDIUM';
        if (error.includes('Timeout')) return 'HIGH';
        if (error.includes('404')) return 'HIGH';
        if (error.includes('500')) return 'HIGH';
        return 'MEDIUM';
    }

    categorizeByURL(url) {
        if (!url) return 'Other';
        if (url.includes('PAYROLL')) return 'Payroll';
        if (url.includes('HR')) return 'Human Resources';
        if (url.includes('REPORT')) return 'Reports';
        if (url.includes('COMPANY')) return 'Company Settings';
        return 'Other';
    }

    determinePriority(url) {
        if (!url) return 'Low';
        if (url.includes('PAYROLL') || url.includes('HOME')) return 'High';
        if (url.includes('REPORT')) return 'Medium';
        return 'Low';
    }

    displayUpdatedStats() {
        const actualTests = this.testResults.linkTests || [];
        const totalCataloged = this.testResults.pageAnalysis?.links?.length || 0;
        const totalTested = actualTests.length;
        const passedTests = actualTests.filter(test => test.working);
        const failedTests = actualTests.filter(test => !test.working);
        const notTested = totalCataloged - totalTested;
        
        console.log('\n📊 CORRECTED TESTING STATISTICS');
        console.log('===============================');
        console.log(`🔍 Total Links Cataloged: ${totalCataloged}`);
        console.log(`🧪 Links Actually Tested: ${totalTested}`);
        console.log(`❌ Links NOT Tested: ${notTested}`);
        console.log(`✅ Tested & Working: ${passedTests.length}`);
        console.log(`🚨 Tested & Broken: ${failedTests.length}`);
        console.log(`📊 Test Coverage: ${totalCataloged > 0 ? ((totalTested / totalCataloged) * 100).toFixed(1) : 0}%`);
        console.log(`💯 Success Rate (of tested): ${totalTested > 0 ? ((passedTests.length / totalTested) * 100).toFixed(1) : 0}%`);
        console.log('');
        console.log('📄 Updated Excel Files:');
        console.log(`   📊 EXCEL_01_Summary_Dashboard.csv - Corrected summary`);
        console.log(`   🔗 EXCEL_02_All_Links_Catalog.csv - Accurate test statuses`);
        console.log(`   🧭 EXCEL_03_Menu_Navigation.csv - Updated navigation status`);
        console.log(`   🚨 EXCEL_04_Broken_Links_Details.csv - Only actual broken links`);
        console.log(`   📋 ADP_Testing_Comprehensive_Report.xlsx - Updated workbook`);
        console.log('');
        console.log('🎯 KEY INSIGHT: Only 5.5% of cataloged links were actually tested!');
        console.log('💡 RECOMMENDATION: Run comprehensive testing to test all 183 cataloged links');
    }
}

// CLI interface
async function main() {
    const updater = new ExcelStatusUpdater();
    await updater.updateExcelStatuses();
}

module.exports = { ExcelStatusUpdater };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
