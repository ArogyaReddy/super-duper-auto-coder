#!/usr/bin/env node

/**
 * 🎯 ENHANCED ADP TESTING REPORT GENERATOR
 * 
 * Addresses all user requirements:
 * 1. ✅ Report location and access
 * 2. ✅ Broken links detection and detailed analysis
 * 3. ✅ Link name and reference capture
 * 4. ✅ Menu name and navigation reference capture
 */

const fs = require('fs-extra');
const path = require('path');

class EnhancedReportGenerator {
    constructor(jsonResultsPath) {
        this.jsonResultsPath = jsonResultsPath;
        this.results = null;
        this.reportDir = path.dirname(jsonResultsPath);
    }

    async generateEnhancedReports() {
        console.log('🎯 ENHANCED REPORT GENERATION STARTING');
        console.log('=====================================');
        
        // Load test results
        await this.loadResults();
        
        // Generate all reports
        await this.generateBrokenLinksReport();
        await this.generateLinkCatalogReport();
        await this.generateMenuNavigationReport();
        await this.generateComprehensiveHTMLReport();
        await this.generateExecutiveSummaryReport();
        
        // Display report locations
        this.displayReportLocations();
        
        console.log('\n✅ Enhanced reports generation completed!');
    }

    async loadResults() {
        console.log('📊 Loading test results...');
        try {
            const data = await fs.readFile(this.jsonResultsPath, 'utf8');
            this.results = JSON.parse(data);
            console.log('   ✅ Results loaded successfully');
        } catch (error) {
            throw new Error(`Failed to load results: ${error.message}`);
        }
    }

    async generateBrokenLinksReport() {
        console.log('🔗 Generating broken links report...');
        
        const brokenLinks = this.results.linkTests.filter(test => !test.working);
        const workingLinks = this.results.linkTests.filter(test => test.working);
        
        const report = {
            summary: {
                totalLinks: this.results.linkTests.length,
                brokenLinks: brokenLinks.length,
                workingLinks: workingLinks.length,
                brokenPercentage: ((brokenLinks.length / this.results.linkTests.length) * 100).toFixed(1),
                testTimestamp: this.results.summary.timestamp
            },
            brokenLinkDetails: brokenLinks.map(link => ({
                linkName: link.link.text || 'No Display Text',
                linkUrl: link.link.href,
                linkTarget: link.link.target,
                testId: link.link.testId || 'No Test ID',
                errorType: this.categorizeError(link.error),
                errorMessage: link.error,
                timestamp: link.timestamp,
                severity: this.determineSeverity(link.link.href, link.error)
            })),
            workingLinkDetails: workingLinks.map(link => ({
                linkName: link.link.text || 'No Display Text',
                linkUrl: link.link.href,
                linkTarget: link.link.target,
                testId: link.link.testId || 'No Test ID',
                responseStatus: link.status,
                responseTime: link.responseTime,
                timestamp: link.timestamp
            })),
            linkCategories: this.categorizeLinks(),
            recommendations: this.generateLinkRecommendations(brokenLinks)
        };
        
        // Save detailed broken links report
        const filePath = path.join(this.reportDir, 'broken-links-detailed-report.json');
        await fs.writeFile(filePath, JSON.stringify(report, null, 2));
        
        // Generate CSV for easy analysis
        await this.generateBrokenLinksCSV(report);
        
        console.log(`   ✅ Broken links report saved: ${filePath}`);
        console.log(`   📊 Found ${brokenLinks.length} broken links out of ${this.results.linkTests.length} total`);
    }

    async generateBrokenLinksCSV(report) {
        const csvData = [
            ['Link Name', 'Link URL', 'Target', 'Test ID', 'Error Type', 'Error Message', 'Severity', 'Timestamp']
        ];
        
        report.brokenLinkDetails.forEach(link => {
            csvData.push([
                link.linkName,
                link.linkUrl,
                link.linkTarget,
                link.testId,
                link.errorType,
                link.errorMessage.replace(/\n/g, ' ').substring(0, 100),
                link.severity,
                link.timestamp
            ]);
        });
        
        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const csvPath = path.join(this.reportDir, 'broken-links-report.csv');
        await fs.writeFile(csvPath, csvContent);
        console.log(`   📊 CSV report saved: ${csvPath}`);
    }

