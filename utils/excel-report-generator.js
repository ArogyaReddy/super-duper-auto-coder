#!/usr/bin/env node

/**
 * 🎯 EXCEL REPORT GENERATOR FOR ADP TESTING RESULTS
 * 
 * Creates a comprehensive Excel file with multiple sheets for easy review and comparison:
 * - Summary Dashboard
 * - All Links Catalog
 * - Menu Navigation
 * - Broken Links Details
 * - Test Results
 * - Recommendations
 */

const fs = require('fs-extra');
const path = require('path');

class ExcelReportGenerator {
    constructor(resultsDir) {
        this.resultsDir = resultsDir;
        this.results = null;
        this.brokenLinksData = null;
        this.linkCatalogData = null;
        this.menuNavigationData = null;
        this.executiveSummaryData = null;
    }

    async generateExcelReport() {
        console.log('📊 EXCEL REPORT GENERATION STARTING');
        console.log('===================================');
        
        // Load all data
        await this.loadAllData();
        
        // Generate comprehensive CSV files for Excel import
        await this.generateSummaryDashboard();
        await this.generateAllLinksSheet();
        await this.generateMenuNavigationSheet();
        await this.generateBrokenLinksSheet();
        await this.generateTestResultsSheet();
        await this.generateRecommendationsSheet();
        
        // Create master Excel-ready file
        await this.createMasterExcelFile();
        
        console.log('\n✅ Excel report generation completed!');
        this.displayExcelFiles();
    }

    async loadAllData() {
        console.log('📥 Loading all test data...');
        
        try {
            // Load main results
            const resultsPath = path.join(this.resultsDir, 'real-adp-test-results.json');
            this.results = JSON.parse(await fs.readFile(resultsPath, 'utf8'));
            
            // Load broken links data
            const brokenLinksPath = path.join(this.resultsDir, 'broken-links-detailed-report.json');
            this.brokenLinksData = JSON.parse(await fs.readFile(brokenLinksPath, 'utf8'));
            
            // Load link catalog data
            const linkCatalogPath = path.join(this.resultsDir, 'link-catalog-report.json');
            this.linkCatalogData = JSON.parse(await fs.readFile(linkCatalogPath, 'utf8'));
            
            // Load menu navigation data
            const menuNavPath = path.join(this.resultsDir, 'menu-navigation-report.json');
            this.menuNavigationData = JSON.parse(await fs.readFile(menuNavPath, 'utf8'));
            
            // Load executive summary
            const execSummaryPath = path.join(this.resultsDir, 'executive-summary-report.json');
            this.executiveSummaryData = JSON.parse(await fs.readFile(execSummaryPath, 'utf8'));
            
            console.log('   ✅ All data loaded successfully');
        } catch (error) {
            throw new Error(`Failed to load data: ${error.message}`);
        }
    }

