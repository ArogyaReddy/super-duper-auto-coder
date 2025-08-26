/**
 * Cucumber Adapter - BDD Framework Integration
 * Generates feature files, step definitions, and page objects for Cucumber BDD testing
 */

const FrameworkAdapter = require('./framework-adapter');
const Handlebars = require('handlebars');
const path = require('path');

class CucumberAdapter extends FrameworkAdapter {
    constructor() {
        super('cucumber');
        
        this.filePatterns = [
            '**/*.feature',
            'step_definitions/**/*.js',
            'support/**/*.js',
            'features/**/*.feature'
        ];
        
        this.packageDependencies = [
            '@cucumber/cucumber',
            'cucumber-html-reporter'
        ];
        
        this.configs = [
            'cucumber.config.js',
            'cucumber.js'
        ];
    }

    /**
     * Generate BDD artifacts
     */
    async generateArtifacts(analysis, matches, options = {}) {
        const context = this.buildContext(analysis, matches, options);

        const artifacts = {
            framework: this.frameworkName,
            files: {},
            metadata: {
                generatedAt: new Date().toISOString(),
                framework: this.frameworkName,
                analysis: analysis,
                confidence: matches?.confidence || 0.5
            }
        };

        // Generate BDD files
        artifacts.files.feature = this.generateFeature(context);
        artifacts.files.steps = this.generateStepDefinitions(context);
        artifacts.files.page = this.generatePageObject(context);
        artifacts.files.config = this.generateConfig(context);
        artifacts.files.helpers = this.generateHelpers(context);

        return artifacts;
    }

    /**
     * Build template context for BDD generation
     */
    buildContext(analysis, matches, options) {
        // Extract values from SBS analysis results
        const primaryEntity = this.extractPrimaryValue(analysis.entities, 'entity') || 'item';
        const primaryAction = this.extractPrimaryValue(analysis.actions, 'action') || 'process';
        const primaryRole = this.extractPrimaryValue(analysis.roles, 'role') || 'user';
        
        // Register Handlebars helpers
        Handlebars.registerHelper('kebabCase', (str) => {
            return str ? str.toLowerCase().replace(/\s+/g, '-') : '';
        });
        
        Handlebars.registerHelper('camelCase', (str) => {
            return str ? str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '') : '';
        });
        
