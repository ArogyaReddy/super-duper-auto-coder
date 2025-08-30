# 🛠️ QA Automation Utilities

This directory contains utility scripts and tools for automated testing, link checking, and report generation.

## 🔧 Core Testing Utilities

### 🔗 Link Testing & Validation
- **`enhanced-broken-link-checker.js`** - Advanced link checker with SPA support
- **`broken-link-checker.js`** - Basic broken link detection
- **`enhanced-link-checker-sbs.js`** - SBS framework integrated link checker
- **`real-adp-tester.js`** - Live ADP application tester with authentication

### 📊 Report Generation
- **`enhanced-report-generator.js`** - Comprehensive report generation system
- **`excel-report-generator.js`** - Excel/CSV report creator
- **`create-excel-workbook.py`** - Python Excel workbook generator
- **`test-analytics-dashboard.js`** - Test analytics and dashboard generator

### 🌐 Browser & Testing Tools
- **`browser-manager.js`** - Browser automation management
- **`cross-browser-tester.js`** - Multi-browser testing capabilities
- **`playwright-mcp-test-executor.js`** - Playwright test execution
- **`login-utilities.js`** - Authentication and login helpers

### 🤖 Auto-Code Generation
- **`enhanced-auto-coder-generator.js`** - Advanced test code generator
- **`enhanced-auto-coder-generator-v2.js`** - Next generation auto-coder
- **`enhanced-auto-coder-cli.js`** - Command-line interface for auto-coding
- **`conflict-free-auto-coder-generator.js`** - Conflict-aware code generation

### 🔄 SBS Framework Integration
- **`enhanced-sbs-registry-generator.js`** - SBS registry creation
- **`sbs-automation-patterns.js`** - SBS automation patterns
- **`sbs-integration-concept.js`** - SBS integration concepts
- **`sbs-integration-demo.js`** - SBS integration demonstrations
- **`sbs-master-registry-builder.js`** - Master registry builder
- **`sbs-registry-generator.js`** - Registry generation utilities
- **`sbs-step-search.js`** - SBS step search functionality
- **`sbs-steps-conflict-checker.js`** - Step conflict detection
- **`simple-sbs-registry-creator.js`** - Simplified registry creation

### 🛡️ Security & Performance
- **`security-scanner.js`** - Security vulnerability scanning
- **`performance-benchmark.js`** - Performance testing and benchmarking
- **`api-fuzzer.js`** - API fuzzing and testing
- **`accessibility-checker.js`** - Accessibility compliance checking

### 🔍 Analysis Tools
- **`ai-visual-regression-detector.js`** - AI-powered visual regression detection
- **`dom-change-detector.js`** - DOM change monitoring
- **`path-validator.js`** - Path validation utilities
- **`smart-test-data-generator.js`** - Intelligent test data generation

### 🔧 Development Tools
- **`adp-demo.js`** - ADP application demo tools
- **`adp-real-tester.js`** - Real ADP testing utilities
- **`fetch-confluence.js`** - Confluence integration
- **`index.js`** - Main utility index

## 🚀 Quick Start

### Run Live ADP Testing
```bash
node real-adp-tester.js
```

### Generate Excel Reports
```bash
node excel-report-generator.js
python3 create-excel-workbook.py
```

### Create Enhanced Reports
```bash
node enhanced-report-generator.js
```

### Use Auto-Code Generator
```bash
node enhanced-auto-coder-cli.js
```

## 📁 Generated Reports

All generated reports are saved to the `../reports/` directory:
- Excel workbooks and CSV files
- HTML visual reports
- JSON data files
- Analysis documentation

## 🔧 Dependencies

Most utilities require:
- Node.js (for JavaScript tools)
- Python 3.9+ (for Python tools)
- Playwright (for browser automation)
- pandas & openpyxl (for Excel generation)

## 📝 Usage Notes

1. **Path Configuration**: Utilities automatically save reports to `../reports/` directory
2. **Authentication**: Real testing tools may require valid credentials
3. **Browser Requirements**: Some tools require Chromium/Chrome for testing
4. **File Permissions**: Ensure write permissions for report generation

## 🎯 Best Practices

- Run utilities from this directory for proper path resolution
- Check `../reports/` for generated output files
- Review logs for debugging information
- Use appropriate utilities based on testing needs

---
*QA Automation Framework - Utility Scripts*  
*Updated: August 30, 2025*
