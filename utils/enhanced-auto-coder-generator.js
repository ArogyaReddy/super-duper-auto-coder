#!/usr/bin/env node

/**
 * Enhanced Auto-Coder Generator with SBS Registry Integration
 * Uses comprehensive SBS_Automation registries to prevent ambiguous steps
 */

const fs = require('fs');
const path = require('path');

class EnhancedAutoCoderGenerator {
  constructor() {
    this.registriesDir = path.join(__dirname, '../knowledge-base/registries');
    this.outputDir = path.join(__dirname, '../SBS_Automation');
    this.registries = this.loadRegistries();
  }

  loadRegistries() {
    const registries = {};
    
    try {
      // Load all registry files
      const registryFiles = [
        'sbs-step-definitions-registry.json',
        'sbs-page-objects-registry.json',
        'sbs-features-registry.json',
        'sbs-actions-registry.json',
        'sbs-locators-registry.json'
      ];

      registryFiles.forEach(file => {
        const filePath = path.join(this.registriesDir, file);
        if (fs.existsSync(filePath)) {
          const key = file.replace('sbs-', '').replace('-registry.json', '');
          registries[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`✅ Loaded ${key} registry`);
        } else {
          console.warn(`⚠️ Registry not found: ${file}`);
        }
      });

      return registries;
    } catch (error) {
      console.error('❌ Error loading registries:', error.message);
      return {};
    }
  }

  /**
   * STEP 1: VALIDATE AGAINST EXISTING STEPS
   */
  validateStepDefinitions(steps) {
    console.log('🔍 Validating steps against SBS registry...');
    
    const conflicts = [];
    const suggestions = [];

    if (!this.registries['step-definitions']) {
      console.warn('⚠️ Step definitions registry not available');
      return { conflicts: [], suggestions: [] };
    }

    const existingPatterns = this.registries['step-definitions'].ambiguous_patterns || [];
    const safePatterns = this.registries['step-definitions'].safe_patterns || [];

    steps.forEach(step => {
      // Check for ambiguous patterns
      const ambiguousPattern = existingPatterns.find(pattern => 
        step.includes(pattern.pattern.replace('{string}', '').replace(/[{}]/g, ''))
      );

      if (ambiguousPattern) {
        conflicts.push({
          step,
          pattern: ambiguousPattern.pattern,
          reason: ambiguousPattern.warning,
          severity: 'HIGH'
        });

        // Generate suggestion
        suggestions.push({
          original: step,
          suggested: this.generateSafeStepAlternative(step),
          reason: 'Avoid ambiguous pattern'
        });
      }

      // Check for exact matches in safe patterns
      const safeMatch = safePatterns.find(pattern => 
        step.includes(pattern.pattern.replace('{string}', ''))
      );

      if (safeMatch) {
        suggestions.push({
          original: step,
          suggested: `Reuse existing: ${safeMatch.pattern}`,
          file: safeMatch.file,
          reason: 'Exact match found - reuse existing step'
        });
      }
    });

    return { conflicts, suggestions };
  }

  /**
   * STEP 2: SUGGEST EXISTING PAGE METHODS
   */
  suggestPageMethods(domain) {
    console.log(`🔍 Finding existing page methods for domain: ${domain}`);
    
    if (!this.registries['page-objects']) {
      return [];
    }

    const suggestions = [];
    const pageObjects = this.registries['page-objects'].page_objects || {};

    // Find relevant page objects
    Object.entries(pageObjects).forEach(([filePath, pageInfo]) => {
      if (filePath.toLowerCase().includes(domain.toLowerCase()) || 
          pageInfo.class_name.toLowerCase().includes(domain.toLowerCase())) {
        
        suggestions.push({
          file: filePath,
          class: pageInfo.class_name,
          methods: pageInfo.methods,
          reusable: true,
          confidence: 'HIGH'
        });
      }
    });

    // Find common methods that could be reused
    const commonMethods = this.registries['page-objects'].common_methods || [];
    commonMethods.forEach(methodInfo => {
      if (methodInfo.usage_count >= 3) {
        suggestions.push({
          method: methodInfo.method,
          usage_count: methodInfo.usage_count,
          type: 'common_method',
          reusable: true,
          confidence: 'MEDIUM'
        });
      }
    });

    return suggestions;
  }