    async generateLinkCatalogReport() {
        console.log('📋 Generating link catalog report...');
        
        const allLinks = this.results.pageAnalysis.links || [];
        
        const linkCatalog = {
            summary: {
                totalLinksFound: allLinks.length,
                uniqueUrls: [...new Set(allLinks.map(link => link.href))].length,
                linksWithText: allLinks.filter(link => link.text && link.text.trim()).length,
                linksWithTestIds: allLinks.filter(link => link.testId).length,
                internalLinks: allLinks.filter(link => this.isInternalLink(link.href)).length,
                externalLinks: allLinks.filter(link => !this.isInternalLink(link.href)).length
            },
            linkDetails: allLinks.map((link, index) => ({
                id: index + 1,
                linkName: link.text || 'No Display Text',
                linkReference: link.href,
                linkTarget: link.target || '_self',
                testId: link.testId || 'No Test ID',
                linkType: this.classifyLinkType(link.href),
                isInternal: this.isInternalLink(link.href),
                hasDisplayText: !!(link.text && link.text.trim()),
                hasTestId: !!link.testId,
                urlFragment: this.extractUrlFragment(link.href)
            })),
            linksByType: this.groupLinksByType(allLinks),
            linksByTarget: this.groupLinksByTarget(allLinks),
            internalNavigation: this.extractInternalNavigation(allLinks)
        };
        
        const filePath = path.join(this.reportDir, 'link-catalog-report.json');
        await fs.writeFile(filePath, JSON.stringify(linkCatalog, null, 2));
        
        // Generate CSV for link catalog
        await this.generateLinkCatalogCSV(linkCatalog);
        
        console.log(`   ✅ Link catalog saved: ${filePath}`);
        console.log(`   📊 Cataloged ${allLinks.length} links with detailed metadata`);
    }

    async generateLinkCatalogCSV(catalog) {
        const csvData = [
            ['ID', 'Link Name', 'Link Reference', 'Target', 'Test ID', 'Link Type', 'Is Internal', 'Has Display Text', 'URL Fragment']
        ];
        
        catalog.linkDetails.forEach(link => {
            csvData.push([
                link.id,
                link.linkName,
                link.linkReference,
                link.linkTarget,
                link.testId,
                link.linkType,
                link.isInternal ? 'Yes' : 'No',
                link.hasDisplayText ? 'Yes' : 'No',
                link.urlFragment || ''
            ]);
        });
        
        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const csvPath = path.join(this.reportDir, 'link-catalog.csv');
        await fs.writeFile(csvPath, csvContent);
        console.log(`   📊 Link catalog CSV saved: ${csvPath}`);
    }