        Handlebars.registerHelper('pascalCase', (str) => {
            return str ? str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
                word.toUpperCase()).replace(/\s+/g, '') : '';
        });
        
        return {
            // Basic info
            featureName: this.formatFeatureName(analysis.domain, primaryAction, primaryEntity),
            scenarioName: this.formatScenarioName(primaryAction, primaryEntity),
            className: this.formatClassName(primaryEntity),
            methodName: this.formatMethodName(primaryAction, primaryEntity),
            
            // Domain context
            domain: analysis.domain || 'general',
            intent: analysis.intent || 'test',
            primaryEntity,
            primaryAction,
            primaryRole,
            
            // Element lists
            entities: analysis.entities?.map(e => e.entity) || [],
            actions: analysis.actions?.map(a => a.action) || [],
            roles: analysis.roles?.map(r => r.role) || [],
            
            // Generation metadata
            timestamp: new Date().toISOString(),
            confidence: matches?.confidence || 0.5,
            originalText: analysis.originalText || ''
        };
    }

    /**
     * Generate Cucumber feature file
     */
    generateFeature(context) {
        const template = `Feature: {{featureName}}
  As a {{primaryRole}}
  I want to {{primaryAction}} {{primaryEntity}}
  So that I can manage my {{domain}} operations

  Background:
    Given I am logged in as a "{{primaryRole}}"
    And I am on the {{domain}} page

  Scenario: {{scenarioName}}
    When I {{primaryAction}} the {{primaryEntity}}
    Then the {{primaryEntity}} should be processed successfully
    And I should see a confirmation message

  Scenario: {{scenarioName}} with validation
    When I attempt to {{primaryAction}} an invalid {{primaryEntity}}
    Then I should see an error message
    And the {{primaryEntity}} should not be processed
`;

        return Handlebars.compile(template)(context);
    }

    /**
     * Generate Cucumber step definitions
     */
    generateStepDefinitions(context) {
        const template = `const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const {{className}} = require('../pages/{{kebabCase className}}');

// Page object instance
const {{camelCase className}} = new {{className}}(this.page);

// Background steps
Given('I am logged in as a {string}', async function (role) {
  await {{camelCase className}}.login(role);
});

Given('I am on the {{domain}} page', async function () {
  await {{camelCase className}}.navigateToPage();
});

// Main action steps
When('I {{primaryAction}} the {{primaryEntity}}', async function () {
  await {{camelCase className}}.{{methodName}}();
});

When('I attempt to {{primaryAction}} an invalid {{primaryEntity}}', async function () {
  await {{camelCase className}}.{{methodName}}WithInvalidData();
});

// Verification steps
Then('the {{primaryEntity}} should be processed successfully', async function () {
  const isProcessed = await {{camelCase className}}.verifySuccessfulProcessing();
  expect(isProcessed).toBe(true);
});

Then('I should see a confirmation message', async function () {
  const hasConfirmation = await {{camelCase className}}.verifyConfirmationMessage();
  expect(hasConfirmation).toBe(true);
});

Then('I should see an error message', async function () {
  const hasError = await {{camelCase className}}.verifyErrorMessage();
  expect(hasError).toBe(true);
});

Then('the {{primaryEntity}} should not be processed', async function () {
  const hasFailed = await {{camelCase className}}.verifyProcessingFailed();
  expect(hasFailed).toBe(true);
});
`;

        return Handlebars.compile(template)(context);
    }

    /**
     * Generate page object for BDD
     */
    generatePageObject(context) {
        const template = `const helpers = require('../../support/helpers');
const By = require('../../support/By');

class {{className}} {
  constructor(page) {
    this.page = page;
  }

  // Page locators following SBS patterns
  get {{camelCase primaryEntity}}Input() {
    return this.page.locator('[data-testid="{{kebabCase primaryEntity}}-input"]');
  }

  get {{camelCase primaryAction}}Button() {
    return this.page.locator('[data-testid="{{kebabCase primaryAction}}-button"]');
  }

  get confirmationMessage() {
    return this.page.locator('[data-testid="confirmation-message"]');
  }

  get errorMessage() {
    return this.page.locator('[data-testid="error-message"]');
  }

  get statusIndicator() {
    return this.page.locator('[data-testid="status-indicator"]');
  }

  // Navigation methods following SBS patterns
  async navigateTo(url, timeOutInSeconds = 300) {
    await helpers.retryGoto(this.page, url, { timeout: timeOutInSeconds * 1000 }, 2);
  }

  async login(role) {
    await this.navigateTo('/login');
    await this.page.locator('[data-testid="username"]').fill(role);
    await this.page.locator('[data-testid="password"]').fill('password');
    await this.page.locator('[data-testid="login-button"]').click();
    await this.page.waitForURL('**/dashboard');
  }

  async navigateToPage() {
    await this.navigateTo('/{{kebabCase domain}}');
    await this.page.waitForLoadState('networkidle');
  }

  // Action methods following SBS patterns
  async {{methodName}}(data = {}) {
    const inputValue = data.{{camelCase primaryEntity}} || 'test data';
    await this.{{camelCase primaryEntity}}Input.fill(inputValue);
    await this.{{camelCase primaryAction}}Button.click();
    await this.page.waitForLoadState('networkidle');
  }

  async {{methodName}}WithInvalidData() {
    await this.{{camelCase primaryEntity}}Input.fill('');  // Invalid: empty data
    await this.{{camelCase primaryAction}}Button.click();
  }

  // Verification methods following SBS patterns
  async verifySuccessfulProcessing() {
    const statusText = await this.statusIndicator.textContent();
    return statusText && statusText.includes('Success');
  }

  async verifyConfirmationMessage() {
    await this.confirmationMessage.waitFor({ state: 'visible', timeout: 5000 });
    const messageText = await this.confirmationMessage.textContent();
    return messageText && messageText.includes('{{primaryEntity}} processed successfully');
  }

  async verifyErrorMessage() {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return await this.errorMessage.isVisible();
  }

  async verifyProcessingFailed() {
    const statusText = await this.statusIndicator.textContent();
    return statusText && statusText.includes('Failed');
  }

  // SBS-style helper methods
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isElementVisible(selector) {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getElementText(selector) {
    try {
      return await this.page.locator(selector).textContent();
    } catch (error) {
      return null;
    }
  }
}

module.exports = {{className}};
`;

        return Handlebars.compile(template)(context);
    }

    /**
     * Generate Cucumber configuration
     */
    generateConfig(context) {
        return `module.exports = {
  default: {
    require: ['step_definitions/**/*.js'],
    format: ['progress', 'json:test-results/cucumber-results.json'],
    paths: ['features/**/*.feature'],
    parallel: 2,
    retry: 1
  },
  ci: {
    require: ['step_definitions/**/*.js'],
    format: ['json:test-results/cucumber-results.json'],
    paths: ['features/**/*.feature'],
    parallel: 4,
    retry: 2
  }
};`;
    }

    /**
     * Generate support helpers
     */
    generateHelpers(context) {
        return `const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// Set default timeout
setDefaultTimeout(30000);

let browser;
let context;
let page;

Before(async function() {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
  
  // Attach page to world for step definitions
  this.page = page;
});

After(async function() {
  if (page) await page.close();
  if (context) await context.close();
  if (browser) await browser.close();
});
`;
    }

    /**
     * Extract primary value from analysis array (handles both old and new SBS formats)
     */
    extractPrimaryValue(analysisArray, key) {
        if (!analysisArray || !Array.isArray(analysisArray) || analysisArray.length === 0) {
            return null;
        }
        
        const firstItem = analysisArray[0];
        
        // Handle SBS format: { entity: 'page', confidence: 0.8, type: 'sbs_entity' }
        if (firstItem[key]) {
            return firstItem[key];
        }
        
        // Handle legacy format: { entity: 'page', count: 5, domains: [...] }
        if (firstItem.entity || firstItem.action || firstItem.role) {
            return firstItem.entity || firstItem.action || firstItem.role;
        }
        
        // Handle simple string format
        if (typeof firstItem === 'string') {
            return firstItem;
        }
        
        return null;
    }

    // Helper methods for formatting
    formatFeatureName(domain, action, entity) {
        return `${domain} ${entity} ${action}`.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatScenarioName(action, entity) {
        return `${action} ${entity} successfully`.toLowerCase();
    }

    formatClassName(entity) {
        return entity.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Page';
    }

    formatMethodName(action, entity) {
        const camelAction = action.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');
        const camelEntity = entity.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');
        return `${camelAction}${camelEntity.charAt(0).toUpperCase() + camelEntity.slice(1)}`;
    }
}

module.exports = CucumberAdapter;