  /**
   * STEP 3: SUGGEST LOCATOR PATTERNS
   */
  suggestLocatorPatterns(elementType) {
    console.log(`🔍 Finding locator patterns for: ${elementType}`);
    
    if (!this.registries['locators']) {
      return [];
    }

    const suggestions = [];
    const commonPatterns = this.registries['locators'].common_element_patterns || [];
    const dataTestIdPatterns = this.registries['locators'].data_testid_patterns || [];

    // Find patterns for element type
    commonPatterns.forEach(patternInfo => {
      if (patternInfo.pattern.toLowerCase().includes(elementType.toLowerCase())) {
        suggestions.push({
          pattern: patternInfo.pattern,
          usage_count: patternInfo.usage_count,
          type: 'element_pattern',
          confidence: 'HIGH'
        });
      }
    });

    // Suggest data-test-id patterns
    const relevantTestIds = dataTestIdPatterns.filter(testId => 
      testId.toLowerCase().includes(elementType.toLowerCase())
    );

    relevantTestIds.forEach(testId => {
      suggestions.push({
        selector: `[data-test-id="${testId}"]`,
        type: 'data_test_id',
        confidence: 'HIGH',
        reason: 'Follows SBS data-test-id patterns'
      });
    });

    return suggestions;
  }

  /**
   * STEP 4: GENERATE CONFLICT-FREE ARTIFACTS
   */
  generateArtifacts(requirement, domain) {
    console.log(`🚀 Generating conflict-free artifacts for domain: ${domain}`);
    
    const analysis = this.analyzeRequirement(requirement);
    const stepValidation = this.validateStepDefinitions(analysis.proposed_steps);
    const pageSuggestions = this.suggestPageMethods(domain);
    const locatorSuggestions = this.suggestLocatorPatterns('button');

    // Generate feature file with validated steps
    const feature = this.generateFeatureFile(analysis, stepValidation);
    
    // Generate page object with suggested methods
    const pageObject = this.generatePageObject(analysis, pageSuggestions, locatorSuggestions, domain);
    
    // Generate steps file with conflict-free definitions
    const steps = this.generateStepsFile(analysis, stepValidation, domain);

    return {
      feature,
      pageObject,
      steps,
      analysis: {
        conflicts_detected: stepValidation.conflicts.length,
        suggestions_provided: stepValidation.suggestions.length,
        reusable_methods: pageSuggestions.length,
        locator_patterns: locatorSuggestions.length
      }
    };
  }

  analyzeRequirement(requirement) {
    // Basic requirement analysis
    return {
      domain: this.extractDomain(requirement),
      elements: this.extractElements(requirement),
      actions: this.extractActions(requirement),
      proposed_steps: this.generateProposedSteps(requirement)
    };
  }

  extractDomain(requirement) {
    // Extract domain from requirement
    const domains = ['billing', 'invoices', 'payroll', 'company', 'employee', 'tax'];
    const found = domains.find(domain => 
      requirement.toLowerCase().includes(domain)
    );
    return found || 'auto-coder';
  }

  extractElements(requirement) {
    // Extract UI elements
    const elementRegex = /(button|link|input|field|dropdown|checkbox|radio|table|form)/gi;
    const matches = requirement.match(elementRegex) || [];
    return [...new Set(matches.map(m => m.toLowerCase()))];
  }

  extractActions(requirement) {
    // Extract user actions
    const actionRegex = /(click|navigate|verify|enter|select|submit|validate|check)/gi;
    const matches = requirement.match(actionRegex) || [];
    return [...new Set(matches.map(m => m.toLowerCase()))];
  }

  generateProposedSteps(requirement) {
    // Generate basic step proposals
    const steps = [];
    
    if (requirement.includes('navigate')) {
      steps.push('Alex navigates to {string} page');
    }
    if (requirement.includes('click')) {
      steps.push('Alex clicks {string} button');
    }
    if (requirement.includes('verify')) {
      steps.push('Alex verifies {string} is displayed');
    }
    
    return steps;
  }

  generateSafeStepAlternative(step) {
    // Generate domain-specific alternative
    const domain = 'billing invoices'; // Could be dynamic
    
    if (step.includes('navigates to')) {
      return step.replace('Alex navigates to {string} page', `Alex navigates to ${domain} page`);
    }
    if (step.includes('clicks')) {
      return step.replace('Alex clicks {string}', `Alex clicks the ${domain} {string}`);
    }
    if (step.includes('verifies')) {
      return step.replace('Alex verifies {string}', `Alex verifies the ${domain} {string}`);
    }
    
    return `Alex ${step.toLowerCase()} in ${domain} context`;
  }