    async generateMenuNavigationReport() {
        console.log('🧭 Generating menu navigation report...');
        
        const navigationElements = this.results.pageAnalysis.navigationElements || [];
        const interactiveElements = this.results.pageAnalysis.interactiveElements || [];
        const navigationTests = this.results.navigationTests || [];
        
        // Extract menu items and navigation references
        const menuItems = interactiveElements.filter(el => 
            el.type === 'a' && 
            el.href && 
            (el.href.includes('#xfm-') || el.text.includes('Home') || el.text.includes('Payroll') || el.text.includes('HR'))
        );
        
        const navigationReport = {
            summary: {
                totalNavigationElements: navigationElements.length,
                totalMenuItems: menuItems.length,
                testedNavigationElements: navigationTests.length,
                workingNavigation: navigationTests.filter(test => test.working).length,
                brokenNavigation: navigationTests.filter(test => !test.working).length
            },
            navigationElementDetails: navigationElements.map((nav, index) => ({
                id: index + 1,
                elementType: 'Navigation Container',
                selector: nav.selector,
                menuName: nav.text || 'No Text Content',
                className: nav.className || 'No Class',
                elementId: nav.id || 'No ID',
                testId: nav.testId || 'No Test ID'
            })),
            menuItemDetails: menuItems.map((item, index) => ({
                id: index + 1,
                menuName: item.text || 'No Display Text',
                menuReference: item.href,
                menuTarget: item.href.includes('#xfm-') ? this.extractXfmModule(item.href) : 'Unknown',
                linkType: item.type,
                selector: item.selector,
                testId: item.testId || 'No Test ID',
                hasOnclick: item.onclick || false,
                navigationPath: this.buildNavigationPath(item.text, item.href)
            })),
            navigationTestResults: navigationTests.map(test => ({
                elementTested: test.element.text || 'No Text',
                testId: test.element.testId || 'No Test ID',
                elementType: test.element.type,
                testResult: test.working ? 'PASSED' : 'FAILED',
                urlChanged: test.urlChanged || false,
                initialUrl: test.initialUrl,
                finalUrl: test.finalUrl,
                errorMessage: test.error || 'No Error',
                timestamp: test.timestamp
            })),
            menuCategories: this.categorizeMenuItems(menuItems),
            navigationFlow: this.buildNavigationFlow(menuItems)
        };
        
        const filePath = path.join(this.reportDir, 'menu-navigation-report.json');
        await fs.writeFile(filePath, JSON.stringify(navigationReport, null, 2));
        
        // Generate CSV for menu navigation
        await this.generateMenuNavigationCSV(navigationReport);
        
        console.log(`   ✅ Menu navigation report saved: ${filePath}`);
        console.log(`   🧭 Documented ${menuItems.length} menu items and ${navigationElements.length} navigation elements`);
    }

    async generateMenuNavigationCSV(report) {
        const csvData = [
            ['ID', 'Menu Name', 'Menu Reference', 'Menu Target', 'Link Type', 'Test ID', 'Has Onclick', 'Navigation Path']
        ];
        
        report.menuItemDetails.forEach(menu => {
            csvData.push([
                menu.id,
                menu.menuName,
                menu.menuReference,
                menu.menuTarget,
                menu.linkType,
                menu.testId,
                menu.hasOnclick ? 'Yes' : 'No',
                menu.navigationPath
            ]);
        });
        
        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const csvPath = path.join(this.reportDir, 'menu-navigation-catalog.csv');
        await fs.writeFile(csvPath, csvContent);
        console.log(`   📊 Menu navigation CSV saved: ${csvPath}`);
    }

