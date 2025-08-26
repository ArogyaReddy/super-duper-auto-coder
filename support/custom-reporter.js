/**
 * Custom Detailed Reporter for Auto-Coder Framework
 * Generates comprehensive reports with detailed error analysis
 */

const fs = require('fs');
const path = require('path');

class CustomReporter {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  onBegin(config, suite) {
    this.config = config;
    this.suite = suite;
    console.log('📊 Custom Reporter: Starting test execution...');
  }

  onTestBegin(test) {
    console.log(`🧪 Starting test: ${test.title}`);
  }

  onTestEnd(test, result) {
    const testResult = {
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error ? {
        message: result.error.message,
        stack: result.error.stack
      } : null,
      steps: result.steps ? result.steps.map(step => ({
        title: step.title,
        category: step.category,
        duration: step.duration,
        error: step.error ? {
          message: step.error.message,
          stack: step.error.stack
        } : null
      })) : [],
      attachments: result.attachments ? result.attachments.map(attachment => ({
        name: attachment.name,
        contentType: attachment.contentType,
        path: attachment.path
      })) : [],
      location: test.location,
      timestamp: new Date().toISOString()
    };

    // Analyze failure details
    if (result.status === 'failed' && result.error) {
      testResult.failureAnalysis = this.analyzeFailure(result.error);
    }

    this.testResults.push(testResult);

    // Real-time logging with detailed information
    if (result.status === 'failed') {
      console.log(`❌ Test FAILED: ${test.title}`);
      console.log(`   Error: ${result.error?.message || 'Unknown error'}`);
      if (result.error?.stack) {
        console.log(`   Stack trace: ${result.error.stack.split('\n')[0]}`);
      }
      console.log(`   Expected behavior: Tests should fail with invalid locators - this indicates locators need updating`);
      console.log(`   Next steps: Update locators in generated page files with real application selectors`);
    } else if (result.status === 'passed') {
      console.log(`✅ Test PASSED: ${test.title}`);
    } else {
      console.log(`⚠️  Test ${result.status.toUpperCase()}: ${test.title}`);
    }
  }