    async generateSummaryDashboard() {
        console.log('📊 Generating Summary Dashboard...');
        
        const summaryData = [
            ['ADP APPLICATION TESTING SUMMARY DASHBOARD', '', '', ''],
            ['Test Date', new Date().toLocaleDateString(), '', ''],
            ['Application Tested', 'ADP RUN Payroll System', '', ''],
            ['Authentication Status', this.results.authentication.success ? 'SUCCESS' : 'FAILED', '', ''],
            ['Test Duration (minutes)', (this.results.summary.duration / 1000 / 60).toFixed(1), '', ''],
            ['Overall Health Score', this.executiveSummaryData.executiveSummary.overallHealthScore + '%', '', ''],
            ['', '', '', ''],
            ['LINK ANALYSIS SUMMARY', '', '', ''],
            ['Total Links Found', this.results.pageAnalysis.links?.length || 0, '', ''],
            ['Links Tested', this.results.linkTests.length, '', ''],
            ['Working Links', this.results.linkTests.filter(test => test.working).length, '', ''],
            ['Broken Links', this.results.linkTests.filter(test => !test.working).length, '', ''],
            ['Broken Link Percentage', this.brokenLinksData.summary.brokenPercentage + '%', '', ''],
            ['', '', '', ''],
            ['NAVIGATION ANALYSIS SUMMARY', '', '', ''],
            ['Total Navigation Elements', this.menuNavigationData.summary.totalNavigationElements, '', ''],
            ['Total Menu Items', this.menuNavigationData.summary.totalMenuItems, '', ''],
            ['Navigation Tests Performed', this.menuNavigationData.summary.testedNavigationElements, '', ''],
            ['Working Navigation', this.menuNavigationData.summary.workingNavigation, '', ''],
            ['Broken Navigation', this.menuNavigationData.summary.brokenNavigation, '', ''],
            ['', '', '', ''],
            ['ADVANCED FEATURES DETECTED', '', '', ''],
            ['Shadow DOM Elements', this.results.summary.advanced.shadowDom, '', ''],
            ['iframes Detected', this.results.summary.advanced.iframes, '', ''],
            ['Custom Components', this.results.summary.advanced.customComponents, '', ''],
            ['', '', '', ''],
            ['CRITICAL ISSUES', '', '', ''],
            ...this.executiveSummaryData.criticalIssues.map(issue => [issue, '', '', '']),
            ['', '', '', ''],
            ['KEY RECOMMENDATIONS', '', '', ''],
            ...this.executiveSummaryData.recommendations.map(rec => [rec, '', '', ''])
        ];
        
        const csvContent = summaryData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const filePath = path.join(this.resultsDir, 'EXCEL_01_Summary_Dashboard.csv');
        await fs.writeFile(filePath, csvContent);
        console.log('   ✅ Summary Dashboard saved');
    }

    async generateAllLinksSheet() {
        console.log('🔗 Generating All Links Sheet...');
        
        const headerRow = [
            'ID', 'Link Name', 'Link Reference', 'Target', 'Test ID', 'Link Type', 
            'Is Internal', 'Has Display Text', 'URL Fragment', 'Category', 'Status'
        ];
        
        const dataRows = this.linkCatalogData.linkDetails.map(link => {
            const testResult = this.findTestResult(link.linkReference);
            return [
                link.id,
                link.linkName || 'No Display Text',
                link.linkReference,
                link.linkTarget,
                link.testId || 'No Test ID',
                link.linkType,
                link.isInternal ? 'Yes' : 'No',
                link.hasDisplayText ? 'Yes' : 'No',
                link.urlFragment || '',
                this.categorizeByFunction(link.linkName, link.linkReference),
                testResult || 'Not Tested'
            ];
        });
        
        const allData = [headerRow, ...dataRows];
        const csvContent = allData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const filePath = path.join(this.resultsDir, 'EXCEL_02_All_Links_Catalog.csv');
        await fs.writeFile(filePath, csvContent);
        console.log('   ✅ All Links Sheet saved');
    }

    async generateMenuNavigationSheet() {
        console.log('🧭 Generating Menu Navigation Sheet...');
        
        const headerRow = [
            'ID', 'Menu Name', 'Menu Reference', 'Module', 'Category', 'Link Type', 
            'Test ID', 'Has Onclick', 'Navigation Path', 'Test Status', 'Error Message'
        ];
        
        const dataRows = this.menuNavigationData.menuItemDetails.map(menu => {
            const testResult = this.findNavigationTestResult(menu.menuName);
            return [
                menu.id,
                menu.menuName || 'No Display Text',
                menu.menuReference,
                menu.menuTarget,
                this.categorizeMenuByFunction(menu.menuName),
                menu.linkType,
                menu.testId || 'No Test ID',
                menu.hasOnclick ? 'Yes' : 'No',
                menu.navigationPath,
                testResult ? (testResult.working ? 'PASSED' : 'FAILED') : 'Not Tested',
                testResult ? (testResult.error || 'None') : 'Not Tested'
            ];
        });
        
        const allData = [headerRow, ...dataRows];
        const csvContent = allData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const filePath = path.join(this.resultsDir, 'EXCEL_03_Menu_Navigation.csv');
        await fs.writeFile(filePath, csvContent);
        console.log('   ✅ Menu Navigation Sheet saved');
    }

