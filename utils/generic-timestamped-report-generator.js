#!/usr/bin/env node

/**
 * 🎯 GENERIC TIMESTAMPED REPORT GENERATOR
 * 
 * Universal report generator that works with any application testing.
 * Generates timestamped reports to preserve test history and avoid overwrites.
 * Removes application-specific references for framework reusability.
 */

const fs = require('fs-extra');
const path = require('path');

class GenericTimestampedReportGenerator {
    constructor(resultsPath, outputDir) {
        this.resultsPath = resultsPath;
        this.outputDir = outputDir || path.join(__dirname, '..', 'reports');
        this.timestamp = this.generateTimestamp();
        this.results = null;
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

    async generateAllReports() {
        console.log('📊 GENERIC TIMESTAMPED REPORT GENERATION');
        console.log('=========================================');
        console.log(`🕒 Timestamp: ${this.timestamp}`);
        console.log(`📁 Output Directory: ${this.outputDir}`);
        console.log('🔧 Application-agnostic framework');
        console.log('');

        try {
            // Load test results
            await this.loadResults();
            
            // Generate timestamped reports
            await this.generateSummaryDashboard();
            await this.generateLinksAnalysis();
            await this.generateNavigationAnalysis();
            await this.generateBrokenLinksDetails();
            await this.generateTestResults();
            await this.generateRecommendations();
            await this.generateMasterImportGuide();
            
            // Generate Excel workbook
            await this.generateExcelWorkbook();
            
            // Generate comprehensive report
            await this.generateComprehensiveReport();
            
            console.log('\n✅ All timestamped reports generated successfully!');
            this.displayGeneratedReports();
            
        } catch (error) {
            console.error('❌ Report generation failed:', error.message);
            throw error;
        }
    }

    async loadResults() {
        console.log('📥 Loading test results...');
        
        if (await fs.pathExists(this.resultsPath)) {
            this.results = JSON.parse(await fs.readFile(this.resultsPath, 'utf8'));
            console.log('   ✅ Test results loaded successfully');
        } else {
            throw new Error(`Results file not found: ${this.resultsPath}`);
        }
    }

    async generateSummaryDashboard() {
        console.log('📊 Generating Summary Dashboard...');
        
        const actualTests = this.results.linkTests || [];
        const passedTests = actualTests.filter(test => test.working);
        const failedTests = actualTests.filter(test => !test.working);
        const totalCataloged = this.results.pageAnalysis?.links?.length || 0;
        const totalTested = actualTests.length;
        const notTested = totalCataloged - totalTested;
        
        const summaryData = [
            ['WEB APPLICATION LINK TESTING SUMMARY', '', '', ''],
            ['Test Date', new Date().toLocaleDateString(), '', ''],
            ['Test Time', new Date().toLocaleTimeString(), '', ''],
            ['Application URL', this.results.authentication?.final_url || 'N/A', '', ''],
            ['Authentication Status', this.results.authentication?.success ? 'SUCCESS' : 'FAILED', '', ''],
            ['', '', '', ''],
            ['LINK TESTING SUMMARY', '', '', ''],
            ['Total Links Cataloged', totalCataloged, '', ''],
            ['Links Actually Tested', totalTested, '', ''],
            ['Links NOT Tested', notTested, '', ''],
            ['Tested Links - Working', passedTests.length, '', ''],
            ['Tested Links - Broken', failedTests.length, '', ''],
            ['Coverage Percentage', totalCataloged > 0 ? ((totalTested / totalCataloged) * 100).toFixed(1) + '%' : '0%', '', ''],
            ['Success Rate (of tested)', totalTested > 0 ? ((passedTests.length / totalTested) * 100).toFixed(1) + '%' : '0%', '', ''],
            ['', '', '', ''],
            ['ADVANCED FEATURES DETECTED', '', '', ''],
            ['Shadow DOM Elements', this.results.summary?.advanced?.shadowDom || 0, '', ''],
            ['iframes Detected', this.results.summary?.advanced?.iframes || 0, '', ''],
            ['Custom Components', this.results.summary?.advanced?.customComponents || 0, '', ''],
            ['', '', '', ''],
            ['TESTING STATUS BREAKDOWN', '', '', ''],
            ['Status: PASSED', passedTests.length, '', ''],
            ['Status: FAILED', failedTests.length, '', ''],
            ['Status: NOT TESTED', notTested, '', ''],
            ['', '', '', ''],
            ['NEXT STEPS REQUIRED', '', '', ''],
            ['1. Test remaining ' + notTested + ' links', '', '', ''],
            ['2. Fix the ' + failedTests.length + ' broken links', '', '', ''],
            ['3. Implement automated monitoring', '', '', ''],
            ['4. Add proper test identifiers', '', '', '']
        ];
        
        const csvContent = summaryData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const fileName = `01_Summary_Dashboard_${this.timestamp}.csv`;
        const filePath = path.join(this.outputDir, fileName);
        await fs.writeFile(filePath, csvContent);
        
        console.log(`   ✅ Summary Dashboard: ${fileName}`);
    }

    async generateLinksAnalysis() {
        console.log('🔗 Generating Links Analysis...');
        
        const links = this.results.pageAnalysis?.links || [];
        const actualTests = this.results.linkTests || [];
        const actualTestsMap = {};
        
        actualTests.forEach(test => {
            actualTestsMap[test.link.href] = {
                status: test.working ? 'PASSED' : 'FAILED',
                error: test.error || 'None',
                timestamp: test.timestamp
            };
        });
        
        const headerRow = [
            'ID', 'Link Name', 'Link Reference', 'Target', 'Test ID', 'Link Type', 
            'Is Internal', 'Has Display Text', 'URL Fragment', 'Category', 'Status'
        ];
        
        const dataRows = links.map((link, index) => {
            const testResult = actualTestsMap[link.href];
            return [
                index + 1,
                link.text || 'No Display Text',
                link.href,
                link.target || '_self',
                link.testId || 'No Test ID',
                this.determineLinkType(link),
                this.isInternalLink(link.href) ? 'Yes' : 'No',
                link.text ? 'Yes' : 'No',
                this.extractURLFragment(link.href),
                this.categorizeByFunction(link.text, link.href),
                testResult ? testResult.status : 'NOT TESTED'
            ];
        });
        
        const allData = [headerRow, ...dataRows];
        const csvContent = allData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const fileName = `02_All_Links_Catalog_${this.timestamp}.csv`;
        const filePath = path.join(this.outputDir, fileName);
        await fs.writeFile(filePath, csvContent);
        
        console.log(`   ✅ Links Analysis: ${fileName}`);
    }

    async generateNavigationAnalysis() {
        console.log('🧭 Generating Navigation Analysis...');
        
        const navigation = this.results.pageAnalysis?.navigation || [];
        const navTests = this.results.navigationTests || [];
        const navTestsMap = {};
        
        navTests.forEach(test => {
            const key = test.element?.text || test.element?.href || 'unknown';
            navTestsMap[key] = {
                status: test.working ? 'PASSED' : 'FAILED',
                error: test.error || 'None'
            };
        });
        
        const headerRow = [
            'ID', 'Menu Name', 'Menu Reference', 'Module', 'Category', 'Link Type', 
            'Test ID', 'Has Onclick', 'Navigation Path', 'Test Status', 'Error Message'
        ];
        
        const dataRows = navigation.map((nav, index) => {
            const testResult = navTestsMap[nav.text];
            return [
                index + 1,
                nav.text || 'No Display Text',
                nav.href || nav.url || 'No Reference',
                nav.target || 'N/A',
                this.categorizeNavigationByFunction(nav.text),
                this.determineLinkType(nav),
                nav.testId || 'No Test ID',
                nav.onclick ? 'Yes' : 'No',
                this.generateNavigationPath(nav),
                testResult ? testResult.status : 'NOT TESTED',
                testResult ? testResult.error : 'Not tested'
            ];
        });
        
        const allData = [headerRow, ...dataRows];
        const csvContent = allData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const fileName = `03_Menu_Navigation_${this.timestamp}.csv`;
        const filePath = path.join(this.outputDir, fileName);
        await fs.writeFile(filePath, csvContent);
        
        console.log(`   ✅ Navigation Analysis: ${fileName}`);
    }

    async generateBrokenLinksDetails() {
        console.log('🚨 Generating Broken Links Details...');
        
        const failedTests = (this.results.linkTests || []).filter(test => !test.working);
        
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
                this.categorizeByFunction(test.link.text, test.link.href),
                this.determinePriority(test.link.href),
                new Date(test.timestamp).toLocaleString()
            ]);
            