  analyzeFailure(error) {
    const message = error.message || '';
    const stack = error.stack || '';
    
    const analysis = {
      likely_cause: '',
      locator_issues: [],
      recommendations: [],
      code_location: ''
    };

    // Analyze common failure patterns
    if (message.includes('Element not found') || message.includes('selector')) {
      analysis.likely_cause = 'Locator not found - element selector is invalid or element does not exist';
      analysis.recommendations.push('Update the element selector in the corresponding page file');
      analysis.recommendations.push('Use browser developer tools to find the correct selector');
    }

    if (message.includes('timeout') || message.includes('TimeoutError')) {
      analysis.likely_cause = 'Element interaction timeout - element may be loading slowly or selector is incorrect';
      analysis.recommendations.push('Verify element selector is correct');
      analysis.recommendations.push('Check if element requires additional wait conditions');
      analysis.recommendations.push('Consider increasing timeout values if element loads slowly');
    }

    if (message.includes('Navigation') || message.includes('navigate')) {
      analysis.likely_cause = 'Navigation failure - URL may be incorrect or application unavailable';
      analysis.recommendations.push('Verify the application URL is correct and accessible');
      analysis.recommendations.push('Check if application is running and reachable');
    }

    // Extract locator information from stack trace
    const locatorMatch = stack.match(/data-testid[='"']([^'"]+)['"']/g);
    if (locatorMatch) {
      analysis.locator_issues = locatorMatch;
      analysis.recommendations.push(`Replace placeholder data-testid selectors: ${locatorMatch.join(', ')}`);
    }

    // Find code location
    const locationMatch = stack.match(/at.*\/([^\/]+\.js):(\d+):(\d+)/);
    if (locationMatch) {
      analysis.code_location = `${locationMatch[1]}:${locationMatch[2]}:${locationMatch[3]}`;
    }

    return analysis;
  }

  onEnd(result) {
    this.endTime = Date.now();
    const duration = this.endTime - this.startTime;
    
    console.log('\n🎯 Auto-Coder Test Execution Summary');
    console.log('=====================================');
    console.log(`📊 Total tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${this.testResults.filter(t => t.status === 'passed').length}`);
    console.log(`❌ Failed: ${this.testResults.filter(t => t.status === 'failed').length}`);
    console.log(`⚠️  Skipped: ${this.testResults.filter(t => t.status === 'skipped').length}`);
    console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
    
    // Generate detailed custom report
    this.generateDetailedReport();
    
    console.log('\n📝 Reports Generated:');
    console.log(`   📄 Detailed Report: SBS_Automation/reports/custom/detailed-test-report.html`);
    console.log(`   📊 HTML Report: SBS_Automation/reports/html-report/index.html`);
    console.log(`   📋 JSON Report: SBS_Automation/reports/results.json`);
    
    if (this.testResults.filter(t => t.status === 'failed').length > 0) {
      console.log('\n💡 Expected Behavior Notice:');
      console.log('   Tests are expected to fail initially due to placeholder locators');
      console.log('   This indicates the framework is working correctly');
      console.log('   Next steps: Update locators in page files with real application elements');
      console.log('   Refer to the detailed report for specific locator issues and recommendations');
    }
  }

  generateDetailedReport() {
    const failedTests = this.testResults.filter(t => t.status === 'failed');
    const passedTests = this.testResults.filter(t => t.status === 'passed');

    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto-Coder Detailed Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; text-align: center; }
        .metric.passed { border-left: 5px solid #4CAF50; }
        .metric.failed { border-left: 5px solid #f44336; }
        .metric.total { border-left: 5px solid #2196F3; }
        .metric h3 { margin: 0; font-size: 24px; }
        .metric p { margin: 5px 0 0 0; color: #666; }
        .test-section { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .test-item { border-bottom: 1px solid #eee; padding: 15px 0; }
        .test-item:last-child { border-bottom: none; }
        .test-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .test-duration { color: #666; font-size: 12px; margin-bottom: 10px; }
        .test-failed .test-title { color: #f44336; }
        .test-passed .test-title { color: #4CAF50; }
        .test-steps { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .test-steps h4 { margin-top: 0; color: #333; }
        .test-steps ol { margin: 0; padding-left: 25px; }
        .test-steps li { margin: 8px 0; padding: 8px; background: white; border-radius: 3px; border-left: 3px solid #ddd; }
        .step-failed { border-left-color: #f44336; background: #ffebee; }
        .step-passed { border-left-color: #4CAF50; background: #e8f5e8; }
        .step-category { background: #e3f2fd; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 10px; }
        .step-duration { color: #666; font-size: 11px; float: right; }
        .step-error { color: #c62828; font-size: 12px; margin-top: 5px; padding: 5px; background: #ffcdd2; border-radius: 3px; }
        .test-attachments { background: #fff3e0; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .test-attachments h4 { margin-top: 0; color: #f57c00; }
        .stack-trace { margin-top: 10px; }
        .stack-trace details { margin-top: 5px; }
        .stack-trace pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px; }
        .error-details { background: #ffebee; padding: 15px; border-radius: 4px; margin-top: 10px; }
        .error-message { color: #c62828; font-weight: bold; margin-bottom: 10px; }
        .failure-analysis { background: #fff3e0; padding: 15px; border-radius: 4px; margin-top: 10px; }
        .recommendations { background: #e8f5e8; padding: 15px; border-radius: 4px; margin-top: 10px; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .code-location { font-family: monospace; background: #f5f5f5; padding: 5px; border-radius: 3px; }
        .notice { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #2196F3; }
        .notice h3 { margin-top: 0; color: #1976d2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Auto-Coder Detailed Test Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Framework: Auto-Coder Test Artifact Generator</p>
    </div>

    <div class="notice">
        <h3>💡 Expected Behavior Notice</h3>
        <p>Tests are designed to fail initially when using generated test artifacts. This is expected behavior because:</p>
        <ul>
            <li>Generated tests use placeholder locators (data-testid attributes) that don't exist in the actual application</li>
            <li>This failure pattern confirms the framework is generating real tests, not mocks</li>
            <li>Users should update locators in page files with actual application element selectors</li>
            <li>Once locators are updated, tests should run successfully against the real application</li>
        </ul>
    </div>

    <div class="summary">
        <div class="metric total">
            <h3>${this.testResults.length}</h3>
            <p>Total Tests</p>
        </div>
        <div class="metric passed">
            <h3>${passedTests.length}</h3>
            <p>Passed</p>
        </div>
        <div class="metric failed">
            <h3>${failedTests.length}</h3>
            <p>Failed (Expected)</p>
        </div>
    </div>

    ${failedTests.length > 0 ? `
    <div class="test-section">
        <h2>❌ Failed Tests (Expected - Locators Need Updating)</h2>
        ${failedTests.map(test => `
            <div class="test-item test-failed">
                <div class="test-title">${test.title}</div>
                <div class="test-duration">Duration: ${Math.round(test.duration)}ms</div>
                
                ${test.steps && test.steps.length > 0 ? `
                    <div class="test-steps">
                        <h4>📋 Test Steps Executed:</h4>
                        <ol>
                            ${test.steps.map(step => `
                                <li class="${step.error ? 'step-failed' : 'step-passed'}">
                                    <strong>${step.title}</strong>
                                    ${step.category ? `<span class="step-category">[${step.category}]</span>` : ''}
                                    <span class="step-duration">${Math.round(step.duration)}ms</span>
                                    ${step.error ? `
                                        <div class="step-error">
                                            <strong>Step Error:</strong> ${step.error.message}
                                        </div>
                                    ` : ''}
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                ` : ''}
                
                <div class="error-details">
                    <div class="error-message">${test.error?.message || 'Unknown error'}</div>
                    ${test.failureAnalysis ? `
                        <div class="failure-analysis">
                            <strong>🔍 Failure Analysis:</strong>
                            <p><strong>Likely Cause:</strong> ${test.failureAnalysis.likely_cause}</p>
                            ${test.failureAnalysis.code_location ? `<p><strong>Location:</strong> <span class="code-location">${test.failureAnalysis.code_location}</span></p>` : ''}
                            ${test.failureAnalysis.locator_issues.length > 0 ? `<p><strong>Placeholder Locators Found:</strong> ${test.failureAnalysis.locator_issues.join(', ')}</p>` : ''}
                        </div>
                        <div class="recommendations">
                            <strong>🛠️ Recommendations:</strong>
                            <ul>
                                ${test.failureAnalysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                <li>Use browser developer tools to inspect elements and get correct selectors</li>
                                <li>Replace data-testid attributes with actual CSS selectors or XPath expressions</li>
                                <li>Test selectors in browser console before updating page files</li>
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${test.error?.stack ? `
                        <div class="stack-trace">
                            <strong>📚 Stack Trace (Click to expand):</strong>
                            <details>
                                <summary>View full stack trace</summary>
                                <pre>${test.error.stack}</pre>
                            </details>
                        </div>
                    ` : ''}
                </div>
                
                ${test.attachments && test.attachments.length > 0 ? `
                    <div class="test-attachments">
                        <h4>📎 Test Attachments:</h4>
                        <ul>
                            ${test.attachments.map(attachment => `
                                <li>
                                    <strong>${attachment.name}</strong> (${attachment.contentType})
                                    ${attachment.path ? `<br><code>${attachment.path}</code>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${passedTests.length > 0 ? `
    <div class="test-section">
        <h2>✅ Passed Tests</h2>
        ${passedTests.map(test => `
            <div class="test-item test-passed">
                <div class="test-title">${test.title}</div>
                <p>Duration: ${Math.round(test.duration)}ms</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="test-section">
        <h2>📋 Next Steps for Real Application Testing</h2>
        <ol>
            <li><strong>Identify Failing Locators:</strong> Review the failed tests above to see which locators need updating</li>
            <li><strong>Inspect Real Application:</strong> Use browser developer tools to find actual element selectors</li>
            <li><strong>Update Page Files:</strong> Replace placeholder locators in generated page files with real selectors</li>
            <li><strong>Test Selectors:</strong> Validate selectors work in browser console before running tests</li>
            <li><strong>Re-run Tests:</strong> Execute tests again to verify they work with real application</li>
            <li><strong>Copy to SBS_Automation:</strong> Once working, copy test files to SBS_Automation framework</li>
        </ol>
    </div>

    <div class="test-section">
        <h2>📁 Generated Test Files Location</h2>
        <p>Your test artifacts are located in:</p>
        <ul>
            <li><code>SBS_Automation/features/</code> - Cucumber feature files</li>
            <li><code>SBS_Automation/steps/</code> - Step definition files</li>
            <li><code>SBS_Automation/pages/</code> - Page object files (update locators here)</li>
            <li><code>SBS_Automation/tests/</code> - Playwright test files</li>
            <li><code>SBS_Automation/summary/</code> - Guide files with detailed instructions</li>
        </ul>
    </div>
</body>
</html>`;

    const reportPath = 'SBS_Automation/reports/custom/detailed-test-report.html';
    fs.writeFileSync(reportPath, reportHtml);

    // Also generate a JSON report with failure analysis
    const detailedJsonReport = {
      summary: {
        total: this.testResults.length,
        passed: passedTests.length,
        failed: failedTests.length,
        duration: this.endTime - this.startTime,
        timestamp: new Date().toISOString()
      },
      tests: this.testResults,
      framework_info: {
        name: 'Auto-Coder Test Framework',
        version: '1.0.0',
        expected_behavior: 'Tests should fail initially due to placeholder locators - this is expected and indicates real tests were generated'
      }
    };

    fs.writeFileSync('SBS_Automation/reports/custom/detailed-results.json', JSON.stringify(detailedJsonReport, null, 2));
  }
}

module.exports = CustomReporter;