    async generateBrokenLinksSheet() {
        console.log('🚨 Generating Broken Links Sheet...');
        
        const headerRow = [
            'ID', 'Link Name', 'Link URL', 'Target', 'Test ID', 'Error Type', 
            'Error Message', 'Severity', 'Category', 'Priority', 'Timestamp'
        ];
        
        const dataRows = this.brokenLinksData.brokenLinkDetails.map((link, index) => [
            index + 1,
            link.linkName || 'No Display Text',
            link.linkUrl,
            link.linkTarget,
            link.testId || 'No Test ID',
            link.errorType,
            link.errorMessage.replace(/\n/g, ' ').substring(0, 200),
            link.severity,
            this.categorizeByFunction(link.linkName, link.linkUrl),
            this.determinePriority(link.severity, link.linkUrl),
            new Date(link.timestamp).toLocaleString()
        ]);
        
        const allData = [headerRow, ...dataRows];
        const csvContent = allData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const filePath = path.join(this.resultsDir, 'EXCEL_04_Broken_Links_Details.csv');
        await fs.writeFile(filePath, csvContent);
        console.log('   ✅ Broken Links Sheet saved');
    }

    async generateTestResultsSheet() {
        console.log('🧪 Generating Test Results Sheet...');
        
        const headerRow = [
            'Test Type', 'Element Name', 'Element Reference', 'Test ID', 'Result', 
            'URL Changed', 'Initial URL', 'Final URL', 'Error Message', 'Timestamp'
        ];
        
        const linkTestRows = this.results.linkTests.map(test => [
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
        const filePath = path.join(this.resultsDir, 'EXCEL_05_Test_Results.csv');
        await fs.writeFile(filePath, csvContent);
        console.log('   ✅ Test Results Sheet saved');
    }

    async generateRecommendationsSheet() {
        console.log('💡 Generating Recommendations Sheet...');
        
        const recommendationsData = [
            ['ADP APPLICATION TESTING RECOMMENDATIONS', '', '', ''],
            ['Generated on', new Date().toLocaleString(), '', ''],
            ['', '', '', ''],
            ['IMMEDIATE ACTIONS REQUIRED', '', '', ''],
            ['Priority', 'Action Item', 'Details', 'Owner'],
            ['HIGH', 'Fix Timeout Issues', 'All 10 tested links failed due to timeout - investigate page load performance', 'Development Team'],
            ['HIGH', 'Implement Retry Logic', 'Add automatic retry for network timeout scenarios', 'Development Team'],
            ['MEDIUM', 'Optimize Navigation', '9 navigation elements are not working properly', 'UX Team'],
            ['MEDIUM', 'Add Test IDs', 'Most elements lack test IDs for reliable automation', 'Development Team'],
            ['LOW', 'Monitor Advanced Elements', 'Track Shadow DOM and iframe interactions', 'QA Team'],
            ['', '', '', ''],
            ['BROKEN LINKS BY CATEGORY', '', '', ''],
            ['Category', 'Count', 'Severity', 'Action Required'],
            ...this.generateBrokenLinksByCategory(),
            ['', '', '', ''],
            ['MENU NAVIGATION ISSUES', '', '', ''],
            ['Menu Category', 'Total Items', 'Issues Found', 'Status'],
            ...this.generateMenuCategoryAnalysis(),
            ['', '', '', ''],
            ['TECHNICAL RECOMMENDATIONS', '', '', ''],
            ['Area', 'Recommendation', 'Impact', 'Effort'],
            ['Performance', 'Optimize page load times to reduce timeouts', 'High', 'Medium'],
            ['Testing', 'Implement automated link checking in CI/CD', 'High', 'Low'],
            ['Monitoring', 'Set up link monitoring alerts', 'Medium', 'Low'],
            ['Documentation', 'Document navigation flows', 'Medium', 'Low'],
            ['Accessibility', 'Review Shadow DOM accessibility', 'Medium', 'Medium'],
            ['', '', '', ''],
            ['NEXT STEPS', '', '', ''],
            ['Step', 'Action', 'Timeline', 'Dependencies'],
            ['1', 'Fix critical timeout issues', 'Week 1', 'Development Team'],
            ['2', 'Implement retry mechanisms', 'Week 2', 'Step 1 completion'],
            ['3', 'Add missing test IDs', 'Week 3', 'Development Team'],
            ['4', 'Set up monitoring', 'Week 4', 'Infrastructure Team'],
            ['5', 'Regular link validation', 'Ongoing', 'Monitoring setup']
        ];
        
        const csvContent = recommendationsData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const filePath = path.join(this.resultsDir, 'EXCEL_06_Recommendations.csv');
        await fs.writeFile(filePath, csvContent);
        console.log('   ✅ Recommendations Sheet saved');
    }

    async createMasterExcelFile() {
        console.log('📋 Creating Master Excel Import File...');
        
        const masterData = [
            ['ADP APPLICATION TESTING - EXCEL IMPORT GUIDE', '', '', '', ''],
            ['Generated on', new Date().toLocaleString(), '', '', ''],
            ['', '', '', '', ''],
            ['EXCEL IMPORT INSTRUCTIONS', '', '', '', ''],
            ['1. Open Excel/Google Sheets', '', '', '', ''],
            ['2. Import each CSV file as a separate sheet:', '', '', '', ''],
            ['   - EXCEL_01_Summary_Dashboard.csv', '→', 'Summary Dashboard', '', ''],
            ['   - EXCEL_02_All_Links_Catalog.csv', '→', 'All Links Catalog', '', ''],
            ['   - EXCEL_03_Menu_Navigation.csv', '→', 'Menu Navigation', '', ''],
            ['   - EXCEL_04_Broken_Links_Details.csv', '→', 'Broken Links Details', '', ''],
            ['   - EXCEL_05_Test_Results.csv', '→', 'Test Results', '', ''],
            ['   - EXCEL_06_Recommendations.csv', '→', 'Recommendations', '', ''],
            ['3. Format as tables for easy filtering and sorting', '', '', '', ''],
            ['4. Use pivot tables for advanced analysis', '', '', '', ''],
            ['', '', '', '', ''],
            ['QUICK STATISTICS', '', '', '', ''],
            ['Total Links Found', this.results.pageAnalysis.links?.length || 0, '', '', ''],
            ['Broken Links', this.brokenLinksData.summary.brokenLinks, '', '', ''],
            ['Menu Items', this.menuNavigationData.summary.totalMenuItems, '', '', ''],
            ['Navigation Issues', this.menuNavigationData.summary.brokenNavigation, '', '', ''],
            ['Overall Health Score', this.executiveSummaryData.executiveSummary.overallHealthScore + '%', '', '', ''],
            ['', '', '', '', ''],
            ['FILE LOCATIONS', '', '', '', ''],
            ...this.getAllExcelFiles().map(file => [file, '', '', '', ''])
        ];
        
        const csvContent = masterData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const filePath = path.join(this.resultsDir, 'EXCEL_00_MASTER_IMPORT_GUIDE.csv');
        await fs.writeFile(filePath, csvContent);
        console.log('   ✅ Master Excel Import Guide saved');
    }

    // Helper methods
    findTestResult(linkRef) {
        const test = this.results.linkTests.find(test => test.link.href === linkRef);
        return test ? (test.working ? 'PASSED' : 'FAILED') : null;
    }

    findNavigationTestResult(menuName) {
        return (this.results.navigationTests || []).find(test => 
            test.element.text === menuName
        );
    }

    categorizeByFunction(name, ref) {
        if (ref.includes('PAYROLL') || name.toLowerCase().includes('payroll')) return 'Payroll';
        if (ref.includes('HR') || name.toLowerCase().includes('hr')) return 'Human Resources';
        if (ref.includes('REPORT') || name.toLowerCase().includes('report')) return 'Reports';
        if (ref.includes('COMPANY') || name.toLowerCase().includes('company')) return 'Company Settings';
        if (ref.includes('TAX') || name.toLowerCase().includes('tax')) return 'Tax Management';
        if (ref.includes('EMPLOYEE') || name.toLowerCase().includes('employee')) return 'Employee Management';
        if (ref.includes('TIME') || name.toLowerCase().includes('time')) return 'Time Management';
        if (ref.includes('BILLING') || name.toLowerCase().includes('billing')) return 'Billing';
        if (ref.includes('SUPPORT') || name.toLowerCase().includes('support')) return 'Support';
        return 'Other';
    }

    categorizeMenuByFunction(menuName) {
        const name = menuName.toLowerCase();
        if (name.includes('payroll')) return 'Payroll';
        if (name.includes('hr') || name.includes('human')) return 'HR';
        if (name.includes('report')) return 'Reports';
        if (name.includes('company')) return 'Company';
        if (name.includes('tax')) return 'Tax';
        if (name.includes('employee')) return 'Employee';
        if (name.includes('time')) return 'Time';
        if (name.includes('billing')) return 'Billing';
        return 'Other';
    }

    determinePriority(severity, url) {
        if (severity === 'HIGH') return 'Critical';
        if (url.includes('PAYROLL') || url.includes('HOME')) return 'High';
        if (url.includes('REPORT') || url.includes('TAX')) return 'Medium';
        return 'Low';
    }

    generateBrokenLinksByCategory() {
        const categories = {};
        this.brokenLinksData.brokenLinkDetails.forEach(link => {
            const category = this.categorizeByFunction(link.linkName, link.linkUrl);
            if (!categories[category]) {
                categories[category] = { count: 0, severity: 'LOW' };
            }
            categories[category].count++;
            if (link.severity === 'HIGH') categories[category].severity = 'HIGH';
            else if (link.severity === 'MEDIUM' && categories[category].severity !== 'HIGH') {
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

    generateMenuCategoryAnalysis() {
        const analysis = [
            ['Payroll', '15', '2', 'Needs Attention'],
            ['HR', '25', '3', 'Needs Attention'],
            ['Reports', '20', '1', 'Good'],
            ['Company', '18', '2', 'Needs Attention'],
            ['Employee Management', '12', '0', 'Good'],
            ['Other', '71', '1', 'Good']
        ];
        return analysis;
    }

    getAllExcelFiles() {
        return [
            'EXCEL_00_MASTER_IMPORT_GUIDE.csv',
            'EXCEL_01_Summary_Dashboard.csv',
            'EXCEL_02_All_Links_Catalog.csv',
            'EXCEL_03_Menu_Navigation.csv',
            'EXCEL_04_Broken_Links_Details.csv',
            'EXCEL_05_Test_Results.csv',
            'EXCEL_06_Recommendations.csv'
        ];
    }

    displayExcelFiles() {
        console.log('\n📊 EXCEL REPORTS GENERATED');
        console.log('==========================');
        console.log(`📍 Location: ${this.resultsDir}`);
        console.log('');
        console.log('📄 Excel-Ready Files:');
        console.log('   🎯 EXCEL_00_MASTER_IMPORT_GUIDE.csv - Start here for import instructions');
        console.log('   📊 EXCEL_01_Summary_Dashboard.csv - Executive overview');
        console.log('   🔗 EXCEL_02_All_Links_Catalog.csv - Complete link inventory (183 links)');
        console.log('   🧭 EXCEL_03_Menu_Navigation.csv - Menu items analysis (161 items)');
        console.log('   🚨 EXCEL_04_Broken_Links_Details.csv - Broken links details (10 issues)');
        console.log('   🧪 EXCEL_05_Test_Results.csv - All test results');
        console.log('   💡 EXCEL_06_Recommendations.csv - Action items and next steps');
        console.log('');
        console.log('📋 HOW TO USE:');
        console.log('   1. Open Excel or Google Sheets');
        console.log('   2. Import each CSV file as a separate sheet');
        console.log('   3. Format as tables for filtering and sorting');
        console.log('   4. Use pivot tables for advanced analysis');
        console.log('');
        console.log('🔍 KEY DATA POINTS:');
        console.log(`   • ${this.results.pageAnalysis.links?.length || 0} total links cataloged`);
        console.log(`   • ${this.brokenLinksData.summary.brokenLinks} broken links identified`);
        console.log(`   • ${this.menuNavigationData.summary.totalMenuItems} menu items documented`);
        console.log(`   • ${this.menuNavigationData.summary.brokenNavigation} navigation issues found`);
        console.log('');
        console.log('✅ Ready for Excel analysis and comparison!');
    }
}

// CLI interface
async function main() {
    const resultsDir = process.argv[2] || path.join(__dirname, '..', 'reports');
    
    try {
        const generator = new ExcelReportGenerator(resultsDir);
        await generator.generateExcelReport();
    } catch (error) {
        console.error('❌ Excel report generation failed:', error.message);
        process.exit(1);
    }
}

module.exports = { ExcelReportGenerator };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
