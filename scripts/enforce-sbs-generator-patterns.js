/**
 * CRITICAL FRAMEWORK FIX: SBS Generator Pattern Enforcer
 * 
 * This script validates that ALL generators follow exact SBS_Automation patterns
 * Created: 2025-07-22
 * Purpose: Prevent generation of non-compliant artifacts from ANY generator
 */

const fs = require('fs');
const path = require('path');

// Ensure directory exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

class SBSGeneratorPatternEnforcer {
    constructor() {
        this.generatorPaths = [
            'src/generators/sbs-artifact-generator.js',
            'src/adapters/cucumber-adapter.js',
            'src/adapters/api-curl-adapter.js',
            'src/adapters/playwright-codegen-adapter.js'
        ];
        this.requiredPatterns = {
            pageImports: [
                "const By = require('./../../support/By.js');",
                "let BasePage = require('../common/base-page');"
            ],
            pageConstructor: "constructor(page) {\n    super(page);\n    this.page = page;\n  }",
            stepImports: [
                "const { When, Then, Given } = require('@cucumber/cucumber');",
                "const { assert } = require('chai');"
            ],
            forbiddenPatterns: [
                "const { expect } = require('@playwright/test');",
                "expect(",
                ".toBe(",
                "data-cy=",
                "this.page.locator"
            ]
        };
    }

    /**
     * Validate all generators follow SBS patterns
     */
    async validateAllGenerators() {
        console.log('🔍 Validating all generators for SBS compliance...');
        
        let allCompliant = true;
        const issues = [];

        for (const generatorPath of this.generatorPaths) {
            const fullPath = path.join(process.cwd(), generatorPath);
            
            if (!fs.existsSync(fullPath)) {
                console.log(`⚠️  Generator not found: ${generatorPath}`);
                continue;
            }

            const generatorIssues = await this.validateGenerator(generatorPath, fullPath);
            if (generatorIssues.length > 0) {
                allCompliant = false;
                issues.push({
                    generator: generatorPath,
                    issues: generatorIssues
                });
            }
        }

        this.generateComplianceReport(allCompliant, issues);
        return allCompliant;
    }

    /**
     * Validate a specific generator file
     */
    async validateGenerator(generatorPath, fullPath) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const issues = [];

        // Check for forbidden patterns
        for (const forbidden of this.requiredPatterns.forbiddenPatterns) {
            if (content.includes(forbidden)) {
                issues.push(`❌ Contains forbidden pattern: ${forbidden}`);
            }
        }

        // Check for required page import patterns
        if (content.includes('generatePageObject')) {
            const hasCorrectByImport = this.requiredPatterns.pageImports[0];
            const hasCorrectBasePageImport = this.requiredPatterns.pageImports[1];
            
            if (!content.includes(hasCorrectByImport)) {
                issues.push(`❌ Missing required By.js import pattern: ${hasCorrectByImport}`);
            }
            
            if (!content.includes(hasCorrectBasePageImport)) {
                issues.push(`❌ Missing required BasePage import pattern: ${hasCorrectBasePageImport}`);
            }

            if (!content.includes('extends BasePage')) {
                issues.push(`❌ Page object must extend BasePage`);
            }

            if (!content.includes('data-test-id')) {
                issues.push(`❌ Must use data-test-id selectors, not data-cy`);
            }
        }

        // Check for required step import patterns
        if (content.includes('generateStepDefinitions')) {
            const hasChaiImport = this.requiredPatterns.stepImports[1];
            
            if (!content.includes(hasChaiImport)) {
                issues.push(`❌ Missing required chai import: ${hasChaiImport}`);
            }

            if (!content.includes('assert.isTrue') && !content.includes('assert.isFalse')) {
                issues.push(`❌ Must use chai assertions (assert.isTrue/isFalse), not expect`);
            }
        }

        return issues;
    }

    /**
     * Generate compliance report
     */
    generateComplianceReport(allCompliant, issues) {
        const reportPath = path.join(process.cwd(), 'reports', 'generator-sbs-compliance-report.md');
        ensureDir(path.dirname(reportPath));

        let report = `# SBS Generator Pattern Compliance Report\n\n`;
        report += `**Generated:** ${new Date().toISOString()}\n\n`;

        if (allCompliant) {
            report += `## ✅ EXCELLENT - ALL GENERATORS ARE SBS COMPLIANT!\n\n`;
            report += `All generator files follow exact SBS_Automation patterns:\n`;
            for (const generatorPath of this.generatorPaths) {
                report += `- ✅ ${generatorPath}\n`;
            }
        } else {
            report += `## ❌ CRITICAL ISSUES FOUND - GENERATORS NOT SBS COMPLIANT\n\n`;
            
            for (const issueGroup of issues) {
                report += `### 🚨 ${issueGroup.generator}\n\n`;
                for (const issue of issueGroup.issues) {
                    report += `${issue}\n`;
                }
                report += `\n`;
            }
            
            report += `\n## 🔧 REQUIRED ACTIONS:\n\n`;
            report += `1. Fix all generators to use exact SBS_Automation patterns\n`;
            report += `2. Use \`const By = require('./../../support/By.js');\` for imports\n`;
            report += `3. Use \`let BasePage = require('../common/base-page');\` for base class\n`;
            report += `4. Use \`const { assert } = require('chai');\` for assertions\n`;
            report += `5. Use \`data-test-id\` selectors, not \`data-cy\`\n`;
            report += `6. Page objects MUST extend BasePage with proper constructor\n`;
            report += `7. Step definitions MUST use chai assertions, not expect\n\n`;
        }

        fs.writeFileSync(reportPath, report);
        console.log(`📊 Generator compliance report: ${reportPath}`);
        
        if (allCompliant) {
            console.log('✅ All generators are SBS compliant!');
        } else {
            console.log('❌ CRITICAL: Some generators are not SBS compliant!');
            console.log('📋 Check the report for detailed issues and required fixes.');
        }
    }
}

// Run the enforcer
if (require.main === module) {
    const enforcer = new SBSGeneratorPatternEnforcer();
    enforcer.validateAllGenerators().then(compliant => {
        process.exit(compliant ? 0 : 1);
    });
}

module.exports = SBSGeneratorPatternEnforcer;
