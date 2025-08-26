/**
 * CRITICAL FRAMEWORK FIX: SBS Pattern Compliance Enforcer
 * 
 * This script ensures all generated artifacts follow exact SBS_Automation patterns
 * Created: 2025-07-22
 * Purpose: Prevent generation of non-compliant artifacts
 */

const fs = require('fs');
const path = require('path');

class SBSPatternEnforcer {
    constructor() {
        this.sbsPath = '../../SBS_Automation';
        this.patterns = {};
        this.loadSBSPatterns();
    }

    /**
     * Load actual patterns from SBS_Automation for reference
     */
    loadSBSPatterns() {
        console.log('🔍 Loading SBS_Automation patterns for compliance...');
        
        // Load actual page patterns
        this.patterns.pageImports = [
            "const By = require('./../../support/By.js');",
            "let BasePage = require('../common/base-page');"
        ];
        
        this.patterns.pageConstructor = `constructor(page) {
    super(page);
    this.page = page;
}`;

        // Load actual step patterns  
        this.patterns.stepImports = [
            "const { When, Then, Given } = require('@cucumber/cucumber');",
            "const { assert } = require('chai');"
        ];

        // Load actual feature patterns
        this.patterns.featureTags = [
            "@Team:SBSBusinessContinuity", "@Team:SBS", "@Team:MAX", "@Team:Digital"
        ];

        console.log('✅ SBS patterns loaded successfully');
    }

    /**
     * Validate generated page object against SBS patterns
     */
    validatePageObject(filePath, content) {
        const issues = [];

        // Check imports
        if (!content.includes("const By = require('./../../support/By.js');")) {
            issues.push("❌ Missing required By.js import");
        }

        if (!content.includes("let BasePage = require('../common/base-page');")) {
            issues.push("❌ Missing required BasePage import");
        }

        // Check class extension
        if (!content.includes("extends BasePage")) {
            issues.push("❌ Must extend BasePage (not basePage)");
        }

        // Check constructor pattern
        if (!content.includes("constructor(page)")) {
            issues.push("❌ Constructor must accept page parameter");
        }

        if (!content.includes("super(page);") || !content.includes("this.page = page;")) {
            issues.push("❌ Constructor must call super(page) and set this.page");
        }

        // Check for wrong patterns
        if (content.includes("data-cy")) {
            issues.push("❌ Use data-test-id, not data-cy (SBS pattern)");
        }

        if (content.includes("this.page.locator(")) {
            issues.push("❌ Use By.xpath() or By.css() patterns, not this.page.locator()");
        }

        if (content.includes("require('playwright/test')")) {
            issues.push("❌ Don't import playwright/test in page objects");
        }

        return issues;
    }

    /**
     * Validate generated step definitions against SBS patterns  
     */
    validateStepDefinitions(filePath, content) {
        const issues = [];

        // Check imports
        if (!content.includes("const { When, Then, Given } = require('@cucumber/cucumber');")) {
            issues.push("❌ Missing required Cucumber imports");
        }

        if (!content.includes("const { assert } = require('chai');")) {
            issues.push("❌ Missing required chai assertion import");
        }

        // Check page instantiation pattern
        if (!content.includes("new ")) {
            issues.push("❌ Must instantiate page objects with 'new PageName(this.page)'");
        }

        // Check assertion patterns
        if (content.includes("expect(") && !content.includes("assert.")) {
            issues.push("❌ Use chai assertions (assert.isTrue), not expect");
        }

        return issues;
    }

    /**
     * Validate generated feature files against SBS patterns
     */
    validateFeatureFile(filePath, content) {
        const issues = [];

        // Check for team tags
        const hasValidTeamTag = this.patterns.featureTags.some(tag => content.includes(tag));
        if (!hasValidTeamTag) {
            issues.push("❌ Must include valid @Team tag (Kokoro, SBS, MAX, Digital)");
        }

        // Check for over-engineering
        if (content.split('|').length > 10) {
            issues.push("⚠️ Consider simplifying complex data tables");
        }

        return issues;
    }

    /**
     * Validate any generated artifact
     */
    validateArtifact(filePath) {
        if (!fs.existsSync(filePath)) {
            return ['❌ File does not exist'];
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filePath);
        let issues = [];

        switch (ext) {
            case '.js':
                if (filePath.includes('/pages/')) {
                    issues = this.validatePageObject(filePath, content);
                } else if (filePath.includes('/steps/')) {
                    issues = this.validateStepDefinitions(filePath, content);
                }
                break;
            case '.feature':
                issues = this.validateFeatureFile(filePath, content);
                break;
        }

        return issues;
    }

    /**
     * Scan and validate all artifacts in SBS_Automation directory
     */
    validateAllArtifacts() {
        console.log('🔍 Validating all generated artifacts...');
        
        const sbsDir = path.join(__dirname, '../SBS_Automation');
        const allIssues = {};

        ['features', 'steps', 'pages'].forEach(type => {
            const typeDir = path.join(sbsDir, type);
            if (fs.existsSync(typeDir)) {
                this.scanDirectory(typeDir, allIssues);
            }
        });

        return allIssues;
    }

    scanDirectory(dir, issues) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                this.scanDirectory(filePath, issues);
            } else if (file.endsWith('.js') || file.endsWith('.feature')) {
                const fileIssues = this.validateArtifact(filePath);
                if (fileIssues.length > 0) {
                    issues[filePath] = fileIssues;
                }
            }
        });
    }

    /**
     * Generate compliance report
     */
    generateComplianceReport() {
        const issues = this.validateAllArtifacts();
        const reportPath = path.join(__dirname, '../reports/sbs-compliance-report.md');
        
        let report = `# SBS Pattern Compliance Report\n\n`;
        report += `Generated: ${new Date().toISOString()}\n\n`;

        if (Object.keys(issues).length === 0) {
            report += `## ✅ ALL ARTIFACTS COMPLIANT\n\n`;
            report += `All generated artifacts follow SBS_Automation patterns correctly.\n`;
        } else {
            report += `## ❌ COMPLIANCE ISSUES FOUND\n\n`;
            
            Object.entries(issues).forEach(([filePath, fileIssues]) => {
                report += `### ${filePath}\n\n`;
                fileIssues.forEach(issue => {
                    report += `- ${issue}\n`;
                });
                report += `\n`;
            });
        }

        // Ensure reports directory exists
        const reportsDir = path.dirname(reportPath);
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        fs.writeFileSync(reportPath, report);
        console.log(`📊 Compliance report generated: ${reportPath}`);
        
        return issues;
    }
}

module.exports = SBSPatternEnforcer;

// CLI usage
if (require.main === module) {
    const enforcer = new SBSPatternEnforcer();
    const issues = enforcer.generateComplianceReport();
    
    if (Object.keys(issues).length > 0) {
        console.log('❌ SBS compliance issues found. Check the report.');
        process.exit(1);
    } else {
        console.log('✅ All artifacts are SBS compliant!');
        process.exit(0);
    }
}