            const allData = [headerRow, ...dataRows];
            const csvContent = allData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const fileName = `04_Broken_Links_Details_${this.timestamp}.csv`;
            const filePath = path.join(this.outputDir, fileName);
            await fs.writeFile(filePath, csvContent);
            
            console.log(`   ✅ Broken Links Details: ${fileName} (${failedTests.length} broken links)`);
        } else {
            console.log(`   ✅ No broken links found in test results`);
        }
    }

    async generateTestResults() {
        console.log('🧪 Generating Test Results...');
        
        const headerRow = [
            'Test Type', 'Element Name', 'Element Reference', 'Test ID', 'Result', 
            'URL Changed', 'Initial URL', 'Final URL', 'Error Message', 'Timestamp'
        ];
        
        const linkTestRows = (this.results.linkTests || []).map(test => [
            'Link Test',
            test.link.text || 'No Display Text',
            test.link.href,
            test.link.testId || 'No Test ID',
            test.working ? 'PASSED' : 'FAILED',
            'N/A',
            'N/A',
            'N/A',
            test.error || 'None',
            new Date(test.timestamp).toLocaleString()
        ]);
        
        const navTestRows = (this.results.navigationTests || []).map(test => [
            'Navigation Test',
            test.element.text || 'No Display Text',
            test.finalUrl || 'N/A',
            test.element.testId || 'No Test ID',
            test.working ? 'PASSED' : 'FAILED',
            test.urlChanged ? 'Yes' : 'No',
            test.initialUrl || 'N/A',
            test.finalUrl || 'N/A',
            test.error || 'None',
            new Date(test.timestamp).toLocaleString()
        ]);
        
        const allData = [headerRow, ...linkTestRows, ...navTestRows];
        const csvContent = allData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const fileName = `05_Test_Results_${this.timestamp}.csv`;
        const filePath = path.join(this.outputDir, fileName);
        await fs.writeFile(filePath, csvContent);
        
        console.log(`   ✅ Test Results: ${fileName}`);
    }

    async generateRecommendations() {
        console.log('💡 Generating Recommendations...');
        
        const actualTests = this.results.linkTests || [];
        const failedTests = actualTests.filter(test => !test.working);
        const totalCataloged = this.results.pageAnalysis?.links?.length || 0;
        const notTested = totalCataloged - actualTests.length;
        
        const recommendationsData = [
            ['WEB APPLICATION TESTING RECOMMENDATIONS', '', '', ''],
            ['Generated on', new Date().toLocaleString(), '', ''],
            ['', '', '', ''],
            ['IMMEDIATE ACTIONS REQUIRED', '', '', ''],
            ['Priority', 'Action Item', 'Details', 'Owner'],
            ['HIGH', 'Test Remaining Links', `${notTested} links need to be tested`, 'QA Team'],
            ['HIGH', 'Fix Broken Links', `${failedTests.length} broken links identified`, 'Development Team'],
            ['MEDIUM', 'Implement Retry Logic', 'Add automatic retry for failed tests', 'Development Team'],
            ['MEDIUM', 'Add Test Identifiers', 'Most elements lack test IDs', 'Development Team'],
            ['LOW', 'Monitor Advanced Elements', 'Track complex UI components', 'QA Team'],
            ['', '', '', ''],
            ['BROKEN LINKS BY CATEGORY', '', '', ''],
            ['Category', 'Count', 'Severity', 'Action Required'],
            ...this.generateBrokenLinksByCategory(failedTests),
            ['', '', '', ''],
            ['TECHNICAL RECOMMENDATIONS', '', '', ''],
            ['Area', 'Recommendation', 'Impact', 'Effort'],
            ['Performance', 'Optimize page load times', 'High', 'Medium'],
            ['Testing', 'Implement automated link checking', 'High', 'Low'],
            ['Monitoring', 'Set up link monitoring alerts', 'Medium', 'Low'],
            ['Documentation', 'Document navigation flows', 'Medium', 'Low'],
            ['Accessibility', 'Review component accessibility', 'Medium', 'Medium'],
            ['', '', '', ''],
            ['NEXT STEPS', '', '', ''],
            ['Step', 'Action', 'Timeline', 'Dependencies'],
            ['1', 'Fix critical broken links', 'Week 1', 'Development Team'],
            ['2', 'Implement retry mechanisms', 'Week 2', 'Step 1 completion'],
            ['3', 'Add missing test identifiers', 'Week 3', 'Development Team'],
            ['4', 'Set up monitoring', 'Week 4', 'Infrastructure Team'],
            ['5', 'Regular link validation', 'Ongoing', 'Monitoring setup']
        ];
        
        const csvContent = recommendationsData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const fileName = `06_Recommendations_${this.timestamp}.csv`;
        const filePath = path.join(this.outputDir, fileName);
        await fs.writeFile(filePath, csvContent);
        
        console.log(`   ✅ Recommendations: ${fileName}`);
    }

    async generateMasterImportGuide() {
        console.log('📋 Generating Master Import Guide...');
        
        const masterData = [
            ['WEB APPLICATION TESTING - EXCEL IMPORT GUIDE', '', '', '', ''],
            ['Generated on', new Date().toLocaleString(), '', '', ''],
            ['Timestamp', this.timestamp, '', '', ''],
            ['', '', '', '', ''],
            ['EXCEL IMPORT INSTRUCTIONS', '', '', '', ''],
            ['1. Open Excel/Google Sheets', '', '', '', ''],
            ['2. Import each CSV file as a separate sheet:', '', '', '', ''],
            [`   - 01_Summary_Dashboard_${this.timestamp}.csv`, '→', 'Summary Dashboard', '', ''],
            [`   - 02_All_Links_Catalog_${this.timestamp}.csv`, '→', 'All Links Catalog', '', ''],
            [`   - 03_Menu_Navigation_${this.timestamp}.csv`, '→', 'Menu Navigation', '', ''],
            [`   - 04_Broken_Links_Details_${this.timestamp}.csv`, '→', 'Broken Links Details', '', ''],
            [`   - 05_Test_Results_${this.timestamp}.csv`, '→', 'Test Results', '', ''],
            [`   - 06_Recommendations_${this.timestamp}.csv`, '→', 'Recommendations', '', ''],
            ['3. Format as tables for easy filtering and sorting', '', '', '', ''],
            ['4. Use pivot tables for advanced analysis', '', '', '', ''],
            ['', '', '', '', ''],
            ['QUICK STATISTICS', '', '', '', ''],
            ['Total Links Found', this.results.pageAnalysis?.links?.length || 0, '', '', ''],
            ['Links Tested', this.results.linkTests?.length || 0, '', '', ''],
            ['Navigation Elements', this.results.pageAnalysis?.navigation?.length || 0, '', '', ''],
            ['Authentication Status', this.results.authentication?.success ? 'SUCCESS' : 'FAILED', '', '', ''],
            ['', '', '', '', ''],
            ['TIMESTAMPED FILES', '', '', '', ''],
            [`01_Summary_Dashboard_${this.timestamp}.csv`, '', '', '', ''],
            [`02_All_Links_Catalog_${this.timestamp}.csv`, '', '', '', ''],
            [`03_Menu_Navigation_${this.timestamp}.csv`, '', '', '', ''],
            [`04_Broken_Links_Details_${this.timestamp}.csv`, '', '', '', ''],
            [`05_Test_Results_${this.timestamp}.csv`, '', '', '', ''],
            [`06_Recommendations_${this.timestamp}.csv`, '', '', '', '']
        ];
        
        const csvContent = masterData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const fileName = `00_Master_Import_Guide_${this.timestamp}.csv`;
        const filePath = path.join(this.outputDir, fileName);
        await fs.writeFile(filePath, csvContent);
        
        console.log(`   ✅ Master Import Guide: ${fileName}`);
    }

    async generateExcelWorkbook() {
        console.log('📊 Generating Excel Workbook...');
        
        const fileName = `BrokenLinks_Testing_Report_${this.timestamp}.xlsx`;
        
        try {
            // Run the Python Excel workbook creator with timestamp
            const { spawn } = require('child_process');
            const pythonProcess = spawn('/usr/bin/python3', [
                'create-timestamped-excel-workbook.py', 
                this.outputDir,
                this.timestamp
            ], {
                cwd: path.join(__dirname),
                stdio: 'inherit'
            });
            
            await new Promise((resolve, reject) => {
                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        console.log('   ⚠️  Excel workbook generation skipped (Python script not available)');
                        resolve(); // Don't fail the entire process
                    }
                });
            });
            
            console.log(`   ✅ Excel Workbook: ${fileName}`);
        } catch (error) {
            console.log('   ⚠️  Excel workbook generation skipped:', error.message);
        }
    }

    async generateComprehensiveReport() {
        console.log('📄 Generating Comprehensive HTML Report...');
        
        const htmlContent = this.generateHTMLReport();
        const fileName = `Comprehensive_Test_Report_${this.timestamp}.html`;
        const filePath = path.join(this.outputDir, fileName);
        await fs.writeFile(filePath, htmlContent);
        
        console.log(`   ✅ Comprehensive Report: ${fileName}`);
    }

    generateHTMLReport() {
        const actualTests = this.results.linkTests || [];
        const passedTests = actualTests.filter(test => test.working);
        const failedTests = actualTests.filter(test => !test.working);
        const totalCataloged = this.results.pageAnalysis?.links?.length || 0;
        const totalTested = actualTests.length;
        const notTested = totalCataloged - totalTested;
        const successRate = totalTested > 0 ? ((passedTests.length / totalTested) * 100).toFixed(1) : 0;
        const coverage = totalCataloged > 0 ? ((totalTested / totalCataloged) * 100).toFixed(1) : 0;
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Application Testing Report - ${this.timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007acc; padding-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .success { color: #28a745; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .danger { color: #dc3545; font-weight: bold; }
        .timestamp { color: #666; font-size: 0.9em; }
        .recommendations { background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #007acc; }
        .file-list { background: #e9ecef; padding: 15px; border-radius: 5px; }
        .file-list ul { list-style-type: none; padding: 0; }
        .file-list li { padding: 5px 0; border-bottom: 1px solid #ddd; }
        .file-list li:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Web Application Testing Report</h1>
            <p class="timestamp">Generated: ${new Date().toLocaleString()} | Timestamp: ${this.timestamp}</p>
            <p><strong>Application:</strong> ${this.results.authentication?.final_url || 'Unknown'}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalCataloged}</div>
                <div class="stat-label">Total Links Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalTested}</div>
                <div class="stat-label">Links Tested</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${coverage}%</div>
                <div class="stat-label">Test Coverage</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Testing Summary</h2>
            <ul>
                <li><strong>Authentication:</strong> <span class="${this.results.authentication?.success ? 'success' : 'danger'}">${this.results.authentication?.success ? 'SUCCESS' : 'FAILED'}</span></li>
                <li><strong>Links Cataloged:</strong> ${totalCataloged}</li>
                <li><strong>Links Tested:</strong> ${totalTested}</li>
                <li><strong>Links Not Tested:</strong> <span class="warning">${notTested}</span></li>
                <li><strong>Working Links:</strong> <span class="success">${passedTests.length}</span></li>
                <li><strong>Broken Links:</strong> <span class="danger">${failedTests.length}</span></li>
            </ul>
        </div>

        <div class="section">
            <h2>🎯 Key Findings</h2>
            <div class="recommendations">
                <ul>
                    ${notTested > 0 ? `<li><strong>Coverage Gap:</strong> ${notTested} links (${((notTested/totalCataloged)*100).toFixed(1)}%) remain untested</li>` : ''}
                    ${failedTests.length > 0 ? `<li><strong>Broken Links:</strong> ${failedTests.length} links are not working and need attention</li>` : ''}
                    ${totalTested === 0 ? '<li><strong>No Testing:</strong> No links have been tested yet</li>' : ''}
                    <li><strong>Advanced Features:</strong> ${this.results.summary?.advanced?.shadowDom || 0} Shadow DOM elements, ${this.results.summary?.advanced?.iframes || 0} iframes detected</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h2>📄 Generated Reports</h2>
            <div class="file-list">
                <h4>Excel-Ready CSV Files:</h4>
                <ul>
                    <li>📊 01_Summary_Dashboard_${this.timestamp}.csv</li>
                    <li>🔗 02_All_Links_Catalog_${this.timestamp}.csv</li>
                    <li>🧭 03_Menu_Navigation_${this.timestamp}.csv</li>
                    <li>🚨 04_Broken_Links_Details_${this.timestamp}.csv</li>
                    <li>🧪 05_Test_Results_${this.timestamp}.csv</li>
                    <li>💡 06_Recommendations_${this.timestamp}.csv</li>
                </ul>
                <h4>Excel Workbook:</h4>
                <ul>
                    <li>📋 BrokenLinks_Testing_Report_${this.timestamp}.xlsx</li>
                </ul>
                <h4>Import Guide:</h4>
                <ul>
                    <li>📋 00_Master_Import_Guide_${this.timestamp}.csv</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h2>🚀 Next Steps</h2>
            <div class="recommendations">
                <ol>
                    ${notTested > 0 ? `<li><strong>Run Comprehensive Testing:</strong> Test the remaining ${notTested} catalogued links</li>` : ''}
                    ${failedTests.length > 0 ? `<li><strong>Fix Broken Links:</strong> Address the ${failedTests.length} identified broken links</li>` : ''}
                    <li><strong>Implement Monitoring:</strong> Set up automated link checking</li>
                    <li><strong>Add Test Identifiers:</strong> Improve element identification for testing</li>
                    <li><strong>Regular Validation:</strong> Schedule periodic link validation</li>
                </ol>
            </div>
        </div>

        <div class="section">
            <h2>ℹ️ Framework Information</h2>
            <p>This report was generated by the Universal QA Automation Framework - a generic, application-agnostic testing solution that works with any web application. All reports are timestamped to preserve test history and enable comparison across multiple test runs.</p>
        </div>
    </div>
</body>
</html>`;
    }

    // Helper methods
    determineLinkType(link) {
        if (!link.href) return 'Unknown';
        if (link.href.startsWith('#')) return 'Anchor';
        if (link.href.startsWith('javascript:')) return 'JavaScript';
        if (link.href.startsWith('mailto:')) return 'Email';
        if (link.href.startsWith('tel:')) return 'Phone';
        if (this.isInternalLink(link.href)) return 'Internal';
        return 'External';
    }

    isInternalLink(href) {
        if (!href) return false;
        return !href.startsWith('http') || href.includes('localhost') || href.includes('127.0.0.1');
    }

    extractURLFragment(href) {
        if (!href) return '';
        const hashIndex = href.indexOf('#');
        return hashIndex !== -1 ? href.substring(hashIndex + 1) : '';
    }

    categorizeByFunction(text, href) {
        const combined = ((text || '') + ' ' + (href || '')).toLowerCase();
        if (combined.includes('payroll') || combined.includes('pay')) return 'Payroll';
        if (combined.includes('hr') || combined.includes('human') || combined.includes('employee')) return 'Human Resources';
        if (combined.includes('report') || combined.includes('analytics')) return 'Reports';
        if (combined.includes('company') || combined.includes('settings')) return 'Settings';
        if (combined.includes('tax')) return 'Tax';
        if (combined.includes('time')) return 'Time Management';
        if (combined.includes('billing') || combined.includes('invoice')) return 'Billing';
        if (combined.includes('help') || combined.includes('support')) return 'Support';
        if (combined.includes('dashboard') || combined.includes('home')) return 'Dashboard';
        return 'Other';
    }

    categorizeNavigationByFunction(text) {
        return this.categorizeByFunction(text, '');
    }

    generateNavigationPath(nav) {
        return nav.href || nav.url || nav.text || 'Unknown Path';
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

    determinePriority(href) {
        if (!href) return 'Low';
        const url = href.toLowerCase();
        if (url.includes('home') || url.includes('dashboard')) return 'High';
        if (url.includes('payroll') || url.includes('main')) return 'High';
        if (url.includes('report') || url.includes('settings')) return 'Medium';
        return 'Low';
    }

    generateBrokenLinksByCategory(failedTests) {
        const categories = {};
        failedTests.forEach(test => {
            const category = this.categorizeByFunction(test.link.text, test.link.href);
            if (!categories[category]) {
                categories[category] = { count: 0, severity: 'LOW' };
            }
            categories[category].count++;
            const errorSeverity = this.determineSeverity(test.error);
            if (errorSeverity === 'HIGH') categories[category].severity = 'HIGH';
            else if (errorSeverity === 'MEDIUM' && categories[category].severity !== 'HIGH') {
                categories[category].severity = 'MEDIUM';
            }
        });
        
        return Object.entries(categories).map(([category, data]) => [
            category,
            data.count,
            data.severity,
            data.severity === 'HIGH' ? 'Immediate Fix Required' : 'Monitor and Fix'
        ]);
    }

    displayGeneratedReports() {
        console.log('\n📊 TIMESTAMPED REPORTS GENERATED');
        console.log('=================================');
        console.log(`🕒 Timestamp: ${this.timestamp}`);
        console.log(`📁 Location: ${this.outputDir}`);
        console.log('');
        console.log('📄 Generated Files:');
        console.log(`   📋 00_Master_Import_Guide_${this.timestamp}.csv`);
        console.log(`   📊 01_Summary_Dashboard_${this.timestamp}.csv`);
        console.log(`   🔗 02_All_Links_Catalog_${this.timestamp}.csv`);
        console.log(`   🧭 03_Menu_Navigation_${this.timestamp}.csv`);
        console.log(`   🚨 04_Broken_Links_Details_${this.timestamp}.csv`);
        console.log(`   🧪 05_Test_Results_${this.timestamp}.csv`);
        console.log(`   💡 06_Recommendations_${this.timestamp}.csv`);
        console.log(`   📋 BrokenLinks_Testing_Report_${this.timestamp}.xlsx`);
        console.log(`   📄 Comprehensive_Test_Report_${this.timestamp}.html`);
        console.log('');
        console.log('🎯 Benefits:');
        console.log('   ✅ All reports timestamped - no overwrites');
        console.log('   ✅ Generic framework - works with any application');
        console.log('   ✅ Complete test history preserved');
        console.log('   ✅ Easy comparison between test runs');
        console.log('   ✅ Stakeholder-ready Excel format');
        console.log('');
        console.log('🔄 Framework Usage:');
        console.log('   • Run multiple times to build test history');
        console.log('   • Compare results across different timestamps');
        console.log('   • Use with any web application for link testing');
        console.log('   • Preserve all test runs for trend analysis');
    }
}

// CLI interface
async function main() {
    const resultsPath = process.argv[2] || path.join(__dirname, '..', 'reports', 'real-adp-test-results.json');
    const outputDir = process.argv[3] || path.join(__dirname, '..', 'reports');
    
    try {
        const generator = new GenericTimestampedReportGenerator(resultsPath, outputDir);
        await generator.generateAllReports();
    } catch (error) {
        console.error('❌ Generic timestamped report generation failed:', error.message);
        process.exit(1);
    }
}

module.exports = { GenericTimestampedReportGenerator };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