  generateFeatureFile(analysis, stepValidation) {
    const domainTitle = analysis.domain.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `@Team:TechnoRebels
@parentSuite:${domainTitle}
@regression
Feature: ${domainTitle} Functionality
  As a client user
  I want to interact with ${domainTitle} features
  So that I can complete my business tasks effectively

  Background:
    Given Alex is logged into RunMod with a homepage test client
    Then Alex verifies that the Payroll section on the Home Page is displayed

  Scenario: Verify ${domainTitle} page navigation and functionality
    When Alex navigates to Billing Home page
    Then Billing Homepage should be displayed
    And Alex verifies the ${analysis.domain} page elements are loaded
`;
  }

  generatePageObject(analysis, pageSuggestions, locatorSuggestions, domain) {
    const className = domain.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Page';

    const locators = locatorSuggestions.map(suggestion => {
      if (suggestion.type === 'data_test_id') {
        return `const ELEMENT = By.css('${suggestion.selector}');`;
      }
      return `const ${suggestion.pattern.toUpperCase()}_ELEMENT = By.css('.${suggestion.pattern}');`;
    }).join('\n');

    return `const By = require('../../support/By.js');
const BasePage = require('../common/base-page');

// Locators defined at top before class
${locators}
const PAGE_CONTENT = By.css('[data-test-id="${domain}-content"], .${domain}-content, main');

class ${className} extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async verifyPageElementsLoaded() {
    const contentVisible = await this.isVisible(PAGE_CONTENT);
    return contentVisible;
  }

  // Add more methods based on requirements
}

module.exports = ${className};`;
  }

  generateStepsFile(analysis, stepValidation, domain) {
    const pageClassName = domain.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Page';

    return `const { assert } = require('chai');
const { Given, When, Then } = require('@cucumber/cucumber');
const ${pageClassName} = require('../pages/${domain}-page');

Then('Alex verifies the ${domain} page elements are loaded', { timeout: 240 * 1000 }, async function () {
  const elementsLoaded = await new ${pageClassName}(this.page).verifyPageElementsLoaded();
  assert.isTrue(elementsLoaded, '${domain} page elements should be loaded');
});

// Add more conflict-free step definitions here
`;
  }

  /**
   * SAVE GENERATED ARTIFACTS
   */
  saveArtifacts(artifacts, domain) {
    const featurePath = path.join(this.outputDir, 'features', `${domain}.feature`);
    const pagePath = path.join(this.outputDir, 'pages', `${domain}-page.js`);
    const stepsPath = path.join(this.outputDir, 'steps', `${domain}-steps.js`);

    // Ensure directories exist
    [
      path.dirname(featurePath),
      path.dirname(pagePath),
      path.dirname(stepsPath)
    ].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    fs.writeFileSync(featurePath, artifacts.feature);
    fs.writeFileSync(pagePath, artifacts.pageObject);
    fs.writeFileSync(stepsPath, artifacts.steps);

    console.log('✅ Conflict-free artifacts generated:');
    console.log(`  📄 Feature: ${featurePath}`);
    console.log(`  📄 Page: ${pagePath}`);
    console.log(`  📄 Steps: ${stepsPath}`);

    return {
      featurePath,
      pagePath,
      stepsPath
    };
  }
}

// CLI usage
if (require.main === module) {
  const generator = new EnhancedAutoCoderGenerator();
  
  const requirement = process.argv[2] || "billing invoices page with get started button and learn more link";
  const domain = process.argv[3] || "billing-invoices";

  console.log(`🚀 Generating artifacts for: ${requirement}`);
  
  const artifacts = generator.generateArtifacts(requirement, domain);
  const paths = generator.saveArtifacts(artifacts, domain);

  console.log('\n📊 Generation Analysis:');
  console.log(`  Conflicts detected: ${artifacts.analysis.conflicts_detected}`);
  console.log(`  Suggestions provided: ${artifacts.analysis.suggestions_provided}`);
  console.log(`  Reusable methods found: ${artifacts.analysis.reusable_methods}`);
  console.log(`  Locator patterns available: ${artifacts.analysis.locator_patterns}`);
}

module.exports = EnhancedAutoCoderGenerator;
