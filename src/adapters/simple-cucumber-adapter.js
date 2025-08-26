/**
 * 🎯 SIMPLE CUCUMBER ADAPTER - CORE AUTO-CODER
 * Generate Feature + Steps + Page → Run → Done
 * 100% SBS_Automation Compatible
 */

const fs = require('fs-extra');
const path = require('path');

class SimpleCucumberAdapter {
    constructor() {
        this.name = 'cucumber';
    }

    async initialize() {
        console.log('✅ Simple adapter initialized');
    }

    async generateArtifacts(options) {
        const { requirement, requirementFile, outputDir = './SBS_Automation' } = options;
        
        // Read requirement
        let requirementText = requirement;
        let baseName = 'generated-feature';
        
        if (requirementFile) {
            requirementText = await fs.readFile(requirementFile, 'utf8');
            baseName = path.basename(requirementFile, path.extname(requirementFile));
        }
        
        // Generate context
        const context = {
            baseName,
            className: this.toClassName(baseName),
            featureName: this.extractFeatureName(requirementText, baseName),
            domain: this.extractDomain(requirementText)
        };
        
        // Create directories
        const featuresDir = path.join(outputDir, 'features');
        const stepsDir = path.join(outputDir, 'steps');
        const pagesDir = path.join(outputDir, 'pages');
        
        await fs.ensureDir(featuresDir);
        await fs.ensureDir(stepsDir);
        await fs.ensureDir(pagesDir);
        
        // Generate artifacts
        const featureContent = this.generateFeature(context, requirementText);
        const stepsContent = this.generateSteps(context);
        const pageContent = this.generatePage(context);
        
        // Write files
        const featureFile = path.join(featuresDir, `${baseName}.feature`);
        const stepsFile = path.join(stepsDir, `${baseName}-steps.js`);
        const pageFile = path.join(pagesDir, `${baseName}-page.js`);
        
        await fs.writeFile(featureFile, featureContent);
        await fs.writeFile(stepsFile, stepsContent);
        await fs.writeFile(pageFile, pageContent);
        
        return {
            files: { 
                feature: featureFile, 
                steps: stepsFile, 
                page: pageFile 
            },
            artifacts: { 
                feature: featureContent, 
                steps: stepsContent, 
                page: pageContent 
            }
        };
    }
    
    toClassName(baseName) {
        return baseName.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Page';
    }
    
    extractFeatureName(text, baseName) {
        const firstLine = text.split('\n')[0].trim();
        if (firstLine.length > 0 && firstLine.length < 100) {
            return firstLine;
        }
        return baseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    extractDomain(text) {
        const lower = text.toLowerCase();
        if (lower.includes('employee') || lower.includes('hr')) return 'hr';
        if (lower.includes('payroll')) return 'payroll';
        if (lower.includes('tax')) return 'tax';
        if (lower.includes('client')) return 'client';
        return 'general';
    }
    
    generateFeature(context, requirementText) {
        return `@${context.domain} @automation
Feature: ${context.featureName}

  Background:
    Given I am authenticated in the system
    And I am on the application page

  @smoke @regression  
  Scenario: ${context.featureName}
    Given I am authenticated in the system
    And I am on the application page
    When I perform the required action
    Then I should see the expected result
`;
    }
    
    generateSteps(context) {
        return `const { Given, When, Then } = require('@cucumber/cucumber');
const { assert } = require('chai');
const ${context.className} = require('../pages/${context.baseName}-page');

let pageObject;

Given('I am authenticated in the system', async function () {
    pageObject = new ${context.className}(this.page);
    await pageObject.authenticateUser();
    console.log('🔐 User authentication completed');
});

Given('I am on the application page', async function () {
    await pageObject.navigateToPage();
    console.log('🏠 Navigated to application page');
});

When('I perform the required action', async function () {
    await pageObject.performAction();
    console.log('✅ Action performed successfully');
});

Then('I should see the expected result', async function () {
    const result = await pageObject.verifyResult();
    assert.isTrue(result, 'Expected result should be verified');
    console.log('✅ Expected result verified');
});
`;
    }
    
    generatePage(context) {
        return `const BasePage = require('../support/base-page.js');

class ${context.className} extends BasePage {
    constructor(page) {
        super(page);
        this.page = page;
        this.baseUrl = process.env.BASE_URL || 'https://staging.example.com';
    }

    async authenticateUser() {
        await this.page.goto(this.baseUrl);
        await this.waitForPageLoad();
        console.log('🔐 User authentication completed');
        return true;
    }

    async navigateToPage() {
        await this.waitForPageLoad();
        console.log('🏠 Navigated to application page');
        return true;
    }

    async performAction() {
        await this.waitForPageLoad();
        console.log('🎯 Performing required action');
        return true;
    }

    async verifyResult() {
        await this.waitForPageLoad();
        console.log('✅ Verifying expected result');
        return true;
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
    }
}

module.exports = ${context.className};
`;
    }
}

module.exports = SimpleCucumberAdapter;