    async generateComprehensiveHTMLReport() {
        console.log('📄 Generating comprehensive HTML report...');
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced ADP Application Testing Report</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
            margin: 0; padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { 
            max-width: 1400px; margin: 0 auto; 
            background: white; padding: 40px; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; margin-bottom: 50px; 
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; padding: 40px; margin: -40px -40px 50px -40px;
            border-radius: 20px 20px 0 0;
        }
        .header h1 { font-size: 3.5em; margin: 0 0 10px 0; font-weight: 300; }
        .live-badge { 
            background: linear-gradient(45deg, #ff6b6b, #ee5a24); 
            padding: 12px 25px; border-radius: 25px; 
            font-size: 1.1em; font-weight: 600;
            display: inline-block; margin-top: 15px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 30px; margin: 40px 0; 
        }
        .metric-card { 
            background: linear-gradient(145deg, #f8f9fa, #e9ecef); 
            padding: 35px; border-radius: 15px; text-align: center;
            border-top: 5px solid #667eea;
            transition: transform 0.3s ease;
        }
        .metric-card:hover { transform: translateY(-10px); }
        .metric-value { font-size: 3.5em; font-weight: 700; margin-bottom: 10px; }
        .metric-label { font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; }
        
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #007bff; }
        
        .section { 
            margin: 50px 0; padding: 40px; 
            background: #f8f9fa; border-radius: 15px; 
            border-left: 8px solid #667eea; 
        }
        .section h2 { 
            margin-top: 0; color: #2c3e50; font-size: 2.5em; 
            border-bottom: 3px solid #667eea; padding-bottom: 15px;
        }
        
        .tabs { 
            display: flex; margin-bottom: 30px; 
            background: #e9ecef; border-radius: 10px; overflow: hidden;
        }
        .tab { 
            flex: 1; padding: 15px 20px; text-align: center; 
            background: #e9ecef; border: none; cursor: pointer;
            font-size: 16px; font-weight: 600; transition: all 0.3s;
        }
        .tab.active { background: #667eea; color: white; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        
        .data-table { 
            width: 100%; border-collapse: collapse; 
            margin: 30px 0; background: white; border-radius: 10px; overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .data-table th { 
            background: #343a40; color: white; padding: 20px 15px; 
            text-align: left; font-weight: 600; font-size: 14px;
        }
        .data-table td { 
            padding: 18px 15px; border-bottom: 1px solid #dee2e6; 
            font-size: 14px; vertical-align: top;
        }
        .data-table tbody tr:hover { background: #f8f9fa; }
        
        .status-indicator { 
            display: inline-block; width: 12px; height: 12px; 
            border-radius: 50%; margin-right: 10px; 
        }
        .status-success { background: #28a745; }
        .status-error { background: #dc3545; }
        .status-warning { background: #ffc107; }
        
        .severity-high { background: #dc3545; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; }
        .severity-medium { background: #ffc107; color: black; padding: 5px 10px; border-radius: 5px; font-size: 12px; }
        .severity-low { background: #28a745; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; }
        
        .recommendation-box { 
            background: linear-gradient(135deg, #74b9ff, #0984e3); 
            color: white; padding: 25px; border-radius: 10px; margin: 20px 0; 
        }
        .recommendation-box h4 { margin-top: 0; font-size: 1.3em; }
        
        .footer-info { 
            background: #2c3e50; color: white; padding: 30px; 
            border-radius: 15px; margin-top: 50px; text-align: center; 
        }
        
        .url-display { 
            background: #2c3e50; color: #ecf0f1; padding: 20px; 
            border-radius: 10px; font-family: 'Courier New', monospace; 
            word-break: break-all; margin: 20px 0; 
        }
        
        .chart-container { 
            background: white; padding: 20px; border-radius: 10px; 
            margin: 20px 0; text-align: center; 
        }
    </style>
    <script>
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }
        
        window.addEventListener('load', function() {
            // Show first tab by default
            document.querySelector('.tab').classList.add('active');
            document.querySelector('.tab-content').classList.add('active');
        });
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Enhanced ADP Testing Report</h1>
            <p style="font-size: 1.4em; opacity: 0.9;">Complete Link & Navigation Analysis</p>
            <div class="live-badge">LIVE AUTHENTICATION TESTING</div>
            <div class="url-display">${this.results.authentication.initialUrl}</div>
            <p style="margin: 20px 0 0 0; opacity: 0.8;">Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value success">${this.results.authentication.success ? '✅' : '❌'}</div>
                <div class="metric-label">Authentication</div>
            </div>
            <div class="metric-card">
                <div class="metric-value info">${this.results.pageAnalysis.links?.length || 0}</div>
                <div class="metric-label">Total Links Found</div>
            </div>
            <div class="metric-card">
                <div class="metric-value error">${this.results.linkTests.filter(test => !test.working).length}</div>
                <div class="metric-label">Broken Links</div>
            </div>
            <div class="metric-card">
                <div class="metric-value success">${this.results.linkTests.filter(test => test.working).length}</div>
                <div class="metric-label">Working Links</div>
            </div>
            <div class="metric-card">
                <div class="metric-value warning">${this.results.pageAnalysis.interactiveElements?.filter(el => el.type === 'a' && el.href && el.href.includes('#xfm-')).length || 0}</div>
                <div class="metric-label">Menu Items</div>
            </div>
            <div class="metric-card">
                <div class="metric-value info">${this.results.summary.advanced.shadowDom + this.results.summary.advanced.iframes}</div>
                <div class="metric-label">Advanced Elements</div>
            </div>
        </div>

        <div class="section">
            <h2>🔗 Link Analysis Details</h2>
            
            <div class="tabs">
                <button class="tab" onclick="showTab('broken-links')">Broken Links</button>
                <button class="tab" onclick="showTab('working-links')">Working Links</button>
                <button class="tab" onclick="showTab('link-catalog')">Complete Link Catalog</button>
            </div>
            
            <div id="broken-links" class="tab-content">
                <h3>🚨 Broken Links Analysis</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Link Name</th>
                            <th>Link Reference</th>
                            <th>Target</th>
                            <th>Test ID</th>
                            <th>Error Type</th>
                            <th>Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.results.linkTests.filter(test => !test.working).map(link => `
                            <tr>
                                <td><span class="status-indicator status-error"></span>${link.link.text || 'No Display Text'}</td>
                                <td style="font-family: monospace; font-size: 12px;">${link.link.href.substring(0, 50)}...</td>
                                <td>${link.link.target}</td>
                                <td>${link.link.testId || 'No Test ID'}</td>
                                <td>${this.categorizeError(link.error)}</td>
                                <td><span class="severity-${this.determineSeverity(link.link.href, link.error).toLowerCase()}">${this.determineSeverity(link.link.href, link.error)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div id="working-links" class="tab-content">
                <h3>✅ Working Links Analysis</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Link Name</th>
                            <th>Link Reference</th>
                            <th>Target</th>
                            <th>Test ID</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.results.linkTests.filter(test => test.working).map(link => `
                            <tr>
                                <td><span class="status-indicator status-success"></span>${link.link.text || 'No Display Text'}</td>
                                <td style="font-family: monospace; font-size: 12px;">${link.link.href.substring(0, 50)}...</td>
                                <td>${link.link.target}</td>
                                <td>${link.link.testId || 'No Test ID'}</td>
                                <td><span class="status-indicator status-success"></span>${link.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div id="link-catalog" class="tab-content">
                <h3>📋 Complete Link Catalog</h3>
                <p><strong>All links found on the page with detailed metadata:</strong></p>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Link Name</th>
                            <th>Link Reference</th>
                            <th>Target</th>
                            <th>Test ID</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.results.pageAnalysis.links?.slice(0, 50).map((link, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${link.text || 'No Display Text'}</td>
                                <td style="font-family: monospace; font-size: 11px; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${link.href}</td>
                                <td>${link.target || '_self'}</td>
                                <td>${link.testId || 'No Test ID'}</td>
                                <td>${this.classifyLinkType(link.href)}</td>
                            </tr>
                        `).join('')}
                        ${this.results.pageAnalysis.links?.length > 50 ? `<tr><td colspan="6" style="text-align: center; font-style: italic;">... and ${this.results.pageAnalysis.links.length - 50} more links</td></tr>` : ''}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <h2>🧭 Menu Navigation Analysis</h2>
            
            <div class="chart-container">
                <h3>Menu Items by Category</h3>
                ${this.generateMenuCategoriesHTML()}
            </div>
            
            <h3>📊 Navigation Test Results</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Menu Name</th>
                        <th>Menu Reference</th>
                        <th>Test ID</th>
                        <th>Test Result</th>
                        <th>URL Changed</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.results.navigationTests?.map(test => `
                        <tr>
                            <td><span class="status-indicator ${test.working ? 'status-success' : 'status-error'}"></span>${test.element.text || 'No Text'}</td>
                            <td style="font-family: monospace; font-size: 12px;">${test.finalUrl ? test.finalUrl.substring(test.finalUrl.lastIndexOf('/') + 1) : 'N/A'}</td>
                            <td>${test.element.testId || 'No Test ID'}</td>
                            <td><strong style="color: ${test.working ? '#28a745' : '#dc3545'}">${test.working ? 'PASSED' : 'FAILED'}</strong></td>
                            <td>${test.urlChanged ? 'Yes' : 'No'}</td>
                            <td>${test.error ? test.error.substring(0, 50) + '...' : 'None'}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="6" style="text-align: center;">No navigation tests performed</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="recommendation-box">
            <h4>🎯 Key Recommendations</h4>
            <ul>
                <li><strong>Broken Links:</strong> ${this.results.linkTests.filter(test => !test.working).length} links need attention</li>
                <li><strong>Navigation:</strong> ${this.results.navigationTests?.filter(test => !test.working).length || 0} navigation elements are not working</li>
                <li><strong>Testing:</strong> Consider implementing retry mechanisms for timeout errors</li>
                <li><strong>Monitoring:</strong> Set up automated link checking for continuous monitoring</li>
            </ul>
        </div>

        <div class="footer-info">
            <h3>📊 Report Summary</h3>
            <p><strong>Total Test Duration:</strong> ${(this.results.summary.duration / 1000).toFixed(1)} seconds</p>
            <p><strong>Authentication Method:</strong> Real Browser Automation with Playwright</p>
            <p><strong>Advanced Elements Detected:</strong> ${this.results.summary.advanced.shadowDom} Shadow DOM, ${this.results.summary.advanced.iframes} iframes, ${this.results.summary.advanced.customComponents} custom components</p>
            <p><strong>Screenshots Captured:</strong> ${this.results.summary.screenshots} images</p>
        </div>
    </div>
</body>
</html>`;
        
        const filePath = path.join(this.reportDir, 'enhanced-comprehensive-report.html');
        await fs.writeFile(filePath, html);
        console.log(`   ✅ Comprehensive HTML report saved: ${filePath}`);
    }

    async generateExecutiveSummaryReport() {
        console.log('📋 Generating executive summary...');
        
        const summary = {
            executiveSummary: {
                testDate: new Date().toISOString().split('T')[0],
                applicationTested: 'ADP RUN Payroll System',
                testDuration: `${(this.results.summary.duration / 1000 / 60).toFixed(1)} minutes`,
                authenticationStatus: this.results.authentication.success ? 'SUCCESSFUL' : 'FAILED',
                overallHealthScore: this.calculateHealthScore()
            },
            keyFindings: {
                totalLinks: this.results.pageAnalysis.links?.length || 0,
                brokenLinks: this.results.linkTests.filter(test => !test.working).length,
                workingLinks: this.results.linkTests.filter(test => test.working).length,
                navigationElements: this.results.pageAnalysis.navigationElements?.length || 0,
                menuItems: this.results.pageAnalysis.interactiveElements?.filter(el => 
                    el.type === 'a' && el.href && el.href.includes('#xfm-')).length || 0,
                advancedFeatures: {
                    shadowDomElements: this.results.summary.advanced.shadowDom,
                    iframes: this.results.summary.advanced.iframes,
                    customComponents: this.results.summary.advanced.customComponents
                }
            },
            criticalIssues: this.identifyCriticalIssues(),
            recommendations: this.generateExecutiveRecommendations(),
            nextSteps: this.generateNextSteps()
        };
        
        const filePath = path.join(this.reportDir, 'executive-summary-report.json');
        await fs.writeFile(filePath, JSON.stringify(summary, null, 2));
        console.log(`   ✅ Executive summary saved: ${filePath}`);
    }

    // Helper methods for analysis
    categorizeError(error) {
        if (error.includes('Timeout')) return 'Timeout Error';
        if (error.includes('404')) return 'Not Found';
        if (error.includes('403')) return 'Access Denied';
        if (error.includes('500')) return 'Server Error';
        if (error.includes('networkidle')) return 'Network Timeout';
        return 'Unknown Error';
    }

    determineSeverity(href, error) {
        if (error.includes('404') || error.includes('403')) return 'HIGH';
        if (error.includes('Timeout') || error.includes('networkidle')) return 'MEDIUM';
        if (href.includes('#')) return 'LOW';
        return 'MEDIUM';
    }

    categorizeLinks() {
        const links = this.results.pageAnalysis.links || [];
        return {
            internal: links.filter(link => this.isInternalLink(link.href)).length,
            external: links.filter(link => !this.isInternalLink(link.href)).length,
            anchors: links.filter(link => link.href.includes('#')).length,
            withText: links.filter(link => link.text && link.text.trim()).length,
            withTestIds: links.filter(link => link.testId).length
        };
    }

    isInternalLink(href) {
        return href.includes('runpayrollmain2-iat.adp.com') || href.startsWith('#') || href.startsWith('/');
    }

    classifyLinkType(href) {
        if (href.includes('#xfm-')) return 'Navigation Menu';
        if (href.includes('#')) return 'Anchor Link';
        if (href.includes('http')) return 'External Link';
        if (href.includes('/')) return 'Internal Link';
        return 'Unknown';
    }

    extractUrlFragment(href) {
        if (href.includes('#xfm-')) {
            return href.split('#xfm-')[1];
        }
        if (href.includes('#')) {
            return href.split('#')[1];
        }
        return '';
    }

    extractXfmModule(href) {
        if (href.includes('#xfm-')) {
            return href.split('#xfm-')[1].replace(/_/g, ' ');
        }
        return 'Unknown Module';
    }

    buildNavigationPath(text, href) {
        if (href.includes('#xfm-')) {
            const module = this.extractXfmModule(href);
            return `Main Menu → ${module}`;
        }
        return text || 'Unknown Path';
    }

    categorizeMenuItems(menuItems) {
        const categories = {
            payroll: menuItems.filter(item => 
                item.text.toLowerCase().includes('payroll') || 
                item.href.includes('PAYROLL')
            ).length,
            hr: menuItems.filter(item => 
                item.text.toLowerCase().includes('hr') || 
                item.href.includes('HR')
            ).length,
            reports: menuItems.filter(item => 
                item.text.toLowerCase().includes('report') || 
                item.href.includes('REPORT')
            ).length,
            company: menuItems.filter(item => 
                item.text.toLowerCase().includes('company') || 
                item.href.includes('COMPANY')
            ).length,
            other: 0
        };
        
        categories.other = menuItems.length - (categories.payroll + categories.hr + categories.reports + categories.company);
        return categories;
    }

    buildNavigationFlow(menuItems) {
        const flow = {};
        menuItems.forEach(item => {
            if (item.href.includes('#xfm-')) {
                const module = this.extractXfmModule(item.href);
                if (!flow[module]) {
                    flow[module] = [];
                }
                flow[module].push(item.text);
            }
        });
        return flow;
    }

    generateLinkRecommendations(brokenLinks) {
        const recommendations = [];
        
        if (brokenLinks.length > 0) {
            recommendations.push('Implement automatic link validation during deployment');
            recommendations.push('Set up monitoring for critical navigation paths');
            recommendations.push('Add retry mechanisms for timeout-related failures');
        }
        
        const timeoutErrors = brokenLinks.filter(link => link.error.includes('Timeout'));
        if (timeoutErrors.length > 0) {
            recommendations.push('Optimize page load times to reduce navigation timeouts');
        }
        
        return recommendations;
    }

    calculateHealthScore() {
        const totalTests = this.results.linkTests.length + (this.results.navigationTests?.length || 0);
        const passedTests = this.results.linkTests.filter(test => test.working).length + 
                           (this.results.navigationTests?.filter(test => test.working).length || 0);
        
        if (totalTests === 0) return 0;
        return Math.round((passedTests / totalTests) * 100);
    }

    identifyCriticalIssues() {
        const issues = [];
        
        const brokenLinks = this.results.linkTests.filter(test => !test.working);
        if (brokenLinks.length > 10) {
            issues.push(`High number of broken links: ${brokenLinks.length}`);
        }
        
        const brokenNavigation = this.results.navigationTests?.filter(test => !test.working) || [];
        if (brokenNavigation.length > 0) {
            issues.push(`Navigation failures: ${brokenNavigation.length} elements`);
        }
        
        if (!this.results.authentication.success) {
            issues.push('Authentication failure detected');
        }
        
        return issues;
    }

    generateExecutiveRecommendations() {
        return [
            'Implement continuous link monitoring',
            'Fix high-priority broken links immediately',
            'Optimize navigation timeout handling',
            'Add comprehensive test automation',
            'Monitor Shadow DOM and iframe interactions'
        ];
    }

    generateNextSteps() {
        return [
            'Review and fix all broken links identified in this report',
            'Implement automated testing for critical navigation paths',
            'Set up monitoring alerts for link failures',
            'Schedule regular link validation testing',
            'Document navigation flows for future testing'
        ];
    }

    generateMenuCategoriesHTML() {
        const menuItems = this.results.pageAnalysis.interactiveElements?.filter(el => 
            el.type === 'a' && el.href && el.href.includes('#xfm-')) || [];
        const categories = this.categorizeMenuItems(menuItems);
        
        return `
            <div style="display: flex; justify-content: space-around; margin: 20px 0;">
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #007bff;">${categories.payroll}</div>
                    <div>Payroll</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #28a745;">${categories.hr}</div>
                    <div>HR</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #ffc107;">${categories.reports}</div>
                    <div>Reports</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #dc3545;">${categories.company}</div>
                    <div>Company</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #6c757d;">${categories.other}</div>
                    <div>Other</div>
                </div>
            </div>
        `;
    }

    groupLinksByType(links) {
        const grouped = {};
        links.forEach(link => {
            const type = this.classifyLinkType(link.href);
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(link);
        });
        return grouped;
    }

    groupLinksByTarget(links) {
        const grouped = {};
        links.forEach(link => {
            const target = link.target || '_self';
            if (!grouped[target]) grouped[target] = [];
            grouped[target].push(link);
        });
        return grouped;
    }

    extractInternalNavigation(links) {
        return links.filter(link => 
            link.href.includes('#xfm-')
        ).map(link => ({
            name: link.text || 'No Name',
            reference: link.href,
            module: this.extractXfmModule(link.href)
        }));
    }

    displayReportLocations() {
        console.log('\n📁 ENHANCED REPORTS GENERATED');
        console.log('=============================');
        console.log(`📍 Report Directory: ${this.reportDir}`);
        console.log('');
        console.log('📄 Available Reports:');
        console.log('   • enhanced-comprehensive-report.html - Main visual report');
        console.log('   • broken-links-detailed-report.json - Detailed broken links analysis');
        console.log('   • broken-links-report.csv - Broken links in CSV format');
        console.log('   • link-catalog-report.json - Complete link catalog');
        console.log('   • link-catalog.csv - Link catalog in CSV format');
        console.log('   • menu-navigation-report.json - Menu and navigation analysis');
        console.log('   • menu-navigation-catalog.csv - Menu items in CSV format');
        console.log('   • executive-summary-report.json - Executive summary');
        console.log('');
        console.log('🔗 Quick Access:');
        console.log(`   file://${path.join(this.reportDir, 'enhanced-comprehensive-report.html')}`);
        console.log('');
        console.log('✅ All user requirements addressed:');
        console.log('   ✅ Report location provided');
        console.log('   ✅ Broken links detection implemented');
        console.log('   ✅ Link name and reference capture completed');
        console.log('   ✅ Menu name and navigation reference documented');
    }
}

// CLI interface
async function main() {
    const resultsPath = process.argv[2] || path.join(__dirname, '..', 'reports', 'real-adp-test-results.json');
    
    try {
        const generator = new EnhancedReportGenerator(resultsPath);
        await generator.generateEnhancedReports();
    } catch (error) {
        console.error('❌ Enhanced report generation failed:', error.message);
        process.exit(1);
    }
}

module.exports = { EnhancedReportGenerator };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
